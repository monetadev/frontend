<template>
  <div class="not-found-container">
    <div class="content-box">
      <font-awesome-icon :icon="getIcon('link-slash')" size="3x" class="icon"/>

      <h1 class="page-title">404 - Page Not Found</h1>
      <p class="message">
        Sorry, the page you were looking for doesn't seem to exist or may have been moved.
      </p>

      <div v-if="isLoadingAuth" class="loading-indicator">
        <font-awesome-icon :icon="getIcon('spinner')" spin/>
        Verifying access...
      </div>

      <div v-else class="actions">
        <button v-if="isAuthenticated" @click="navigateToLibrary" class="action-button primary-button">
          <font-awesome-icon :icon="getIcon('book-open-reader')"/>
          Go to My Library
        </button>
        <button v-else @click="navigateToLogin" class="action-button secondary-button">
          <font-awesome-icon :icon="getIcon('right-to-bracket')"/>
          Go to Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue';
import {useRouter} from 'vue-router';
import {useQuery} from '@vue/apollo-composable';
import {ME_QUERY} from '@/graphql/auth.js';

// --- Router ---
const router = useRouter();

// --- Font Awesome Icons ---
import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {
  faLinkSlash, faBookOpenReader, faRightToBracket, faTriangleExclamation, faSpinner
} from '@fortawesome/free-solid-svg-icons';

library.add(faLinkSlash, faBookOpenReader, faRightToBracket, faTriangleExclamation, faSpinner);
const icons = {
  'link-slash': faLinkSlash,
  'book-open-reader': faBookOpenReader,
  'right-to-bracket': faRightToBracket,
  'spinner': faSpinner,
};

function getIcon(iconName) {
  return icons[iconName] || faTriangleExclamation;
}

const {
  result: meQueryResult,
  loading: isLoadingAuth,
  error: meQueryError
} = useQuery(ME_QUERY, null, {
  fetchPolicy: 'cache-and-network',
  errorPolicy: 'all',
});

const isAuthenticated = computed(() => {
  if (isLoadingAuth.value) {
    return false;
  }

  if (meQueryError.value) {
    return false;
  }

  return !!meQueryResult.value?.me?.id;
});


function navigateToLibrary() {
  router.push({name: 'privateProfileLibrary'});
}

function navigateToLogin() {
  router.push({name: 'login'});
}
</script>

<style scoped>
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1em;
  color: var(--text-secondary);
  padding: 10px 0;
  min-height: 50px;
  box-sizing: border-box;
}

.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(80vh);
  text-align: center;
  padding: 20px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Outfit', sans-serif;
  box-sizing: border-box;
  width: 100%;
}

.content-box {
  background-color: var(--bg-secondary);
  padding: 40px 50px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
  max-width: 550px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.icon {
  color: var(--sidebar-active);
  opacity: 0.8;
  margin-bottom: 10px;
}

.page-title {
  font-size: 1.8em;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.message {
  font-size: 1.1em;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 15px 0;
  max-width: 400px;
}

.actions {
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 50px;
  box-sizing: border-box;
  align-items: center;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 0.95em;
  line-height: 1.5;
  white-space: nowrap;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button {
  position: relative;
  top: -1px;
}

.action-button.primary-button {
  background-color: var(--button-primary-bg);
  border-color: var(--button-primary-bg);
  color: #fff;
}

.action-button.primary-button:hover:not(:disabled) {
  background-color: var(--button-primary-hover-bg);
  border-color: var(--button-primary-hover-bg);
}

.action-button.secondary-button {
  background-color: var(--button-secondary-bg);
  border-color: var(--button-secondary-bg);
  color: var(--text-primary);
}

.action-button.secondary-button:hover:not(:disabled) {
  background-color: var(--button-secondary-hover-bg);
  border-color: var(--button-secondary-hover-bg);
}

@media (max-width: 600px) {
  .content-box {
    padding: 30px 25px;
  }

  .page-title {
    font-size: 1.6em;
  }

  .message {
    font-size: 1em;
  }

  .action-button {
    font-size: 0.9em;
    padding: 9px 18px;
  }
}
</style>