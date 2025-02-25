<template>
    <section class="create-account">
      <div class="before-form">
        <h1>Create Account</h1>
        <p>The ultimate study experience. Sign up for free!</p>
        <p>Already have an account? <a class="hyperlink" href="#">Sign up</a></p>
      </div>
  
      <div class="circle-container">
        <!-- Circle One -->
        <div class="circle">
          <span class="number">1</span>
        </div>
  
        <div class="line"></div>
  
        <!-- Circle Two -->
        <div class="circle2">
          <span class="number">2</span>
        </div>
  
        <div class="line"></div>
  
        <!-- Circle Three -->
        <div class="circle3">
          <span class="number">3</span>
        </div>
      </div>
  
      <form @submit.prevent="handleSubmit">
        <div class="container">
          <div class="form-row">
            <InputField
              label="First Name"
              name="fname"
              v-model="formData.fname"
              required
              placeholder="First Name"
            />
            <InputField
              label="Last Name"
              name="lname"
              v-model="formData.lname"
              required
              placeholder="Last Name"
            />
          </div>
  
          <div class="form-row">
            <InputField
              label="Email"
              type="email"
              name="email"
              v-model="formData.email"
              required
              placeholder="Enter Email"
            />
            <InputField
              label="Password"
              type="password"
              name="password"
              v-model="formData.password"
              required
              placeholder="Enter Password"
            />
          </div>
  
          <CheckboxField
            label="Remember me"
            v-model="formData.remember"
          />
  
          <p>
            By creating an account you agree to our
            <a href="#" style="color: dodgerblue">Terms & Privacy</a>.
          </p>
  
          <div class="clearfix">
            <PrimaryButton
              text="Cancel"
              @click="handleCancel"
            />
            <PrimaryButton
              text="Sign Up"
              type="submit"
            />
          </div>
        </div>
      </form>
    </section>
  </template>
  
  <script>
  import InputField from './InputField.vue';
  import CheckboxField from './CheckboxField.vue';
  import PrimaryButton from './PrimaryButton.vue'; // Import the PrimaryButton component
  
  export default {
    components: {
      InputField,
      CheckboxField,
      PrimaryButton, // Register the PrimaryButton component
    },
    data() {
      return {
        formData: {
          fname: "",
          lname: "",
          email: "",
          password: "",
          remember: true,
        },
      };
    },
    methods: {
      handleSubmit() {
        console.log("Form submitted with data: ", this.formData);
      },
      handleCancel() {
        this.formData = {
          fname: "",
          lname: "",
          email: "",
          password: "",
          remember: true,
        };
      },
    },
  };
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');
  
  body {
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 100vh;
    background-color: #121729;
    font-family: 'Outfit', sans-serif;
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
  }
  
  .create-account .before-form {
    text-align: left;
    padding-top: 10%;
    padding-left: 10%;
  }
  
  .create-account .before-form h1 {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  .create-account .before-form p {
    font-size: 1rem;
    margin-bottom: 20px;
  }
  
  .hyperlink {
    color: #5F98EF;
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
    background-color: #5F98EF;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 24px;
    font-weight: bold;
  }
  
  .number {
    font-size: 20px;
  }
  
  .line {
    width: 200px;
    height: 2px;
    background-color: #000;
    margin-left: 20px;
    margin-right: 20px;
  }
  
  /* Remove old button styles */
  button {
    background-color: #5F98EF;
    color: white;
    font-size: medium;
    padding: 14px 20px;
    margin: 8px 0;
    border: none;
    cursor: pointer;
    width: 100%;
    opacity: 0.9;
  }
  
  button:hover {
    opacity: 1;
  }
  
  .cancelbtn {
    padding: 14px 20px;
    background-color: #f44336;
  }
  
  .cancelbtn, .signupbtn {
    float: left;
    width: 50%;
  }
  
  .container {
    padding: 16px;
  }
  
  .clearfix::after {
    content: "";
    clear: both;
    display: table;
  }
  
  @media screen and (max-width: 300px) {
    .cancelbtn, .signupbtn {
      width: 100%;
    }
    .form-row input {
      width: 100%;
    }
  }
  </style>
  