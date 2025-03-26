<template>
  <section class="create-account">
    <div class="before-form">
      <h1>Create Account</h1>
      <p>The ultimate study experience. Sign up for free!</p>
      <p>
        Already have an account?
        <router-link to="/login" class="hyperlink">Sign in</router-link>
      </p>
    </div>

    <div class="circle-container">
      <ProgressCircle :number="1" :is-active="currentStep >= 1" />
      <ProgressLine :is-active="currentStep >= 2" />
      <ProgressCircle :number="2" :is-active="currentStep >= 2" />
      <ProgressLine :is-active="currentStep === 3" />
      <ProgressCircle :number="3" :is-active="currentStep === 3" />
    </div>

    <div class="container">
      <div v-if="currentStep === 1" class="form-step">
        <h2>Personal Information</h2>
        <div class="form-row">
          <InputForm
              label="First Name"
              v-model="formData.fname"
              type="text"
              placeholder="First Name"
              name="firstName"
              :required="true"
              id="firstName"
          />
        </div>
        <div class="form-row">
          <InputForm
              label="Last Name"
              v-model="formData.lname"
              type="text"
              placeholder="Last Name"
              name="lastName"
              :required="true"
              id="lastName"
          />
        </div>
        <div style="text-align: center; margin-top: 20px">
          <SecondaryButton text="Next" @click="moveToStep(2)" />
        </div>
      </div>
      <div v-if="currentStep === 2" class="form-step">
        <h2>Email Information</h2>
        <div class="form-row">
          <InputForm
              label="Email"
              v-model="formData.email"
              type="email"
              placeholder="Email"
              name="email"
              :required="true"
              id="email"
          />
        </div>
        <div style="text-align: center; margin-top: 20px">
          <SecondaryButton text="Back" @click="moveToStep(1)" />
          <SecondaryButton text="Next" @click="moveToStep(3)" />
        </div>
      </div>
      <div v-if="currentStep === 3" class="form-step">
        <h2>Password Information</h2>
        <div class="form-row">
          <InputForm
              label="Password"
              v-model="formData.password"
              type="password"
              placeholder="Password"
              name="password"
              :required="true"
              id="password"
          />
          <InputForm
              label="Confirm Password"
              v-model="formData.confirmPassword"
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              :required="true"
              id="confirmPassword"
          />
        </div>
        <div style="text-align: center; margin-top: 20px">
          <SecondaryButton text="Back" @click="moveToStep(2)" />
          <SecondaryButton text="Submit" @click="submitForm" />
        </div>
      </div>
    </div>
  </section>

  <section class="Image-class">
    <div class="image">
      <img src="../assets/3d-casual-life-smiling-young-man-with-laptop-sitting-on-floor 1.svg" alt="Guy sitting" />
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation } from '@vue/apollo-composable';
import InputForm from '@/components/inputForms.vue';
import SecondaryButton from '@/components/SecondaryButton.vue';
import ProgressCircle from '@/components/ProgressCircle.vue';
import ProgressLine from '@/components/ProgressLine.vue';
import { REGISTER_USER } from '@/graphql/auth';

const router = useRouter();
const currentStep = ref(1);
const formData = reactive({
  // TODO: Adjust to properly take username and email. For now, email response is stored as a username.
  fname: '',
  lname: '',
  email: '',
  confirmEmail: '',
  password: '',
  confirmPassword: ''
});

const { mutate: registerMutate } = useMutation(REGISTER_USER);

const moveToStep = (step) => {
  currentStep.value = step;
};

const submitForm = async () => {
  if (formData.email !== formData.confirmEmail) {
    alert("Email and Confirm Email do not match!");
    return;
  }
  // TODO: Refactor such that only the validated password gets sent to the backend, not with confirmPassword
  if (formData.password !== formData.confirmPassword) {
    alert("Password and Confirm Password do not match!");
    return;
  }

  const input = {
    username: formData.email,
    email: formData.email,
    firstName: formData.fname,
    lastName: formData.lname,
    password: formData.password,
    confirmPassword: formData.confirmPassword
  };

  try {
    const result = await registerMutate({ input });
    console.log("Registration successful:", result.data.register);
    // Optionally update a global auth state here (e.g., via Pinia)
    await router.push('/dashboard'); // Redirect to a protected route
  } catch (error) {
    console.error("Registration error:", error);
    alert("Registration failed. Please try again.");
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  background-color: #121729;
  font-family: 'Outfit', sans-serif;
}

.Image-class {
  background-color: #121729;
  position: fixed;
  top: 0;
  left: 0;
  width: 27%;
  height: 100%;
  padding: 30px;
  box-shadow: -2px 0px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.create-account {
  position: fixed;
  top: 0;
  right: 0;
  width: 65%;
  height: 100%;
  background-color: #22293A;
  color: white;
  padding: 30px;
  box-shadow: -2px 0px 8px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
}

.create-account .before-form {
  text-align: left;
  padding-top: 3%;
  padding-left: 10%;
}

.create-account .before-form h1 {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 2.5rem;
}

.create-account .before-form p {
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  font-size: 1rem;
}

.hyperlink {
  color: #5F98EF;
  font-weight: 500;
  text-decoration: none;
}

.container {
  padding: 20px;
  padding-left: 10%;
  padding-right: 10%;
}

.form-step {
  margin-top: 30px;
}

.form-step h2 {
  text-align: center;
  font-weight: 500;
  margin-bottom: 30px;
  font-family: "Outfit", sans-serif;
}

.form-row {
  margin-bottom: 20px;
}

.circle-container {
  display: flex;
  justify-content: left;
  align-items: center;
  margin-top: 40px;
  padding-left: 10%;
}


</style>
