<template>
  <section class="create-account">
    <div class="before-form">
      <h1>Create Account</h1>
      <p>The ultimate study experience. Sign up for free!</p>
      <p>Already have an account? <a class="hyperlink" href="#">Sign in</a></p>
    </div>

    <div class="circle-container">
      <ProgressCircle :number="1" :is-active="currentStep === 1" />
      <ProgressLine :is-active="currentStep >= 2" />
      <ProgressCircle :number="2" :is-active="currentStep >= 2" />
      <ProgressLine :is-active="currentStep === 3" />
      <ProgressCircle :number="3" :is-active="currentStep === 3" />
    </div>

    <div class="container">
      <div v-if="currentStep === 1" class="form-steps">
        <h2>Personal Information</h2>
        <div class="form-row">
          <InputForm
            label="First Name"
            v-model="formData.firstName"
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
          v-model="formData.firstName"
          type="text"
          placeholder="Last Name"
          name="lastName"
          :required="true"
          id="lastName"
          />
        </div>
        <div style="text-align: center; margin-top: 20px">
          <SecondaryButton text="Next" @click="moveToStep(2)"/>
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
          <SecondaryButton text="Back"  @click="moveToStep(1)"/>
          <SecondaryButton text="Next" @click="moveToStep(3)"/>
        </div>
      </div>
      <div v-if="currentStep === 3" class="form-step"></div>


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
import ProgressLine from '@/components/ProgressLine.vue';
export default {
  components: {
    InputForm,
    SecondaryButton,
    ProgressCircle,
    ProgressLine,
  },
  data() {
    return {
      currentStep: 1,
      formData: {
        fname: '',
        lname: '',
        email: '',
        confirmEmail: '',
        password: '',
        confirmPassword: ''
      }
    };
  },
methods: {
  moveToStep(step) {
    this.currentStep = step;
  },
  submitForm() {
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

.circle-container {
  display: flex;
  justify-content: left;
  align-items: center;
  margin-top: 40px;
  padding-left: 10%;
}


</style>
