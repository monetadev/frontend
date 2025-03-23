<template>
    <div class="createPanel" @click="$emit('add-card')">
      <div class="add-card">Add Card</div>
    </div>
  </template>
  
  <script>
  export default {
    name: "CreatePanel"
  };
  </script>
  
  <style scoped>
  .createPanel {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 90%;
    height: 120px;
    background-color: #1b2233;
    border-radius: 20px;
    color: white;
    font-family: "Outfit", sans-serif;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .createPanel:hover {
    background-color: #2a3045;
  }
  
  .add-card {
    font-size: 20px;
    font-weight: 600;
  }
  </style>
  