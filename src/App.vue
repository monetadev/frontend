<template>
  <div class="app-container">
    <!-- Sidebar (Only for Logged-In Pages) -->
    <Sidebar v-if="isAuthenticated" />

    <!-- Main Content -->
    <div class="main-content">
      <!-- Navigation Bar (Only for Logged-In Pages) -->
      <nav v-if="isAuthenticated">
        <NavBar />
      </nav>

      <!-- Dynamic Page Content -->
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import NavBar from "./components/NavBar.vue";
import Sidebar from "./components/Sidebar.vue";

// Vue Router Hook to Check Current Route
const route = useRoute();

// Show Sidebar & Navbar Only for Logged-In Pages
const isAuthenticated = computed(() => {
  return !["/", "/reset-password", "/login"].includes(route.path);
});
</script>

<style scoped>
/* App Layout */
.app-container {
  display: flex;
  height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 310px;
  height: 100vh;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #121729;
  color: white;
}
</style>
