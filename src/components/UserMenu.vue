<template>
  <div class="user-menu" @click="toggleMenu">
    <div class="avatar-container">
      <!-- Show initials placeholder if no profile picture -->
      <div v-if="!hasProfilePicture" class="avatar avatar-placeholder">
        {{ userInitials }}
      </div>
      <!-- Show profile picture if it exists -->
      <div v-else class="avatar-image-container">
        <img
            :src="profilePictureUrl"
            alt="Profile Picture"
            @error="handleImageError"
        >
      </div>
    </div>

    <div class="user-info">
      <p class="name">{{ fullName }}</p>
      <p class="username">{{ usernameText }}</p>
    </div>

    <transition name="dropdown">
      <ul v-if="showMenu" class="dropdown-menu">
        <li @click="goToSettings">
          <i class="fas fa-cog icon"></i>
          <span>Account Settings</span>
        </li>
        <li @click="logout">
          <i class="fas fa-sign-out-alt icon"></i>
          <span>Logout</span>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { ME_QUERY } from "@/graphql/auth.js";
import { useRouter } from "vue-router";
import apolloClient from "@/plugins/apollo.js";

const { result, loading, error } = useQuery(ME_QUERY);
const user = computed(() => result.value?.me);
const router = useRouter();
const showMenu = ref(false);
const hasProfilePicture = ref(false);

// Profile picture URL computation
const profilePictureUrl = computed(() => {
  if (loading.value || error.value || !user.value) return '';

  // Use userId for the profile picture URL
  return `http://localhost:8080/profile/${user.value.id}`;
});

// Watch for changes in user data to check profile picture
watch(user, (newValue) => {
  if (newValue) {
    checkProfilePicture();
  }
}, { immediate: true });

function checkProfilePicture() {
  if (!user.value) return;

  const img = new Image();
  img.onload = () => {
    hasProfilePicture.value = true;
  };
  img.onerror = () => {
    hasProfilePicture.value = false;
  };
  img.src = profilePictureUrl.value;
}

// Handle image load error
function handleImageError() {
  hasProfilePicture.value = false;
}

// Generate user initials for the placeholder based on the requirements
const userInitials = computed(() => {
  if (loading.value || error.value || !user.value) return '?';

  // Use initials if both firstName AND lastName exist
  if (user.value.firstName && user.value.lastName) {
    return `${user.value.firstName.charAt(0)}${user.value.lastName.charAt(0)}`.toUpperCase();
  }
  // Otherwise use first character of username
  else if (user.value.username) {
    return user.value.username.charAt(0).toUpperCase();
  }

  return '?';
});

const fullName = computed(() => {
  if (loading.value) return "Loading...";
  if (error.value) return "Error";
  if (user.value) {
    return `${user.value.firstName} ${user.value.lastName}`;
  }
  return "Guest";
});

const usernameText = computed(() => {
  if (loading.value) return "";
  if (error.value) return "";
  if (user.value) {
    return `@${user.value.username}`;
  }
  return "";
});

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function goToSettings() {
  showMenu.value = false;
  router.push('/settings');
}

function logout() {
  showMenu.value = false;
  // TODO: Implement logout logic (JWT cookie management)

  apolloClient.clearStore().then(() => {
    //navigate to log-in screen after clearing apollo cache
    router.push('/login');
  })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
/* Note: Font Awesome should be imported in your main app entry point or index.html */

.user-menu {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  font-family: "Outfit", sans-serif;
  transition: all 0.2s ease;
  padding: 6px;
  border-radius: 24px;
  user-select: none;
}

.user-menu:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.avatar-container {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.avatar-container:hover {
  transform: scale(1.05);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
}

.avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.avatar-placeholder {
  background-color: #5f98ef;
  font-size: 16px;
  font-weight: 600;
}

.avatar-image-container {
  width: 100%;
  height: 100%;
  background: transparent;
}

.avatar-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
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
  font-weight: 600;
  margin: 0;
  transition: color 0.2s ease;
  letter-spacing: 0.2px;
}

.username {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  transition: color 0.2s ease;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 54px;
  background: rgba(27, 34, 51, 0.98);
  border-radius: 12px;
  list-style: none;
  padding: 6px;
  width: 200px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 10;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dropdown-menu:before {
  content: '';
  position: absolute;
  top: -8px;
  right: 20px;
  width: 16px;
  height: 16px;
  background: rgba(27, 34, 51, 0.98);
  transform: rotate(45deg);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.dropdown-menu li {
  padding: 12px 14px;
  cursor: pointer;
  color: white;
  font-size: 14px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  margin-bottom: 2px;
  font-weight: 500;
}

.dropdown-menu li:last-child {
  margin-bottom: 0;
  color: #ff6b6b; /* Highlight logout in red */
}

.dropdown-menu li:hover {
  background: #5F98EF;
  transform: translateX(2px);
  color: white; /* Reset to white color on hover, including logout button */
}

.dropdown-menu .icon {
  margin-right: 12px;
  font-size: 14px;
  width: 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.dropdown-menu li:last-child .icon {
  color: #ff6b6b; /* Match logout text color */
}

.dropdown-menu li:hover .icon {
  color: white; /* Icon color on hover */
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s, transform 0.25s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
