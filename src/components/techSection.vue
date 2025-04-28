<template>
  <section class="tech-stack-section" id="tech-stack">
    <div class="tech-stack-container">
      <h2 class="section-title">Our Tech Stack</h2>
      <p class="section-subtitle">Built with modern and powerful technologies.</p>

      <div class="stack-categories">
        <div class="category-column">
          <h3 class="category-title">Backend</h3>
          <ul class="tech-list">
             <li v-for="tech in techStack.backend" :key="tech.name" class="tech-item">
               <a :href="tech.url" target="_blank" rel="noopener noreferrer" class="tech-link">
                {{ tech.name }}
              </a>
            </li>
          </ul>
        </div>

        <div class="category-column">
          <h3 class="category-title">Frontend</h3>
          <ul class="tech-list">
             <li v-for="tech in techStack.frontend" :key="tech.name" class="tech-item">
               <a :href="tech.url" target="_blank" rel="noopener noreferrer" class="tech-link">
                {{ tech.name }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

// Define the technologies used as objects with name and url
const techStack = ref({
  backend: [
    { name: 'Spring', url: 'https://spring.io/projects/spring-boot' },
    { name: 'PostgreSQL', url: 'https://www.postgresql.org/' },
    { name: 'OpenAI API', url: 'https://platform.openai.com/docs/overview' },
    { name: 'Ollama', url: 'https://ollama.com/' },
    // Cleaned Qdrant URL (removed tracking parameters)
    { name: 'Qdrant', url: 'https://qdrant.tech/' }
  ],
  frontend: [
    // Added URL for Vue.js
    { name: 'Vue.js', url: 'https://vuejs.org/' }
  ]
});
</script>

<style scoped>
.tech-stack-section {
  background-color: #283143;
  padding: 80px 20px;
  color: #E2E8F0;
}

.tech-stack-container {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.section-title {
  font-size: clamp(2rem, 5vw, 2.8rem);
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #A0AEC0;
  margin-bottom: 3.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.stack-categories {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  text-align: left;
}

.category-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #E2E8F0;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #4A5568;
}

.tech-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Style the list item container */
.tech-item {
  background-color: #2d3748;
  margin-bottom: 0.8rem;
  border-radius: 6px;
  border: 1px solid #4A5568;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  /* Remove padding from li if applying to link */
  padding: 0;
}

.tech-item:hover {
  background-color: #4A5568;
  border-color: #A0AEC0;
}

/* Style the link itself */
.tech-link {
  display: block; /* Make the link fill the list item */
  padding: 0.8rem 1.2rem; /* Apply padding to the link for click area */
  color: #CBD5E0; /* Link text color */
  text-decoration: none; /* Remove underline */
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

/* Style link on hover (within the hovered list item) */
.tech-item:hover .tech-link {
  color: #E2E8F0; /* Lighter color on hover */
  /* text-decoration: underline; */ /* Optional: Add underline on hover */
}


/* Remove .tech-name style as it's replaced by .tech-link */

@media (max-width: 640px) {
  .stack-categories {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  .category-title {
    text-align: center;
  }
  /* Center link text when stacked */
  .tech-link {
     text-align: center;
  }
}
</style>