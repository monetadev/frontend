<template>
  <router-link :to="`/library/set/${set.id}`" class="flashcard-set-card-link">
    <div class="flashcard-set-card">
      <h4 class="set-title">{{ set.title || 'Untitled Set' }}</h4>
      <p class="set-description">{{ set.description || 'No description.' }}</p>
      <div class="set-footer">
        <div class="author-section">
          <div v-if="!isOwnedByLoggedInUser && set.author" class="author-info-link-wrapper">
            <router-link :to="`/profile/${set.author.username}`" class="author-info-link" @click.stop>
              <div class="author-profile-icon">
                <img
                    v-if="authorPictureUrl"
                    :src="authorPictureUrl"
                    alt=""
                    class="author-pic-small"
                    @error="onAuthorPicError"
                />
                <span v-else class="author-initials-small">
                           {{ authorInitials }}
                       </span>
              </div>
              <span class="author-username">@{{ set.author.username }}</span>
            </router-link>
          </div>
          <div v-else-if="!isOwnedByLoggedInUser" class="author-info-link-wrapper">
                 <span class="author-info-link author-unknown">
                    <div class="author-profile-icon">
                         <span class="author-initials-small">?</span>
                    </div>
                    <span class="author-username">@Unknown Author</span>
                 </span>
          </div>
          <div v-else class="author-section-placeholder">
          </div>
        </div>

        <div class="set-metadata">
          <span class="meta-item tooltip-container card-count" :data-tooltip="`${set.flashcards?.length ?? 0} Cards`">
            <font-awesome-icon :icon="getIcon('layer-group')" fixed-width />
            {{ set.flashcards?.length ?? 0 }}
          </span>
          <span
              v-if="!hideVisibility"
              class="meta-item tooltip-container visibility-icon"
              :data-tooltip="set.isPublic ? 'Public Set' : 'Private Set'"
          >
            <font-awesome-icon
                :icon="getIcon(set.isPublic ? 'eye' : 'eye-slash')"
                :class="{ 'public': set.isPublic, 'private': !set.isPublic }"
                fixed-width
            />
          </span>
          <span class="meta-item tooltip-container creation-date" :data-tooltip="`Created: ${formatDate(set.creationDate, { dateStyle: 'long', timeStyle: 'short' })}`">
             <font-awesome-icon :icon="getIcon('calendar-days')" fixed-width />
             {{ formatDate(set.creationDate, { month: 'short', day: 'numeric', year:'numeric'}) }}
          </span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { defineProps, computed, ref } from 'vue';
// Font Awesome setup
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faLayerGroup, faCalendarDays, faEye, faEyeSlash, faTriangleExclamation, faSpinner // Added spinner maybe for future loading state? Keep minimal
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faLayerGroup, faCalendarDays, faEye, faEyeSlash, faTriangleExclamation, faSpinner
);

// Icon map
const icons = {
  'layer-group': faLayerGroup, 'calendar-days': faCalendarDays,
  'eye': faEye, 'eye-slash': faEyeSlash, 'spinner': faSpinner,
  'triangle-exclamation': faTriangleExclamation
};
// Helper
function getIcon(iconName) { return icons[iconName] || icons['triangle-exclamation']; }

// Props definition
const props = defineProps({
  set: {
    type: Object,
    required: true,
    validator: (value) => value && typeof value.id === 'string'
  },
  hideVisibility: {
    type: Boolean,
    default: false
  },
  // New prop for logged-in user ID
  loggedInUserId: {
    type: String,
    default: null
  }
});

// State for handling image error fallback
const authorPicLoadError = ref(false);

// Computed property to check ownership
const isOwnedByLoggedInUser = computed(() => {
  return props.loggedInUserId && props.set?.author?.id === props.loggedInUserId;
});

// Computed property for author's profile picture URL
const authorPictureUrl = computed(() => {
  // Reset error flag if library changes
  // Note: This simple reset might not cover all edge cases if the same component instance
  // receives rapidly changing props, but sufficient for typical list rendering.
  authorPicLoadError.value = false;

  if (authorPicLoadError.value || !props.set?.author?.files || !props.set?.author?.id) {
    return null;
  }
  const profilePicFile = props.set.author.files.find(file => file?.contentType?.startsWith('image/'));
  if (profilePicFile?.filename) {
    return `http://localhost:8080/profile/${profilePicFile.filename}?userId=${props.set.author.id}&t=${Date.now()}`;
  }
  return null;
});

// Computed property for author's initials
const authorInitials = computed(() => {
  const first = props.set?.author?.firstName?.[0] || '';
  const last = props.set?.author?.lastName?.[0] || '';
  // Fallback to first letter of username if name is missing
  return (first + last).toUpperCase() || props.set?.author?.username?.[0]?.toUpperCase() || '?';
});

// Handle image load error
function onAuthorPicError() {
  console.warn(`Failed to load author pic for user ${props.set?.author?.username}`);
  authorPicLoadError.value = true; // Set flag to fallback to initials
}

// Date Formatting Helper
function formatDate(dateString, options = {}) {
  if (!dateString) return 'N/A';
  try {
    return new Intl.DateTimeFormat(navigator.language || 'en-US', options).format(new Date(dateString));
  } catch (e) { console.error("Error formatting date:", e); return 'Invalid Date'; }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.flashcard-set-card-link, .flashcard-set-card-link * {
  font-family: 'Outfit', sans-serif;
  box-sizing: border-box;
}
.flashcard-set-card-link { text-decoration: none; color: inherit; display: block; height: 100%; }
.flashcard-set-card { background: var(--bg-secondary, #1a2036); border-radius: 12px; border: 1px solid var(--border-color, #3b3e56); display: flex; flex-direction: column; height: 100%; transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, border-color 0.2s ease-out; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15); padding: 20px 25px; }
.flashcard-set-card:hover { transform: translateY(-4px); box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3); border-color: var(--sidebar-active, #5f98ef); }
.set-title { font-size: 1.15em; font-weight: 600; color: var(--text-primary, #ffffff); margin: 0 0 8px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.set-description { font-size: 0.9em; color: var(--text-secondary, #adb5bd); line-height: 1.5; margin-bottom: 15px; flex-grow: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; min-height: 4.05em; }
.set-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border-color, #3b3e56); margin-top: auto; min-height: 30px; gap: 10px; }

.author-section { min-width: 0; flex-shrink: 1; overflow: hidden; }
.author-section-placeholder { height: 24px; }
.author-info-link-wrapper { min-width: 0; }

.author-info-link { display: inline-flex; align-items: center; gap: 6px; text-decoration: none; color: inherit; overflow: hidden; max-width: 100%; }
.author-unknown { cursor: default; }
.author-username { font-size: 0.9em; font-weight: 500; color: var(--text-secondary, #adb5bd); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.2s; }
.author-info-link:not(.author-unknown):hover .author-username { color: var(--link-color, #5f98ef); text-decoration: underline; }

.author-profile-icon { width: 20px; height: 20px; flex-shrink: 0; border-radius: 50%; background-color: #4a5a78; display: flex; align-items: center; justify-content: center; overflow: hidden; font-size: 9px; font-weight: 600; color: white; border: 1px solid rgba(255,255,255,0.1); }
.author-profile-icon .author-pic-small { width: 100%; height: 100%; object-fit: cover; }
.author-profile-icon .author-initials-small { line-height: 1; }

.set-metadata { display: flex; align-items: center; gap: 12px; font-size: 0.85em; color: var(--text-secondary, #adb5bd); flex-shrink: 0; }
.meta-item { display: flex; align-items: center; gap: 5px; white-space: nowrap; }
.meta-item .svg-inline--fa { color: var(--sidebar-active, #5f98ef); width: 1em; flex-shrink: 0; }
.visibility-icon .svg-inline--fa { font-size: 1.1em; }
.visibility-icon .svg-inline--fa.public { color: var(--success-color, #7dd37d); }
.visibility-icon .svg-inline--fa.private { color: var(--text-secondary, #adb5bd); }
.tooltip-container { position: relative; cursor: default; }
.tooltip-container::before { content: attr(data-tooltip); position: absolute; bottom: 130%; left: 50%; transform: translateX(-50%); background-color: var(--bg-tertiary, #1f2640); color: var(--text-primary, #ffffff); padding: 4px 8px; border-radius: 4px; font-size: 0.8em; white-space: nowrap; z-index: 15; opacity: 0; visibility: hidden; transition: opacity 0.2s ease-out, visibility 0.2s ease-out; pointer-events: none; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
.card-count.tooltip-container::before { left: 0; transform: translateX(0); }
.creation-date.tooltip-container::before { left: auto; right: 0; transform: translateX(0); }
.tooltip-container:hover::before { opacity: 1; visibility: visible; }
</style>