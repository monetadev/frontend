<template>
    <section class="about-section" id="about"> <div class="about-container">
        <div class="text-content">
          <h2 class="section-title">About Our Project</h2>
          <p class="about-text">
            This project started from a simple idea: make the process of learning and building software faster and more intuitive. We saw students and developers spending too much time on boilerplate and repetitive tasks, hindering the creative flow.
          </p>
          <p class="about-text">
            Our tool leverages cutting-edge AI to understand your needs and generate high-quality code snippets, components, or even entire application structures instantly. Whether you're designing a UI, developing an algorithm, or just exploring possibilities, we aim to be your intelligent coding partner.
          </p>
          <p class="about-text">
            We are passionate about bridging the gap between concept and creation, empowering you to focus on innovation.
          </p>
          </div>
  
        <div class="image-content">
           <img src="https://via.placeholder.com/450x350/2D3748/E2E8F0?text=Project+Image" alt="Illustration or photo related to the project" class="about-image">
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
  
  /* Optional Link/Button Style */
  /*
  .learn-more-link {
    display: inline-block;
    margin-top: 1rem;
    color: #3182CE;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
  }
  .learn-more-link:hover {
    color: #63B3ED;
    text-decoration: underline;
  }
  */
  
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