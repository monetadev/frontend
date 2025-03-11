<template>
  <div class="dashboard">
    <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
      <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
      <div class="content">
  
        <FlashcardTitle title="Biology" />

        <div class="flashcards-container">
          <FlashCard
            term="What is an Atom?"
            definiton="The smallest unit of matter."
          />
        </div>

      </div>
      
      <div class="icon-container">
        <div class="prev-next">
          <PrevIcon active />
          <counterDisplay :current="1" :total="10" />
          <NextIcon active />
        </div>

        <div class="full-screen-container">
              <shuffle active />
              <PlayButtonIcon active />
              <FullScreenIcon active />
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

.icon-container {
  display: flex;
  top: 10px; 
  left: 20px; 
  justify-content: space-between; 
  align-items: center; 
  margin-top: 20px; 
  padding-left: 42%; 
}

.prev-next,
.full-screen-container {
  display: flex;
  justify-content: center; 
  align-items: center;
  gap: 50px;
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
