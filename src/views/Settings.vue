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
              
              <!--Deleted Notifications to save for later
              <li :class="{ active: activeTab === 'notifications' }" @click="activeTab = 'notifications'">
                <i class="fas fa-bell"></i>
                <span>Notifications</span>
              </li>
              -->

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
              <h2>Account Settings</h2>

              
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

              <!-- Bio -->
              <div class="input-group">
                <label>Bio:</label>
                <textarea v-model="user.bio" class="input-field"></textarea>
              </div>


              <!-- Timezone -->
              <div class="input-group">
                <label>Timezone:</label>
                <select v-model="user.timezone" class="input-field">
                  <option value="GMT-5">Eastern Time (GMT-5)</option>
                  <option value="GMT-8">Pacific Time (GMT-8)</option>
                  <option value="GMT+1">Central European Time (GMT+1)</option>
                </select>
              </div>

              <!-- Save Button -->
              <button class="save-button" @click="saveAccountSettings">Save Changes</button>
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
              
              <!-- Theme Toggle Switch -->
              <label class="theme-switch">
                <input type="checkbox" v-model="isDarkMode" @change="toggleTheme">
                <span class="slider"></span>
              </label>
              
              <p>Current Mode: <strong>{{ isDarkMode ? "Dark Mode" : "Light Mode" }}</strong></p>
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
              <!-- Users Table -->
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Uuid</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Date Created</th>
                    <th>Last Updated</th>
                    <th>Roles</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.uuid">
                    <td>{{ user.uuid }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.dateCreated }}</td>
                    <td>{{ user.lastUpdated }}</td>
                    <td>{{ user.roles.join(', ') }}</td>
                  </tr>
                </tbody>
              </table>
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
  
  <script>
  import SideNavigation from "@/components/SideNavigation.vue";
  import TopNavigation from "@/components/TopNavigation.vue";

  
  
  
  export default {
  components: {
    SideNavigation,
    TopNavigation,
  },
  data() {
    return {
      
      activeTab: 'account',
      user: {
      profilePicture: "https://cdn2.momjunction.com/wp-content/uploads/2019/07/Whatsapp-DP-Images-For-Boys-1.jpg.avif", // Placeholder image URL
      firstname: "John",
      lastname: "Doe",
      username: "johndoe123",
      email: "john.doe@example.com",
      bio: "Passionate developer, coffee lover, and tech enthusiast.",
      language: "en",
      timezone: "GMT-5",
    },

    //  notifications: { email: true },
      users: [
        { uuid: "123", username: "johndoe", email: "john@example.com", dateCreated: "2024-01-01", lastUpdated: "2024-03-01", roles: ["Admin"] },
        { uuid: "456", username: "janedoe", email: "jane@example.com", dateCreated: "2023-11-15", lastUpdated: "2024-02-20", roles: ["User"] }
      ],
      roleOptions: ["Admin", "Editor", "User"],
      selectedRoles: {},

      
       isDarkMode: true, // Default mode is light mode

       isSidebarCollapsed: false,

    };

    

  },
  methods: {
    
    updateUserRole(uuid) {
      const newRole = this.selectedRoles[uuid];
      const user = this.users.find(user => user.uuid === uuid);
      
      if (user) {
        user.roles = [newRole]; // Replace existing role
      }
    },

    uploadProfilePicture(event) {
    const file = event.target.files[0];
    if (file) {
      this.user.profilePicture = URL.createObjectURL(file); // Show preview of selected image
    }
  },

  toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }

    

  }
};

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
    background: #121729; /* Back ground color */
    color: white;
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
    background: #22293A; /* Sidebar background color */
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
    background: #5f98ef;  /* When button is clicked */
  }
  
  /* Settings Content */
  /* Main Box */
  .settings-content {
    flex: 1;
    padding: 30px;
    background: #22293A; /* Main Content background color */
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
    background:  #121729;
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
    border: 2px solid #31406d; /* Adds a border */ /* Another Color: #4a5f9e */
    background: #121729;
    color: white;
    font-size: 16px;
    outline: none; /* Removes default outline */
    transition: border 0.3s;
}

.input-field:focus {
    border-color: #5f98ef; /* Changes border color when input is focused   */ 
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







  /* Background Colors: 
  - Settings Main Background Color: #121729
  - Settings Sidebar Background Color: #22293A
  - Settings Sidebar when active: #5f98ef

  */


  
  </style>
  



  

