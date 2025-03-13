


<template>
    <div class="flashset-set-viewer">
      <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
  
      <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
        <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
  
        <div class="Top">
          <div class="my-Stuffs">
            <h1>My Stuffs</h1>
          </div>
        </div>

        

        <div class="Search_Bar">
          <setBar />  

        </div>


        <div class='wrapper'>
    <tabs :mode="mode">
      <tab title="Flashcard Sets">Contents</tab>
      <tab title="Practice Test">Contents</tab>
      <tab title="Study Guides">Contents</tab>
      <tab title="Expert solutions">Contents</tab>
    </tabs>
  </div>

      </div>
    </div>
  </template>
  
  <script>
  import SidebarNavigation from "@/components/SideNavigation.vue";
  import NavigationBar from "@/components/TopNavigation.vue";
  import setBar from "@/components/SetBar.vue";
  import Tab from "@/components/Tab.vue";
  import Tabs from "@/components/Tabs.vue";
  
  export default {
    name: "FlashsetViewer",
    components: {
      SidebarNavigation,
      NavigationBar,
      setBar,
      Tabs,
      Tab
 
    },
    data() {
      return {
        isSidebarCollapsed: false,
        
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
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

  /* Ensures sidebar doesn't overlap content */
  .flashset-set-viewer {
    display: flex;
    background-color: #22293A;
    min-height: 100vh;
    font-family: "Outfit", sans-serif;
  }
  
  /* Make sidebar fixed so it stays in place */
  .SidebarNavigation {
    position: fixed;
    left: 0;
    top: 0;
    width: 250px; /* Adjust to match sidebar width */
    height: 100vh;
    z-index: 50; /* Lower than main content */
    background-color: #22293A;
  }
  
  /* Push main content to the right */
  .main-content {
    margin-left: 250px; /* Adjust to match sidebar width */
    flex: 1;
    transition: margin-left 0.3s ease-in-out;
    position: relative;
    z-index: 100; /* Higher than sidebar */
    padding: 20px;
    margin-top: 60px; /* Added space to prevent overlap with the navigation bar */
  }
  
  /* Adjust when sidebar is collapsed */
  .main-content.collapsed {
    margin-left: 80px; /* Adjust for collapsed state */
  }
  
  /* Fix the visibility issue */
  .Top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    margin-top: 1rem;
    background-color:  #22293A;
    width: 100%;
    position: relative;
    z-index: 110; 
  }
  
  /* Ensure text is visible */
  .Top h1 {
    font-size: 2rem;
    font-weight: bold;
    padding: 10px;
    color: white;
  }
  .nav{
    padding-left: 1%
    ;
  }
  .Search_Bar{
    padding-left: 5%;
  }
  </style>
  