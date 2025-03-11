<template>
  <nav class="navbar" :class="{ collapsed: isSidebarCollapsed }">
    <SearchBar />

    <UserMenu />
  </nav>
</template>

<script>
import SearchBar from "@/components/SearchBar.vue";
import UserMenu from "@/components/UserMenu.vue";

export default {
  name: "NavigationBar",
  components: { SearchBar, UserMenu },
  props: {
    isSidebarCollapsed: Boolean,
  },
};
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1b2233;
  padding: 15px 20px;
  color: white;
  position: fixed;
  left: 230px;
  right: 0;
  top: 0;
  height: 60px;
  transition: left 0.3s ease-in-out;
  font-family: "Outfit", sans-serif;
  z-index: 1000;
}

.navbar.collapsed {
  left: 80px;
}
</style>
