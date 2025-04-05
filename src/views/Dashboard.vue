<template>
  <div class="dashboard">
    <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />

    <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
      <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
      <div class="content">
        <h1>Your Dashboard</h1>
        <p>Manage your study materials, quizzes, and more!</p>
      </div>
    </div>
  </div>
  <Footer :class="[isSidebarCollapsed ? 'footer-collapsed' : 'footer-expanded']" />
</template>

<script setup>
import { ref } from 'vue';
import SidebarNavigation from "@/components/SideNavigation.vue";
import NavigationBar from "@/components/TopNavigation.vue";
import Footer from "@/components/Footer.vue";

// Component name (optional in Vue 3.3+)
defineOptions({
  name: 'Dashboard'
});

// Reactive state
const isSidebarCollapsed = ref(false);

// Methods
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
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
  padding: 20px;
  color: white;
}

/* Footer dynamic layout */
.footer-expanded {
  margin-left: 230px;
  transition: margin-left 0.3s ease-in-out;
}

.footer-collapsed {
  margin-left: 80px;
  transition: margin-left 0.3s ease-in-out;
  
}
</style>
