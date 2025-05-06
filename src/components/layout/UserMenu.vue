<template>
  <div class="user-menu" ref="userMenuRef">
    <div class="user-menu-trigger" @click="toggleMenu" role="button" aria-haspopup="true" :aria-expanded="showMenu">
      <div class="avatar-container">
        <div v-if="!hasProfilePicture" class="avatar avatar-placeholder">
          {{ userInitials }}
        </div>
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
    </div>

    <transition name="dropdown">
      <ul v-if="showMenu" class="dropdown-menu">
        <li @click="goToSettings" role="menuitem">
          <font-awesome-icon :icon="getIcon('cog')" class="icon"/>
          <span>Account Settings</span>
        </li>
        <li @click="logout" role="menuitem" class="logout-item">
          <font-awesome-icon :icon="getIcon('sign-out-alt')" class="icon"/>
          <span>Logout</span>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import {ref, computed, watch, onMounted, onUnmounted} from 'vue';
import {useQuery} from '@vue/apollo-composable';
import {ME_QUERY} from "@/graphql/auth.js"; // Adjust path if needed
import {useRouter} from "vue-router";
import apolloClient from "@/plugins/apollo.js"; // Adjust path if needed
import {useSidebarStore} from "@/stores/sidebar.js";

// --- Font Awesome Setup ---
import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {faCog, faSignOutAlt} from '@fortawesome/free-solid-svg-icons';

library.add(faCog, faSignOutAlt);

const faIcons = {
  'cog': faCog,
  'sign-out-alt': faSignOutAlt
};

function getIcon(iconName) {
  return faIcons[iconName];
}

// --- Component State and Logic ---
const {result, loading, error} = useQuery(ME_QUERY);
const sidebarStore = useSidebarStore();
const user = computed(() => result.value?.me);
const router = useRouter();
const showMenu = ref(false);
const hasProfilePicture = ref(false);
const userMenuRef = ref(null);

const profilePictureUrl = computed(() => {
  if (loading.value || error.value || !user.value) return '';
  return `http://localhost:8080/profile/${user.value.id}`;
});

function checkProfilePicture() {
  if (!user.value || !profilePictureUrl.value) {
    hasProfilePicture.value = false;
    return;
  }
  const img = new Image();
  img.onload = () => {
    hasProfilePicture.value = true;
  };
  img.onerror = () => {
    hasProfilePicture.value = false;
  };
  img.src = profilePictureUrl.value;
}

function handleImageError() {
  hasProfilePicture.value = false;
}

watch(user, (newValue) => {
  if (newValue) {
    checkProfilePicture();
  } else {
    hasProfilePicture.value = false;
  }
}, {immediate: true});

// Generate user initials for the avatar placeholder
const userInitials = computed(() => {
  if (loading.value || error.value || !user.value) return '?';
  if (user.value.firstName && user.value.lastName) {
    return `${user.value.firstName.charAt(0)}${user.value.lastName.charAt(0)}`.toUpperCase();
  } else if (user.value.username) {
    return user.value.username.charAt(0).toUpperCase();
  }
  return '?';
});

// Display user's full name
const fullName = computed(() => {
  if (loading.value) return "Loading...";
  if (error.value) return "Error";
  if (user.value && user.value.firstName && user.value.lastName) {
    return `${user.value.firstName} ${user.value.lastName}`;
  } else if (user.value && user.value.username) {
    return user.value.username;
  }
  return "User";
});

// Display username (like @handle)
const usernameText = computed(() => {
  if (loading.value || error.value || !user.value?.username) return "";
  return `@${user.value.username}`;
});

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function goToSettings() {
  showMenu.value = false;
  router.push('/settings'); // Adjust route if needed
}

async function logout() {
  showMenu.value = false;
  try {
    sidebarStore.clearUserSpecificData();
    sessionStorage.removeItem('app_auth_status');
    await apolloClient.clearStore();
    await apolloClient.resetStore();
    await router.push('/login');
  } catch (err) {
    console.error(err);
  }
}

const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* ==================================
   User Menu Styles - Modernized Theme
   ================================== */

/* Inherit font and define component-specific vars */
.user-menu {
  --avatar-size: 38px; /* Consistent avatar size */
  /* Define logout colors locally for better control on dark bg */
  --logout-text-color: #ff6b6b; /* Original logout color */
  --logout-hover-bg: rgba(255, 107, 107, 0.15); /* Subtle red background */
  --logout-hover-text: #ff8f8f; /* Slightly lighter red on hover */

  /* --- ADDED: Assumed RGB value for primary color for the glow --- */
  /* Replace with your actual global variable or RGB values */
  --primary-color-rgb: 95, 152, 239; /* Example: RGB for #5f98ef */

  position: relative; /* For dropdown positioning */
  font-family: "Outfit", sans-serif;
  user-select: none; /* Prevent text selection on click */
}

/* Clickable trigger area containing avatar and user info */
.user-menu-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px; /* Add some padding around the content */
  border-radius: 24px; /* Rounded corners for hover effect */
  /* REMOVED background transition */
  gap: 10px; /* Space between avatar and user info */
}

/* --- REMOVED HOVER BACKGROUND CHANGE ---
.user-menu-trigger:hover {
  background-color: var(--bg-tertiary, rgba(255, 255, 255, 0.08));
}
*/

/* Avatar container - Circle */
.avatar-container {
  width: var(--avatar-size);
  height: var(--avatar-size);
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  /* Use tertiary background as placeholder bg */
  background-color: var(--bg-tertiary, #4a5568);
  display: flex;
  align-items: center;
  justify-content: center;
  /* Use consistent border color */
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  color: var(--text-primary, white);
  font-weight: 600; /* Make initials bold */
  /* Add position relative for potential pseudo-elements if needed */
  position: relative;
  /* Ensure smooth transition *off* the animation if needed, though might not be necessary */
  /* transition: box-shadow 0.3s ease; */
  /* Ensure default shadow is none or minimal */
  box-shadow: none;
}

/* --- ADDED: Apply pulsing glow animation on hover --- */
.user-menu-trigger:hover .avatar-container {
  /* Apply the animation */
  animation: pulseGlow 1.8s infinite ease-in-out;
  /* Optional: Add a subtle static shadow as base for the animation */
  /* box-shadow: 0 0 3px rgba(var(--primary-color-rgb, 95, 152, 239), 0.4); */
}


/* Placeholder initials text */
.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(var(--avatar-size) * 0.4); /* Scale font size with avatar */
  line-height: 1;
}

/* Container for the actual image */
.avatar-image-container {
  width: 100%;
  height: 100%;
}

.avatar-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensure image covers the area */
  display: block; /* Remove extra space below image */
}

/* User info block (Name, Username) */
.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  line-height: 1.3;
  text-align: left;
  /* Colors are inherited from trigger or set directly */
}

.name {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  color: var(--text-primary, white);
}

.username {
  font-size: 12px;
  /* Use secondary text color for username */
  color: var(--text-secondary, #a0a8b8);
  margin: 0;
  white-space: nowrap;
}

/* Dropdown Menu Container */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px); /* Position below trigger with gap */
  /* Use secondary background, same as sidebar/navbar */
  background: var(--bg-secondary, #1c2333);
  border-radius: 8px; /* Consistent rounding */
  list-style: none;
  padding: 8px; /* Padding inside the dropdown border */
  margin: 0;
  min-width: 200px; /* Slightly wider */
  /* Consistent shadow */
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  /* Consistent border */
  border: 1px solid var(--border-color, #121729);
  overflow: hidden; /* For transitions */
}

/* Dropdown Menu Items (List elements) */
.dropdown-menu li {
  padding: 10px 14px;
  cursor: pointer;
  /* Use secondary text color by default */
  color: var(--text-secondary, #e0e0e0);
  font-size: 14px;
  border-radius: 6px; /* Slightly smaller rounding */
  display: flex;
  align-items: center;
  transition: background-color 0.15s ease, color 0.15s ease;
  margin-bottom: 2px; /* Small gap between items */
  font-weight: 400;
  white-space: nowrap;
}
.dropdown-menu li:last-child {
  margin-bottom: 0;
}

/* Hover state for regular items */
.dropdown-menu li:hover:not(.logout-item) {
  /* Use tertiary background for hover */
  background-color: var(--bg-tertiary, #3c4a64);
  /* Use primary text color on hover */
  color: var(--text-primary, #ffffff);
}
.dropdown-menu li:hover:not(.logout-item) .icon {
  color: var(--text-primary, #ffffff); /* Match icon color to text */
}

/* Logout Item Specific Styles */
.logout-item {
  color: var(--logout-text-color);
}
.logout-item .icon {
  color: var(--logout-text-color); /* Match icon color */
}
.logout-item:hover {
  background-color: var(--logout-hover-bg);
  color: var(--logout-hover-text);
}
.logout-item:hover .icon {
  color: var(--logout-hover-text); /* Match icon color */
}

/* Icon styling within dropdown items */
.dropdown-menu .icon {
  margin-right: 12px;
  font-size: 16px; /* Slightly larger icon */
  width: 18px; /* Fixed width */
  text-align: center;
  /* Use secondary text color by default */
  color: var(--text-secondary, #a0a8b8);
  flex-shrink: 0;
  transition: color 0.15s ease;
}

/* Transition for dropdown appearance/disappearance */
/* Uses the name 'dropdown' from the template */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px); /* Start slightly up */
}
.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0);
}


/* Responsive: Hide user info on small screens */
@media (max-width: 576px) {
  .user-info {
    display: none;
  }
  .user-menu-trigger {
    padding: 5px; /* Adjust padding if needed */
    gap: 0; /* Remove gap when text is hidden */
  }
  .dropdown-menu {
    min-width: 180px; /* Adjust width if needed */
  }
}

/* --- ADDED: Keyframes for the pulsing glow animation --- */
@keyframes pulseGlow {
  0% {
    /* Use RGB variable or hardcoded values */
    box-shadow: 0 0 3px rgba(var(--primary-color-rgb, 95, 152, 239), 0.4),
    0 0 5px rgba(var(--primary-color-rgb, 95, 152, 239), 0.2);
  }
  50% {
    box-shadow: 0 0 7px rgba(var(--primary-color-rgb, 95, 152, 239), 0.7),
    0 0 12px rgba(var(--primary-color-rgb, 95, 152, 239), 0.4);
  }
  100% {
    box-shadow: 0 0 3px rgba(var(--primary-color-rgb, 95, 152, 239), 0.4),
    0 0 5px rgba(var(--primary-color-rgb, 95, 152, 239), 0.2);
  }
}

</style>