<template>
    <section class="about-section" id="about"> <div class="about-container">
        <div class="text-content">
          <h2 class="section-title">About Our Project</h2>
          <p class="about-text">
            This project started from a simple idea: make the process of learning faster and more intuitive. We saw students spending too much time on reading and studying, and we wanted to change that. By harnessing the power of AI, we aim to revolutionize the way you learn and interact with information.
        </p>
            <p class="about-text">
            Our tool leverages cutting-edge AI to understand your needs and generate high-quality flashcards, quizzes, and study materials tailored just for you. Whether you're preparing for an exam or just want to learn something new, our platform is designed to make your studying experience more efficient and enjoyable.
          </p>
          <p class="about-text">
            We are passionate about bridging the gap between technology and education. Our mission is to empower learners everywhere with the tools they need to succeed. We believe that with the right resources, anyone can achieve their learning goals, and we are here to help you every step of the way.
          </p>
          </div>
  
        <div class="image-content">
           <img src="@/assets/about_us.png" alt="Illustration or photo related to the project" class="about-image">
        </div>
      </div>
    </section>
  </template>
  
  <style scoped>
  .about-section {
    background-color: #283143; /* Slightly different background from features */
    padding: 80px 20px; /* More vertical padding */
    color: #E2E8F0;
  }
  
  .about-container {
    max-width: 1100px;
    margin: 0 auto; /* Center the content */
    display: grid;
    grid-template-columns: 1fr 1fr; /* Create two equal columns */
    gap: 3rem; /* Space between text and image columns */
    align-items: center; /* Vertically align the content in each column */
  }
  
  .section-title {
    text-align: left;
    font-size: clamp(1.8rem, 5vw, 2.5rem); /* Responsive title size */
    font-weight: 600;
    color: #E2E8F0;
    margin-bottom: 1.5rem;
  }
  
  .about-text {
    font-size: 1rem; /* Standard text size */
    line-height: 1.7; /* Increase line spacing for readability */
    color: #CBD5E0; /* Lighter text color */
    margin-bottom: 1.5rem;
  }
  
  .about-text:last-of-type {
    margin-bottom: 0; /* Remove margin from the last paragraph */
  }
  
  .image-content {
    text-align: center; /* Center image within its column */
  }
  
  .about-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px; /* Soften corners */
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2); /* Subtle shadow */
  }

  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .about-container {
      grid-template-columns: 1fr; /* Stack columns on smaller screens */
      gap: 2rem; /* Reduce gap when stacked */
    }
  
    .section-title {
      text-align: center; /* Center title when stacked */
    }
  
    .text-content {
       order: 2; /* Put text below image on small screens (optional) */
       text-align: center;
    }
  
     .image-content {
       order: 1; /* Put image above text on small screens (optional) */
     }
  }
  </style>