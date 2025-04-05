<template>
  <div class="reset-wrapper">
    <div class="reset-container">
      <div class="illustration-container">
        <img src="@/assets/reset.png" alt="Illustration" class="illustration" />
      </div>

      <div class="form-container">
        <h1>Reset Password</h1>
        <p class="subtitle">Enter your email address to receive a password reset link.</p>

        <form @submit.prevent="handleResetPassword">
          <InputWithIcon iconName="email" label="Email" type="email" v-model="email" />

          <PrimaryButton text="Send Link" />
          <div class="signup">
            <router-link to="/login">
              Back to Login
            </router-link>
          </div>
        </form>
      </div>
    </div>
    <Footer class="footer" />
  </div>
</template>

<script>
import InputWithIcon from "@/components/InputWithIcon.vue";
import PrimaryButton from "@/components/PrimaryButton.vue";
import Footer from '@/components/Footer.vue';

export default {
  name: "ResetPassword",
  components: {
    InputWithIcon,
    PrimaryButton,
    Footer
  },
  data() {
    return {
      email: "",
    };
  },
  methods: {
    handleResetPassword() {
      console.log("Reset Email", { email: this.email});
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

.reset-container {
  display: flex;
  height: 100vh;
  background-color: #22293A;
}


.reset-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}


.illustration-container {
  flex: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #121729;
}

.illustration {
  max-width: 300px;
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

.checkbox-label input {
  width: 16px;
  height: 16px;
  accent-color: #5F98EF;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .reset-container {
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
