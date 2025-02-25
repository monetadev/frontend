<template>
    <div class="home-container">
      <!-- SideNavigation -->
      <Sidebar />
  
      <!-- Main Content -->
      <div class="content">
        <h1>Welcome to Moneta</h1>
        <p>This is your home page.</p>
      </div>
    </div>
  </template>
  
  <script>
  import SideNavigation from "@/components/SideNavigation.vue";
  
  export default {
    name: "Home",
    components: {
      Sidebar: SideNavigation,
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
  