// src/stores/themeStore.js
import { ref, watch } from 'vue';
import { defineStore } from 'pinia'; // You can use Vuex if you prefer

export const useThemeStore = defineStore('theme', () => {
    // Get initial state from localStorage or default to dark
    const isDarkMode = ref(localStorage.getItem('theme') === 'light' ? false : true);

    // Watch for changes and update localStorage
    watch(isDarkMode, (newValue) => {
        localStorage.setItem('theme', newValue ? 'dark' : 'light');
        applyTheme(newValue);
    });

    // Function to apply theme to document
    function applyTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark-theme');
            document.documentElement.classList.remove('light-theme');
        } else {
            document.documentElement.classList.add('light-theme');
            document.documentElement.classList.remove('dark-theme');
        }
    }

    // Toggle function
    function toggleTheme() {
        isDarkMode.value = !isDarkMode.value;
    }

    // Initialize theme on store creation
    applyTheme(isDarkMode.value);

    return { isDarkMode, toggleTheme };
});
