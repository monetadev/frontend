<template>
  <div class="dashboard">
    <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
      <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
      <div class="content">

        <FlashcardTitle :title="currentDeck.title" />

        <div class="flashcard-container">
          <FlashCard
              :term="currentFlashcard.term"
              :definition="currentFlashcard.definition"
              ref="flashcard"
          />
        </div>

        <div class="icon-container">
          <div class="prev-next">
            <PrevIcon
                active
                :disabled="currIndex === 0"
                @click="prevCardDebounced"
            />
            <counterDisplay :current="currIndex+1" :total="flashcards.length" />
            <NextIcon active @click="nextCardDebounced"/>
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
import { useRoute } from 'vue-router';
import { useQuery } from '@vue/apollo-composable';
import { GET_FLASHCARD_SET_BY_ID } from "@/graphql/auth.js";
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
  setup() {
    const route = useRoute();
    const flashcardSetId = route.params.id;

    console.log('Viewing flashcard set with ID:', flashcardSetId);

    // If we have an ID, fetch the data
    let flashcardSet = null;

    if (flashcardSetId) {
      const { result, loading, error } = useQuery(
          GET_FLASHCARD_SET_BY_ID,
          { id: flashcardSetId }
      );

      // Make this data available to the template
      flashcardSet = { result, loading, error };
    }

    return {
      flashcardSetId,
      flashcardSet
    };
  },
  data() {
    return {
      isSidebarCollapsed: true,
      currIndex: 0,
      isNavigating: false,
      fallbackFlashcards: [
        {id: 1, term: "What is an Atom?", definition: "The smallest unit of matter."},
        {id: 2, term: "What is a Molecule?", definition: "A group of atoms bonded together."},
        {id: 3, term: "What is a Cell?", definition: "The basic unit of life."},
        {id: 4, term: "What is a Tissue?", definition: "A group of cells that work together to perform a specific function."},
        {id: 5, term: "What is an Organ?", definition: "A group of tissues that work together to perform a specific function."},
        {id: 6, term: "What is an Organ System?", definition: "A group of organs that work together to perform a specific function."},
        {id: 7, term: "What is an Organism?", definition: "An individual living thing."},
        {id: 8, term: "What is a Population?", definition: "A group of organisms of the same species that live in the same area."},
        {id: 9, term: "What is a Community?", definition: "All the populations of different species that live in the same area."},
      ],
      fallbackDeck: {
        id: 1,
        title: "Biology",
      }
    };
  },
  computed: {
    // Use GraphQL data if available, otherwise fallback
    flashcards() {
      if (this.flashcardSetId && this.flashcardSet?.result?.value?.findFlashcardSetById?.flashcards) {
        return this.flashcardSet.result.value.findFlashcardSetById.flashcards;
      }
      return this.fallbackFlashcards;
    },
    currentDeck() {
      if (this.flashcardSetId && this.flashcardSet?.result?.value?.findFlashcardSetById) {
        return this.flashcardSet.result.value.findFlashcardSetById;
      }
      return this.fallbackDeck;
    },
    currentFlashcard() {
      return this.flashcards[this.currIndex] || { term: "", definition: "" };
    },
  },

  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },

    //These Debounce Methods Prevent Spamming the Next and Previous Buttons

    nextCardDebounced() {
      if (this.isNavigating) return;
      this.isNavigating = true;

      this.nextCard();

      setTimeout(() => {
        this.isNavigating = false;
      }, 300);
    },

    prevCardDebounced() {
      if (this.isNavigating) return;
      this.isNavigating = true;

      this.prevCard();

      setTimeout(() => {
        this.isNavigating = false;
      }, 300);
    },

    //Methods for Navigation
    nextCard() {
      if (this.currIndex < this.flashcards.length - 1) {
        this.currIndex++;
      } else {
        this.currIndex = 0;
      }
    },
    prevCard() {
      if (this.currIndex > 0) {
        this.currIndex--;
      } else {
        this.currIndex = this.flashcards.length - 1;
      }
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
  height: 100%;
}

.flashcard-container {
  margin-top: 20px;
  position: relative;
  z-index: 5;
}

.icon-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  padding-left: 500px;
  padding-top: 30px;
  z-index: 10;
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