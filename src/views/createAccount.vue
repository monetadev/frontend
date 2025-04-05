<template>
  <div class="page-wrapper">
    <div class="signup-layout">
      <section class="Image-class">
        <div class="image">
          <img src="../assets/3d-casual-life-smiling-young-man-with-laptop-sitting-on-floor 1.svg" alt="Guy sitting" />
        </div>
      </section>

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
          <ProgressLine :is-active="currentStep === 2" />
          <ProgressCircle :number="2" :is-active="currentStep === 2" />
        </div>

        <div class="container">
          <div v-if="currentStep === 1" class="form-step">
            <h2>Personal Information</h2>
            <div class="form-row">
              <InputForm
                  label="Username"
                  v-model="usernameInput"
                  type="text"
                  placeholder="Username"
                  name="username"
                  :required="true"
                  id="username"
              />
            </div>
            <div class="form-row">
              <InputForm
                  label="Email"
                  v-model="emailInput"
                  type="text"
                  placeholder="Email"
                  name="email"
                  :required="true"
                  id="email"
              />
            </div>
            <div class="form-row">
              <InputForm
                  label="First Name"
                  v-model="firstnameInput"
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
                  v-model="lastnameInput"
                  type="text"
                  placeholder="Last Name"
                  name="lastName"
                  :required="true"
                  id="lastName"
              />
            </div>

            <div style="text-align: center; margin-top: 20px">
              <SecondaryButton text="Next" @click="e => { e.preventDefault(); moveToStep(2); }" />
            </div>
          </div>
          <div v-if="currentStep === 2" class="form-step">
            <h2>Password Information</h2>
            <div class="form-row">
              <InputForm
                  label="Password"
                  v-model="passwordInput"
                  type="password"
                  placeholder="Password"
                  name="password"
                  :required="true"
                  id="password"
              />
            </div>
            <div class="form-row">
              <InputForm
                  label="Confirm Password"
                  v-model="confirmPasswordInput"
                  type="confirmPassword"
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  :required="true"
                  id="confirmPassword"
              />
            </div>
            <div style="text-align: center; margin-top: 20px">
              <SecondaryButton text="Back" @click="moveToStep(1)" />
              <SecondaryButton text="Submit" @click="submitForm" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <Footer class="footer" />
  </div>
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
import eventBus from "@/eventBus.js";
import Footer from '@/components/Footer.vue';

const router = useRouter();
const currentStep = ref(1);
const usernameInput = ref('');
const emailInput = ref('');
const firstnameInput = ref('');
const lastnameInput = ref('');
const passwordInput = ref('');
const confirmPasswordInput = ref('');

// const formData = reactive({
//   // TODO: Adjust to properly take username and email. For now, email response is stored as a username.
//   fname: '',
//   lname: '',
//   email: '',
//   username: '',
//   password: '',
//   confirmPassword: ''
// });

const { mutate: registerMutate } = useMutation(REGISTER_USER);

const isSubmitting = ref(false);


const moveToStep = (step, event) => {
  // if (event) event.stopPropagation();

  //Making sure the user inputs a correct
  let message = '';

  if(usernameInput.value === '') {
    message = 'Username is required';
    // toastFunction(message, "error")
  }

  if(emailInput.value === ''){
    message = '\nEmail is required';
    // toastFunction(message, "error")
  }

  if(firstnameInput.value === ''){
    message = '\nFirst Name is required';
    // toastFunction(message, "error")
  }

  if(lastnameInput.value === ''){
    message = '\nLast Name is required';
    // toastFunction(message, "error")
  }

  if(!(message === '')){
    alert(message);
    message = '';
    return
  }


  // TODO: Insert toast for step 1...
  currentStep.value = step;
};

function toastFunction(message, type) {
  eventBus.emit('toast', {
    msg: message,
    type: type,
    duration: 3000
  })
}


const submitForm = async () => {

  if(isSubmitting.value) return;
  isSubmitting.value = true;

  // TODO: Refactor such that only the validated password gets sent to the backend, not with confirmPassword
  if (passwordInput.value !== confirmPasswordInput.value) {
   toastFunction("Password and Confirm Password do not match!", "error");
    return;
  }

  const input = {
    username: usernameInput.value,
    email: emailInput.value,
    firstName: firstnameInput.value,
    lastName: lastnameInput.value,
    password: passwordInput.value,
  };

  try {

    const result = await registerMutate({ input });

    // TODO: Display successful login message
    toastFunction("Account successfully created!", "success");

    // Optionally update a global auth state here (e.g., via Pinia)
    await router.push('/myLibrary'); // Redirect to a protected route
  } catch (error) {

    // TODO: Insert toast here....
    console.error("Registration error:", error);
    toastFunction("Invalid Password. Please try again.", "error");
  }
  finally{
    isSubmitting.value = false;
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

.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.signup-layout {
  display: flex;
  width: 100%;
}

.Image-class {
  background-color: #121729;
  width: 27%;
  height: auto;
  min-height: 100vh;
  padding: 30px;
  box-shadow: -2px 0px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.create-account {
  width: 65%;
  height: auto;
  min-height: 100vh;
  background-color: #22293A;
  color: white;
  padding: 30px;
  box-shadow: -2px 0px 8px rgba(0, 0, 0, 0.2);
  overflow-y: visible;
  position: relative;
  padding-bottom: 100px; /* Make room for footer */
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

.footer {
  background: #1a1f2e;
  color: white;
  text-align: center;
  padding: 20px;
  width: 100%;
}
</style>
