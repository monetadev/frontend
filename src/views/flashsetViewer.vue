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
          <tab title="Flashcard Sets" class="panel-container">

            <div class="divide">
              <divider time="Today"/>
            </div>
            <div class="panel-wrapper">
              <Panel number="10" username="chris" title="OS Quiz 2" />
            </div>
            <div class="panel-wrapper">
              <Panel number="22" username="Gagan" title="AI & Machine Learing" />
            </div>
            <div class="divide">
              <divider time="Last week"/>
            </div>
            <div class="panel-wrapper">
              <Panel number="33" username="Jomal" title="Moblie  Development" />
            </div>
            <div class="panel-wrapper">
              <Panel number="23" username="Matt" title="Spring Cards" />
            </div>
            <div class="divide">
              <divider time="1 month ago"/>
            </div>
            <div class="panel-wrapper">
              <Panel number="12" username="Jen" title="React Native" />
            </div>

          </tab>
          <tab title="Practice Test">Contents2</tab>
          <tab title="Study Guides">Contents3</tab>
          <tab title="Expert solutions">Contents4</tab>
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
import Panel from "@/components/panelSets.vue";
import divider from "@/components/timeDivider.vue";

export default {
  name: "FlashsetViewer",
  components: {
    SidebarNavigation,
    NavigationBar,
    setBar,
    Tabs,
    Panel,
    Tab,
    divider,
  },
  data() {
    return {
      isSidebarCollapsed: false,
      mode: 'default'
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

.flashset-set-viewer {
  display: flex;
  background-color: #22293A;
  min-height: 100vh;
  font-family: "Outfit", sans-serif;
}

.SidebarNavigation {
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  height: 100vh;
  z-index: 50;
  background-color: #22293A;
}

.main-content {
  margin-left: 250px;
  flex: 1;
  transition: margin-left 0.3s ease-in-out;
  position: relative;
  z-index: 100;
  padding: 20px;
  margin-top: 60px;
}

.main-content.collapsed {
  margin-left: 80px;
}

.Top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-top: 1rem;
  background-color: #22293A;
  width: 50%;
  position: relative;
  z-index: 110;
}

.Top h1 {
  font-size: 2rem;
  font-weight: bold;
  padding: 10px;
  color: white;
}

.Search_Bar {
  padding-left: 2%;
}

.wrapper {
  padding-left: 2%;
  padding-top: 5%;
}

.panel-container {
  display: flex;
  flex-direction: column;
  gap: 20px; 
  padding-top: 2%;
}

.panel-wrapper {
  margin-bottom: 20px; 
}

.panel-wrapper:last-child {
  margin-bottom: 0;
}
.divide {
  
}
</style>