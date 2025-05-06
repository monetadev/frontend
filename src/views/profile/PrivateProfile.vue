<template>
  <main class="profile-content">
    <h2 class="page-title">My Profile</h2>

    <div v-if="loadingMe || loadingStreak" class="loading-indicator full-page-indicator">
      <font-awesome-icon :icon="getIcon('spinner')" spin size="3x"/>
      <p>Loading profile data...</p>
    </div>

    <div v-else-if="errorMe || errorStreak" class="error-message full-page-error">
      <font-awesome-icon :icon="getIcon('triangle-exclamation')" size="3x" class="error-icon"/>
      <p>Could not load core profile information.</p>
      <pre v-if="errorMe">User Error: {{ errorMe.message }}</pre>
      <pre v-if="errorStreak">Streak Error: {{ errorStreak.message }}</pre>
    </div>

    <div v-else-if="user" class="profile-layout">

      <aside class="profile-sidebar">
        <div class="settings-section profile-picture-subsection">
          <div class="profile-image-container">
            <img
                v-if="profilePictureUrl"
                :src="profilePictureUrl"
                alt="Profile Picture"
                class="profile-img"
                @error="onImageError"
            />
            <div v-else class="placeholder-avatar">
              {{ avatarInitials }}
            </div>
          </div>
          <router-link to="/settings" class="action-link">Change Picture</router-link>
        </div>

        <div class="settings-section stats-subsection">
          <h3>Statistics</h3>
          <div class="stats-grid">
            <div class="stat-card interactive" :class="{ 'popout-active': activePopout === 'streak' }"
                 @click="togglePopout('streak')">
              <font-awesome-icon :icon="streakIcon" class="stat-icon" :class="streakIconClass"/>
              <span class="stat-value-condensed">{{ loginStreak ?? '0' }}</span>
              <div class="stat-popout" v-if="activePopout === 'streak'" @click.stop>
                <h5 class="popout-title">
                  <font-awesome-icon :icon="streakIcon" :class="streakIconClass"/>
                  Login Streak
                </h5>
                <p>{{ streakFlavorText }}</p>
                <span class="popout-detail">Current Streak: {{ loginStreak ?? '0' }} days</span>
              </div>
            </div>
            <div class="stat-card interactive" :class="{ 'popout-active': activePopout === 'sets' }"
                 @click="togglePopout('sets')">
              <font-awesome-icon :icon="getIcon('layer-group')" class="stat-icon"/>
              <span class="stat-value-condensed">{{ flashcardSetCount }}</span>
              <div class="stat-popout" v-if="activePopout === 'sets'" @click.stop>
                <h5 class="popout-title">
                  <font-awesome-icon :icon="getIcon('layer-group')"/>
                  Sets Created
                </h5>
                <p>You have created {{ flashcardSetCount }} flashcard set{{ flashcardSetCount !== 1 ? 's' : '' }}.</p>
                <router-link to="/library" class="popout-link">Go to Library</router-link>
              </div>
            </div>
            <div class="stat-card interactive" :class="{ 'popout-active': activePopout === 'docs' }"
                 @click="togglePopout('docs')">
              <font-awesome-icon :icon="getIcon('file-lines')" class="stat-icon"/>
              <span class="stat-value-condensed">{{ fileCount }}</span>
              <div class="stat-popout" v-if="activePopout === 'docs'" @click.stop>
                <h5 class="popout-title">
                  <font-awesome-icon :icon="getIcon('file-lines')"/>
                  Documents
                </h5>
                <p>You have uploaded {{ fileCount }} document{{ fileCount !== 1 ? 's' : '' }}.</p>
              </div>
            </div>
            <div class="stat-card interactive" :class="{ 'popout-active': activePopout === 'memberSince' }"
                 @click="togglePopout('memberSince')">
              <font-awesome-icon :icon="getIcon('calendar-days')" class="stat-icon"/>
              <span class="stat-value-condensed">{{ daysSinceCreation }}</span>
              <div class="stat-popout" v-if="activePopout === 'memberSince'" @click.stop>
                <h5 class="popout-title">
                  <font-awesome-icon :icon="getIcon('calendar-days')"/>
                  Member Since
                </h5>
                <p>You joined Moneta {{ daysSinceCreation }} days ago.</p>
                <span class="popout-detail">Joined on: {{ formatDate(user.creationDate, {dateStyle: 'long'}) }}</span>
              </div>
            </div>
          </div>
          <p class="stats-hint" v-if="!activePopout">Click a stat for more info.</p>
        </div>
      </aside>

      <section class="profile-main-info settings-section">
        <div class="user-name-header">
          <h1>{{ user.firstName }} {{ user.lastName }}</h1>
          <span class="username-display">@{{ user.username }}</span>
        </div>

        <div class="details-subsection">
          <h2>Account Details</h2>
          <dl class="details-list">
            <dt>Email:</dt>
            <dd>{{ user.email }}</dd>
            <dt>First Name:</dt>
            <dd>{{ user.firstName }}</dd>
            <dt>Last Name:</dt>
            <dd>{{ user.lastName }}</dd>
            <dt>Joined On:</dt>
            <dd>{{ formatDate(user.creationDate, {dateStyle: 'full'}) }}</dd>
            <dt v-if="user.lastUpdated">Last Updated:</dt>
            <dd v-if="user.lastUpdated">{{
                formatDate(user.lastUpdated, {dateStyle: 'medium', timeStyle: 'short'})
              }}
            </dd>
            <template v-if="user.roles && user.roles.length > 0">
              <dt>Roles:</dt>
              <dd>
                <ul class="roles-list">
                  <li v-for="role in user.roles" :key="role.id" class="role-tag">
                    {{ role.name.replace('ROLE_', '') }}
                  </li>
                </ul>
              </dd>
            </template>
          </dl>
          <router-link to="/settings" class="action-link edit-link">Edit Account Settings</router-link>
        </div>

        <div class="details-subsection">
          <h2>My Content</h2>
          <MyFlashcardSet
              v-if="user?.id"
              :userId="user.id"
              :page="0"
              :size="4"
          />

          <router-link
              v-if="flashcardSetCount > 3"
              to="/library"
              class="action-link view-all-link"
              style="display: block; margin-top: 20px;"
          >
            View Full Library ({{ flashcardSetCount }} total)
          </router-link>
          <p v-else-if="flashcardSetCount > 0 && flashcardSetCount <= 3" class="stats-hint" style="margin-top: 20px;">
            All your sets are shown here.
          </p>
        </div>
      </section>
    </div>

    <div v-else-if="!loadingMe && !loadingStreak" class="info-state full-page-error">
      <p>No profile data available. Please try logging in again.</p>
    </div>
  </main>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted} from 'vue';
import {useQuery} from '@vue/apollo-composable';
import {ME_QUERY, MY_LOGIN_STREAK_QUERY} from '@/graphql/auth.js';
import MyFlashcardSet from "@/components/flashcard/browse-sets/MyFlashcardSet.vue";
import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {
  faSpinner, faTriangleExclamation, faLayerGroup, faFileLines,
  faCalendarDays, faFire, faSeedling, faSun, faMeteor, faQuestionCircle,
  faFireAlt
} from '@fortawesome/free-solid-svg-icons';

library.add(faSpinner, faTriangleExclamation, faLayerGroup, faFileLines, faCalendarDays, faFire, faSeedling, faSun, faMeteor, faQuestionCircle, faFireAlt);
const icons = {
  'spinner': faSpinner,
  'triangle-exclamation': faTriangleExclamation,
  'layer-group': faLayerGroup,
  'file-lines': faFileLines,
  'calendar-days': faCalendarDays,
  'fire': faFire,
  'seedling': faSeedling,
  'sun': faSun,
  'meteor': faMeteor,
  'question-circle': faQuestionCircle,
  'fire-alt': faFireAlt
};

function getIcon(iconName) {
  return icons[iconName] || faQuestionCircle;
}

// Component State
const activePopout = ref(null);

// Queries
const {
  result: meResult,
  loading: loadingMe,
  error: errorMe
} = useQuery(ME_QUERY, null, {fetchPolicy: 'cache-and-network'});
const {
  result: streakResult,
  loading: loadingStreak,
  error: errorStreak
} = useQuery(MY_LOGIN_STREAK_QUERY, null, {fetchPolicy: 'cache-and-network'});

// Computed Properties
const user = computed(() => meResult.value?.me ?? null);
const loginStreak = computed(() => streakResult.value?.myLoginStreak ?? 0);
const hasUploadedProfilePic = computed(() => user.value?.files?.some(file => file?.contentType?.startsWith('image/')) ?? false);

const profilePictureUrl = computed(() => {
  if (user.value?.id && user.value?.files) {
    const profilePicFile = user.value.files.find(file => file?.contentType?.startsWith('image/'));
    if (profilePicFile?.filename) {
      // TODO: replace with variable for prod.
      return `http://localhost:8080/profile/${profilePicFile.filename}?userId=${user.value.id}&t=${Date.now()}`;
    }
  }
  return null;
});

const avatarInitials = computed(() => `${user.value?.firstName?.[0] || ''}${user.value?.lastName?.[0] || ''}`.toUpperCase() || '??');
const flashcardSetCount = computed(() => user.value?.flashcardSets?.length ?? 0); // From ME_QUERY
const fileCount = computed(() => user.value?.files?.filter(file => !file?.contentType?.startsWith('image/')).length ?? 0);
const daysSinceCreation = computed(() => {
  if (!user.value?.creationDate) return '?';
  try {
    const creationDate = new Date(user.value.creationDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - creationDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    console.error("Error calculating days since creation:", e);
    return '?';
  }
});
const streakIcon = computed(() => {
  const streak = loginStreak.value;
  if (streak === 0) return getIcon('question-circle');
  if (streak >= 1 && streak <= 7) return getIcon('seedling');
  if (streak >= 8 && streak <= 30) return getIcon('fire-alt');
  if (streak >= 31 && streak <= 90) return getIcon('fire');
  if (streak >= 91 && streak < 365) return getIcon('meteor');
  if (streak >= 365) return getIcon('sun');
  return getIcon('question-circle');
});
const streakIconClass = computed(() => {
  const streak = loginStreak.value;
  if (streak === 0) return 'streak-zero';
  if (streak >= 1 && streak <= 7) return 'streak-low';
  if (streak >= 8 && streak <= 90) return 'streak-medium';
  if (streak >= 91 && streak < 365) return 'streak-high';
  if (streak >= 365) return 'streak-max';
  return 'streak-zero';
});
const streakFlavorText = computed(() => {
  const streak = loginStreak.value;
  if (streak === 0) return "No current login streak. Log in tomorrow to start one!";
  if (streak === 1) return "First day of your streak! Keep it going.";
  if (streak <= 7) return `Day ${streak} of your streak! You're building a habit.`;
  if (streak <= 30) return `Going strong for ${streak} days! Impressive consistency.`;
  if (streak <= 90) return `Wow, ${streak} days! You're really dedicated.`;
  if (streak < 365) return `${streak} days and counting! Almost a year!`;
  if (streak === 365) return "One year login streak! Incredible commitment!";
  if (streak > 365) {
    const years = Math.floor(streak / 365);
    return `Amazing! Over ${years} year${years > 1 ? 's' : ''} (${streak} days) login streak!`;
  }
  return "Keep up the great work!";
});

/* --- Methods --- */
function formatDate(dateString, options = {}) {
  if (!dateString) return 'N/A';
  try {
    return new Intl.DateTimeFormat(navigator.language || 'en-US', options).format(new Date(dateString));
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Invalid Date';
  }
}

function onImageError(event) {
  console.warn("Profile picture failed to load:", event.target.src);
  event.target.style.display = 'none';
  const placeholder = event.target.nextElementSibling;
  if (placeholder && placeholder.classList.contains('placeholder-avatar')) {
    placeholder.style.display = 'flex';
  }
}

function togglePopout(statKey) {
  activePopout.value = activePopout.value === statKey ? null : statKey;
}

function handleClickOutside(event) {
  const clickedElement = event.target;
  let clickInsideInteractiveElement = false;
  document.querySelectorAll('.stat-card.interactive').forEach(el => {
    if (el.contains(clickedElement)) {
      clickInsideInteractiveElement = true;
    }
  });
  if (!clickInsideInteractiveElement) {
    activePopout.value = null;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true);
});
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true);
});
</script>

<style scoped>
.profile-content, .profile-content * {
  font-family: 'Outfit', sans-serif;
  box-sizing: border-box;
}

.profile-content * {
  box-sizing: border-box;
}

.profile-content {
  color: var(--text-primary);
  background-color: var(--bg-primary);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.page-title {
  font-size: 1.8em;
  font-weight: 600;
  margin-bottom: 0;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

/* --- Loading/Error/Info States --- */
.loading-indicator, .error-message {
  padding: 15px;
  text-align: center;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 8px;
  margin: 0;
  font-size: 0.95em;
  border: 1px solid var(--border-color);
}

.full-page-indicator, .full-page-error, .info-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
  min-height: 300px;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  width: 100%;
}

.full-page-indicator p, .full-page-error p, .info-state p {
  margin-top: 15px;
  font-size: 1.1em;
  color: var(--text-primary);
}

.full-page-error .error-icon {
  color: var(--error-color);
}

.full-page-error pre {
  background-color: rgba(var(--error-color-rgb), 0.1);
  color: var(--error-color);
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 15px;
  font-size: 0.9em;
  white-space: pre-wrap;
  word-break: break-all;
  text-align: left;
  max-width: 90%;
  border: 1px solid var(--error-color);
}

/* --- Profile Layout --- */
.profile-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  width: 100%;
}

.profile-sidebar {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.profile-main-info {
  flex: 1;
  min-width: 300px;
}

@media (max-width: 992px) {
  .profile-layout {
    flex-direction: column;
  }

  .profile-sidebar {
    flex: 1 1 auto;
    order: -1;
    align-items: center;
    width: 100%;
  }

  .profile-sidebar > .settings-section {
    width: 100%;
    max-width: 500px;
  }

  .profile-main-info {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  }
}

/* --- Settings Section Base --- */
.settings-section {
  background: var(--bg-secondary);
  padding: 25px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
}

.settings-section h3 {
  font-size: 1.3em;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--text-primary);
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

/* --- Profile Picture Specific Styles --- */
.profile-picture-subsection {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-image-container {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--sidebar-active);
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-tertiary);
  margin-bottom: 15px;
  box-shadow: 0 0 10px rgba(var(--sidebar-active-rgb), 0.3);
  position: relative;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.placeholder-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 3.5em;
  font-weight: 600;
  color: var(--text-primary);
  opacity: 0.8;
}

.action-link {
  color: var(--link-color);
  text-decoration: none;
  font-size: 0.9em;
  font-weight: 500;
  transition: color 0.2s;
  display: inline-block;
  margin-top: 10px;
}

.action-link:hover {
  color: var(--text-primary);
  text-decoration: underline;
}

/* --- Statistics Section Styles --- */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
}

.stat-card {
  background: var(--bg-tertiary);
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border-color);
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, border-color 0.2s;
  overflow: visible;
  position: relative;
  z-index: 1;
}

.stat-card.interactive {
  cursor: pointer;
}

.stat-card.interactive:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  border-color: var(--sidebar-active);
}

.stat-icon {
  font-size: 1.8em;
  color: var(--sidebar-active);
  width: 30px;
  text-align: center;
  flex-shrink: 0;
  transition: color 0.3s ease;
}

.stat-value-condensed {
  font-size: 1.3em;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 1;
  text-align: left;
}

.stat-card.popout-active {
  z-index: 20;
}

/* --- Popout Styling --- */
.stat-popout {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: auto;
  min-width: 220px;
  max-width: 280px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  z-index: 10;
  font-size: 0.9em;
  line-height: 1.5;
  color: var(--text-secondary);
  text-align: left;
  animation: fadeInPopout 0.2s ease-out forwards;
  white-space: normal;
}

@keyframes fadeInPopout {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.popout-title {
  font-size: 1.05em;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.popout-title .stat-icon {
  font-size: 1.1em;
  width: auto;
  margin-right: 4px;
}

.stat-popout p {
  margin: 0 0 10px 0;
  color: var(--text-primary);
  word-wrap: break-word;
}

.stat-popout p:last-of-type {
  margin-bottom: 0;
}

.popout-detail {
  display: block;
  font-size: 0.85em;
  color: var(--text-secondary);
  margin-top: 8px;
  border-top: 1px dashed var(--border-color);
  padding-top: 8px;
  word-wrap: break-word;
}

.popout-link {
  color: var(--link-color);
  text-decoration: none;
  font-weight: 500;
  display: inline-block;
  margin-top: 10px;
}

.popout-link:hover {
  text-decoration: underline;
}

.stats-hint {
  font-size: 0.8em;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 15px;
  font-style: italic;
}

/* --- Main Info Section Styles --- */
.profile-main-info {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.user-name-header {
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.profile-main-info h1 {
  font-size: 2.2em;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  line-height: 1.2;
}

.username-display {
  font-size: 1.1em;
  color: var(--text-secondary);
  display: block;
  margin-top: 4px;
  font-weight: 400;
  line-height: 1.3;
}

/* --- Subsections for Main Info --- */
.details-subsection {
  padding-top: 25px;
}

.details-subsection:first-of-type {
  padding-top: 0;
}

.details-subsection h2 {
  font-size: 1.4em;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--text-primary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

/* --- Details List Styling --- */
.details-list {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 15px 25px;
  align-items: baseline;
  margin-top: 15px;
}

.details-list dt {
  font-weight: 400;
  color: var(--text-secondary);
  grid-column: 1;
  text-align: right;
  padding-right: 10px;
}

.details-list dd {
  grid-column: 2;
  margin: 0;
  color: var(--text-primary);
  font-weight: 500;
  word-break: break-word;
}

.roles-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.role-tag {
  background-color: var(--bg-tertiary);
  color: var(--sidebar-active);
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.85em;
  font-weight: 500;
  border: 1px solid var(--sidebar-active);
  text-transform: capitalize;
}

.edit-link {
  margin-top: 25px;
}

.view-all-link {
  display: inline-block;
  margin-top: 15px;
  font-weight: 500;
}
</style>