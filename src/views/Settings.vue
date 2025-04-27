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

              <li :class="{ active: activeTab === 'admin' }" @click="activeTab = 'admin'" v-if="hasAdminRole">
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
                  <img
                      v-if="user.profilePicture"
                      :src="user.profilePicture"
                      alt="Profile Picture"
                      class="profile-img"
                  >
                  <div v-else class="placeholder-avatar">
                    {{ avatarInitials }}
                  </div>
                </div>

                <div class="profile-pic-controls">
                  <!-- File Input with Apollo Upload -->
                  <label for="profile-upload" class="upload-button">Choose File</label>
                  <input
                      type="file"
                      id="profile-upload"
                      @change="uploadProfilePicture"
                      accept="image/*"
                      class="file-input"
                      ref="fileInput"
                  />

                  <button
                      v-if="user.profilePicture"
                      @click="deleteProfilePicture"
                      class="delete-button"
                  >
                    Remove Picture
                  </button>
                </div>
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
                <label>Creation Date (YYYY-MM-DD):</label>
                <input type="text" :value= "formattedCreationDate" class="read-only-field" readonly/>
              </div>

              <!-- LastUpdated -->
              <div class="input-group">
                <label>Last Updated (YYYY-MM-DD):</label>
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
            <h2>Delete Users or Manage Roles</h2>
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
                    <th>Actions</th>
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
                    <td class="action-buttons">
                      <button
                          @click="manageUserRoles(user)"
                          class="manage-button">
                        Manage Roles
                      </button>
                      <button
                          @click="confirmDeleteUser(user)"
                          class="delete-button"
                          :disabled="user.id === result.value?.me?.id">
                        Delete
                      </button>
                    </td>
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
              <!-- Confirmation Modal -->
              <div v-if="showDeleteConfirm" class="modal-overlay">
                <div class="modal-content">
                  <h3>Confirm User Deletion</h3>
                  <p>Are you sure you want to delete the user <strong>{{ userToDelete?.username }}</strong>?</p>
                  <p class="warning-text">This action cannot be undone.</p>
                  <div class="modal-buttons">
                    <button @click="cancelDeleteUser" class="cancel-button">Cancel</button>
                    <button @click="executeDeleteUser" class="confirm-delete-button">Delete User</button>
                  </div>
                </div>
              </div>
              <!-- Role Management Modal -->
              <div v-if="showRoleManagementModal" class="modal-overlay">
                <div class="modal-content role-modal">
                  <h3>Manage Roles for {{ userBeingManaged?.username }}</h3>

                  <!-- Current Roles -->
                  <div class="current-roles">
                    <h4>Current Roles:</h4>
                    <div v-if="userBeingManaged?.roles.length" class="role-chips">
                      <div v-for="role in userBeingManaged.roles" :key="role.id" class="role-chip">
                        {{ role.name }}
                        <button @click="removeRole(role.id)" class="remove-role-btn">×</button>
                      </div>
                    </div>
                    <p v-else>No roles assigned</p>
                  </div>

                  <!-- Assign New Role -->
                  <div class="assign-role">
                    <h4>Assign New Role:</h4>
                    <div class="role-select-container">
                      <select v-model="selectedRoleId" class="role-select">
                        <option value="">Select a role to assign</option>
                        <option
                            v-for="role in availableRoles"
                            :key="role.id"
                            :value="role.id"
                            :disabled="userBeingManaged?.roles.some(r => r.id === role.id)">
                          {{ role.name }}
                        </option>
                      </select>
                      <button
                          @click="assignRole"
                          class="assign-button"
                          :disabled="!selectedRoleId">
                        Assign
                      </button>
                    </div>
                  </div>

                  <div class="modal-buttons">
                    <button @click="closeRoleManagement" class="close-button">Close</button>
                  </div>
                </div>
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
import {UPDATE_USER, ME_QUERY, FIND_ALL_USERS, UPLOAD_PROFILE_PICTURE, DELETE_PROFILE_PICTURE, DELETE_USER, GET_ROLES,
  REMOVE_ROLE_FROM_USER, ASSIGN_ROLE_TO_USER} from "@/graphql/auth.js"
import apolloClient from '../plugins/apollo.js';
import eventBus from "@/eventBus.js";
import router from "@/router.js";



// Reactive state
const activeTab = ref('account');
const isSidebarCollapsed = ref(false);
const currentPage = ref(0);
const pageSize = ref(10);
const fileInput = ref(null);
const themeStore = useThemeStore();
const user = reactive({
  profilePicture: null,
  firstname: "",
  lastname: "",
  username: "",
  email: "",
  creationDate: "",
  lastUpdated: "",
});

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

const availableRoles = ref([]);
const selectedRoleId = ref('');
const userBeingManaged = ref(null);
const showRoleManagementModal = ref(false);

const { result: rolesResult, loading: rolesLoading } = useQuery(
    GET_ROLES,
    { page: 0, size: 10 }
);

// Watch for roles data
watch(() => rolesResult.value?.roles?.items, (roles) => {
  if (roles) {
    availableRoles.value = roles;
  }
}, { immediate: true });

// Open role management modal for a specific user
function manageUserRoles(user) {
  userBeingManaged.value = user;
  showRoleManagementModal.value = true;
  selectedRoleId.value = '';
}
// Assign role to user
async function assignRole() {
  if (!selectedRoleId.value || !userBeingManaged.value) return;

  try {
    const { data } = await apolloClient.mutate({
      mutation: ASSIGN_ROLE_TO_USER,
      variables: {
        userId: userBeingManaged.value.id,
        roleId: selectedRoleId.value
      }
    });

    if (data.assignRoleToUser) {
      // Find the role name for the toast message
      const selectedRole = availableRoles.value.find(role => role.id === selectedRoleId.value);
      toastFunction(`Role ${selectedRole.name} assigned to ${userBeingManaged.value.username}`, "success");

      // Refetch to ensure data consistency
      apolloClient.refetchQueries({
        include: [{
          query: FIND_ALL_USERS,
          variables: { page: currentPage.value, size: pageSize.value }
        }]
      });

      selectedRoleId.value = '';
    }
  } catch (error) {
    console.error("Error assigning role:", error);
    toastFunction(`Failed to assign role: ${error.message}`, "error");
  }
}

function changePassword() {
  // This is a placeholder until you implement the actual password change
  toastFunction("Password change feature not yet implemented", "info");
}

// Remove role from user
async function removeRole(roleId) {
  if (!userBeingManaged.value) return;

  try {
    const { data } = await apolloClient.mutate({
      mutation: REMOVE_ROLE_FROM_USER,
      variables: {
        userId: userBeingManaged.value.id,
        roleId: roleId
      }
    });

    if (data.removeRoleFromUser) {
      const removedRole = userBeingManaged.value.roles.find(role => role.id === roleId);
      toastFunction(`Role ${removedRole.name} removed from ${userBeingManaged.value.username}`, "success");

      // Refetch to ensure data consistency
      apolloClient.refetchQueries({
        include: [{
          query: FIND_ALL_USERS,
          variables: { page: currentPage.value, size: pageSize.value }
        }]
      });
    }
  } catch (error) {
    console.error("Error removing role:", error);
    toastFunction(`Failed to remove role: ${error.message}`, "error");
  }
}

// Close role management modal
function closeRoleManagement() {
  showRoleManagementModal.value = false;
  userBeingManaged.value = null;
  selectedRoleId.value = '';
}

// const avatarInitials = computed(() => {
//   if (!user.firstname && !user.lastname) return '';
//   const firstInitial = user.firstname ? user.firstname.charAt(0) : '';
//   const lastInitial = user.lastname ? user.lastname.charAt(0) : '';
//   return ```${firstInitial}${lastInitial}```.toUpperCase();
// });

const showDeleteConfirm = ref(false);
const userToDelete = ref(null);


function confirmDeleteUser(user) {
  userToDelete.value = user;
  showDeleteConfirm.value = true;
}

async function executeDeleteUser() {
  if (!userToDelete.value) return;

  try {
    // Call apolloClient.mutate directly
    const { data } = await apolloClient.mutate({
      mutation: DELETE_USER,
      variables: {
        id: userToDelete.value.id
      },
      update: (cache) => {
        // Update the cache to remove the deleted user
        const existingData = cache.readQuery({
          query: FIND_ALL_USERS,
          variables: { page: currentPage.value, size: pageSize.value }
        });

        if (existingData) {
          const newItems = existingData.findAllUsers.items.filter(
              item => item.id !== userToDelete.value.id
          );

          cache.writeQuery({
            query: FIND_ALL_USERS,
            variables: { page: currentPage.value, size: pageSize.value },
            data: {
              findAllUsers: {
                ...existingData.findAllUsers,
                items: newItems,
                pageInfo: {
                  ...existingData.findAllUsers.pageInfo,
                  totalElements: existingData.findAllUsers.pageInfo.totalElements - 1
                }
              }
            }
          });
        }
      }
    });

    // Check if deletion was successful
    if (data.deleteUser) {
      toastFunction(`User ${userToDelete.value.username} deleted successfully`, "success");

      // Refetch to ensure data consistency
      apolloClient.refetchQueries({
        include: [{ query: FIND_ALL_USERS, variables: { page: currentPage.value, size: pageSize.value } }]
      });
    } else {
      throw new Error("Failed to delete user");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    toastFunction(`Failed to delete user: ${error.message}`, "error");
  } finally {
    showDeleteConfirm.value = false;
    userToDelete.value = null;
  }
}

function cancelDeleteUser() {
  showDeleteConfirm.value = false;
  userToDelete.value = null;
}

const formattedLastUpdated = computed(() => {
  if (!user.lastUpdated) return '';
  return user.lastUpdated.split('T')[0]; // Shows "2025-03-20"
});


const formattedCreationDate = computed(() => {
  if (!user.creationDate) return '';
  return user.creationDate.split('T')[0]; // Shows "2025-03-20"
});

// Add this computed property
const isUserDataLoaded = computed(() => {
  return !loading.value && result.value?.me?.id;
});

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

const hasAdminRole = computed(() => {
  const roles = result.value?.me?.roles || [];
  return roles.some(role => role.name === "ROLE_ADMIN");
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

//update user details
const { mutate: updateUser } = useMutation(UPDATE_USER);

const { mutate: deleteProfilePic } = useMutation(DELETE_PROFILE_PICTURE);

// Watch for query results and update user data
watch(() => result.value?.me, (userData) => {
  if (userData) {
    user.firstname = userData.firstName;
    user.lastname = userData.lastName;
    user.username = userData.username;
    user.email = userData.email;
    user.creationDate = userData.creationDate;
    user.lastUpdated = userData.lastUpdated;

    if (userData.files && userData.files.length > 0) {
      const profilePic = userData.files.find(file =>
          file.contentType?.startsWith('image/'));

      if (profilePic) {
        user.profilePicture = `http://localhost:8080/profile/${profilePic.filename}`;
      }
      else{
        user.profilePicture = null
      }
    }
    else{
      user.profilePicture = null
    }
  }
}, { immediate: true });


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

async function uploadProfilePicture(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    toastFunction("Uploading profile picture...", "info");

    const { data } = await apolloClient.mutate({
      mutation: UPLOAD_PROFILE_PICTURE,
      variables: {
        input: file
      }
    });

    const uploadResult = data.uploadProfilePicture;
    console.log(uploadResult);
    user.profilePicture = `http://localhost:8080/profile/${uploadResult.filename}`;

    toastFunction("Profile picture updated successfully!", "success");

    // Refresh user data
    apolloClient.refetchQueries({
      include: [ME_QUERY]
    });
  } catch (error) {
    console.error("Upload error:", error);
    toastFunction("Failed to upload profile picture", "error");
  }
}

async function deleteProfilePicture() {
  try {
    const { data } = await deleteProfilePic();

    if (data.deleteCurrentUserProfilePicture) {
      user.profilePicture = null;
      toastFunction("Profile picture removed", "success");

      // Refresh user data
      apolloClient.refetchQueries({
        include: [ME_QUERY]
      });
    } else {
      throw new Error("Failed to delete profile picture");
    }
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    toastFunction("Failed to remove profile picture", "error");
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

   //used for when the user changes their username
    const originalUsername = result.value?.me?.username;

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
    // Check if username was changed
    if (originalUsername !== user.username) {
      // Username changed, show message and trigger logout
      toastFunction("Username changed. Please login again with your new username.", "info");

      // Wait 2 seconds before logging out so user can see the message
      setTimeout(() => {
        // Clear Apollo store
        apolloClient.clearStore().then(() => {
          // Navigate to login screen
          router.push('/login');
        });
      }, 2000);
    }
    else
    {
      toastFunction("Settings saved!", 'success');
    }
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
    //max-width: 1000px; /* Limit the settings page width */
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
    //max-width: 800px; /* Limit content width */
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

.placeholder-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 36px;
  font-weight: bold;
  color: white;
}

.profile-pic-controls {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.upload-button {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  background: #2a335a;
  color: white;
  border: none;
  transition: background 0.3s;
}

.delete-button {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  background: #8b1f1f;
  color: white;
  border: none;
  transition: background 0.3s;
}

.upload-button:hover {
  background: #5f98ef;
}

.delete-button:hover {
  background: #c53030;
}

.file-input {
  display: none;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #22293A;
  padding: 25px;
  border-radius: 10px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-button {
  background: #3b3e56;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.confirm-delete-button {
  background: #c53030;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.warning-text {
  color: #ff6b6b;
  font-weight: bold;
  margin-top: 10px;
}

/* Button Styles */
.delete-button {
  background: #8b1f1f;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.delete-button:hover:not(:disabled) {
  background: #c53030;
}

.delete-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


  /* Background Colors: 
  - Settings Main Background Color: #121729
  - Settings Sidebar Background Color: #22293A
  - Settings Sidebar when active: #5f98ef

  */

/* Role Management Styles */
.role-modal {
  width: 500px;
  max-width: 90%;
}

.current-roles, .assign-role {
  margin-bottom: 20px;
}

.role-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.role-chip {
  background: #2a335a;
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.remove-role-btn {
  background: transparent;
  border: none;
  color: white;
  margin-left: 5px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.remove-role-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.role-select-container {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.role-select {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: #22293A;
  color: white;
  border: 1px solid #3b3e56;
}

.assign-button {
  background: #2a335a;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.assign-button:hover:not(:disabled) {
  background: #5f98ef;
}

.assign-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.close-button {
  background: #3b3e56;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.manage-button {
  background: #2a335a;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.manage-button:hover {
  background: #5f98ef;
}

  </style>