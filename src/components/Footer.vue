<template>
  <footer class="global-footer">
    <div class="footer-content">
<!--      <div class="footer-section">-->
<!--        <h3>Learn</h3>-->
<!--        <ul>-->
<!--          <li><a href="#">Flashcards</a></li>-->
<!--          <li><a href="#">Study Guides</a></li>-->
<!--          <li><a href="#">Practice Tests</a></li>-->
<!--        </ul>-->
<!--      </div>-->
      
      <div class="footer-section">
        <h3>Company</h3>
        <ul>
          <li><a href="https://github.com/monetadev">About Us</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Support</h3>
        <ul>
          <li><a href="#">Contact Us</a></li>
          <li><a href="#">FAQ</a></li>
          <li><a href="#">Help Center</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Legal</h3>
        <ul>
          <li><a href="#">Terms of Service</a></li>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Cookie Policy</a></li>
        </ul>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>© {{ currentYear }} Moneta. License TBD.</p>
      <div class="social-icons">
        <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
        <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
        <a href="https://github.com/monetadev" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="fab fa-github"></i></a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.global-footer {
  background-color: #1b2233;
  color: #b8c4e0;
  font-family: 'Outfit', sans-serif;
  padding: 3rem 2rem 1.5rem;
  width: 100%;
  z-index: 100;
  margin-top: auto;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  gap: 2rem;
}

.footer-section {
  flex: 1;
  min-width: 150px;
}

.footer-section h3 {
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section li {
  margin-bottom: 0.7rem;
}

.footer-section a {
  color: #b8c4e0;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.footer-section a:hover {
  color: white;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #2c3547;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-bottom p {
  font-size: 0.9rem;
  margin: 0;
}

.social-icons {
  display: flex;
  gap: 1rem;
}

.social-icons a {
  color: #b8c4e0;
  font-size: 1.2rem;
  transition: color 0.2s ease;
}

.social-icons a:hover {
  color: white;
}

/* Media queries for responsiveness */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 2rem;
  }
  
  .footer-section {
    width: 100%;
  }
  
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Styling for different views */
@media (max-height: 800px) {
  .global-footer {
    padding-top: 2rem;
    padding-bottom: 1rem;
  }
  
  .footer-content {
    gap: 1.5rem;
  }
  
  .footer-section h3 {
    margin-bottom: 0.8rem;
  }
  
  .footer-section li {
    margin-bottom: 0.5rem;
  }
  
  .footer-bottom {
    margin-top: 1.5rem;
  }
}
</style> 