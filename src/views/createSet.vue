<template>
    <div class="create-set">
      <SideNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
      <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
        <TopNavigation :isSidebarCollapsed="isSidebarCollapsed" />
        <div class="content">
          <div class="header-container">
            <FCTitle title="Create a Flashcard Set" class="FC-Title"/>
            <div class="saved-text">
              <Saved text="Saved" :show="true" />
            </div>
          </div>
          <div class = "button-container">
            <sButton text="Create" />
            <sButton text="Clear" />
          </div>
          <div class="input-forms-container">
            <createForm
              v-model="formData.title"
              type="text"
              placeholder="Give your flashcard set a title"
              name="title"
              :required="true"
              id="title"
            />
            <createForm
              v-model="formData.description"
              type="text"
              placeholder="Description"
              name="description"
              :required="false"
              id="description"
            />
          </div>
          <div class="create-Panels">
            <createPanel :number="1"  @update-flashcard="handleFlashcardUpdate" 
            />
            <createPanel :number="2"  @update-flashcard="handleFlashcardUpdate" 
            />
            <createPanel :number="3"  @update-flashcard="handleFlashcardUpdate" 
            />
            <createPanel :number="4"  @update-flashcard="handleFlashcardUpdate" 
            />
            <addCard @add-card="handleAddCard" />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import SideNavigation from '@/components/SideNavigation.vue';
  import TopNavigation from '@/components/TopNavigation.vue';
  import Saved from '@/components/saved.vue';
  import sButton from '@/components/SecondaryButton.vue'
  import createForm from '@/components/createForm.vue';
  import FCTitle from '@/components/FlashcardTitle.vue';
  import createPanel from '@/components/createPanel.vue';
  import addCard from '@/components/addCardCreate.vue';
  
  const isSidebarCollapsed = ref(true);
  const show = ref(false);
  const showMenu = ref(false);
  const formData = ref({
    title: ''
  });
  
  // Methods
  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
    console.log("Sidebar toggled:", isSidebarCollapsed.value);
  }
  function handleFlashcardUpdate(flashcardData){
    // Handle the updated flashcard data
    console.log(flashcardData); // Contains {term, definition, position}
  }
  function handleAddCard(){
    // Add a new flashcard panel
    console.log("Add a new flashcard panel");
  }
  </script>
  
  <style scoped>
  .main-content {
    flex-grow: 1;
    transition: margin-left 0.3s ease-in-out;
    margin-left: 220px;
  }
  
  .main-content.collapsed {
    margin-left: 80px;
  }
  
  .content {
    padding: 5% 5% 0 5%;
    position: relative;
  }
  
  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    position: relative;
    margin-bottom: 30px;
  }
  
  .FC-Title {
    margin: 0;
  }
  
  .saved-text {
    margin-right: 650px;
  }
  
  .input-forms-container {
    padding-left: 12%;
    padding-right: 10%;
    margin-top: 20px;
    width: 100%;
    max-width: 800px;
  }
  .button-container {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
    padding-right: 6%;
  }
  .create-Panels {
    margin-top: 20px;
    padding-left: 12%;
  }
  @media (max-width: 768px) {
    .header-container {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .saved-text {
      margin-left: 0;
      margin-top: 10px;
    }
    
    .input-forms-container {
      padding-left: 0;
      padding-right: 0;
    }
  }
  </style>