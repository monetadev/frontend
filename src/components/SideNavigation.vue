<template>
  <div :class="['sidebar', { collapsed: isCollapsed }]">
    <button class="toggle-button" @click="toggleSidebar">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
        <path d="M4 12h16M4 6h16M4 18h16" stroke="white" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>

    <div class="menu-container">
      <ul class="menu">
        <li
            v-for="item in menuItems"
            :key="item.name"
            :class="{ active: activeMenu === item.name }"
            @click="setActive(item.name)"
        >
          <span class="icon">
            <component :is="item.icon" :active="activeMenu === item.name" />
          </span>
          <transition name="fade">
            <span v-if="showMenuText" class="menu-text">{{ item.name }}</span>
          </transition>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import DashboardIcon from "./icons/DashboardIcon.vue";
import MyStuffsIcon from "./icons/MyStuffsIcon.vue";
import FlashcardsIcon from "./icons/FlashcardsIcon.vue";
import QuizzesIcon from "./icons/QuizzesIcon.vue";
import ExploreIcon from "./icons/ExploreIcon.vue";
import SettingsIcon from "./icons/SettingsIcon.vue";

export default {
  name: "SidebarNavigation",
  components: {
    DashboardIcon,
    MyStuffsIcon,
    FlashcardsIcon,
    QuizzesIcon,
    ExploreIcon,
    SettingsIcon,
  },
  data() {
    return {
      isCollapsed: false,
      showMenuText: true,
      activeMenu: "Add Flashcards",
      menuItems: [
        { name: "Dashboard", icon: DashboardIcon },
        { name: "My Stuffs", icon: MyStuffsIcon },
        { name: "Add Flashcards", icon: FlashcardsIcon },
        { name: "Quizzes", icon: QuizzesIcon },
        { name: "Explore", icon: ExploreIcon },
        { name: "Settings", icon: SettingsIcon },
      ],
    };
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;

      if (this.isCollapsed) {
        this.showMenuText = false;
      } else {
        setTimeout(() => {
          this.showMenuText = true;
        }, 200);
      }
    },
    setActive(menuName) {
      this.activeMenu = menuName;
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap");

.sidebar {
  background: #1b2233;
  width: 220px;
  height: 100vh;
  padding: 10px;
  transition: width 0.3s ease-in-out;
  font-family: "Outfit", sans-serif;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar.collapsed {
  width: 80px;
}

.toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  padding: 10px;
  width: 100%;
}

.menu-container {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.menu-container::-webkit-scrollbar {
  width: 6px;
}
.menu-container::-webkit-scrollbar-thumb {
  background: transparent;
}
.menu-container:hover::-webkit-scrollbar-thumb {
  background: #5f98ef;
  border-radius: 10px;
}

.menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li {
  display: flex;
  align-items: center;
  padding: 14px;
  color: white;
  cursor: pointer;
  border-radius: 10px;
  transition: background 0.3s, font-weight 0.3s;
  margin-bottom: 8px;
}

.menu li.active {
  background: #5f98ef;
  font-weight: 700;
}

.menu li:hover {
  background: #3c4a64;
}

.menu .icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.sidebar.collapsed .menu-text {
  display: none;
}
</style>
