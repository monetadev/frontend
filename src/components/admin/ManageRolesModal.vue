<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content role-modal">
      <h3 class="modal-title">
        <font-awesome-icon :icon="getIcon('user-edit')"/>
        Manage Roles: {{ user?.username }}
      </h3>

      <div v-if="assignError || removeError" class="status-message error form-error modal-error">
        <font-awesome-icon :icon="getIcon('triangle-exclamation')"/>
        <span>
          <span v-if="assignError">Assign Error: {{ formatGqlError(assignError) }}<br/></span>
          <span v-if="removeError">Remove Error: {{ formatGqlError(removeError) }}</span>
        </span>
      </div>

      <div class="current-roles">
        <h4>Current Roles:</h4>
        <div v-if="localUserRoles.length" class="role-chips modal-chips">
          <div v-for="role in localUserRoles" :key="role.id" class="role-chip">
            {{ role.name.replace('ROLE_', '') }}
            <button
                @click="handleRemoveRole(role.id)"
                class="remove-role-btn"
                :disabled="isRemovingRole === role.id || !!isAssigningRole"
                title="Remove Role"
            >
              <font-awesome-icon :icon="getIcon(isRemovingRole === role.id ? 'spinner': 'times')"
                                 :spin="isRemovingRole === role.id"/>
            </button>
          </div>
        </div>
        <p v-else class="no-roles-text">No roles assigned.</p>
      </div>

      <div class="assign-role">
        <h4>Assign New Role:</h4>
        <div v-if="!availableRolesForAssignment.length && !localUserRoles.length" class="info-message">No roles
          available to assign.
        </div>
        <div v-else-if="!availableRolesForAssignment.length && localUserRoles.length" class="info-message">User already
          has all available roles.
        </div>

        <div v-else class="role-select-container">
          <select v-model="selectedRoleIdToAssign" class="role-select input-field"
                  :disabled="!!isAssigningRole || !!isRemovingRole">
            <option value="" disabled>Select a role...</option>
            <option v-for="role in availableRolesForAssignment" :key="role.id" :value="role.id">
              {{ role.name.replace('ROLE_', '') }}
            </option>
          </select>
          <button
              @click="handleAssignRole"
              class="action-button primary-button assign-button"
              :disabled="!selectedRoleIdToAssign || !!isAssigningRole || !!isRemovingRole"
          >
            <font-awesome-icon :icon="getIcon(isAssigningRole ? 'spinner': 'plus')" :spin="!!isAssigningRole"/>
            {{ isAssigningRole ? 'Assigning...' : 'Assign' }}
          </button>
        </div>
      </div>

      <div class="modal-buttons">
        <button @click="$emit('close')" class="action-button secondary-button">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, watch, defineProps, defineEmits} from 'vue';
import {useMutation} from '@vue/apollo-composable';
import {ASSIGN_ROLE_TO_USER, REMOVE_ROLE_FROM_USER} from '@/graphql/auth.js';

// Font Awesome
import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {faSpinner, faUserEdit, faTriangleExclamation, faTimes, faPlus} from '@fortawesome/free-solid-svg-icons';
import {useToast} from "@/composables/useToast.js";

library.add(faSpinner, faUserEdit, faTriangleExclamation, faTimes, faPlus);
const icons = {
  'spinner': faSpinner,
  'user-edit': faUserEdit,
  'triangle-exclamation': faTriangleExclamation,
  'times': faTimes,
  'plus': faPlus
};

function getIcon(iconName) {
  return icons[iconName] || faTriangleExclamation;
}

// --- Props & Emits ---
const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  availableRolesList: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['close', 'roles-updated']);

// --- Utility ---
const {addToast} = useToast();

function formatGqlError(error) {
  return error?.message || 'An unknown error occurred.';
}


// --- Modal-specific State ---
const selectedRoleIdToAssign = ref('');
const isAssigningRole = ref(false);
const isRemovingRole = ref(null); // Store Role ID being removed
const localUserRoles = ref([]); // Local copy for optimistic updates

// Initialize and watch localUserRoles
watch(() => props.user, (newUser) => {
  localUserRoles.value = newUser?.roles ? [...newUser.roles].sort((a, b) => a.name.localeCompare(b.name)) : [];
}, {immediate: true, deep: true});


// --- Apollo Mutations ---
const {
  mutate: assignRoleMutate,
  error: assignError, /* loading: assignLoading (use isAssigningRole) */
} = useMutation(ASSIGN_ROLE_TO_USER);
const {
  mutate: removeRoleMutate,
  error: removeError, /* loading: removeLoading (use isRemovingRole) */
} = useMutation(REMOVE_ROLE_FROM_USER);

// --- Computed Properties ---
const availableRolesForAssignment = computed(() => {
  if (!props.availableRolesList?.length) return [];
  const currentRoleIds = localUserRoles.value.map(r => r.id);
  // Ensure roles in list are unique objects if needed
  return props.availableRolesList.filter(role => !currentRoleIds.includes(role.id));
});

// --- Methods ---
async function handleAssignRole() {
  if (!selectedRoleIdToAssign.value || !props.user?.id || isAssigningRole.value || isRemovingRole.value) return;

  const roleToAssign = props.availableRolesList.find(r => r.id === selectedRoleIdToAssign.value);
  if (!roleToAssign) {
    addToast({msg: "Selected role not found.", type: "error", duration: 5000});
  }

  isAssigningRole.value = true;
  assignError.value = null; // Clear previous error manually if needed

  try {
    const {data} = await assignRoleMutate({userId: props.user.id, roleId: selectedRoleIdToAssign.value});
    if (data?.assignRoleToUser) {
      addToast({
        msg: `Role '${roleToAssign.name.replace('ROLE_', '')}' assigned successfully`,
        type: "success",
        duration: 5000
      });
      if (!localUserRoles.value.some(r => r.id === roleToAssign.id)) {
        localUserRoles.value.push(roleToAssign);
        localUserRoles.value.sort((a, b) => a.name.localeCompare(b.name));
      }
      selectedRoleIdToAssign.value = '';
      emit('roles-updated'); // Notify parent
    } else {
      throw new Error(assignError.value?.message || "Assignment failed: Invalid response.");
    }
  } catch (error) {
    addToast({
      msg: `Failed to assign role '${roleToAssign.name.replace('ROLE_', '')}'.`,
      type: "error",
      duration: 5000
    });
  } finally {
    isAssigningRole.value = false;
  }
}

async function handleRemoveRole(roleIdToRemove) {
  if (!props.user?.id || isRemovingRole.value || isAssigningRole.value) return;

  const roleToRemove = localUserRoles.value.find(r => r.id === roleIdToRemove);
  if (!roleToRemove) {
    addToast({msg: "Role to remove not found locally.", type: "error", duration: 5000});
  }

  isRemovingRole.value = roleIdToRemove;
  removeError.value = null; // Clear previous error manually if needed

  try {
    const {data} = await removeRoleMutate({userId: props.user.id, roleId: roleIdToRemove});
    if (data?.removeRoleFromUser) {
      addToast({
        msg: `Role '${roleToRemove.name.replace('ROLE_', '')}' removed successfully!`,
        type: "success",
        duration: 5000
      });
      localUserRoles.value = localUserRoles.value.filter(r => r.id !== roleIdToRemove);
      emit('roles-updated');
    } else {
      throw new Error(removeError.value?.message || "Removal failed: Invalid response.");
    }
  } catch (error) {
    console.error("Remove role error:", error);
    // Error is captured by removeError ref, display it in template
    addToast({msg: "Failed to remove role.", type: "error", duration: 5000});
  } finally {
    isRemovingRole.value = null;
  }
}

</script>

<style scoped>
/* --- Base Variables --- */
/* Re-declare or import */
:root { /* Example - Prefer global definition */
  --bg-primary-rgb: 18, 23, 41;
  --bg-secondary: #22293A;
  --bg-tertiary: #2b364f;
  --modal-bg: var(--bg-secondary);
  --text-primary: #ffffff;
  --text-secondary: #adb5bd;
  --border-color: #3b3e56;
  --input-bg: var(--bg-primary);
  --error-color: #ff6b6b;
  --error-color-rgb: 255, 107, 107;
  --info-color: #2196f3;
  --info-color-rgb: 33, 150, 243;
  --sidebar-active: #5f98ef;
  --button-primary-bg: var(--sidebar-active);
  --button-primary-hover-bg: #4a8adf;
  --button-secondary-bg: var(--bg-tertiary);
  --button-secondary-hover-bg: #3a4562;
}

/* --- Modal Styling (Copied & Scoped) --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(var(--bg-primary-rgb, 18, 23, 41), 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--modal-bg, var(--bg-secondary)); /* Ensure opaque background */
  padding: 25px 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 550px; /* Role modal width */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  opacity: 1; /* Explicitly opaque */
}

.modal-title {
  font-size: 1.4em;
  font-weight: 600;
  margin: 0 0 20px 0;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title .fa-icon {
  color: var(--sidebar-active);
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

/* Role Management Specifics */
.current-roles, .assign-role {
  margin-bottom: 25px;
}

.current-roles h4, .assign-role h4 {
  font-size: 1.1em;
  font-weight: 500;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.role-chips.modal-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 5px;
}

.role-chip {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 6px 12px;
  border-radius: 15px;
  display: inline-flex;
  align-items: center;
  font-size: 0.95em;
  border: 1px solid var(--border-color);
  font-weight: 500;
  text-transform: capitalize;
}

.remove-role-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  margin-left: 8px;
  font-size: 1.1em;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s ease-in-out;
}

.remove-role-btn:hover:not(:disabled) {
  color: var(--error-color);
}

.remove-role-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.no-roles-text {
  font-style: italic;
  color: var(--text-secondary);
  font-size: 0.95em;
}

.role-select-container {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 5px;
}

.input-field { /* Base input field style for select */
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 1em;
  outline: none;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.input-field:focus {
  border-color: var(--sidebar-active);
  box-shadow: 0 0 0 3px rgba(var(--sidebar-active-rgb, 95, 152, 239), 0.2);
}

.input-field:disabled {
  background-color: var(--bg-tertiary);
  opacity: 0.7;
  cursor: not-allowed;
}

select.role-select {
  flex: 1;
}

.assign-button { /* Use primary button styles */
}

/* Status Messages */
.status-message {
  width: 100%;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 0.9em;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid transparent;
}

.status-message.error {
  color: var(--error-color);
  background-color: rgba(var(--error-color-rgb, 255, 107, 107), 0.1);
  border-color: var(--error-color);
}

.status-message.info {
  color: var(--info-color);
  background-color: rgba(var(--info-color-rgb, 33, 150, 243), 0.1);
  border-color: var(--info-color);
}

.status-message.modal-error {
  margin-bottom: 15px;
  margin-top: -10px;
}

.status-message .fa-icon {
  flex-shrink: 0;
  margin-right: 5px;
}

.info-message { /* Style for info messages like 'no roles' */
  padding: 10px 0;
  color: var(--text-secondary);
  font-style: italic;
  font-size: 0.95em;
}

/* --- Base Button Styles (Copied - Consider making global) --- */
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

.action-button .fa-icon {
  position: relative;
  top: -1px;
}

/* Variants */
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
</style>