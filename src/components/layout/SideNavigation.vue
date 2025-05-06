<template>
  <div :class="['sidebar', { collapsed: isCollapsed }]">
    <div class="sidebar-header">
      <button class="toggle-button" @click="toggleSidebar" aria-label="Toggle sidebar">
        <font-awesome-icon :icon="getIcon('bars')" />
      </button>
      <transition name="fade">
        <span v-if="!isCollapsed" class="logo">Moneta</span>
      </transition>
    </div>

    <div class="menu-container">
      <ul class="menu">
        <li v-if="loadingMe" class="loading-item">
          <span class="icon"> <font-awesome-icon :icon="getIcon('spinner')" spin /> </span>
          <transition name="fade"> <span v-if="!isCollapsed" class="menu-text">Loading...</span> </transition>
        </li>
        <li v-if="errorMe" class="error-item">
          <span class="icon"> <font-awesome-icon :icon="getIcon('triangle-exclamation')" /> </span>
          <transition name="fade"> <span v-if="!isCollapsed" class="menu-text">Error</span> </transition>
        </li>

        <template v-for="item in filteredMenuItems" :key="getItemExpansionKey(item) || item.name">
          <li
              :class="[
              'menu-item',
              {
                'has-children': item.children && item.children.length > 0,
                'parent-active': isParentActive(item),
                'expanded': sidebarStore.isItemExpanded(getItemExpansionKey(item))
              }
            ]"
              :aria-expanded="item.children && item.children.length > 0 ? sidebarStore.isItemExpanded(getItemExpansionKey(item)) : undefined"
              :aria-controls="item.children && item.children.length > 0 ? `submenu-${getItemExpansionKey(item)}` : undefined"
          >
            <router-link
                v-if="item.path"
                :to="item.path"
                custom
                v-slot="{ navigate, href, isActive, isExactActive }"
            >
              <a
                  :href="href"
                  @click.prevent="navigate()"
                  class="item-content-wrapper"
                  :class="{
                  'router-link-active': isActive || isParentActive(item),
                  'router-link-exact-active': isExactActive && !hasActiveChild(item)
                }"
              >
                <span class="icon"> <font-awesome-icon :icon="getIcon(item.icon)" /> </span>
                <transition name="fade"> <span v-if="!isCollapsed" class="menu-text">{{ item.name }}</span> </transition>
                <transition name="fade">
                  <span
                      v-if="!isCollapsed && item.children && item.children.length > 0"
                      class="expand-icon"
                      @click.stop.prevent="handleExpansionToggle(item)">
                    <font-awesome-icon :icon="sidebarStore.isItemExpanded(getItemExpansionKey(item)) ? getIcon('chevron-down') : getIcon('chevron-right')" />
                  </span>
                </transition>
              </a>
            </router-link>
            <div v-else class="item-content-wrapper">
              <span class="icon"> <font-awesome-icon :icon="getIcon(item.icon)" /> </span>
              <transition name="fade"> <span v-if="!isCollapsed" class="menu-text">{{ item.name }}</span> </transition>
              <transition name="fade">
                <span
                    v-if="!isCollapsed && item.children && item.children.length > 0"
                    class="expand-icon"
                    @click.stop.prevent="handleExpansionToggle(item)">
                   <font-awesome-icon :icon="sidebarStore.isItemExpanded(getItemExpansionKey(item)) ? getIcon('chevron-down') : getIcon('chevron-right')" />
                </span>
              </transition>
            </div>
          </li>

          <transition name="slide-fade">
            <li
                v-if="!isCollapsed && item.children && item.children.length > 0 && sidebarStore.isItemExpanded(getItemExpansionKey(item))"
                class="submenu-container"
                :id="`submenu-${getItemExpansionKey(item)}`"
            >
              <transition-group name="list-anim" tag="ul" class="submenu">
                <template v-for="child in item.children" :key="child.path || child.query || child.id">
                  <router-link
                      :to="child.path"
                      custom
                      v-slot="{ navigate, href }"
                      #default="{ route }"
                  >
                    <li
                        :class="[
                          'submenu-item',
                          {
                              'active': isSubmenuItemActive(child),
                              'dynamic-item': child.isDynamic
                          }
                        ]"
                        @click.stop="navigate" >

                      <div v-if="child.isDynamic && (child.type === 'profile' || child.type === 'library')" class="dynamic-profile-icon">
                        <span v-if="child.isLoading" class="icon-spinner">
                            <font-awesome-icon :icon="getIcon('spinner')" spin />
                        </span>
                        <img v-else-if="child.pictureUrl"
                             :src="child.pictureUrl"
                             :alt="`${child.username} profile picture`"
                             class="profile-pic-small"
                             @error="onDynamicPicError(child.username, child.type)" />
                        <span v-else class="profile-initials-small">{{ getDynamicInitials(child) }}</span>
                      </div>

                      <span v-else-if="child.icon" class="submenu-icon">
                           <font-awesome-icon :icon="getIcon(child.icon)" />
                      </span>
                      <span v-else-if="child.isDynamic && child.type === 'search'" class="submenu-icon">
                           <font-awesome-icon :icon="getIcon('tag')" />
                      </span>
                      <span v-else-if="child.isDynamic && child.type === 'set'" class="submenu-icon">
                           <font-awesome-icon :icon="getIcon('layer-group')" />
                      </span>

                      <span class="menu-text">{{ child.name || child.title }}</span>

                      <button
                          v-if="child.isDynamic"
                          @click.prevent.stop="removeChildEntry(child.username || child.query || child.id, child.type)"
                          class="remove-profile-btn"
                          :aria-label="`Remove ${child.name || child.title} from list`"
                      >
                        <font-awesome-icon :icon="getIcon('xmark')" />
                      </button>
                    </li>
                  </router-link>
                </template>
              </transition-group>
            </li>
          </transition>
        </template>
      </ul>
    </div>
  </div>
</template>

<script setup>
// Script setup remains identical to the previous version
// where client.query was used in the watcher.
import { computed, watch, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery, useApolloClient } from '@vue/apollo-composable';
import { useSidebarStore } from '@/stores/sidebar.js';
import { ME_QUERY, GET_FLASHCARD_SET_BY_ID, FIND_USER_BY_USERNAME } from '@/graphql/auth.js';

// Font Awesome Setup
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faBars, faSpinner, faTriangleExclamation, faBook, faPlusSquare,
  faListCheck, faSearch, faCog, faUserShield, faChevronRight, faChevronDown,
  faUser, faFileLines, faXmark, faLayerGroup, faTag
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faBars, faSpinner, faTriangleExclamation, faBook, faPlusSquare,
    faListCheck, faSearch, faCog, faUserShield, faChevronRight, faChevronDown,
    faUser, faFileLines, faXmark, faLayerGroup, faTag
);

const icons = {
  'bars': faBars, 'spinner': faSpinner, 'triangle-exclamation': faTriangleExclamation,
  'book': faBook, 'plus-square': faPlusSquare, 'list-check': faListCheck,
  'search': faSearch, 'cog': faCog, 'user-shield': faUserShield,
  'chevron-right': faChevronRight, 'chevron-down': faChevronDown, 'user': faUser,
  'file-lines': faFileLines, 'xmark': faXmark, 'layer-group': faLayerGroup,
  'tag': faTag
};
function getIcon(iconName) { return icons[iconName] || faTriangleExclamation; }

// Component Interaction
const props = defineProps({ isCollapsed: Boolean });
const emit = defineEmits(['toggle']);

// Vue Services
const route = useRoute();
const router = useRouter();
const sidebarStore = useSidebarStore();
const { client } = useApolloClient(); // Get Apollo client instance directly

// GraphQL Data for 'Me'
const { result: meResult, loading: loadingMe, error: errorMe } = useQuery(ME_QUERY, null, {
  fetchPolicy: 'cache-first'
});

// Base Menu Structure
const baseMenuItems = ref([
  { name: "Create", icon: "plus-square", expansionKey: "_create", children: [ { name: "Flashcard Set", icon: "layer-group", path: "/create/set" }, { name: "Quiz", icon: "list-check", path: "/create/quiz" } ] },
  { name: "Profile", icon: "user", path: "/profile", expansionKey: "/profile", children: [] },
  { name: "Library", icon: "book", path: "/library", expansionKey: "/library", children: [] },
  { name: "Explore", icon: "search", path: "/explore", expansionKey: "/explore", children: [] },
  { name: "Quizzes", icon: "list-check", path: "/quiz", children: [] },
  { name: "Documents", icon: "file-lines", path: "/documents" },
  { name: "Preferences", icon: "cog", path: "/settings", expansionKey: "/settings", children: [] },
]);
const adminMenuItem = { name: "Admin Panel", icon: "user-shield", path: "/settings/admin" };

// Helper Functions
function getItemExpansionKey(item) { return item.expansionKey || item.path; }

// Computed Properties
const loggedInUsername = computed(() => meResult.value?.me?.username);
const isAdmin = computed(() => meResult.value?.me?.roles?.some(role => role.name === "ROLE_ADMIN") ?? false);

/**
 * Generates the final list of menu items including dynamic entries.
 */
const filteredMenuItems = computed(() => {
  const items = JSON.parse(JSON.stringify(baseMenuItems.value));

  const generatePictureUrl = (userId) => {
    if (!userId) return null;
    return `http://localhost:8080/profile/${userId}?t=${Date.now()}`;
  };

  if (isAdmin.value) {
    const prefsItem = items.find(item => getItemExpansionKey(item) === "/settings");
    if (prefsItem) {
      prefsItem.children = prefsItem.children || [];
      if (!prefsItem.children.some(child => child.path === adminMenuItem.path)) {
        prefsItem.children.push(adminMenuItem);
      }
    }
  }

  const profileItem = items.find(item => getItemExpansionKey(item) === "/profile");
  if (profileItem) {
    profileItem.children = profileItem.children || [];
    const dynamicProfiles = sidebarStore.visitedUserProfiles.map(profileInfo => ({
      name: `@${profileInfo.username}`, path: `/profile/${profileInfo.username}`,
      isDynamic: true, type: 'profile', username: profileInfo.username,
      id: profileInfo.id, firstName: profileInfo.firstName, lastName: profileInfo.lastName,
      pictureUrl: (!profileInfo.isLoading && profileInfo.id) ? generatePictureUrl(profileInfo.id) : null,
      isLoading: profileInfo.isLoading,
    }));
    profileItem.children.push(...dynamicProfiles.filter(dp => !profileItem.children.some(child => child.path === dp.path)));
  }

  const libraryItem = items.find(item => getItemExpansionKey(item) === "/library");
  if (libraryItem) {
    libraryItem.children = libraryItem.children || [];

    const dynamicLibraries = sidebarStore.visitedUserLibraries.map(libraryInfo => ({
      name: `@${libraryInfo.username}`, path: `/library/${libraryInfo.username}`,
      isDynamic: true, type: 'library', username: libraryInfo.username,
      id: libraryInfo.id, firstName: libraryInfo.firstName, lastName: libraryInfo.lastName,
      pictureUrl: (!libraryInfo.isLoading && libraryInfo.id) ? generatePictureUrl(libraryInfo.id) : null,
      isLoading: libraryInfo.isLoading,
    }));
    libraryItem.children.push(...dynamicLibraries.filter(dl => !libraryItem.children.some(child => child.path === dl.path)));

    const dynamicSets = sidebarStore.visitedFlashcardSets.map(setInfo => ({
      id: setInfo.id, title: setInfo.title, name: setInfo.title,
      path: `/library/set/${setInfo.id}`, isDynamic: true, type: 'set', icon: 'layer-group'
    }));
    libraryItem.children.push(...dynamicSets.filter(ds => !libraryItem.children.some(child => child.path === ds.path)));
  }

  const exploreItem = items.find(item => getItemExpansionKey(item) === "/explore");
  if (exploreItem) {
    exploreItem.children = exploreItem.children || [];
    const dynamicSearches = sidebarStore.recentSearchQueries.map(searchInfo => ({
      ...searchInfo, icon: 'tag'
    }));
    exploreItem.children.push(...dynamicSearches.filter(ds => !exploreItem.children.some(child => child.path === ds.path)));
  }

  return items.map(item => ({ ...item, children: item.children || [] }));
});


// --- Methods ---

function onDynamicPicError(username, type) {
  console.error(`[SideNavigation] Image failed to load for ${username} (${type}).`);
}

function getDynamicInitials(child) {
  if (child.type === 'profile' || child.type === 'library') {
    const first = child.firstName?.[0] || '';
    const last = child.lastName?.[0] || '';
    return (first + last).toUpperCase() || child.username?.[0]?.toUpperCase() || '?';
  }
  return '?';
}


function removeChildEntry(identifier, type) {
  sidebarStore.removeVisitedEntry(identifier, type);
}

function toggleSidebar() { emit("toggle"); }

function handleExpansionToggle(item) {
  const expansionKey = getItemExpansionKey(item);
  if (!props.isCollapsed && item.children && item.children.length > 0 && expansionKey) {
    sidebarStore.toggleItemExpansion(expansionKey);
  }
}

// --- Active State Checks ---
function isParentActive(item) {
  const itemKey = getItemExpansionKey(item);
  if (!itemKey && !item.path) return false;
  if (item.path && route.path === item.path) return !(item.path === '/explore' && route.query.q);
  if (item.children && item.children.length > 0) {
    const hasActiveStaticChild = item.children.some(child => child.path && route.path === child.path && !child.isDynamic);
    if (hasActiveStaticChild) return true;
    if (itemKey === '/profile' && route.path.startsWith('/profile/') && route.path !== '/profile') return true;
    if (itemKey === '/library' && (route.path.startsWith('/library/set/') || (route.path.startsWith('/library/') && !route.path.startsWith('/library/set/') && route.path !== '/library') || route.path === '/library')) return true;
    if (itemKey === '/explore' && route.path === '/explore' && route.query.q) return sidebarStore.recentSearchQueries.some(search => search.query === route.query.q?.toString());
    const parentPathPrefix = item.path ? item.path + (item.path.endsWith('/') ? '' : '/') : null;
    if (parentPathPrefix && route.path.startsWith(parentPathPrefix) && route.path !== item.path) {
      const baseItem = baseMenuItems.value.find(base => getItemExpansionKey(base) === itemKey);
      return baseItem?.children?.some(child => child.path === route.path && !child.isDynamic) ?? false;
    }
  }
  return false;
}

function hasActiveChild(item) {
  if (!item.children || item.children.length === 0) return false;
  return item.children.some(child => isSubmenuItemActive(child));
}

function isSubmenuItemActive(child) {
  if (child.type === 'search') return route.path === '/explore' && route.query.q === child.query;
  if (child.path) return route.path === child.path;
  return false;
}


// Initialize Apollo Client in Store on Mount
onMounted(() => {
  if (client) {
    sidebarStore.initializeApolloClient();
  } else {
    console.error("[SideNavigation] Apollo client instance is not available on mount.");
  }
});

// --- Watchers ---
/**
 * Watches route changes to add visited dynamic items and expand sections.
 */
watch([() => route.path, () => route.params.id, () => route.query.q], async ([newPath, newIdParam, newQuery], [oldPath, oldIdParam, oldQuery]) => {
  if (newPath === oldPath && newIdParam === oldIdParam && newQuery === oldQuery && oldPath !== undefined) return;

  let visitedUsername = null;
  let visitedSetId = null;
  let parentKey = null;
  let type = null;

  const profileMatch = newPath.match(/^\/profile\/([^/]+)$/);
  const libraryMatch = newPath.match(/^\/library\/([^/]+)$/);
  const setMatch = newPath.match(/^\/library\/set\/([^/]+)$/);

  if (profileMatch) {
    visitedUsername = profileMatch[1]; parentKey = '/profile'; type = 'profile';
  } else if (libraryMatch) {
    visitedUsername = libraryMatch[1]; parentKey = '/library'; type = 'library';
  } else if (setMatch) {
    visitedSetId = setMatch[1]; parentKey = '/library'; type = 'set';
  } else if (newPath === '/explore' && newQuery) {
    const currentSearchQuery = newQuery.toString().trim();
    if (currentSearchQuery) { sidebarStore.addRecentSearch(currentSearchQuery); parentKey = '/explore'; type = 'search'; }
  }

  if (visitedUsername && (type === 'profile' || type === 'library')) {
    if (loggedInUsername.value && visitedUsername !== loggedInUsername.value) {
      sidebarStore.addVisitedEntry(visitedUsername, type);
    }
  }

  if (visitedSetId && type === 'set') {
    const alreadyVisited = sidebarStore.visitedFlashcardSets.find(s => s.id === visitedSetId);
    if (!alreadyVisited) {
      if (!client) {
        console.error("[SideNavigation Watcher] Apollo client is not available. Cannot fetch set title.");
      } else {
        try {
          const { data, error } = await client.query({
            query: GET_FLASHCARD_SET_BY_ID,
            variables: { id: visitedSetId },
            fetchPolicy: 'network-only',
          });

          if (error) {
            console.error(`[SideNavigation] Apollo error fetching title for set ${visitedSetId}:`, JSON.stringify(error, null, 2));
          } else if (data?.findFlashcardSetById?.title) {
            sidebarStore.addVisitedSet({ id: visitedSetId, title: data.findFlashcardSetById.title });
          } else {
            console.warn(`[SideNavigation] Set ${visitedSetId} fetched but no title found in response data.`);
          }
        } catch (e) {
          console.error(`[SideNavigation] Network/other error fetching title for set ${visitedSetId}:`, e);
        }
      }
    } else {
      sidebarStore.addVisitedSet({ id: visitedSetId, title: alreadyVisited.title });
    }
  }


  let keyToExpand = parentKey;
  if (!keyToExpand) {
    for (const item of baseMenuItems.value) {
      const currentItemKey = getItemExpansionKey(item);
      if (!currentItemKey || !item.children || item.children.length === 0) continue;
      const isStaticChildRoute = item.children.some(child => newPath === child.path && !child.isDynamic);
      if (isStaticChildRoute) { keyToExpand = currentItemKey; break; }
    }
  }

  if (keyToExpand && !sidebarStore.isItemExpanded(keyToExpand)) {
    sidebarStore.expandItem(keyToExpand);
  }

}, { immediate: true, deep: true });

</script>

<style scoped>
/* Import needed if not global */
/* @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap"); */

.sidebar {
  /* Use CSS variable for background */
  background: var(--bg-secondary);
  width: var(--sidebar-width-expanded); /* Use variable */
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  padding: 10px;
  /* Use variable for transition duration */
  transition: width var(--layout-transition-duration) ease-in-out,
  box-shadow var(--layout-transition-duration) ease-in-out; /* Added shadow transition */
  display: flex;
  flex-direction: column;
  font-family: "Outfit", sans-serif;
  z-index: 100;
  color: var(--text-primary); /* Use variable */
  box-sizing: border-box; /* Add box-sizing */

  /* --- Theming Enhancements --- */
  /* Add border to separate from main content */
  border-right: 1px solid var(--border-color);
  /* Add subtle shadow for depth */
  box-shadow: 2px 0 8px -2px rgba(0, 0, 0, 0.25);
}
.sidebar.collapsed {
  width: var(--sidebar-width-collapsed); /* Use variable */
  /* Optional: reduce shadow when collapsed */
  /* box-shadow: 1px 0 5px -1px rgba(0, 0, 0, 0.2); */
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 20px 10px 10px 10px;
  gap: 10px;
  height: var(--navbar-height); /* Use variable */
  box-sizing: border-box;
  flex-shrink: 0; /* Prevent header from shrinking */
}
.sidebar.collapsed .sidebar-header {
  padding: 20px 0;
  justify-content: center;
}
.toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-primary); /* Use variable */
  font-size: 20px;
  width: 40px; /* Keep fixed size */
  height: 40px; /* Keep fixed size */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
  border-radius: 4px; /* Optional: slightly round corners */
  transition: background-color 0.2s;
}
.toggle-button:hover {
  background-color: rgba(255, 255, 255, 0.1); /* Subtle hover */
}

.logo {
  font-size: 20px;
  font-weight: 700;
  white-space: nowrap;
  margin-left: 5px;
  color: var(--text-primary); /* Use variable */
}

.menu-container {
  flex: 1; /* Take remaining space */
  overflow-y: auto;
  /* Custom scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent; /* Thumb, Track */
  margin-top: 10px;
  padding-right: 5px; /* Space for scrollbar */
}
.menu-container::-webkit-scrollbar { width: 6px; }
.menu-container::-webkit-scrollbar-track { background: transparent; border-radius: 10px;}
.menu-container::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; }
.menu-container:hover::-webkit-scrollbar-thumb { background: var(--primary-color); } /* Use variable */
.sidebar.collapsed .menu-container {
  overflow-y: hidden;
  padding-right: 0;
}
.menu, .submenu { list-style: none; padding: 0; margin: 0; }

.menu-item {
  display: block;
  color: var(--text-secondary); /* Default subtle text color */
  border-radius: 8px;
  transition: background 0.2s;
  margin-bottom: 5px;
}
.menu-item a.item-content-wrapper, .menu-item div.item-content-wrapper {
  display: flex;
  align-items: center;
  padding: 12px 14px 12px 10px;
  text-decoration: none;
  color: inherit;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
  gap: 8px;
}
/* Hover effect for non-active items */
.menu-item:not(.parent-active):not(:has(a.router-link-exact-active)) > a.item-content-wrapper:hover,
.menu-item:not(.parent-active) > div.item-content-wrapper:hover {
  background: var(--bg-tertiary); /* Use tertiary background for hover */
  color: var(--text-primary); /* Brighten text on hover */
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px; /* Adjust size */
  height: 24px; /* Adjust size */
  flex-shrink: 0;
  font-size: 18px;
  /* margin-right: 10px; Removed, using gap now */
  transition: margin 0.3s ease-in-out;
}
.sidebar.collapsed .icon {
  margin-right: 0;
  width: 100%; /* Fill horizontal space in collapsed mode */
}
.menu-text {
  white-space: nowrap;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  /* margin-left: 5px; Removed, using gap now */
}
.sidebar.collapsed .menu-text { display: none; }

.expand-icon {
  margin-left: auto; /* Pushes to the right */
  font-size: 14px;
  transition: transform 0.2s ease-in-out, background-color 0.2s;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
  color: var(--text-secondary); /* Match icon color */
}
.expand-icon:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}
.sidebar.collapsed .expand-icon { display: none; }


/* Active state styling */
.menu-item.parent-active > a.item-content-wrapper,
.menu-item.parent-active > div.item-content-wrapper {
  background: rgba(var(--sidebar-active-rgb), 0.15); /* Subtle active background */
  color: var(--sidebar-active); /* Active color for text/icon */
  font-weight: 500;
}
/* Exact active link */
.menu-item a.item-content-wrapper.router-link-exact-active {
  background: var(--sidebar-active) !important; /* Stronger active background */
  color: white !important; /* Ensure contrast */
  font-weight: 600; /* Slightly bolder */
}
/* Ensure icon color changes correctly */
.menu-item.parent-active .icon,
.menu-item a.item-content-wrapper.router-link-exact-active .icon {
  color: inherit; /* Inherit color from the parent wrapper */
}


.submenu-container {
  padding-left: 0.75rem;
  margin-bottom: 5px;
  overflow: hidden;
}
.submenu { padding-top: 5px; padding-bottom: 5px; position: relative; }

.loading-item, .error-item {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  color: var(--text-secondary);
  border-radius: 8px;
  margin-bottom: 5px;
  cursor: default;
  gap: 10px;
}
.error-item { color: var(--error-color); } /* Use variable */
/* .loading-item .icon, .error-item .icon { margin-right: 10px; } Removed */
.sidebar.collapsed .loading-item .menu-text, .sidebar.collapsed .error-item .menu-text { display: none; }

.submenu-item {
  display: flex;
  align-items: center;
  padding: 8px 14px 8px 8px; /* Adjust padding slightly */
  color: var(--text-secondary); /* Subdued color */
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s, transform 0.5s ease, opacity 0.4s ease-out; /* Combined transitions */
  margin-bottom: 3px;
  white-space: nowrap;
  position: relative;
  gap: 8px;
}
.submenu-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
.submenu-item.active {
  background: var(--primary-color); /* Use variable */
  color: white; /* Ensure contrast */
  font-weight: 500; /* Slightly bolder */
}
.submenu-item.active .submenu-icon, /* Ensure icons in active items are visible */
.submenu-item.active .dynamic-profile-icon {
  color: white;
}
.submenu-item.active .dynamic-profile-icon {
  border-color: rgba(255, 255, 255, 0.5); /* Make border visible on active */
}


.submenu-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-secondary); /* Match default text */
  transition: color 0.2s; /* Add transition */
}
.submenu-item:hover .submenu-icon {
  color: var(--text-primary); /* Match hover text */
}

.dynamic-profile-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: var(--bg-tertiary); /* Slightly different bg */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-primary);
  border: 1px solid var(--border-color); /* Use border color */
}
.dynamic-profile-icon .icon-spinner { font-size: 14px; color: var(--text-secondary); }
.dynamic-profile-icon .profile-pic-small { width: 100%; height: 100%; object-fit: cover; }
.dynamic-profile-icon .profile-initials-small { line-height: 1; }

.remove-profile-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary); /* Subtle color */
  cursor: pointer;
  padding: 5px;
  font-size: 12px;
  line-height: 1;
  border-radius: 4px;
  transition: color 0.2s, background-color 0.2s, opacity 0.2s;
  opacity: 0; /* Hidden by default */
}
.submenu-item:hover .remove-profile-btn {
  opacity: 1; /* Show on hover */
}
.remove-profile-btn:hover {
  color: var(--error-color); /* Danger color on hover */
  background-color: rgba(var(--error-color-rgb), 0.1); /* Subtle danger bg */
}
.sidebar.collapsed .remove-profile-btn { display: none; }

/* --- Transitions --- */

/* Sidebar expand/collapse text fade */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Submenu expand/collapse slide+fade */
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
/* Adjust max-height if needed for longer submenus */
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-10px); opacity: 0; max-height: 0; }
.slide-fade-enter-to, .slide-fade-leave-from { max-height: 500px; /* Or a larger value */ opacity: 1; transform: translateY(0); }

/* --- List Animation (using transition-group name 'list-anim') --- */
.list-anim-move {
  transition: transform 0.5s cubic-bezier(0.55, 0, 0.1, 1); /* Smoother easing for moves */
}

.list-anim-enter-active,
.list-anim-leave-active {
  transition: all 0.4s ease-out;
}

.list-anim-enter-from,
.list-anim-leave-to {
  opacity: 0;
  transform: translateX(-20px); /* Slide from left */
}

/* Important: Absolute positioning for leaving items to allow smooth move */
.list-anim-leave-active {
  position: absolute;
  /* Adjust width calculation based on final submenu-item padding */
  width: calc(100% - 10px - 14px); /* Left padding - Right padding */
  box-sizing: border-box;
  left: 10px; /* Match submenu-item's effective left padding */
}

</style>