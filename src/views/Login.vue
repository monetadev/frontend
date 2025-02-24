<template>
  <div class="login-container">
    <div class="illustration-container">
      <img src="@/assets/login.svg" alt="Illustration" class="illustration" />
    </div>

    <div class="form-container">
      <h1>Login to Moneta</h1>
      <p class="subtitle">Sign in to your account and start your learning adventure.</p>

      <form @submit.prevent="handleLogin">
        <InputWithIcon iconName="email" label="Email" type="email" v-model="email" />
        <InputWithIcon iconName="lock" label="Password" type="password" v-model="password" />
        <PrimaryButton text="Sign-In" />
        <div class="signup">
          <p>New on our platform? <a href="#">Create Account</a></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import InputWithIcon from "@/components/InputWithIcon.vue";
import PrimaryButton from "@/components/PrimaryButton.vue";

export default {
  name: "Login",
  components: {
    InputWithIcon,
    PrimaryButton
  },
  data() {
    return {
      email: "",
      password: "",
      rememberMe: false,
    };
  },
  methods: {
    handleLogin() {
      console.log("Logging in with", { email: this.email, password: this.password, rememberMe: this.rememberMe });
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

.illustration {
  max-width: 500px;
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
</style>
