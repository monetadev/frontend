<template>
    <div class="reset-password-container">
      <!-- Left Side: Large Image -->
      <div class="image-section">
        <img src="@/assets/ImagesResetPage/ResetPageImage.png" alt="Reset Password Illustration" />
      </div>
  
      <!-- Right Side: Reset Password Form -->
      <div class="form-section">
        <h1 class="title">Reset Password</h1>
        <p class="description">Enter your email address to receive a password reset link.</p>
  
        <!-- Input Field -->
        <div class="input-container">
          <span class="icon">📧</span>
          <input type="email" v-model="email" placeholder="Email" />
        </div>
  
        <!-- Submit Button -->
        <button class="primary-button" @click="sendResetEmail">Send Password</button>
  
        <!-- Back to Login -->
        <router-link to="/login" class="back-link">Back To Login</router-link>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        email: "",
      };
    },
    methods: {
      sendResetEmail() {
        console.log("Reset email sent to:", this.email);
      },
    },
  };
  </script>
  
  <style scoped>
  /* MAIN LAYOUT */
  .reset-password-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    background-color: #121729;
  }
  
  /* LEFT SECTION (Larger Image) */
  .image-section {
    flex: 1.2; /* Make the image section slightly larger */
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0f172a;
    padding: 50px;
  }
  
  .image-section img {
    width: 80%; /* Adjust size */
    max-width: 600px;
  }
  
  /* RIGHT SECTION (Form) */
  .form-section {
    flex: 1;
    padding: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #1e293b;
    color: white;
  }
  
  /* TEXT STYLES */
  .title {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 15px;
  }
  
  .description {
    font-size: 18px;
    color: #94a3b8;
    margin-bottom: 25px;
  }
  
  /* INPUT */
  .input-container {
    display: flex;
    align-items: center;
    background: #334155;
    padding: 15px;
    border-radius: 5px;
    width: 100%;
    max-width: 400px;
  }
  
  .icon {
    margin-right: 10px;
    color: white;
  }
  
  input {
    background: transparent;
    border: none;
    outline: none;
    color: white;
    width: 100%;
    font-size: 16px;
  }
  
  /* BUTTON */
  .primary-button {
    margin-top: 20px;
    width: 100%;
    max-width: 400px;
    padding: 15px;
    background: #3b82f6;
    border: none;
    color: white;
    font-size: 18px;
    font-weight: bold;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .primary-button:hover {
    background: #2563eb;
  }
  
  /* BACK TO LOGIN */
  .back-link {
    margin-top: 15px;
    color: #60a5fa;
    text-decoration: none;
    font-size: 16px;
  }
  
  /* RESPONSIVE DESIGN */
  @media (max-width: 768px) {
    .reset-password-container {
      flex-direction: column;
    }
  
    .image-section {
      display: none; /* Hide image on small screens */
    }
  
    .form-section {
      width: 100%;
      padding: 30px;
      align-items: center;
      text-align: center;
    }
  }
  </style>
  