<template>
    <div class="sidebar">
      <!-- Sidebar Content -->
      <div class="sidebar-content">
        <div class="logo">MonetA</div>
        <nav class="nav-links">
          <router-link to="/dashboard">🏠 Dashboard</router-link>
          <router-link to="/my-stuffs">📂 My Stuffs</router-link>
          <router-link to="/flashcards">➕ Add Flashcards</router-link>
          <router-link to="/quizzes">💡 Quizzes</router-link>
          <router-link to="/explore">🔍 Explore</router-link>
          <router-link to="/settings">⚙️ Settings</router-link>
        </nav>
      </div>
  
      <!-- User Profile Section with Separator -->
      <div class="user-profile">
        <div class="separator"></div>
        <div class="profile-details">
          <div class="avatar">JD</div>
          <div class="user-info">
            <h3>John Doe</h3>
            <p>@_john.doe1337</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <style scoped>
  /* Full Height Sidebar */
  .sidebar {
    width: 250px; /* Adjust width as needed */
    height: 100vh; /* Full height */
    background: #22293a;
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    padding-top: 20px; /* Ensures content starts at the top */
  }
  
  /* Sidebar Content */
  .sidebar-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;
  }
  
  /* Logo Styling */
  .logo {
    font-size: 24px;
    font-weight: bold;
    color: white;
    margin-bottom: 20px;
  }
  
  /* Navigation Links */
  .nav-links {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  
  .nav-links a {
    color: white;
    text-decoration: none;
    font-size: 16px;
    padding: 15px 20px;
    display: flex;
    align-items: center;
  }
  
  .nav-links a:hover {
    background-color: #3b82f6;
    border-radius: 5px;
  }
  
  /* User Profile Section */
  .user-profile {
    width: 100%;
    padding: 15px 20px;
    background: #1a202c;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: auto; /* Pushes profile to bottom */
  }
  
  /* Separator */
  .separator {
    width: 100%;
    height: 2px;
    background: #3b82f6;
    margin-bottom: 10px;
  }
  
  /* Profile Details */
  .profile-details {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  /* Avatar */
  .avatar {
    width: 40px;
    height: 40px;
    background: #3b82f6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-weight: bold;
  }
  
  /* User Info */
  .user-info h3 {
    margin: 0;
    font-size: 16px;
    color: white;
  }
  
  .user-info p {
    margin: 0;
    font-size: 14px;
    color: #94a3b8;
  }
  </style>