<template>
    <nav class="navbar">
      <div class="logo">Moneta</div>
      
      <ul class="nav-links">
        <li class="dropdown">
          <span>Resources</span>
          <ul class="dropdown-content">
            <li><a href="#">Academy</a></li>
            <li><a href="#">Get Help</a></li>
          </ul>
        </li>
        <li class="dropdown">
          <span>Community</span>
          <ul class="dropdown-content">
            <li><a href="#">Discord</a></li>
          </ul>
        </li>
        <li><a href="#tech-stack">Tech</a></li>      </ul>
      <div class="auth-buttons">
        <PrimaryButton text="Sign In" @click="goToSignInPage" />
      </div>
    </nav>
  </template>
  
  <script>
  import PrimaryButton from "@/components/PrimaryButton.vue"; 
  export default {
    name: "NavigationBar",
    components: {
      PrimaryButton,
    },
    data() {
      return {
        isSidebarCollapsed: false, 
      };
    },
    methods: { 
      goToSignInPage() {
        
        this.$router.push('/register');
       }
    }
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
  }

  .logo {
    font-size: 1.5em;
    font-weight: bold;
    margin-right: 20px;
  }

  .auth-buttons {
    display: flex;
    align-items: center;
    margin-left: auto;
  }

  .auth-buttons .primary-button {
    margin-left: 15px;
    width: auto;
    padding: 10px 15px;
    font-size: 16px;
  }

  .nav-links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    margin-left: 20px;
    height: 100%; 
  }

  .nav-links li {
    margin-right: 10px; 
    position: relative;
    display: flex; 
    align-items: center;
    height: 100%;
  }

  .nav-links li:last-child {
    margin-right: 0;
  }

  .nav-links li a,
  .nav-links li span {
    display: flex; 
    align-items: center;
    height: 100%;
    padding: 0 15px;
    text-decoration: none;
    color: #CBD5E0;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500; 
    border-radius: 4px; 
    transition: background-color 0.2s ease, color 0.2s ease; 
  }

 
  .nav-links li a:hover,
  .nav-links li span:hover {
    background-color: #2d3748; 
    color: #ffffff; 
  }


  .dropdown-content {
    position: absolute;
    top: 100%; 
    left: 0;
    background-color: #2d3748; 
    border: 1px solid #4A5568;
    border-radius: 0 0 4px 4px; 
    list-style: none;
    padding: 5px 0; 
    margin: 0;
    min-width: 110px; 
    display: none;
    z-index: 1;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }

  .dropdown:hover .dropdown-content {
    display: block;
  }

  .dropdown-content li a {
    display: block;
    padding: 10px 15px;
    text-decoration: none;
    color: #CBD5E0; /* Match non-hover nav link color */
    font-size: 0.9rem; /* Slightly smaller font in dropdown */
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .dropdown-content li a:hover {
    background-color: #4A5568; /* Hover color for dropdown items */
     color: #ffffff;
  }
  </style>