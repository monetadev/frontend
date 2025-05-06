<template>
  <div class="login-container">
    <div class="illustration-container">
      <FlashcardAnimation/>
    </div>

    <div class="form-container">
      <h1>Create Account</h1>
      <p class="subtitle">Sign up for free and start your learning adventure.</p>

      <div class="step-indicator" v-if="!isSubmitting">
        <div class="circle-container">
          <div :class="['circle', { active: currentStep >= 1 }]">1</div>
          <div :class="['line', { active: currentStep === 2 }]"></div>
          <div :class="['circle', { active: currentStep === 2 }]">2</div>
        </div>
      </div>

      <form @submit.prevent="currentStep === 1 ? moveToStep(2) : submitForm()">
        <div v-if="currentStep === 1" class="form-step">
          <h2>Personal Information</h2>
          <InputWithIcon icon="user" label="Username" type="text" v-model="usernameInput"/>
          <InputWithIcon icon="envelope" label="Email" type="email" v-model="emailInput"/>
          <InputWithIcon icon="user-circle" label="First Name" type="text" v-model="firstnameInput"/>
          <InputWithIcon icon="user-circle" label="Last Name" type="text" v-model="lastnameInput"/>

          <PrimaryButton
              text="Next"
              :disabled="!isStep1Valid"
              :class="{ 'button-disabled': !isStep1Valid }"
          />
        </div>

        <div v-if="currentStep === 2" class="form-step">
          <h2>Password Information</h2>
          <InputWithIcon icon="lock" label="Password" :type="showPassword ? 'text' : 'password'"
                         v-model="passwordInput"/>

          <InputWithIcon v-if="!showPassword" icon="lock" label="Confirm Password" type="password"
                         v-model="confirmPasswordInput"/>

          <!-- Password Validation Section -->
          <div v-if="passwordInput.length > 0" class="password-validation">
            <div :class="['validation-item', { valid: lengthValid }]">
              Between 8 and 64 characters in length.
            </div>
            <div :class="['validation-item', { valid: hasUppercase }]">
              Contains at least 1 uppercase letter.
            </div>
            <div :class="['validation-item', { valid: hasLowercase }]">
              Contains at least 1 lowercase letter.
            </div>
            <div :class="['validation-item', { valid: hasSpecialChar }]">
              Contains at least 1 special character.
            </div>
            <div :class="['validation-item', { valid: hasNumber }]">
              Contains at least 1 number.
            </div>
            <div v-if="!showPassword" :class="['validation-item', { valid: passwordsMatch }]">
              The password fields match.
            </div>
          </div>

          <div class="remember-container">
            <label class="checkbox-label">
              <input type="checkbox" id="showPassword" v-model="showPassword"/>
              <span class="checkmark"></span>
              Show Password
            </label>
          </div>

          <div class="button-group">
            <button class="back-button" @click.prevent="moveToStep(1)">Back</button>
            <PrimaryButton
                text="Create Account"
                :disabled="isSubmitting || !isPasswordValid"
                :class="{ 'button-disabled': !isPasswordValid }"
            />
          </div>
        </div>
      </form>

      <div class="signup">
        <p>
          Already have an account?
          <router-link to="/login">Sign In</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue';
import {useRouter} from 'vue-router';
import {useMutation} from '@vue/apollo-composable';
import InputWithIcon from "@/components/ui/InputWithIcon.vue";
import PrimaryButton from "@/components/ui/PrimaryButton.vue";
import {REGISTER_USER} from '@/graphql/auth.js';
import {useToast} from "@/composables/useToast.js";
import FlashcardAnimation from "@/components/auth/FlashcardAnimation.vue";
import apolloClient from "@/plugins/apollo.js";

const router = useRouter();
const currentStep = ref(1);
const usernameInput = ref('');
const emailInput = ref('');
const firstnameInput = ref('');
const lastnameInput = ref('');
const passwordInput = ref('');
const confirmPasswordInput = ref('');
const showPassword = ref(false);
const isSubmitting = ref(false);
const {addToast} = useToast();

const isStep1Valid = computed(() => {
  return usernameInput.value.trim() !== '' &&
      emailInput.value.trim() !== '' &&
      firstnameInput.value.trim() !== '' &&
      lastnameInput.value.trim() !== '';
});

const lengthValid = computed(() => {
  return passwordInput.value.length >= 8 && passwordInput.value.length <= 64;
});

const hasUppercase = computed(() => {
  return /[A-Z]/.test(passwordInput.value);
});

const hasLowercase = computed(() => {
  return /[a-z]/.test(passwordInput.value);
});

const hasSpecialChar = computed(() => {
  return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordInput.value);
});

const hasNumber = computed(() => {
  return /[0-9]/.test(passwordInput.value);
});

const passwordsMatch = computed(() => {
  return passwordInput.value === confirmPasswordInput.value && passwordInput.value.length > 0;
});

const isPasswordValid = computed(() => {
  if (showPassword.value) {
    return lengthValid.value && hasUppercase.value && hasLowercase.value &&
        hasSpecialChar.value && hasNumber.value;
  } else {
    return lengthValid.value && hasUppercase.value && hasLowercase.value &&
        hasSpecialChar.value && hasNumber.value && passwordsMatch.value;
  }
});

const {mutate: registerMutate} = useMutation(REGISTER_USER);

const moveToStep = (step) => {
  if (step === 2) {
    if (!isStep1Valid.value) {
      if (!usernameInput.value) {
        addToast({msg: "Username is required", type: "error", duration: 4000});
      } else if (!emailInput.value) {
        addToast({msg: "Email is required", type: "error", duration: 4000});
      } else if (!firstnameInput.value) {
        addToast({msg: "First Name is required", type: "error", duration: 4000});
      } else if (!lastnameInput.value) {
        addToast({msg: "Last Name is required", type: "error", duration: 4000});
      }
      return;
    }
  }

  currentStep.value = step;
};

const submitForm = async () => {
  if (isSubmitting.value || !isPasswordValid.value) return;
  isSubmitting.value = true;

  const input = {
    username: usernameInput.value,
    email: emailInput.value,
    firstName: firstnameInput.value,
    lastName: lastnameInput.value,
    password: passwordInput.value,
  };

  try {
    await registerMutate({input});
    addToast({msg: "Account successfully created!", type: "success", duration: 4000});

    try {
      sessionStorage.setItem('app_auth_status', 'logged_in');
    } catch (error) {
      addToast({msg: "Failed to save session status.", type: "warning", duration: 4000});
    }

    try {
      await apolloClient.resetStore();
    } catch (error) {
    }

    await router.push({name: 'privateProfileLibrary'});
  } catch (error) {
    addToast({msg: "Registration failed. Please try again.", type: "error", duration: 4000});
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Outfit', sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.login-container {
  display: flex;
  height: 100vh;
  background-color: #22293A;
}

.illustration-container {
  flex: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #121729;
}

.form-container {
  flex: 1;
  max-width: 420px;
  background: #22293A;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #ffffff;
}

h1 {
  font-weight: 700;
  font-size: 36px;
  margin-bottom: 10px;
}

h2 {
  font-size: 20px;
  margin-bottom: 20px;
  font-weight: 600;
}

.subtitle {
  font-weight: 400;
  font-size: 16px;
  margin-bottom: 20px;
  opacity: 0.8;
}

form {
  display: flex;
  flex-direction: column;
}

.form-step {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.signup {
  text-align: center;
  margin-top: 20px;
}

.signup a {
  color: #5F98EF;
  font-weight: 500;
  text-decoration: none;
}

.remember-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin-bottom: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  accent-color: #5F98EF;
}

.step-indicator {
  margin: 20px 0;
}

.circle-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #333a4d;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.line {
  width: 60px;
  height: 2px;
  background-color: #333a4d;
  margin: 0 10px;
  transition: all 0.3s ease;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.back-button {
  padding: 12px 24px;
  background-color: transparent;
  border: 1px solid #5F98EF;
  color: #5F98EF;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  flex: 0.4;
}

.back-button:hover {
  background-color: rgba(95, 152, 239, 0.1);
}

.password-validation {
  background-color: #1a1f2c;
  border-radius: 6px;
  padding: 15px;
  font-size: 14px;
  margin-top: -10px;
}

.validation-item {
  margin-bottom: 8px;
  color: #ff5151;
  display: flex;
  align-items: center;
}

.validation-item:last-child {
  margin-bottom: 0;
}

.validation-item:before {
  content: "✕";
  margin-right: 8px;
  font-weight: bold;
}

.button-disabled {
  opacity: 0.6;
  cursor: not-allowed !important;
}

:deep(.button-disabled button) {
  background-color: #5F98EF80 !important;
  cursor: not-allowed !important;
  border-color: transparent !important;
}

/* --- Responsive Design --- */
@media (max-width: 1024px) {
  .login-container {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
  }

  .illustration-container {
    display: none;
  }

  .form-container {
    width: 100%;
    max-width: 400px;
    padding: 30px;
  }
}
</style>
