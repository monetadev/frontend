<template>
  <section class="create-account">
    <div class="before-form">
      <h1>Create Account</h1>
      <p>The ultimate study experience. Sign up for free!</p>
      <p>Already have an account? <a class="hyperlink" href="#">Sign in</a></p>
    </div>

    <div class="circle-container">
      <div :class="['circle', { active: currentStep === 1 }]">
        <span class="number">1</span>
      </div>
      <div :class="['line', { active: currentStep >= 2 }]"></div>
      <div :class="['circle2', { active: currentStep >= 2 }]">
        <span class="number">2</span>
      </div>
      <div :class="['line', { active: currentStep === 3 }]"></div>
      <div :class="['circle3', { active: currentStep === 3 }]">
        <span class="number">3</span>
      </div>
    </div>

    <!-- Debug info -->
    <div style="padding-left: 10%; margin-top: 20px; color: white;">
      Current Step: {{ currentStep }}
    </div>
    
    <div class="container">
      <!-- Step 1 -->
      <div v-show="currentStep === 1" class="form-step">
        <h2>Step 1: Personal Information</h2>
        <div class="form-row">
          <input 
            type="text" 
            v-model="formData.fname" 
            placeholder="First Name" 
            class="form-input"
          />
        </div>
        <div class="form-row">
          <input 
            type="text" 
            v-model="formData.lname" 
            placeholder="Last Name" 
            class="form-input"
          />
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <button 
            @click="moveToStep(2)" 
            class="primary-button" 
            type="button"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Step 2 -->
      <div v-show="currentStep === 2" class="form-step">
        <h2>Step 2: Email Information</h2>
        <div class="form-row">
          <input 
            type="email" 
            v-model="formData.email" 
            placeholder="Email" 
            class="form-input"
          />
        </div>
        <div class="form-row">
          <input 
            type="email" 
            v-model="formData.confirmEmail" 
            placeholder="Confirm Email" 
            class="form-input"
          />
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <button 
            @click="moveToStep(1)" 
            class="secondary-button" 
            type="button"
          >
            Back
          </button>
          <button 
            @click="moveToStep(3)" 
            class="primary-button" 
            type="button"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Step 3 -->
      <div v-show="currentStep === 3" class="form-step">
        <h2>Step 3: Password</h2>
        <div class="form-row">
          <input 
            type="password" 
            v-model="formData.password" 
            placeholder="Password" 
            class="form-input"
          />
        </div>
        <div class="form-row">
          <input 
            type="password" 
            v-model="formData.confirmPassword" 
            placeholder="Confirm Password" 
            class="form-input"
          />
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <button 
            @click="moveToStep(2)" 
            class="secondary-button" 
            type="button"
          >
            Back
          </button>
          <button 
            @click="submitForm" 
            class="primary-button" 
            type="button"
          >
            Submit
          </button>
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

<script>
export default {
  data() {
    return {
      currentStep: 1,
      formData: {
        fname: "",
        lname: "",
        email: "",
        confirmEmail: "",
        password: "",
        confirmPassword: "",
      }
    };
  },
  methods: {
    moveToStep(step) {
      console.log("Moving to step:", step);
      this.currentStep = step;
    },
    submitForm() {
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

.circle-container {
  display: flex;
  justify-content: left;
  align-items: center;
  margin-top: 40px;
  padding-left: 10%;
}

.circle, .circle2, .circle3 {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.circle.active, .circle2.active, .circle3.active {
  background-color: #5F98EF;
}

.number {
  font-size: 20px;
}

.line {
  width: 200px;
  height: 2px;
  background-color: #333;
  margin-left: 20px;
  margin-right: 20px;
  transition: background-color 0.3s ease;
}

.line.active {
  background-color: #5F98EF;
}

.image img {
  border: none;
  height: auto;
  border-radius: 10px;
  padding-top: 10%;
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

.primary-button {
  background-color: #5F98EF;
  color: white;
  font-size: medium;
  padding: 14px 20px;
  margin: 8px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  min-width: 120px;
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
</style>