<template>
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
  </template>
  
  <script>
  export default {
    props: {
      currentStep: {
        type: Number,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
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
  </style>
  