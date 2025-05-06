<template>
  <div class="main-layout">
    <SideNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />

    <div class="layout-main-content-area" :class="{ collapsed: isSidebarCollapsed }">
      <TopNavigation :isSidebarCollapsed="isSidebarCollapsed" />

      <main class="scrollable-content">
        <slot></slot>
      </main>
    </div>

    <Toast />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SideNavigation from "@/components/layout/SideNavigation.vue";
import TopNavigation from "@/components/layout/TopNavigation.vue";
import Toast from "@/components/ui/Toast.vue";

const isSidebarCollapsed = ref(false);

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  /* Added relative positioning to potentially contain absolutely positioned children if needed,
     though Toast uses 'fixed' so it's viewport-relative anyway. */
  position: relative;
}

.layout-main-content-area {
  flex-grow: 1;
  height: 100vh;
  overflow: hidden;
  position: relative;
  margin-left: var(--sidebar-width-expanded);
  transition: margin-left var(--layout-transition-duration) ease-in-out;
  background-color: var(--bg-primary);
}

.layout-main-content-area.collapsed {
  margin-left: var(--sidebar-width-collapsed);
}

.scrollable-content {
  height: 100%;
  overflow-y: auto;
  background-color: var(--bg-primary);
  /* Ensure padding accommodates the top navigation bar */
  padding: calc(var(--navbar-height) + 30px) 30px 30px;
  box-sizing: border-box;
}

/* Make sure your global CSS or App root defines these variables */
/* Example definitions (place in :root or similar) */
/*
:root {
  --navbar-height: 60px;
  --sidebar-width-expanded: 250px;
  --sidebar-width-collapsed: 80px;
  --layout-transition-duration: 0.3s;
  --bg-primary: #1a202c;
  --bg-secondary: #111625;
  --bg-secondary-rgb: 27, 34, 51; // For rgba() usage
  --bg-tertiary: #22293A;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --border-color: #2d3748;
  --primary-color: #3b82f6; // Example primary color
  --success-color: #4CAF50;
  --error-color: #ff6b6b;
  --warning-color: #ffcc00;
  --info-color: #2196f3;
}
*/
</style>