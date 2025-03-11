<template>
    <div class="settings-wrapper">
      <SideNavigation />
      <div class="settings-main">
        <TopNavigation />
        <div class="settings-content-wrapper">
          <!-- Settings Sidebar -->
          <aside class="settings-sidebar">
            <h2 class="settings-title">Settings</h2>
            <ul>
              <li :class="{ active: activeTab === 'account' }" @click="activeTab = 'account'">
                <i class="icon-user"></i>
                <span>Account</span>
              </li>
              <li :class="{ active: activeTab === 'security' }" @click="activeTab = 'security'">
                <i class="icon-lock"></i>
                <span>Security</span>
              </li>
              <li :class="{ active: activeTab === 'billing' }" @click="activeTab = 'billing'">
                <i class="icon-credit-card"></i>
                <span>Plan & Billing</span>
              </li>
              <li :class="{ active: activeTab === 'notifications' }" @click="activeTab = 'notifications'">
                <i class="icon-bell"></i>
                <span>Notifications</span>
              </li>
              <li :class="{ active: activeTab === 'admin' }" @click="activeTab = 'admin'">
              <i class="icon-settings"></i>
              <span>Admin Settings</span>
            </li>
            </ul>
          </aside>
  
          <!-- Settings Content -->
          <main class="settings-content">
            <h2 class="section-title">{{ getTitle }}</h2>
  
            <div v-if="activeTab === 'account'" class="settings-section">
              <h3>Account Settings</h3>
              <div class="input-group">
                <label>Name:</label>
                <input type="text" v-model="user.name" class="input-field" />
              </div>
              <div class="input-group">
                <label>Username:</label>
                <input type="text" v-model="user.username" class="input-field" />
              </div>
              <button class="save-button">Save</button>
            </div>
  
            <div v-if="activeTab === 'security'" class="settings-section">
              <h3>Security Settings</h3>
              <button class="save-button">Change Password</button>
            </div>
  
            <div v-if="activeTab === 'billing'" class="settings-section">
              <h3>Plan & Billing</h3>
              <p>Manage your subscription plan.</p>
            </div>
  
            <div v-if="activeTab === 'notifications'" class="settings-section">
              <h3>Notification Settings</h3>
              <label>
                <input type="checkbox" v-model="notifications.email" /> Email Notifications
              </label>
            </div>
            <div v-if="activeTab === 'admin'" class="settings-section">
  <h2>Admin Settings</h2>
  <div class="table-container">
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
          name: 'John Doe',
          username: 'johndoe',
        },
        notifications: {
          email: true,
        },
      };
    },
    computed: {
      getTitle() {
        const titles = {
          account: "Account Settings",
          security: "Security Settings",
          billing: "Plan & Billing",
          notifications: "Notification Settings",
        };
        return titles[this.activeTab] || "Settings";
      },
    },
  };
  </script>

  

  
  
  <style scoped>
  /* Full Page Layout */
  .settings-wrapper {
    display: flex;
    height: 100vh;
    background: #0d0f18;
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
  
  /* Sidebar Styling */
  .settings-sidebar {
    width: 240px; /* Reduced sidebar width */
    min-width: 220px;
    background: #1c1e2b;
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
    background: #4a4a68;
  }
  
  /* Settings Content */
  .settings-content {
    flex: 1;
    padding: 30px;
    background: #191b2a;
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
    background: #22243a;
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
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: none;
    background: #2b2d42;
    color: white;
    font-size: 16px;
  }
  
  /* Save Button */
  .save-button {
    background: #4a5f9e;
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
    background: #3b4d7c;
  }

  .table-container {
  overflow-x: auto;
  margin-top: 20px;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  background: #22243a;
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
  background: #2b2d42;
  font-weight: bold;
}

.admin-table tr:hover {
  background: #3b3e56;
}



  </style>
  

  