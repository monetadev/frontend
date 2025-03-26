<template>
  <div :class="['sidebar', { collapsed: isCollapsed }]">
    <div class="sidebar-header">
      <button class="toggle-button" @click="toggleSidebar">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
          <path d="M4 12h16M4 6h16M4 18h16" stroke="white" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
      <transition name="fade">
        <span v-if="!isCollapsed" class="logo">Moneta</span>
      </transition>
    </div>

    <div class="menu-container">
      <ul class="menu">
        <router-link
            v-for="item in menuItems"
            :key="item.name"
            :to="item.path"
            class="menu-link"
        >
          <li
              :class="{ active: $route.path === item.path }"
              @click="setActive(item.name)"
          >
      <span class="icon">
        <component :is="item.icon" :active="activeMenu === item.name" />
      </span>
            <transition name="fade">
              <span v-if="!isCollapsed" class="menu-text">{{ item.name }}</span>
            </transition>
          </li>
        </router-link>
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
  props: {
    isCollapsed: Boolean,
  },
  data() {
    return {
      activeMenu: "Dashboard",
      menuItems: [
        { name: "Dashboard", icon: DashboardIcon, path: "/dashboard"  },
        { name: "My Stuffs", icon: MyStuffsIcon, path: "/my-stuffs" },
        { name: "Add Flashcards", icon: FlashcardsIcon, path: "/add-flashcard"},
        { name: "Quizzes", icon: QuizzesIcon, path: "/quizzes"  },
        { name: "Explore", icon: ExploreIcon, path: "/view"  },
        { name: "Settings", icon: SettingsIcon, path: "/settings"  },
      ],
    };
  },
  methods: {
    toggleSidebar() {
      this.$emit("toggle");
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
  position: fixed;
  left: 0;
  top: 0;
  padding: 10px;
  transition: width 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  font-family: "Outfit", sans-serif;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 30px;
  gap: 10px;
}

.toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: white;
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

.sidebar.collapsed .menu-text {
  display: none;
}

.menu-link {
  text-decoration: none;
  display: block;
}
.menu-link:visited,
.menu-link:link {
  color: inherit;
}

</style>
