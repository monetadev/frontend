<template>
  <div class="user-menu" @click="toggleMenu">
    <div class="avatar">{{ avatarInitials }}</div>
    <div class="user-info">
      <p class="name">{{ fullName }}</p>
      <p class="username">{{ usernameText }}</p>
    </div>

    <ul v-if="showMenu" class="dropdown-menu">
      <li @click="goToSettings">Account Settings</li>
      <li @click="logout">Logout</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { ME_QUERY } from "@/graphql/auth.js";
import {useRouter} from "vue-router";
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

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

//route to settings
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
