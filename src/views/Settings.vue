<template>
    <div class="settings-wrapper">
      <SideNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
      <div class="settings-main":class="{ 'collapsed': isSidebarCollapsed }">
        <TopNavigation :isSidebarCollapsed="isSidebarCollapsed" />
        <div class="settings-content-wrapper" :class="{ 'collapsed': isSidebarCollapsed }">
          <!-- Settings Sidebar -->
          <aside class="settings-sidebar">
            <h2 class="settings-title">Settings</h2>
            <ul>
              <li :class="{ active: activeTab === 'account' }" @click="activeTab = 'account'">
                <i class="fas fa-user"></i>
                <span>Account</span>
              </li>
              <li :class="{ active: activeTab === 'security' }" @click="activeTab = 'security'">
                <i class="fas fa-lock"></i>
                <span>Security</span>
              </li>
              
              <li :class="{ active: activeTab === 'theme' }" @click="activeTab = 'theme'">
                <i class="fas fa-moon"></i>
                <span>Theme</span>
              </li>

              <li :class="{ active: activeTab === 'admin' }" @click="activeTab = 'admin'">
              <i class="fas fa-tools"></i>
              <span>Admin Settings</span>
            </li>
            </ul>
          </aside>
  
          <!-- Settings Content -->
          <main class="settings-content">
            <h2 class="section-title">{{ getTitle }}</h2>
  
            <div v-if="activeTab === 'account'" class="settings-section">
              <h2>Edit Account Settings?</h2>

              
              <!-- Profile Picture Section -->
              <div class="profile-picture-section">
                <h3>Profile Picture:</h3>

                <!-- Profile Image Container -->
                <div class="profile-image-container">
                  <img v-if="user.profilePicture" :src="user.profilePicture" alt="Profile Picture" class="profile-img">
                  <span v-else class="placeholder-text">Profile Picture</span>
                </div>

                <!-- File Upload Input -->
                <input type="file" id="profile-upload" @change="uploadProfilePicture" accept="image/*">
              </div>



              <!-- FirstName -->
              <div class="input-group">
                <label>First Name:</label>
                <input type="text" v-model="user.firstname" class="input-field" />
              </div>

              <div class="input-group">
                <label>Last Name:</label>
                <input type="text" v-model="user.lastname" class="input-field" />
              </div>

              <!-- Username -->
              <div class="input-group">
                <label>Username:</label>
                <input type="text" v-model="user.username" class="input-field" />
              </div>

              <!-- Email -->
              <div class="input-group">
                <label>Email:</label>
                <input type="email" v-model="user.email" class="input-field" />
              </div>

              <!-- Creation Date -->
              <div class="input-group">
                <label>Creation Date:</label>
                <input type="text" :value= "formattedCreationDate" class="read-only-field" readonly/>
              </div>

              <!-- LastUpdated -->
              <div class="input-group">
                <label>Last Updated:</label>
                <input type="text" :value= "formattedLastUpdated" class="read-only-field" readonly/>
              </div>

              <!-- Save Button -->
              <button class="save-button" @click="handleUserUpdated" :disabled="!isUserDataLoaded">Save Changes</button>
            </div>

  
            <div v-if="activeTab === 'security'" class="settings-section">

              <h2>Security Settings</h2>

              <!-- Change Password -->
              <h3>Change Password</h3>
              <div class="input-group">
                <label>Current Password:</label>
                <input type="password"  class="input-field" />
              </div>
              <div class="input-group">
                <label>New Password:</label>
                <input type="password"  class="input-field" />
              </div>
              <div class="input-group">
                <label>Confirm New Password:</label>
                <input type="password"  class="input-field" />
              </div>
              <button class="save-button" @click="changePassword">Change Password</button>
 
            </div>



            <div v-if="activeTab === 'theme'" class="settings-section">
              <h2>Theme Settings</h2>
              <p>Change Your Theme!</p>

              <label class="theme-switch">
                <input type="checkbox" v-model="themeStore.isDarkMode" @change="toggleTheme">
                <span class="slider"></span>
              </label>

              <p>Current Mode: <strong>{{ themeStore.isDarkMode ? "Dark Mode" : "Light Mode" }}</strong></p>
            </div>
            
            <!-- Deleted Notifications to save for later
            <div v-if="activeTab === 'notifications'" class="settings-section">
              <h2>Notification Settings</h2>
              <label>
                <input type="checkbox" v-model="notifications.email" /> Email Notifications
              </label>
            </div>
            -->

            <div v-if="activeTab === 'admin'" class="settings-section">
            <h2>Admin Settings</h2>
              <div class="table-container">
                <!-- Loading indicator -->
                <div v-if="usersLoading && !paginatedUsers.length" class="loading-indicator">
                  Loading users...
                </div>

                <!-- Error display -->
                <div v-if="usersError" class="error-message">
                  Error loading users: {{ usersError.message }}
                </div>

                <!-- Users Table -->
                <table v-if="paginatedUsers.length" class="admin-table">
                  <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Date Created</th>
                    <th>Last Updated</th>
                    <th>Roles</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="user in paginatedUsers" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.creationDate.split('T')[0] }}</td>
                    <td>{{ user.lastUpdated?.split('T')[0] || '—' }}</td>
                    <td>{{ user.roles.map(role => role.name).join(', ') }}</td>
                  </tr>
                  </tbody>
                </table>

                <!-- Pagination controls -->
                <div v-if="paginatedUsers.length" class="pagination-controls">
                  <button
                      @click="prevPage"
                      :disabled="pageInfo.currentPage <= 0"
                      class="pagination-button"
                  >
                    Previous
                  </button>

                  <span class="page-info">
      Page {{ pageInfo.currentPage + 1 }} of {{ pageInfo.totalPages }}
      ({{ pageInfo.totalElements }} total users)
    </span>

                  <button
                      @click="nextPage"
                      :disabled="pageInfo.currentPage >= pageInfo.totalPages - 1"
                      class="pagination-button"
                  >
                    Next
                  </button>
                </div>
              </div>

            <!-- Roles Management -->
            <h2>Role Management</h2>
            <div class="table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Current Role</th>
                    <th>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.uuid">
                    <td>{{ user.username }}</td>
                    <td>{{ user.roles.join(', ') }}</td>
                    <td>
                      <select v-model="selectedRoles[user.uuid]" @change="updateUserRole(user.uuid)">
                        <option v-for="role in roleOptions" :key="role" :value="role">
                          {{ role }}
                        </option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>


</div>

          </main>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { useThemeStore } from "@/stores/themeStore";
import SideNavigation from "@/components/SideNavigation.vue";
import TopNavigation from "@/components/TopNavigation.vue";
import { ref, reactive, computed, watch } from 'vue';
import {useMutation, useQuery} from '@vue/apollo-composable';
import {UPDATE_USER, ME_QUERY, FIND_ALL_USERS} from "@/graphql/auth.js"
import apolloClient from '../plugins/apollo.js';
import eventBus from "@/eventBus.js";

const currentPage = ref(0);
const pageSize = ref(10);

const {
  result: usersResult,
  loading: usersLoading,
  error: usersError
} = useQuery(
    FIND_ALL_USERS,
    () => ({
      page: currentPage.value,
      size: pageSize.value
    }),
    {
      fetchPolicy: 'cache-and-network'
    }
);

// Parse the results
const paginatedUsers = computed(() => {
  return usersResult.value?.findAllUsers?.items || [];
});

const pageInfo = computed(() => {
  return usersResult.value?.findAllUsers?.pageInfo || {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0
  };
});

// Pagination control methods
function nextPage() {
  if (currentPage.value < pageInfo.value.totalPages - 1) {
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 0) {
    currentPage.value--;
  }
}

// execute graphql 'me' query to retrieve current user data
const { result, loading, error } = useQuery(ME_QUERY);

// //fetched the current user
// const queriedUser = computed(() => result.value?.me);

//update user details
const { mutate: updateUser } = useMutation(UPDATE_USER);

// Use the theme store
const themeStore = useThemeStore();

// Reactive state
const activeTab = ref('account');
const isSidebarCollapsed = ref(false);


const formattedLastUpdated = computed(() => {
  if (!user.lastUpdated) return '';
  return user.lastUpdated.split('T')[0]; // Shows "2025-03-20"
});


const formattedCreationDate = computed(() => {
  if (!user.creationDate) return '';
  return user.creationDate.split('T')[0]; // Shows "2025-03-20"
});

const user = reactive({
  profilePicture: "https://cdn2.momjunction.com/wp-content/uploads/2019/07/Whatsapp-DP-Images-For-Boys-1.jpg.avif",
  firstname: "",
  lastname: "",
  username: "",
  email: "",
  bio: "Passionate developer, coffee lover, and tech enthusiast.",
  language: "en",
  creationDate: "",
  lastUpdated: "",
});

// Add this computed property
const isUserDataLoaded = computed(() => {
  return !loading.value && result.value?.me?.id;
});

// Watch for query results and update user data
watch(() => result.value?.me, (userData) => {
  if (userData) {
    user.firstname = userData.firstName;
    user.lastname = userData.lastName;
    user.username = userData.username;
    user.email = userData.email;
    user.creationDate = userData.creationDate;
    user.lastUpdated = userData.lastUpdated;
  }
}, { immediate: true });

const users = ref([
  { uuid: "123", username: "johndoe", email: "john@example.com", dateCreated: "2024-01-01", lastUpdated: "2024-03-01", roles: ["Admin"] },
  { uuid: "456", username: "janedoe", email: "jane@example.com", dateCreated: "2023-11-15", lastUpdated: "2024-02-20", roles: ["User"] }
]);

const roleOptions = ref(["Admin", "Moderator", "User"]);
const selectedRoles = ref({});

// Computed properties
const getTitle = computed(() => {
  return activeTab.value.charAt(0).toUpperCase() + activeTab.value.slice(1) + ' Settings';
});

// Methods
function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

function toggleTheme() {
  themeStore.toggleTheme();
}

function updateUserRole(uuid) {
  const newRole = selectedRoles.value[uuid];
  const user = users.value.find(user => user.uuid === uuid);

  if (user) {
    user.roles = [newRole];
  }
}



function uploadProfilePicture(event) {
  const file = event.target.files[0];
  if (file) {
    user.profilePicture = URL.createObjectURL(file);
  }
}

function toastFunction(message, type) {
  eventBus.emit('toast', {
    msg: message,
    type: type,
    duration: 3000
  })
}

const handleUserUpdated = async () => {
  try {

    //used to retrieve the UUID for the currently logged-in user
    const userId = result.value?.me;

    //calling updateUser query
    await apolloClient.mutate({
      mutation: UPDATE_USER,
      variables: {
        id: userId.id,
        username: user.username,
        email: user.email,
        firstName: user.firstname,
        lastName: user.lastname
      },

      //update apollo client cache
      update: (cache, { data }) => {
        const updatedUser = data.updateUser;

        cache.writeQuery({
          query: ME_QUERY,
          data:{
            me:{
              ...result.value.me,
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              username: updatedUser.username,
              email: updatedUser.email,
              lastUpdated: updatedUser.lastUpdated
            }
          }
        })
      }
    });

    toastFunction("Settings saved!", 'success');
  }
  catch (error) {

    //graphql mutation failed
    toastFunction("Error while saving user", "error");

  }
}

// TODO: Implement password changing mutation
// const changePassword() = async () => {
//   try{
//
//
//
//     // TODO: Display successful message
//     toastFunction("Password updated successfully!", "success");
//   }
//   catch (error) {
//    toastFunction("Error while updating password.", "error");
//   }
// }
</script>

  

  
  
  <style scoped>

@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Outfit', sans-serif;
}
  /* Full Page Layout */
  .settings-wrapper {
    display: flex;
    height: 100vh;
    background: var(--bg-primary);
    color: var(--text-primary);
  }
  
  /* Main Content Area */
  .settings-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-top: 80px; /* Prevents overlap with top navbar */
  }
  
  /* Flex container for sidebar & settings content */
  .settings-content-wrapper {
    display: flex;
    flex-grow: 1;
    padding: 20px;
    gap: 15px; /* Reduce the gap for better spacing */
    margin-left: 450px; /* Move it further right */
    max-width: 1000px; /* Limit the settings page width */
  }

  .settings-content-wrapper.collapsed {
    transition: margin-left 0.3s ease-in-out;
    margin-left: 300px; /* Adjusted margin when sidebar is collapsed */
  }

  
  /* Sidebar Styling */
  .settings-sidebar {
    width: 240px; /* Reduced sidebar width */
    min-width: 220px;
    background: var(--bg-secondary);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
    height: fit-content;
    position: relative; /* Prevents blocking */
    margin-left: -200px; /* Moves it right */
  }
  
  /* Sidebar Title */
  .settings-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #ffffff;
  }
  
  /* Sidebar Navigation */
  .settings-sidebar ul {
    list-style: none;
    padding: 0;
  }
  
  .settings-sidebar li {
    display: flex;
    align-items: center;
    padding: 12px;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.3s;
    font-size: 16px;
    font-weight: bold;
  }
  
  .settings-sidebar li i {
    margin-right: 12px;
    font-size: 18px;
  }
  
  .settings-sidebar li.active {
    background: var(--sidebar-active);
  }
  
  /* Settings Content */
  /* Main Box */
  .settings-content {
    flex: 1;
    padding: 30px;
    background: var(--bg-secondary);
    border-radius: 12px;
    margin-left: 50px; /* Increase space between sidebar and content */
    max-width: 800px; /* Limit content width */
    box-shadow: 2px 2px 15px rgba(0, 0, 0, 0.3);
    min-height: calc(100vh - 100px);
    overflow-y: auto;
  }
  
  /* Section Title */
  .section-title {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  /* Individual Setting Sections */
  .settings-section {
    background: var(--bg-primary);
    padding: 30px;
    border-radius: 12px;
    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.2);
  }
  
  /* Input Field Styling */
  .input-group {
    margin-bottom: 20px;
  }
  
  .input-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    font-size: 18px;
  }
  
  .input-field {
    width: 95%;
    padding: 12px;
    border-radius: 8px;
    border: 2px solid var(--border-color);
    background: var(--input-bg);
    color: var(--text-primary);
    font-size: 16px;
    outline: none; /* Removes default outline */
    transition: border 0.3s;
}

.input-field:focus {
    border-color: #5f98ef; /* Changes border color when input is focused   */ 
}

.display-field {
  width: 95%;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 16px;
}




/* Save Button */
  .save-button {
    background: #2a335a;
    color: white;
    padding: 12px 25px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.3s;
    font-size: 18px;
    font-weight: bold;
  }
  
  .save-button:hover {
    background: #5f98ef;
  }

  .table-container {
  overflow-x: auto;
  margin-top: 20px;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  background: #22293A;
  color: white;
  border-radius: 8px;
  overflow: hidden;
}

.admin-table th, .admin-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #3b3e56;
}

.admin-table th {
  background: #22293A;
  font-weight: bold;
}

.admin-table tr:hover {
  background: #2b364f;
}

/* Role Management Button in the Admin Settings Page */

select {
  padding: 8px;
  border-radius: 6px;
  background: #22293A;
  color: white;
  border: 1px solid #3b3e56;
  font-size: 16px;
  cursor: pointer;
}

select:focus {
  outline: none;
  border-color: #5f98ef;
}

/* Dark Mode Styles */
.dark-mode {
  background: #121212;
  color: white;
}

/* Theme Switch Styling */
.theme-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 25px;
}

.theme-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 25px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 3.5px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4a5f9e;
}

input:checked + .slider:before {
  transform: translateX(25px);
}

/* Profile Picture Section Styling */
.profile-picture-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  margin-bottom: 20px;
}

/* Profile Image Container (Circle) */
.profile-image-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #5f98ef;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #22293A; /* Background color if no image */
  position: relative;
}

/* Profile Image */
.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Placeholder Text (When No Image is Selected) */
.placeholder-text {
  color: white;
  font-size: 14px;
  position: absolute;
  text-align: center;
}

/* File Input */
#profile-upload {
  padding: 8px;
  border-radius: 6px;
  background: #22293A;
  color: white;
  border: 1px solid #3b3e56;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

#profile-upload:focus {
  outline: none;
  border-color: #5f98ef;
}

.read-only-field {
  /* Just copy all properties from input-field */
  width: 95%;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background: var(--input-bg); /* Change this if you want a different background */
  color: var(--text-primary);
  font-size: 16px;
  outline: none;
  /* Optional: add a subtle visual cue that it's read-only */
  cursor: not-allowed;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 10px;
  background: #22293A;
  border-radius: 8px;
}

.pagination-button {
  background: #2a335a;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.3s;
}

.pagination-button:hover:not(:disabled) {
  background: #5f98ef;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: white;
  font-weight: bold;
}

.loading-indicator, .error-message {
  padding: 20px;
  text-align: center;
  background: #22293A;
  color: white;
  border-radius: 8px;
  margin-bottom: 15px;
}

.error-message {
  color: #ff6b6b;
}




  /* Background Colors: 
  - Settings Main Background Color: #121729
  - Settings Sidebar Background Color: #22293A
  - Settings Sidebar when active: #5f98ef

  */

  </style>
  



  

