<template>
    <div class="dashboard">
      <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
  
      <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
        <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
        <div class="content">
          <h1>Your Dashboard</h1>
          <p>Manage your study materials, quizzes, and more!</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import SidebarNavigation from "@/components/SideNavigation.vue";
  import NavigationBar from "@/components/TopNavigation.vue";
  
  export default {
    name: "Dashboard",
    components: {
      SidebarNavigation,
      NavigationBar,
    },
    data() {
      return {
        isSidebarCollapsed: true,
      };
    },
    methods: {
      toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
      },
    },
  };
  </script>
  
  <style scoped>
  .dashboard {
    display: flex;
    height: 100vh;
    background-color: #22293A;
  }
  
  .main-content {
    flex-grow: 1;
    transition: margin-left 0.3s ease-in-out;
    margin-left: 220px;
  }
  
  .main-content.collapsed {
    margin-left: 80px;
  }

  .content {
    padding-top: 5%;
    color: white;
    padding-left: 1%;
  }
  </style>
  