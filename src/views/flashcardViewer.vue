<template>
    <div class="dashboard">
      <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
      <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
        <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
        <div class="content">
          <h1>Flashcard Viewer</h1>
          <FlashCard
            frontContent="What is an Atom"
            backContent="Back content"
          >
            <template #front>
              <FlashcardTitle title="Front Title" />
            </template>
            <template #back>
              <FlashcardTitle title="Back Title" />
            </template>
          </FlashCard>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import SidebarNavigation from "@/components/SideNavigation.vue";
  import NavigationBar from "@/components/TopNavigation.vue";
  import FlashCard from "@/components/FlashCard.vue";
  import FlashcardTitle from "@/components/FlashcardTitle.vue"; // Added missing import
  
  export default {
    name: "Dashboard",
    components: {
      SidebarNavigation,
      FlashCard,
      NavigationBar,
      FlashcardTitle, // Added component registration
    },
    data() {
      return {
        isSidebarCollapsed: true,
        // Removed incomplete 'is' line
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