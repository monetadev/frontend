<template>
    <nav class="navbar">
      <div class="logo">Moneta</div>
      
      <ul class="nav-links">
        <li class="dropdown">
          <span>Solutions</span>
          <ul class="dropdown-content">
            <li><a href="#">Solution 1</a></li>
            <li><a href="#">Solution 2</a></li>
            <li><a href="#">Solution 3</a></li>
          </ul>
        </li>
        <li class="dropdown">
          <span>Resources</span>
          <ul class="dropdown-content">
            <li><a href="#">Resource 1</a></li>
            <li><a href="#">Resource 2</a></li>
            <li><a href="#">Resource 3</a></li>
          </ul>
        </li>
        <li class="dropdown">
          <span>Community</span>
          <ul class="dropdown-content">
            <li><a href="#">Forum</a></li>
            <li><a href="#">Discord</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </li>
        <li><a href="#">Pricing</a></li>
      </ul>
      <div class="auth-buttons">
        <PrimaryButton text="Sign In" />
      </div>
    </nav>
  </template>
  
  <script>
  import PrimaryButton from "@/components/PrimaryButton.vue"; // Adjust path if needed
  
  export default {
    name: "NavigationBar",
    components: {
      PrimaryButton,
    },
    data() {
      return {
        isSidebarCollapsed: false, // You might still need this for other logic
      };
    },
  };
  </script>
  
  <style scoped>
  .navbar {
    display: flex;
    align-items: center;
    background: #1b2233;
    padding: 15px 20px;
    color: white;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    font-family: "Outfit", sans-serif;
    z-index: 1000;
    /* justify-content: space-between; Remove this to control order manually */
  }
  
  .logo {
    font-size: 1.5em;
    font-weight: bold;
    margin-right: 20px; /* Add some space between logo and buttons */
  }
  
  .auth-buttons {
  display: flex;
  align-items: center;
  margin-left: auto; /* Push buttons to the right */
}

.auth-buttons .primary-button {
  margin-left: 15px;
  width: auto; /* Adjust width to content */
  padding: 10px 15px; /* Adjust padding for smaller buttons */
  font-size: 16px; /* Adjust font size for smaller buttons */
}
  .nav-links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    margin-left: 0; /* Ensure links start from the left of their container */
  }
  
  .nav-links li {
    margin-right: 20px; /* Space between the tabs */
    position: relative;
  }
  
  .nav-links li:last-child {
    margin-right: 0; /* Remove extra margin from the last tab */
  }
  
  .nav-links li a,
  .nav-links li span {
    text-decoration: none;
    color: white;
    cursor: pointer;
  }
  
  .dropdown-content {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: #343a40;
    border: 1px solid #495057;
    border-top: none;
    list-style: none;
    padding: 0;
    margin: 0;
    min-width: 120px;
    display: none;
    z-index: 1;
  }
  
  .dropdown:hover .dropdown-content {
    display: block;
  }
  
  .dropdown-content li a {
    display: block;
    padding: 10px 15px;
    text-decoration: none;
    color: white;
  }
  
  .dropdown-content li a:hover {
    background-color: #495057;
  }
  </style>