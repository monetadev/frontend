<template>

  
  <div class="user-menu" @click="toggleMenu">

   <div class ='create set' @click.stop="toggleCreatePopup" >
      <createButton text="+" @click="" />
    </div> 

    <div class="avatar">{{ avatarInitials }}</div>
    <div class="user-info">
      <p class="name">{{ fullName }}</p>
      <p class="username">{{ usernameText }}</p>
    </div>

    <ul v-if="showMenu" class="dropdown-menu">
      <li @click="goToSettings">Account Settings</li>
      <li @click="logout">Logout</li>
    </ul>

    <div v-if="showCreatePopup" class="create-popup">
      <div class="popup-header">
        <h3>Create New</h3>
        <button class="close-btn" @click.stop="showCreatePopup = false">×</button>
      </div>
      <div class="popup-options">
        <div class="popup-option" @click="generateFlashcard">
          <span class="option-icon">🤖</span>
          <span class="option-text">Generate Flashcard</span>
        </div>
        <div class="popup-option" @click="createFlashcard">
          <span class="option-icon">✏️</span>
          <span class="option-text">Create Flashcard</span>
        </div>
      </div>
    </div>
    
    <!-- Overlay to close popup when clicking outside -->
    <div v-if="showCreatePopup" class="popup-overlay" @click.stop="showCreatePopup = false"></div>
  </div>
</template>

<script setup>
import createButton from '@/components/createButton.vue';
import { ref, computed } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { ME_QUERY } from "@/graphql/auth.js";
import { useRouter } from "vue-router";
import router from '@/router';
import apolloClient from "@/plugins/apollo.js";


const { result, loading, error } = useQuery(ME_QUERY);

const user = computed(() => result.value?.me);

const router = useRouter();


const avatarInitials = computed(() => {
  if (loading.value) return "";
  if (error.value) return "";
  if (user.value) {
    const firstInitial = user.value.firstName ? user.value.firstName.charAt(0) : '';
    const lastInitial = user.value.lastName ? user.value.lastName.charAt(0) : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }
  return "";
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

const showMenu = ref(false);
const showCreatePopup = ref(false);


function toggleMenu() {
  showMenu.value = !showMenu.value;
}
function toggleCreatePopup(event) {
  event.stopPropagation();
  showCreatePopup.value = !showCreatePopup.value;
  // Close menu if open
  if (showMenu.value) showMenu.value = false;
}

function generateFlashcard() {
  showCreatePopup.value = false;
  // TODO: Implement generate flashcard logic
  console.log("Generate flashcard");
  router.push('/add-flashcard');
}

function createFlashcard() {
  showCreatePopup.value = false;
  // TODO: Implement create flashcard logic
  console.log("Create flashcard");
  router.push('/create');
}

// Route to settings (if needed, implement logic here)

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

.user-menu {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  font-family: "Outfit", sans-serif;
}

.create-set {
  margin-right: 15px;
  cursor: pointer;
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
  z-index: 10;
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

/* Popup styles */
.create-popup {
  position: absolute;
  
  top: 50px;
  right: 0;
  background: #1b2233;
  border-radius: 8px;
  padding: 15px;
  width: 220px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.popup-header h3 {
  color: white;
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
}

.close-btn:hover {
  color: white;
}

.popup-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.popup-option {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border-radius: 6px;
  color: white;
}

.popup-option:hover {
  background: #5F98EF;
}

.option-icon {
  margin-right: 10px;
  font-size: 18px;
}

.option-text {
  font-size: 14px;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
}
</style>