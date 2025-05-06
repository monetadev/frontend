<template>
  <TransitionGroup name="toast-list" tag="div" class="toast-container" appear>
    <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast-${toast.type}`"
        @mouseenter="pauseTimer(toast)"
        @mouseleave="resumeTimer(toast)"
    >
      <div
          class="progress-bar"
          :style="{ animationDuration: `${toast.duration}ms` }"
          :class="{ 'paused': toast.isPaused }" />

      <div class="toast-content">
        <div class="icon-wrapper">
          <font-awesome-icon :icon="iconMap[toast.type]" class="icon"/>
        </div>
        <div class="message">
          <span class="toast-msg">{{ toast.msg }}</span>
        </div>
      </div>

      <button class="close" @click="removeToast(toast.id)" aria-label="Close toast">
        <font-awesome-icon :icon="faTimes"/>
      </button>
    </div>
  </TransitionGroup>
</template>

<script setup>
import { useToast } from '@/composables/useToast';

// Import icons (still needed for display)
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

// --- Get state and methods from the composable ---
// Note: We get the readonly `toasts` ref and the methods to interact with it.
const { toasts, pauseTimer, resumeTimer, removeToast } = useToast();

// Icon mapping remains component-specific display logic
const iconMap = {
  success: faCheckCircle,
  error: faTimesCircle,
  warning: faExclamationTriangle,
  info: faInfoCircle
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.toast-container {
  position: fixed;
  top: calc(var(--navbar-height, 60px) + 20px);
  right: 25px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
  max-width: 380px;
  width: calc(100% - 50px);
  font-family: 'Outfit', sans-serif;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-tertiary, #22293A);
  color: var(--text-primary, #e0e0e0);
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color, #2d3748);
  position: relative;
  overflow: hidden;
  width: 100%;
  transition: transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease;
}

.toast:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}


/* --- Progress Bar --- */
.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background-color: var(--primary-color);
  animation: shrink linear forwards;
  transform-origin: left;
}

.toast:hover .progress-bar {
  animation-play-state: paused;
}

.progress-bar.paused {
    animation-play-state: paused;
}

@keyframes shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}


/* --- Toast Content --- */
.toast-content {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-grow: 1;
  min-width: 0;
  padding-top: 5px;
}

.icon-wrapper {
  font-size: 1.4em;
  flex-shrink: 0;
  line-height: 1;
}

.icon {
  display: block;
}

.message {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 2px;
  line-height: 1.4;
  min-width: 0;
}

.toast-msg {
  font-weight: 400;
  font-size: 0.9em;
  color: var(--text-secondary, #a0a0a0);
  word-wrap: break-word;
}


/* --- Close Button --- */
.close {
  border: none;
  cursor: pointer;
  color: var(--text-secondary, #a0a0a0);
  margin-left: 15px; /* Space from content */
  padding: 0;
  flex-shrink: 0; /* Prevent shrinking */
  align-self: center; /* Align vertically */

  width: 26px;
  height: 26px;
  border-radius: 6px;
  font-size: 1em;
  line-height: 1;
  display: inline-flex; /* Use flex for centering icon */
  align-items: center;
  justify-content: center;

  opacity: 0.6;
  background: transparent none;

  transition: opacity 0.2s ease, color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.toast:hover .close {
  opacity: 1;
  color: var(--text-primary, #e0e0e0);
  background-color: rgba(0,0,0,0.2);
  transform: scale(1.1);
}


/* --- Type-specific colors --- */
.toast-success .icon-wrapper { color: var(--success-color, #4CAF50); }
.toast-success .progress-bar { background-color: var(--success-color, #4CAF50); }
.toast-error .icon-wrapper { color: var(--error-color, #ff6b6b); }
.toast-error .progress-bar { background-color: var(--error-color, #ff6b6b); }
.toast-warning .icon-wrapper { color: var(--warning-color, #ffcc00); }
.toast-warning .progress-bar { background-color: var(--warning-color, #ffcc00); }
.toast-info .icon-wrapper { color: var(--info-color, #2196f3); }
.toast-info .progress-bar { background-color: var(--info-color, #2196f3); }


/* --- Elegant Enter/Leave Animations --- */

/* 1. Enter Transition */
.toast-list-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
  transform-origin: right center;
}
.toast-list-enter-active {
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.toast-list-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
}

/* 2. Leave Transition */
.toast-list-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.toast-list-leave-active {
  transition: all 0.4s cubic-bezier(0.5, 0, 0.75, 0);
  position: absolute;
  width: 100%;
  right: 0;
}
.toast-list-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
  transform-origin: right center;
}

/* 3. Move Transition */
.toast-list-move {
  transition: transform 0.4s ease;
}


/* --- Responsiveness --- */
@media (max-width: 600px) {
  .toast-container {
    left: 15px;
    right: 15px;
    top: calc(var(--navbar-height, 60px) + 15px);
    max-width: none;
    width: auto;
    align-items: stretch;
  }

  .toast {
    padding: 12px 15px;
  }

  .toast:hover {
    transform: none;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  }

  .toast:hover .close {
    transform: none;
    background-color: rgba(0,0,0,0.1);
  }

  .icon-wrapper {
    font-size: 1.3em;
  }

  .toast-msg {
    font-size: 0.85em;
  }

  .toast-list-leave-active {
  }
}
</style>