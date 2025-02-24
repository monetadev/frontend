<template>
    <div class="home-container">
      <!-- Sidebar -->
      <Sidebar />
  
      <!-- Main Content -->
      <div class="content">
        <h1>Welcome to Moneta</h1>
        <p>This is your home page.</p>
      </div>
    </div>
  </template>
  
  <script>
  import Sidebar from "@/components/Sidebar.vue";
  
  export default {
    name: "Home",
    components: {
      Sidebar,
    },
  };
  </script>
  
  <style scoped>
  /* Home Page Layout */
  .home-container {
    display: flex;
    height: 100vh;
    background-color: #121729;
  }
  
  /* Content Area */
  .content {
    flex: 1;
    padding: 40px;
    color: white;
  }
  </style>
  