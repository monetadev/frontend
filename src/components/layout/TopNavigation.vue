<template>
  <nav :class="['navbar', { collapsed: isSidebarCollapsed }]">
    <div class="navbar-content-left">
      <SearchBar />
    </div>

    <div class="navbar-content-right">
      <UserMenu />
    </div>
  </nav>
</template>

<script setup>
import SearchBar from "@/components/layout/SearchBar.vue"; // Path to your SearchBar component
import UserMenu from "@/components/layout/UserMenu.vue";   // Path to your UserMenu component

// Props definition using defineProps
const props = defineProps({
  isSidebarCollapsed: Boolean,
});
</script>

<style scoped>
.navbar {
  /* Local Variables pointing to global ones for clarity */
  --navbar-height: var(--navbar-height); /* From main.css */
  --navbar-padding-x: 25px;
  --navbar-padding-y: 0;
  --navbar-bg-color: var(--bg-secondary); /* Use secondary bg */
  /* --navbar-border-color: var(--border-color); /* Use consistent border color (changed below) */
  --navbar-text-color: var(--text-primary); /* Use primary text */
  --navbar-z-index: 99; /* Lower than sidebar if overlap is possible */
  --navbar-transition-duration: var(--layout-transition-duration); /* Use global duration */

  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--navbar-bg-color);
  color: var(--navbar-text-color);
  padding: var(--navbar-padding-y) var(--navbar-padding-x);

  position: fixed;
  top: 0;
  right: 0;
  left: var(--sidebar-width-expanded); /* Use global variable */
  height: var(--navbar-height);
  box-sizing: border-box;

  /* Use global transition duration */
  transition: left var(--navbar-transition-duration) ease-in-out,
  box-shadow var(--navbar-transition-duration) ease-in-out; /* Add shadow transition */

  font-family: "Outfit", sans-serif;
  z-index: var(--navbar-z-index);

  /* --- Theming Enhancements --- */
  /* Use consistent border color */
  border-bottom: 1px solid var(--border-color);
  /* Add subtle shadow for depth */
  box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.25);
}

/* Adjust 'left' when the sidebar is collapsed */
.navbar.collapsed {
  left: var(--sidebar-width-collapsed); /* Use global variable */
}

/* Containers for left and right groups */
.navbar-content-left {
  flex-grow: 1;
  margin-right: 20px;
  max-width: 600px;
}

.navbar-content-right {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
}

/* Responsive adjustments (remain the same) */
@media (max-width: 768px) {
  .navbar {
    --navbar-padding-x: 15px;
  }
  .navbar-content-left {
    max-width: 400px;
    margin-right: 10px;
  }
}

@media (max-width: 576px) {
  .navbar {
    --navbar-padding-x: 10px;
  }
  .navbar-content-left {
    max-width: none;
    flex-grow: 1;
  }
  .navbar-content-right {
    gap: 8px;
  }
}
</style>