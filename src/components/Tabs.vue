<template>
    <div class="tabs">
      <div class="tab-buttons">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          @click="selectTab(index)"
          :class="{ active: index === selectedIndex }"
        >
          {{ tab.title }}
        </button>
      </div>
      <slot></slot>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        selectedIndex: 0,
        tabs: []
      };
    },
    methods: {
      registerTab(tab) {
        this.tabs.push(tab);
        if (this.tabs.length === 1) {
          tab.isActive = true;
        }
      },
      selectTab(i) {
        this.tabs.forEach((tab, index) => {
          tab.isActive = index === i;
        });
        this.selectedIndex = i;
      }
    }
  };
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
  
  .tabs {
    width: 100%;
  }
  
  .tab-buttons {
    display: flex;
    justify-content: flex-start; /* Align tabs to the left */
    margin-bottom: 0; /* No margin between buttons */
  }
  
  .tab-buttons button {
    padding: 0.5rem 1rem;
    cursor: pointer;
    border: none;
    background: none;
    color: rgb(255, 255, 255); 
    transition: background-color 0.3s, box-shadow 0.3s ease-in-out;
    margin-right: 3rem; 
    font-family: "Outfit", sans-serif;
    font-size: medium;
    position: relative;
  }
  
  .tab-buttons button.active {
    border-bottom: 2px solid #5F98EF; 
  }
  
  /* Hover effect */
  .tab-buttons button:hover {
    border-bottom: 2px solid #5F98EF; 
  }
  
  .tab-content {
    padding: 1rem;
  }
  
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s;
  }
  
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
  </style>
  