<template>
  <nav class="navbar">
    <div class="logo">MonetA</div>
    <SearchBar @search="handleSearch" />
    <UserMenu />
  </nav>
</template>

<script>
import SearchBar from "./SearchBar.vue";
import UserMenu from "./UserMenu.vue";

export default {
  name: "NavigationBar",
  components: {
    SearchBar,
    UserMenu,
  },
  methods: {
    handleSearch(query) {
      //backend
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1b2233;
  padding: 12px 24px;
  height: 60px;
  font-family: "Outfit", sans-serif;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: white;
}
</style>
