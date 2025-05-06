<template>
  <main class="settings-content">
    <h2 class="page-title">Admin Panel</h2>

    <section class="settings-section stats-section">
      <h3 class="section-title-h3">System Statistics</h3>
      <div class="stats-grid-admin">
        <div class="stat-card-admin">
          <font-awesome-icon :icon="getIcon('users')" class="stat-icon-admin"/>
          <div class="stat-info-admin">
            <span class="stat-value-admin">{{ totalUserCount ?? '...' }}</span>
            <span class="stat-label-admin">Total Users</span>
          </div>
        </div>
        <div class="stat-card-admin">
          <font-awesome-icon :icon="getIcon('tags')" class="stat-icon-admin"/>
          <div class="stat-info-admin">
            <span class="stat-value-admin">{{ totalRoleCount ?? '...' }}</span>
            <span class="stat-label-admin">Total Roles</span>
          </div>
        </div>
      </div>
      <div v-if="usersLoading || rolesLoading" class="loading-indicator mini-loading">Loading stats...</div>
    </section>

    <section class="settings-section user-management-section">
      <h3 class="section-title-h3">User Management</h3>

      <div class="search-container">
        <font-awesome-icon :icon="getIcon('search')" class="search-icon"/>
        <input type="text" v-model="searchQuery" placeholder="Search users by name, username, or email..."
               class="search-input"/>
        <button v-if="searchQuery" @click="clearSearch" class="clear-search-btn" aria-label="Clear search">&times;
        </button>
      </div>
      <small v-if="searchQuery && allUsersOnPage.length > 0" class="search-hint">
        Searching within the current {{ adminPageSize }} users ({{ filteredUsers.length }} found).
      </small>
      <small v-else-if="searchQuery && allUsersOnPage.length === 0" class="search-hint">
        No users on this page to search.
      </small>


      <div class="table-container">
        <div v-if="usersLoading && !filteredUsers.length" class="loading-indicator table-loading">
          <font-awesome-icon :icon="getIcon('spinner')" spin/>
          Loading users...
        </div>
        <div v-else-if="usersError" class="error-message table-error">
          <font-awesome-icon :icon="getIcon('triangle-exclamation')"/>
          Error loading users: {{ usersError.message }}
        </div>
        <div v-else-if="!usersLoading && !allUsersOnPage.length && !searchQuery" class="info-message table-info">
          No users found in the system.
        </div>
        <div v-else-if="!usersLoading && !filteredUsers.length && searchQuery" class="info-message table-info">
          No users match your search term "{{ searchQuery }}" on this page.
        </div>

        <table v-if="filteredUsers.length" class="admin-table">
          <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Date Created</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="adminUser in filteredUsers" :key="adminUser.id">
            <td class="id-cell" :title="adminUser.id">{{ adminUser.id }}</td>
            <td>{{ adminUser.username }}</td>
            <td>{{ adminUser.firstName }} {{ adminUser.lastName }}</td>
            <td>{{ adminUser.email }}</td>
            <td>{{ formatDisplayDate(adminUser.creationDate) }}</td>
            <td>
              <div v-if="adminUser.roles.length" class="role-chips-table">
                  <span v-for="role in adminUser.roles" :key="role.id" class="role-chip-admin" :title="role.name">
                    {{ role.name.replace('ROLE_', '') }}
                  </span>
              </div>
              <span v-else class="no-roles">—</span>
            </td>
            <td class="action-buttons">
              <button @click="openRoleManagementModal(adminUser)" class="action-button icon-button manage-button"
                      title="Manage Roles">
                <font-awesome-icon :icon="getIcon('user-edit')"/>
                <span class="btn-text">Manage</span>
              </button>
              <button
                  @click="openDeleteConfirmation(adminUser)"
                  class="action-button icon-button danger-button"
                  :disabled="adminUser.id === currentUserId || isDeletingUserId === adminUser.id"
                  :title="adminUser.id === currentUserId ? 'Cannot delete yourself' : 'Delete User'"
              >
                <font-awesome-icon :icon="getIcon(isDeletingUserId === adminUser.id ? 'spinner' : 'trash')"
                                   :spin="isDeletingUserId === adminUser.id"/>
                <span class="btn-text">Delete</span>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pageInfo.totalPages > 1" class="pagination-controls">
        <button @click="prevPage" :disabled="pageInfo.currentPage <= 0 || usersLoading"
                class="action-button pagination-button">
          <font-awesome-icon :icon="getIcon('chevron-left')"/>
          Previous
        </button>
        <span class="page-info">
          Page {{ pageInfo.currentPage + 1 }} of {{ pageInfo.totalPages }}
          <span class="total-elements"> ({{ pageInfo.totalElements }} total users)</span>
        </span>
        <button @click="nextPage" :disabled="pageInfo.currentPage >= pageInfo.totalPages - 1 || usersLoading"
                class="action-button pagination-button">
          Next
          <font-awesome-icon :icon="getIcon('chevron-right')"/>
        </button>
      </div>
    </section>

    <Transition name="modal-fade">
      <ConfirmDeleteModal
          v-if="showDeleteConfirmModal"
          :user="userToDelete"
          :is-deleting="isDeletingUserId === userToDelete?.id"
          @close="cancelDeleteUser"
          @confirm="executeDeleteUser"
      />
    </Transition>

    <Transition name="modal-fade">
      <ManageRolesModal
          v-if="showRoleManagementModal"
          :user="userBeingManaged"
          :available-roles-list="availableRoles"
          @close="closeRoleManagementModal"
          @roles-updated="handleRolesUpdated"
      />
    </Transition>

  </main>
</template>

<script setup>
import {ref, computed, watch} from 'vue';
import {useQuery, useMutation} from '@vue/apollo-composable';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal.vue';
import ManageRolesModal from '@/components/admin/ManageRolesModal.vue';
import {ME_QUERY, FIND_ALL_USERS, DELETE_USER, GET_ROLES} from "@/graphql/auth.js";
import {useToast} from "@/composables/useToast.js";

import {icon, library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {
  faSpinner, faTriangleExclamation, faUserEdit, faTrash, faSearch, faUsers,
  faTags, faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import {duration} from "vue-3-slider-component/src/stories/props/duration.stories.js";

library.add(
    faSpinner, faTriangleExclamation, faUserEdit, faTrash, faSearch, faUsers,
    faTags, faChevronLeft, faChevronRight
);

const icons = {
  'spinner': faSpinner, 'triangle-exclamation': faTriangleExclamation, 'user-edit': faUserEdit,
  'trash': faTrash, 'search': faSearch, 'users': faUsers, 'tags': faTags,
  'chevron-left': faChevronLeft, 'chevron-right': faChevronRight
};

function getIcon(iconName) {
  return icons[iconName] || faTriangleExclamation;
}

// --- Page State ---
const adminCurrentPage = ref(0);
const adminPageSize = ref(10);
const searchQuery = ref('');
const availableRoles = ref([]);

// -- Toast ---
const {addToast} = useToast();

// --- Modal Control State ---
const showDeleteConfirmModal = ref(false);
const userToDelete = ref(null);
const showRoleManagementModal = ref(false);
const userBeingManaged = ref(null);
const isDeletingUserId = ref(null);

// --- Apollo Queries ---
const {result: meResult, loading: loadingMe} = useQuery(ME_QUERY, null, {fetchPolicy: 'cache-first'});

// Fetch users with pagination
const {
  result: usersResult,
  loading: usersLoading,
  error: usersError,
  refetch: refetchAllUsersQuery,
} = useQuery(FIND_ALL_USERS, () => ({
  page: adminCurrentPage.value,
  size: adminPageSize.value
}), {
  fetchPolicy: 'cache-and-network',
});

// Fetch all available roles for the role management modal
const {result: rolesResult, loading: rolesLoading, error: rolesError} = useQuery(GET_ROLES, {
  page: 0, size: 100
}, {fetchPolicy: 'cache-first'});

// --- Apollo Mutations ---
const {mutate: deleteUserMutate, loading: deleteUserLoading, error: deleteUserError} = useMutation(DELETE_USER, {});

// --- Computed Properties ---
const currentUserId = computed(() => meResult.value?.me?.id);
const allUsersOnPage = computed(() => usersResult.value?.findAllUsers?.items || []);
const pageInfo = computed(() => usersResult.value?.findAllUsers?.pageInfo || {
  currentPage: 0, totalPages: 0, totalElements: 0
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) return allUsersOnPage.value;
  const lowerSearch = searchQuery.value.toLowerCase().trim();
  if (!lowerSearch) return allUsersOnPage.value;
  return allUsersOnPage.value.filter(user =>
      user.username?.toLowerCase().includes(lowerSearch) ||
      user.email?.toLowerCase().includes(lowerSearch) ||
      user.firstName?.toLowerCase().includes(lowerSearch) ||
      user.lastName?.toLowerCase().includes(lowerSearch) ||
      `${user.firstName?.toLowerCase()} ${user.lastName?.toLowerCase()}`.includes(lowerSearch)
  );
});

const totalUserCount = computed(() => pageInfo.value?.totalElements);
const totalRoleCount = computed(() => rolesResult.value?.roles?.items?.length ?? availableRoles.value.length);

// --- Watchers ---
watch(() => rolesResult.value?.roles?.items, (newRoles) => {
  if (newRoles) {
    availableRoles.value = [...newRoles].sort((a, b) => a.name.localeCompare(b.name));
  }
}, {immediate: true});

watch(adminCurrentPage, () => {
  searchQuery.value = '';
  refetchAllUsersQuery();
});

// --- Methods ---
// Date formatting helper
function formatDisplayDate(dateString) {
  if (!dateString) return '—';
  try {
    return new Intl.DateTimeFormat(navigator.language || 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    }).format(new Date(dateString));
  } catch (e) {
    console.warn("Error formatting date:", dateString, e);
    return typeof dateString === 'string' ? dateString.split('T')[0] : 'Invalid Date';
  }
}

function clearSearch() {
  searchQuery.value = '';
}

function nextPage() {
  if (adminCurrentPage.value < pageInfo.value.totalPages - 1) {
    adminCurrentPage.value++;
  }
}

function prevPage() {
  if (adminCurrentPage.value > 0) {
    adminCurrentPage.value--;
  }
}

// --- Modal Open/Close Logic ---
function openDeleteConfirmation(userPayload) {
  if (userPayload.id === currentUserId.value) {
    addToast(msg
  :
    "You cannot delete your own account.", type
  :
    "warning", duration
  :
    6000, icon
  :
    getIcon('triangle-exclamation')
  )
    return;
  }
  userToDelete.value = userPayload;
  showDeleteConfirmModal.value = true;
}

function cancelDeleteUser() {
  showDeleteConfirmModal.value = false;
  userToDelete.value = null;
  isDeletingUserId.value = null;
}

function openRoleManagementModal(userPayload) {
  userBeingManaged.value = userPayload;
  showRoleManagementModal.value = true;
}

function closeRoleManagementModal() {
  showRoleManagementModal.value = false;
  userBeingManaged.value = null;
}

// --- Role Update Handling ---
function handleRolesUpdated() {
  refetchAllUsersQuery();
}


// --- Delete User Logic ---
async function executeDeleteUser() {
  if (!userToDelete.value || isDeletingUserId.value) return;

  isDeletingUserId.value = userToDelete.value.id;
  const usernameToDelete = userToDelete.value.username;

  try {
    const {data} = await deleteUserMutate({id: userToDelete.value.id});

    if (data?.deleteUser === true) {
      addToast(msg
    :
      "User deleted successfully.", type
    :
      "success", duration
    :
      6000, icon
    :
      getIcon('trash')
    )

      cancelDeleteUser();
      const usersLeftOnPage = filteredUsers.value.length - 1;
      if (usersLeftOnPage === 0 && adminCurrentPage.value > 0) {
        adminCurrentPage.value--;
      } else {
        refetchAllUsersQuery();
      }

    } else {
      throw new Error(deleteUserError.value?.message || "Deletion mutation returned false.");
    }
  } catch (error) {
    const errorMessage = error.graphQLErrors?.[0]?.message || error.message || 'Unknown error';
    addToast(msg
  :
    "Failed to delete user.", type
  :
    "error", duration
  :
    6000, icon
  :
    getIcon('triangle-exclamation')
  )
    isDeletingUserId.value = null;
  }
}

</script>

<style scoped>
/* --- Content Container Styling --- */
.settings-content {
  width: 100%;
  max-width: 1400px; /* Max width for the content area */
  margin: 0 auto; /* Center the content block horizontally */
  display: flex;
  flex-direction: column;
  gap: 30px; /* Consistent spacing between sections */
}

.page-title {
  font-size: 1.8em;
  font-weight: 600;
  margin-bottom: 0; /* Use gap for spacing */
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

/* --- Section Styling (Keep as is) --- */
.settings-section {
  background: var(--bg-secondary);
  padding: 25px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Slightly lighter shadow */
  border: 1px solid var(--border-color);
}

.section-title-h3 {
  font-size: 1.3em;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--text-primary);
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

/* --- Statistics Section (Keep as is) --- */
.stats-grid-admin {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.stat-card-admin {
  background: var(--bg-tertiary);
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid var(--border-color);
  transition: box-shadow 0.2s ease-in-out;
}

.stat-card-admin:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.stat-icon-admin {
  font-size: 2em;
  color: var(--sidebar-active); /* Use theme color */
  opacity: 0.8;
  flex-shrink: 0; /* Prevent icon shrinking */
}

.stat-info-admin {
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent text overflow */
}

.stat-value-admin {
  font-size: 1.6em;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.1;
  white-space: nowrap; /* Prevent wrapping */
  text-overflow: ellipsis;
  overflow: hidden;
}

.stat-label-admin {
  font-size: 0.9em;
  color: var(--text-secondary);
  margin-top: 2px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/* --- User Management Section --- */
.search-container {
  display: flex;
  align-items: center;
  background-color: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0px 12px; /* Adjust padding */
  margin-bottom: 8px; /* Reduced margin */
  transition: border-color 0.2s, box-shadow 0.2s;
  max-width: 600px; /* Limit search bar width */
}

.search-container:focus-within {
  border-color: var(--sidebar-active); /* Use theme color */
  box-shadow: 0 0 0 3px rgba(var(--sidebar-active-rgb), 0.2); /* Use theme color with opacity */
}

.search-icon {
  color: var(--text-secondary);
  margin-right: 10px; /* Slightly more space */
  font-size: 1.1em;
  flex-shrink: 0;
}

.search-input {
  flex-grow: 1;
  padding: 12px 5px; /* Vertical padding */
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 1em;
  outline: none;
  width: 100%; /* Ensure it takes available space */
}

.search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7; /* Slightly more visible placeholder */
}

.clear-search-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.6em; /* Larger clear button */
  cursor: pointer;
  padding: 0 5px;
  margin-left: 8px;
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.2s;
}

.clear-search-btn:hover {
  color: var(--text-primary);
}

.search-hint {
  display: block;
  font-size: 0.85em;
  color: var(--text-secondary);
  margin-bottom: 18px; /* More space below hint */
  font-style: italic;
}

/* Admin Table */
.table-container {
  overflow-x: auto; /* Allow horizontal scroll on smaller screens */
  width: 100%; /* Ensure container takes full width */
  border: 1px solid var(--border-color); /* Add border around table */
  border-radius: 8px; /* Match section radius */
  background-color: var(--bg-tertiary); /* Subtle background for table area */
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--text-primary);
  font-size: 0.95em;
  /* Remove margin-top, handled by container */
}

.admin-table th, .admin-table td {
  padding: 14px 18px; /* Slightly more padding */
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap; /* Keep nowrap for most columns */
  vertical-align: middle; /* Better vertical alignment */
}

.admin-table th {
  background: rgba(var(--bg-primary-rgb), 0.5); /* Slightly darker header */
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase; /* Uppercase headers */
  font-size: 0.85em; /* Smaller header font */
  letter-spacing: 0.5px;
  position: sticky; /* Make header sticky if table scrolls vertically (needs container height) */
  top: 0; /* Required for sticky */
  z-index: 1; /* Ensure header stays above content */
}

.admin-table tr:last-child td {
  border-bottom: none; /* Remove border on last row */
}

.admin-table tbody tr:hover {
  background: rgba(var(--sidebar-active-rgb), 0.05); /* Subtle hover using theme color */
}

.admin-table td.id-cell {
  font-family: monospace;
  font-size: 0.9em;
  color: var(--text-secondary);
  max-width: 80px; /* Slightly narrower ID column */
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: help; /* Indicate title attribute on hover */
}

/* Allow wrapping for specific columns */
.admin-table td:nth-child(3), /* Name */
.admin-table td:nth-child(4) { /* Email */
  white-space: normal;
  min-width: 150px; /* Minimum width before wrapping */
}

.role-chips-table {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.role-chip-admin {
  background-color: var(--sidebar-active);
  color: white; /* Ensure contrast */
  padding: 3px 8px;
  border-radius: 12px; /* Pill shape */
  font-size: 0.85em;
  font-weight: 500;
  text-transform: capitalize;
  line-height: 1.3;
  cursor: default; /* Indicate title attribute on hover */
}

.no-roles {
  color: var(--text-secondary);
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 10px; /* Slightly more space */
  white-space: nowrap; /* Prevent buttons wrapping */
}

.action-button.icon-button {
  padding: 6px 12px; /* Adjust padding */
  font-size: 0.9em;
  display: inline-flex; /* Ensure icon and text align */
  align-items: center;
}

.action-button.icon-button .svg-inline--fa { /* Target FontAwesome icon */
  margin-right: 6px;
  width: 1em; /* Ensure consistent icon width */
  height: 1em;
}

.action-button.manage-button {
  /* Use secondary button styles */
  background-color: var(--button-secondary-bg);
  color: var(--text-primary);
  border-color: var(--button-secondary-bg);
}

.action-button.manage-button:hover:not(:disabled) {
  background-color: var(--button-secondary-hover-bg);
  border-color: var(--button-secondary-hover-bg);
}

/* Pagination */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.pagination-button {
  padding: 8px 15px;
  /* Use secondary button style */
  background-color: var(--button-secondary-bg);
  color: var(--text-primary);
  border-color: var(--button-secondary-bg);
}

.pagination-button:hover:not(:disabled) {
  background-color: var(--button-secondary-hover-bg);
  border-color: var(--button-secondary-hover-bg);
}

.pagination-button .svg-inline--fa { /* Target FontAwesome */
  margin: 0 4px; /* Space around icon */
  vertical-align: middle; /* Better alignment */
}

.page-info {
  font-weight: 500;
  font-size: 0.95em;
  color: var(--text-secondary);
  text-align: center; /* Center text if space allows */
  flex-grow: 1; /* Allow it to take space */
  padding: 0 10px;
}

.page-info .total-elements {
  font-size: 0.9em;
  margin-left: 5px;
}

/* Loading / Error / Info States (Keep as is) */
.loading-indicator, .error-message, .info-message {
  padding: 15px 20px; /* More horizontal padding */
  text-align: center;
  border-radius: 8px;
  margin: 20px 0; /* Consistent margin */
  font-size: 1em;
  display: flex; /* Use flex for alignment */
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.loading-indicator {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color); /* Add subtle border */
}

.error-message {
  background: rgba(var(--error-color-rgb), 0.1);
  color: var(--error-color);
  border: 1px solid rgba(var(--error-color-rgb), 0.3); /* Softer border */
}

.info-message {
  background: rgba(var(--info-color-rgb), 0.1);
  color: var(--info-color);
  border: 1px solid rgba(var(--info-color-rgb), 0.3);
}

.loading-indicator.mini-loading {
  padding: 10px 15px;
  font-size: 0.9em;
  margin: 10px 0 0 0; /* Adjust margin for stats loading */
  justify-content: flex-start; /* Align left for mini loading */
}

.loading-indicator.table-loading,
.error-message.table-error,
.info-message.table-info {
  /* Styles specific to table states */
  padding: 40px 20px; /* More padding for table messages */
  font-size: 1.1em;
  min-height: 150px; /* Ensure minimum height */
  border-radius: 0 0 8px 8px; /* Match table bottom radius */
  margin: 0; /* Remove margin when inside table container */
  border: none; /* Remove border as container has one */
  border-top: 1px solid var(--border-color); /* Add top border */
}

.loading-indicator .svg-inline--fa, .error-message .svg-inline--fa {
  /* margin-right: 8px; -- Handled by gap */
}

/* --- Base Button Styles (Ensure these match global styles or define here) --- */
.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid transparent; /* Start with transparent border */
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 0.95em;
  line-height: 1.5;
  white-space: nowrap;
  background-color: var(--button-secondary-bg); /* Default to secondary */
  color: var(--text-primary);
  border-color: var(--border-color); /* Use border color for secondary */
}

.action-button:hover:not(:disabled) {
  background-color: var(--button-secondary-hover-bg);
  border-color: var(--border-color);
  transform: translateY(-1px); /* Subtle lift */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.action-button .svg-inline--fa {
  /* position: relative; top: -1px; */ /* Might not be needed with flex alignment */
}

/* Primary Button (Example if needed) */
.action-button.primary-button {
  background-color: var(--button-primary-bg);
  border-color: var(--button-primary-bg);
  color: #fff;
}

.action-button.primary-button:hover:not(:disabled) {
  background-color: var(--button-primary-hover-bg);
  border-color: var(--button-primary-hover-bg);
}

/* Danger Button */
.action-button.danger-button {
  background-color: var(--button-danger-bg);
  border-color: var(--button-danger-bg);
  color: #fff;
}

.action-button.danger-button:hover:not(:disabled) {
  background-color: var(--button-danger-hover-bg);
  border-color: var(--button-danger-hover-bg);
}

.action-button.danger-button:disabled {
  background-color: var(--button-danger-bg); /* Keep color when disabled but spinning */
  border-color: var(--button-danger-bg);
}

/* --- Responsive Adjustments --- */
@media (max-width: 992px) {
  .admin-table th:nth-child(5), /* Hide Date Created */
  .admin-table td:nth-child(5) {
    display: none;
  }

  .stats-grid-admin {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); /* Adjust minmax */
  }
}

@media (max-width: 768px) {
  .settings-content {
    gap: 20px; /* Reduce gap on smaller screens */
  }

  .settings-section {
    padding: 20px; /* Reduce padding */
  }

  .page-title {
    font-size: 1.6em;
  }

  .section-title-h3 {
    font-size: 1.2em;
  }

  .admin-table th:nth-child(1), /* Hide ID */
  .admin-table td:nth-child(1),
  .admin-table th:nth-child(4), /* Hide Email */
  .admin-table td:nth-child(4) {
    display: none;
  }

  .admin-table th, .admin-table td {
    padding: 10px 12px; /* Further reduce padding */
    font-size: 0.9em;
  }

  .role-chips-table {
    gap: 4px;
  }

  .role-chip-admin {
    font-size: 0.8em;
    padding: 2px 6px;
  }

  .action-buttons {
    gap: 8px;
  }

  /* Hide text label on buttons */
  .action-button.icon-button .btn-text {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .action-button.icon-button {
    padding: 8px 10px; /* Adjust padding for icon only */
  }

  .action-button.icon-button .svg-inline--fa {
    margin-right: 0; /* Remove margin when text hidden */
  }


  .pagination-controls {
    flex-direction: column;
    gap: 15px; /* Increase gap for stacked controls */
  }

  .page-info .total-elements {
    display: none;
  }

  /* Hide total count */
  .pagination-button {
    width: 100%; /* Make buttons full width */
    max-width: 200px; /* Max width for pagination buttons */
  }

  .search-container {
    max-width: none; /* Allow search to take full width */
  }
}

@media (max-width: 576px) {
  .stats-grid-admin {
    grid-template-columns: 1fr; /* Single column stats */
    gap: 15px;
  }

  .stat-card-admin {
    padding: 15px;
  }

  .admin-table th:nth-child(3), /* Hide Name */
  .admin-table td:nth-child(3) {
    display: none;
  }

  .admin-table th, .admin-table td {
    padding: 8px 10px;
  }
}

</style>