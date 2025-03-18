<template>
  <div class="dashboard">
    <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
      <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
      <div class="content">
  
        <FlashcardTitle :title="currentDeck.title" />

        <transition :name="transitionName">
          <div class="flashcard-wrapper" :key="currIndex">
            <FlashCard :term="currentFlashcard.term" :definiton="currentFlashcard.definition" />
          </div>
        </transition>
      
      <div class="icon-container">
        <div class="prev-next">
          <PrevIcon active :disabled="currIndex === 0" @click="prevCard"/>     
          <counterDisplay :current="currIndex+1" :total="flashcards.length" />
          <NextIcon active @click="nextCard"/>
        </div>

        <div class="full-screen-container">
              <shuffle active @click="shuffleCards" />
              <PlayButtonIcon active />
              <FullScreenIcon active />
        </div>
      </div> 
    </div>
  </div> 
</div>
</template>

<script>
import SidebarNavigation from "@/components/SideNavigation.vue";
import NavigationBar from "@/components/TopNavigation.vue";
import FlashCard from "@/components/FlashCard.vue";
import FlashcardTitle from "@/components/FlashcardTitle.vue";
import NextIcon from "@/components/icons/NextIcon.vue";
import PrevIcon from "@/components/icons/prevIcon.vue";
import FullScreenIcon from "@/components/icons/fullScreen.vue";
import PlayButtonIcon from "@/components/icons/playButton.vue";
import counterDisplay from "@/components/icons/counterDisplay.vue";
import shuffle from "@/components/icons/shuffle.vue";

export default {
  name: "Dashboard",
  components: {
    SidebarNavigation,
    FlashCard,
    NavigationBar,
    FlashcardTitle, 
    NextIcon,
    PrevIcon,
    FullScreenIcon,
    PlayButtonIcon,
    counterDisplay,
    shuffle,
  },
  data() {
    return {
      isSidebarCollapsed: true,
      currIndex : 0,
      prevIndex:0, 
      transitionName: 'slide-left',

      currentDeck:{
        id : 1,
        title: "Biology",
      },
      flashcards:[
        {id: 1, term: "What is an Atom?", definition: "The smallest unit of matter."},
        {id: 2, term: "What is a Molecule?", definition: "A group of atoms bonded together."},
        {id: 3, term: "What is a Cell?", definition: "The basic unit of life."},
        {id: 4, term: "What is a Tissue?", definition: "A group of cells that work together to perform a specific function."},
        {id: 5, term: "What is an Organ?", definition: "A group of tissues that work together to perform a specific function."},
        {id: 6, term: "What is an Organ System?", definition: "A group of organs that work together to perform a specific function."},
        {id: 7, term: "What is an Organism?", definition: "An individual living thing."},
        {id: 8, term: "What is a Population?", definition: "A group of organisms of the same species that live in the same area."},
        {id: 9, term: "What is a Community?", definition: "All the populations of different species that live in the same area."},
        
      ]
    };
  },
  computed: {
    currentFlashcard() {
      return this.flashcards[this.currIndex] || { term: "", definition: "" };
    },
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    nextCard(){
      this.prevIndex = this.currIndex;

      if(this.currIndex < this.flashcards.length - 1){
        this.currIndex++;
      } else {
        this.currIndex = 0;
      }
      this.transitionName = 'slide-left';
    },

    prevCard() {
  // Save the current index as the previous index before changing the current index
  this.prevIndex = this.currIndex;

  if (this.currIndex > 0) {
    this.currIndex--;  // Move to the previous card
    console.log(this.currIndex);
  } else {
    this.currIndex = this.flashcards.length-1; 
    console.log(this.currIndex);
    // Go to the last card if at the start
  }
  console.log(this.currIndex);

  this.transitionName = 'slide-right';  // Set the transition
},
  shuffleCards() {
      const shuffled = [...this.flashcards];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      this.flashcards = shuffled;
      this.currIndex = 0;
    }
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
  position: relative;
  overflow: hidden;
  height: 100%; /* Ensure content area has full height */
}

/* Flashcard container needs proper positioning */
.flashcard-wrapper {
  position: absolute;
  width: 100%;
  z-index: 5; /* Set z-index to ensure visibility */
  top: 100px; /* Adjust this value to position below controls */
  padding-top: 70px;
}

/* Transition styles for sliding cards */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.5s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-from {
  transform: translateX(-100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}

.icon-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-left: 500px;
  padding-top: 600px;
  position: relative;
  z-index: 10; /* Keep controls above flashcards */

}

.prev-next,
.full-screen-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 50px;
  padding-left: 75px;
}

.prev-next svg,
.full-screen-container svg {
  width: 40px;
  height: 40px;
}

.full-screen-container {
  margin-left: auto;
  padding-right: 20%;
}

.prev-next svg:hover,
.full-screen-container svg:hover {
  cursor: pointer;
  fill: #F9F9F9;
}
</style>