<template>
  <section class="create-account">
    <div class="before-form">
      <h1>Create Account</h1>
      <p>The ultimate study experience. Sign up for free!</p>
      <p>Already have an account? <a class="hyperlink" href="#">Sign in</a></p>
    </div>

    <ProgressCircle :currentStep="currentStep" />

    <div class="container">
      <!-- Step 1 -->
      <transition name="fade" mode="out-in">
        <div v-if="currentStep === 1" class="form-step">
          <h2>Step 1: Personal Information</h2>
          <div class="form-row">
            <InputForm 
              label="First Name"
              v-model="formData.fname"
              type="text"
              placeholder="First Name"
              name="fname"
              :required="true"
              id="fname"
              :error="errors.fname"
            />
          </div>
          <div class="form-row">
            <InputForm 
              label="Last Name"
              v-model="formData.lname"
              type="text"
              placeholder="Last Name"
              name="lname"
              :required="true"
              id="lname"
              :error="errors.lname"
            />
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <SecondaryButton 
              text="Next"
              @click="moveToStep(2)"
            />
          </div>
        </div>
      </transition>

      <!-- Step 2 -->
      <transition name="fade" mode="out-in">
        <div v-if="currentStep === 2" class="form-step">
          <h2>Step 2: Email Information</h2>
          <div class="form-row">
            <InputForm 
              label="Email"
              v-model="formData.email"
              type="email"
              placeholder="Email"
              name="email"
              :required="true"
              id="email"
              :error="errors.email"
            />
          </div>
          <div class="form-row">
            <InputForm 
              label="Confirm Email"
              v-model="formData.confirmEmail"
              type="email"
              placeholder="Confirm Email"
              name="confirmEmail"
              :required="true"
              id="confirmEmail"
              :error="errors.confirmEmail"
            />
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <SecondaryButton 
              text="Back"
              @click="moveToStep(1)"
            />
            <SecondaryButton 
              text="Next"
              @click="moveToStep(3)"
            />
          </div>
        </div>
      </transition>

      <!-- Step 3 -->
      <transition name="fade" mode="out-in">
        <div v-if="currentStep === 3" class="form-step">
          <h2>Step 3: Password</h2>
          <div class="form-row">
            <InputForm 
              label="Password"
              v-model="formData.password"
              type="password"
              placeholder="Password"
              name="password"
              :required="true"
              id="password"
              :error="errors.password"
            />
          </div>
          <div class="form-row">
            <InputForm 
              label="Confirm Password"
              v-model="formData.confirmPassword"
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              :required="true"
              id="confirmPassword"
              :error="errors.confirmPassword"
            />
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <SecondaryButton 
              text="Back"
              @click="moveToStep(2)"
            />
            <SecondaryButton 
              text="Submit"
              @click="submitForm"
            />
          </div>
        </div>
      </transition>
    </div>
  </section>

  <section class="Image-class">
    <div class="image">
      <img src="../assets/3d-casual-life-smiling-young-man-with-laptop-sitting-on-floor 1.svg" alt="Guy sitting" />
    </div>
  </section>
</template>

<script>
import InputForm from '@/components/inputForms.vue';
import SecondaryButton from '@/components/SecondaryButton.vue';
import ProgressCircle from '@/components/ProgressCircle.vue';

export default {
  components: {
    InputForm,
    SecondaryButton,
    ProgressCircle
  },
  data() {
    return {
      currentStep: 1,
      formData: {
        fname: "",
        lname: "",
        email: "",
        confirmEmail: "",
        password: "",
        confirmPassword: ""
      },
      errors: {
        fname: "",
        lname: "",
        email: "",
        confirmEmail: "",
        password: "",
        confirmPassword: ""
      },
      regex: {
        name: /^[a-zA-Z]*$/,  // The * instead of + allows empty fields
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,  // Updated regex
        password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
      }
    };
  },
  methods: {
    moveToStep(step) {
  console.log("Moving to step:", step);
  
  // Step 2: Validate Email
  if (step === 2) {
    const isValid = this.validateStep1();
    console.log("Step 1 validation result:", isValid, "Errors:", this.errors.fname, this.errors.lname);
    if (!isValid) {
      console.log("Validation failed for step 1");
      return;
    }
  }
  
  // Step 2: Validate Email and Confirm Email
  if (step === 3) {
    const isValid = this.validateStep2();
    console.log("Step 2 validation result:", isValid, "Errors:", this.errors.email, this.errors.confirmEmail);
    
    if (!isValid) {
      console.log("Validation failed for step 2");
      return;
    }
    
    // Check if both email and confirm email are filled
    if (!this.formData.email || !this.formData.confirmEmail) {
      console.log("Please fill out both email and confirm email fields.");
      this.errors.email = "Please fill out both email and confirm email fields.";
      return; // Don't move forward if the fields are empty
    }
  }
  
  // If validation passed, move to the next step
  this.currentStep = step;
  console.log("Transitioned to step:", step);
}
,
    
    validateStep1() {
      console.log("Validating Step 1:", this.formData.fname, this.formData.lname);
      this.errors.fname = this.regex.name.test(this.formData.fname) ? "" : "First name must only contain letters.";
      this.errors.lname = this.regex.name.test(this.formData.lname) ? "" : "Last name must only contain letters.";
      console.log("Validation errors:", this.errors);
      
      // Check if the error strings are empty (validation passed)
      return this.errors.fname === "" && this.errors.lname === "";
    },
    
    validateStep2() {
      // Validate email format and check if it's empty
      if (!this.formData.email) {
        this.errors.email = "Please enter a valid email.";
      } else {
        this.errors.email = this.regex.email.test(this.formData.email) ? "" : "Please enter a valid email.";
      }

      // Validate confirm email match
      if (this.formData.email && this.formData.confirmEmail) {
        this.errors.confirmEmail = this.formData.email === this.formData.confirmEmail ? "" : "Emails must match.";
      }
      
      // Log email and confirm email values for debugging
      console.log('Email:', this.formData.email);
      console.log('Confirm Email:', this.formData.confirmEmail);
      
      // Check if the error strings are empty (validation passed)
      return this.errors.email === "" && this.errors.confirmEmail === "";
    },
    
    validateStep3() {
      this.errors.password = this.regex.password.test(this.formData.password) ? "" : "Password must be at least 8 characters long and contain both letters and numbers.";
      this.errors.confirmPassword = this.formData.password === this.formData.confirmPassword ? "" : "Passwords must match.";
      
      // Check if the error strings are empty (validation passed)
      return this.errors.password === "" && this.errors.confirmPassword === "";
    },
    
    submitForm() {
      if (!this.validateStep3()) {
        console.log("Validation failed for step 3");
        return;
      }
      console.log("Form submitted:", this.formData);
      alert("Form submitted successfully!");
    }
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
}

.form-row {
  margin-bottom: 20px;
}

.form-input {
  width: 100%;
  padding: 12px;
  background-color: #2c3548;
  color: white;
  border: 1px solid #3a4560;
  border-radius: 4px;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
}

.form-input::placeholder {
  color: #8a929e;
}

.secondary-button {
  background-color: transparent;
  color: white;
  border: 2px solid #5F98EF;
  font-size: medium;
  padding: 12px 20px;
  margin: 8px;
  cursor: pointer;
  border-radius: 4px;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  min-width: 120px;
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
