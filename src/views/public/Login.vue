<template>
  <div class="login-container">
    <div class="illustration-container">
      <FlashcardAnimation/>
    </div>

    <div class="form-container">
      <h1>Login to Moneta</h1>
      <p class="subtitle">Sign in to your account and start your learning adventure.</p>

      <form @submit.prevent="handleLogin">
        <InputWithIcon icon="user" label="Username" type="text" v-model="username"/>
        <InputWithIcon icon="lock" label="Password" :type="showPassword ? 'text' : 'password'" v-model="password"/>

        <div class="remember-container">
          <label class="checkbox-label">
            <input type="checkbox" id="rememberMe" v-model="showPassword"/>
            <span class="checkmark"></span>
            Show Password
          </label>
        </div>

        <PrimaryButton text="Sign-In"/>
        <div class="signup">
          <p>
            New on our platform?
            <router-link to="/register">Create Account</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {useMutation, useApolloClient} from '@vue/apollo-composable';
import {useRouter} from 'vue-router';
import InputWithIcon from "@/components/ui/InputWithIcon.vue";
import PrimaryButton from "@/components/ui/PrimaryButton.vue";
import FlashcardAnimation from "@/components/auth/FlashcardAnimation.vue";
import {LOGIN_USER, ME_QUERY} from '@/graphql/auth.js';
import {useToast} from "@/composables/useToast.js";

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const router = useRouter();
const {client: apolloClient} = useApolloClient();
const {addToast} = useToast();

const {mutate: loginMutate, loading: isLoggingIn, error: loginError} = useMutation(LOGIN_USER, () => ({
}));

const handleLogin = async () => {
  loginError.value = null;

  try {
    const variables = {
      username: username.value,
      password: password.value
    };
    const result = await loginMutate(variables);

    if (result?.data?.login) {
      addToast({msg: "Login successful!", type: "success", duration: 4000});

      try {
        sessionStorage.setItem('app_auth_status', 'logged_in');
      } catch (e) {
        console.error("Failed to library sessionStorage:", e);
        addToast({msg: "Failed to save session status.", type: "warning", duration: 4000});
      }
      try {
        await apolloClient.resetStore();
      } catch (cacheError) {
      }

      await router.push({name: 'privateProfileLibrary'});
    } else {
      throw new Error("Login mutation completed but returned unexpected data.");
    }

  } catch (error) {
    const message = error.graphQLErrors?.[0]?.message || error.networkError?.message || "Invalid username/password or connection issue.";
    // TODO: Look into this.
    addToast({msg: message, type: "error", duration: 4000});
    try {
      sessionStorage.removeItem('app_auth_status');
    } catch (e) {
      console.error("Failed to remove sessionStorage:", e);
    }
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

.subtitle {
  font-weight: 400;
  font-size: 16px;
  margin-bottom: 20px;
  opacity: 0.8;
}

form {
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
