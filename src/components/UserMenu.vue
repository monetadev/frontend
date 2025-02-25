<template>
  <div class="user-menu" @click="toggleMenu">
    <div class="avatar">JD</div>
    <div class="user-info">
      <p class="name">John Doe</p>
      <p class="username">@_john.doe1337</p>
    </div>

    <ul v-if="showMenu" class="dropdown-menu">
      <li @click="goToSettings">Account Settings</li>
      <li @click="logout">Logout</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "UserMenu",
  data() {
    return {
      showMenu: false
    };
  },
  methods: {
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    goToSettings() {
      this.showMenu = false;
    },
    logout() {
      this.showMenu = false;
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.user-menu {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  font-family: "Outfit", sans-serif;
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: #5f98ef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  margin-right: 10px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  color: white;
}

.name {
  font-size: 14px;
  font-weight: bold;
  margin: 0;
}

.username {
  font-size: 12px;
  color: gray;
  margin: 0;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 50px;
  background: #1b2233;
  border-radius: 8px;
  list-style: none;
  padding: 8px;
  width: 160px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

.dropdown-menu li {
  padding: 10px;
  cursor: pointer;
  color: white;
  font-size: 14px;
}

.dropdown-menu li:hover {
  background: #5F98EF;
  border-radius: 4px;
}
</style>
