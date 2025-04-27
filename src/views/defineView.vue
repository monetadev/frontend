<template>
    <div class="dashboard">
      <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
      <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
        <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
        <div class="content">
          <div class="set-header">
            <h1>{{ currentDeck.title }}</h1>
            <p>{{ flashcards.length }} terms</p>
            <button class="begin-study-btn" @click="beginStudying">Begin Studying</button>
          </div>
          <div class="terms-container">
            <div class="terms-header">
              <div class="term-column">Term</div>
              <div class="definition-column">Definition</div>
            </div>
            <div class="definition-rows-container">
              <DefinitionRow
                v-for="card in flashcards"
                :key="card.id"
                :term="card.term"
                :definition="card.definition"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import SidebarNavigation from "@/components/SideNavigation.vue";
  import NavigationBar from "@/components/TopNavigation.vue";
  import DefinitionRow from "@/components/termDisplayer.vue"; 
  
  export default {
    name: "SetDetailView",
    components: {
      SidebarNavigation,
      NavigationBar,
      DefinitionRow 
    },
    data() {
      return {
        isSidebarCollapsed: false,
        flashcards: [
          {id: 1, term: "What is an Atom?", definition: "The smallest unit of matter."},
          {id: 2, term: "What is a Molecule?", definition: "A group of atoms bonded together."},
          {id: 3, term: "What is a Cell?", definition: "The basic unit of life."},
          {id: 4, term: "What is a Tissue?", definition: "A group of cells working together."},
        ],
        currentDeck: {
          id: 2,
          title: "Biology",
        }
      };
    },
    methods: {
      toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
      },
      beginStudying() {
        // Store the current data in localStorage
        localStorage.setItem('currentFlashcards', JSON.stringify(this.flashcards));
        localStorage.setItem('currentDeck', JSON.stringify(this.currentDeck));
        
        // Navigate to deck
        this.$router.push(`/view`);
      }
    },
    created() {
      // Here you would fetch the specific set data based on route parameter
      const deckId = this.$route.params.deckId;
      // fetchDeckData(deckId) - replace with your actual data fetching
    }
  };
  </script>
  
  <style scoped>
  @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap");

  
  .dashboard {
    display: flex;
    height: 100vh;
    background-color: #22293A;
    font-family: "Outfit", sans-serif;

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
    padding: 40px;
    color: white;
  }
  
  .set-header {
    margin-bottom: 30px;
  }
  
  .set-header h1 {
    font-size: 28px;
    margin-bottom: 10px;
  }
  
  .begin-study-btn {
    background-color: #4caf50;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 15px;
  }
  
  .begin-study-btn:hover {
    background-color: #45a049;
  }
  
  .terms-container {
    background-color: #2e3951;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .terms-header {
    display: flex;
    background-color: #1e2533;
    padding: 15px;
    border-bottom: 1px solid #3a4359;
    font-weight: bold;
  }
  
  .term-column {
    flex: 1;
    padding-right: 15px;
  }
  
  .definition-column {
    flex: 1;
  }
  
  .definition-rows-container {
    padding: 15px;
  }
  
  .definition-rows-container :deep(.definition-row) {
    margin-bottom: 15px;
    border: none;
    box-shadow: none;
  }
  
  .definition-rows-container :deep(.definition-row:last-child) {
    margin-bottom: 0;
  }
  
  .definition-rows-container :deep(.term-container),
  .definition-rows-container :deep(.definition-container) {
    background-color: #384257;
    border-radius: 6px;
    margin: 0 5px;
  }
  
  .definition-rows-container :deep(.term-container) {
    margin-right: 10px;
  }
  </style>