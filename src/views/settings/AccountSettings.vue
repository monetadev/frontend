<template>
  <main class="settings-content">
    <h2 class="page-title">Account Settings</h2>

    <div v-if="isUserDataLoading && !user.id" class="loading-indicator full-page-state">
      <font-awesome-icon :icon="getIcon('spinner')" spin size="2x"/>
      <p>Loading account settings...</p>
    </div>

    <div v-else-if="currentUserError && !user.id" class="error-message full-page-state">
      <font-awesome-icon :icon="getIcon('triangle-exclamation')" size="2x"/>
      <p>Could not load account settings.</p>
      <pre v-if="currentUserError.message">Error: {{ currentUserError.message }}</pre>
    </div>

    <template v-else-if="user.id">
      <section class="settings-section account-details-section">
        <h3 class="section-title-h3">Account Details</h3>

        <div class="subsection profile-picture-subsection">
          <h4 class="subsection-title-h4">Profile Picture</h4>
          <div class="profile-area">
            <div class="profile-image-wrapper">
              <div class="profile-image-container" :class="{ 'has-picture': !!user.profilePicture }">
                <img
                    v-if="user.profilePicture"
                    :src="user.profilePicture"
                    alt="Profile Picture"
                    class="profile-img"
                    @error="onImageError"
                />
                <div v-else class="placeholder-avatar icon-placeholder">
                  <font-awesome-icon :icon="getIcon('user-circle')" class="placeholder-icon"/>
                </div>
                <div v-if="isUploadingProfilePic || isDeletingProfilePic" class="loading-overlay">
                  <font-awesome-icon :icon="getIcon('spinner')" spin size="2x"/>
                  <span>{{ isUploadingProfilePic ? 'Uploading...' : 'Removing...' }}</span>
                </div>
              </div>
            </div>

            <div class="profile-controls-status">
              <template v-if="!user.profilePicture">
                <label for="profile-upload" class="action-button primary-button"
                       :class="{'disabled-look': isUploadingProfilePic || isDeletingProfilePic}">
                  <font-awesome-icon :icon="getIcon('upload')"/>
                  Choose Picture
                </label>
                <input
                    type="file"
                    id="profile-upload"
                    @change="handleProfilePictureUpload"
                    accept="image/*"
                    class="file-input"
                    ref="fileInputRef"
                    :disabled="isUploadingProfilePic || isDeletingProfilePic"/>
                <small class="input-hint">Max 5MB. JPG, PNG, GIF.</small>
              </template>

              <template v-if="user.profilePicture">
                <button
                    @click="handleProfilePictureDelete"
                    class="action-button danger-button"
                    :disabled="isDeletingProfilePic || isUploadingProfilePic"
                >
                  <font-awesome-icon :icon="getIcon(isDeletingProfilePic ? 'spinner': 'trash')"
                                     :spin="isDeletingProfilePic"/>
                  Remove Picture
                </button>
              </template>

              <div v-if="profilePictureStatusMessage" class="status-message form-status"
                   :class="profilePictureStatusType">
                <font-awesome-icon
                    :icon="getIcon(profilePictureStatusType === 'error' ? 'triangle-exclamation' : 'info-circle')"/>
                <span>{{ profilePictureStatusMessage }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="subsection user-info-subsection">
          <h4 class="subsection-title-h4">User Information</h4>
          <div class="input-grid">
            <div class="input-group">
              <label for="firstname">First Name:</label>
              <input id="firstname" type="text" v-model="user.firstname" class="input-field"/>
            </div>
            <div class="input-group">
              <label for="lastname">Last Name:</label>
              <input id="lastname" type="text" v-model="user.lastname" class="input-field"/>
            </div>
            <div class="input-group">
              <label for="username">Username:</label>
              <input id="username" type="text" v-model="user.username" class="input-field"/>
              <small class="input-hint">Changing username will require re-login.</small>
            </div>
            <div class="input-group">
              <label for="email">Email:</label>
              <input id="email" type="email" v-model="user.email" class="input-field"/>
            </div>
            <div class="input-group read-only-group">
              <label>Joined On:</label>
              <span class="read-only-text">{{ formattedCreationDate }}</span>
            </div>
            <div class="input-group read-only-group">
              <label>Last Updated:</label>
              <span class="read-only-text">{{ formattedLastUpdated }}</span>
            </div>
          </div>
          <div class="form-actions">
            <button
                class="action-button primary-button save-button"
                @click="handleUserUpdate"
                :disabled="!isUserDataLoaded || isUpdatingUser"
            >
              <font-awesome-icon :icon="getIcon(isUpdatingUser ? 'spinner' : 'save')" :spin="isUpdatingUser"/>
              {{ isUpdatingUser ? 'Saving...' : 'Save Changes' }}
            </button>
            <div v-if="updateUserStatusMessage" class="status-message form-status" :class="updateUserStatusType">
              <font-awesome-icon
                  :icon="getIcon(updateUserStatusType === 'error' ? 'triangle-exclamation' : 'info-circle')"/>
              <span>{{ updateUserStatusMessage }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-section security-section">
        <h3 class="section-title-h3">Security</h3>

        <div class="subsection password-subsection">
          <h4 class="subsection-title-h4">Change Password</h4>
          <div class="input-grid">
            <div class="input-group">
              <label for="current-password">Current Password:</label>
              <input id="current-password" type="password" class="input-field" v-model="passwordFields.current"
                     autocomplete="current-password"/>
            </div>
            <div class="input-group">
              <label for="new-password">New Password:</label>
              <input id="new-password" type="password" class="input-field" v-model="passwordFields.new"
                     autocomplete="new-password"/>
              <small class="input-hint">Minimum 8 characters.</small>
            </div>
            <div class="input-group">
              <label for="confirm-password">Confirm New Password:</label>
              <input id="confirm-password" type="password" class="input-field" v-model="passwordFields.confirm"
                     autocomplete="new-password"/>
            </div>
          </div>
          <div class="form-actions">
            <button class="action-button secondary-button password-button" @click="changePassword"
                    :disabled="isChangingPassword">
              <font-awesome-icon :icon="getIcon(isChangingPassword ? 'spinner': 'key')" :spin="isChangingPassword"/>
              {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
            </button>
            <div v-if="passwordStatusMessage" class="status-message form-status" :class="passwordStatusType">
              <font-awesome-icon
                  :icon="getIcon(passwordStatusType === 'error' ? 'triangle-exclamation' : 'info-circle')"/>
              <span>{{ passwordStatusMessage }}</span>
            </div>
          </div>
        </div>
      </section>
    </template>

    <div v-else-if="!isUserDataLoading && !user.id" class="info-message full-page-state">
      <font-awesome-icon :icon="getIcon('info-circle')"/>
      <span>User data could not be loaded or is unavailable.</span>
    </div>
  </main>
</template>

<script setup>
import {ref, reactive, computed, watch} from 'vue';
import {useQuery, useMutation, useApolloClient} from '@vue/apollo-composable';
import {useRouter} from 'vue-router';

import {
  ME_QUERY,
  UPDATE_USER,
  UPLOAD_PROFILE_PICTURE,
  DELETE_PROFILE_PICTURE,
  //CHANGE_PASSWORD_MUTATION, // TODO: Add this when available
} from "@/graphql/auth.js";
import {useToast} from "@/composables/useToast.js";

import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {
  faSpinner, faTriangleExclamation, faSave, faKey, faUpload, faTrash,
  faUserCircle, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faSpinner, faTriangleExclamation, faSave, faKey, faUpload, faTrash,
    faUserCircle, faInfoCircle
);
const icons = {
  'spinner': faSpinner, 'triangle-exclamation': faTriangleExclamation, 'save': faSave,
  'key': faKey, 'upload': faUpload, 'trash': faTrash, 'user-circle': faUserCircle,
  'info-circle': faInfoCircle,
};

function getIcon(iconName) {
  return icons[iconName] || faTriangleExclamation;
}

// --- Component State ---
const router = useRouter();
const {client: apolloClient} = useApolloClient();
const fileInputRef = ref(null);
const {addToast} = useToast();

// --- User Data State ---
const user = reactive({
  id: null, profilePicture: null, profilePicFilename: null, firstname: "",
  lastname: "", username: "", email: "", creationDate: "", lastUpdated: "",
});

// --- Password Change State ---
const passwordFields = reactive({current: '', new: '', confirm: ''});
const passwordChangeStatus = ref({message: '', type: 'info'}); // Consolidated status
const isChangingPassword = ref(false);

// --- Apollo Queries & Mutations ---
const {
  result: currentUserResult,
  loading: isUserDataLoading,
  error: currentUserError,
  refetch: refetchMeQuery,
} = useQuery(ME_QUERY, null, {fetchPolicy: 'cache-and-network'});

const {
  mutate: updateUserMutate,
  loading: isUpdatingUser,
  error: updateUserErrorRaw,
  onDone: onUpdateUserDone,
  onError: onUpdateUserError,
} = useMutation(UPDATE_USER, () => ({
  update: (cache, {data}) => {
    const updatedUser = data?.updateUser;
    if (updatedUser && currentUserResult.value?.me) {
      const existingData = cache.readQuery({query: ME_QUERY});
      if (existingData?.me) {
        const newData = {
          ...existingData,
          me: {
            ...existingData.me,
            username: updatedUser.username ?? existingData.me.username,
            email: updatedUser.email ?? existingData.me.email,
            firstName: updatedUser.firstName ?? existingData.me.firstName,
            lastName: updatedUser.lastName ?? existingData.me.lastName,
            lastUpdated: updatedUser.lastUpdated ?? existingData.me.lastUpdated,
            files: existingData.me.files
          }
        };
        cache.writeQuery({query: ME_QUERY, data: newData});
      }
    }
  }
}));

const {
  mutate: uploadProfilePicMutate,
  loading: isUploadingProfilePic,
  error: uploadProfilePicErrorRaw,
  onDone: onUploadDone,
  onError: onUploadError,
} = useMutation(UPLOAD_PROFILE_PICTURE, () => ({refetchQueries: [{query: ME_QUERY}]}));

const {
  mutate: deleteProfilePicMutate,
  loading: isDeletingProfilePic,
  error: deleteProfilePicErrorRaw,
  onDone: onDeleteDone,
  onError: onDeleteError,
} = useMutation(DELETE_PROFILE_PICTURE, () => ({
  update: (cache) => {
    const existingData = cache.readQuery({query: ME_QUERY});
    if (existingData?.me?.id && user.profilePicFilename) {
      const updatedFiles = existingData.me.files.filter(f => f.filename !== user.profilePicFilename);
      cache.writeQuery({
        query: ME_QUERY,
        data: {
          me: {
            ...existingData.me,
            files: updatedFiles
          }
        }
      });
      user.profilePicture = null;
      user.profilePicFilename = null;
    }
  },
  refetchQueries: [{query: ME_QUERY}]
}));

// TODO: Define CHANGE_PASSWORD mutation and its useMutation hook
// const { mutate: changePasswordMutate, loading: isChangingPassword, error: changePasswordErrorRaw, onDone: onChangePassDone, onError: onChangePassError } = useMutation(CHANGE_PASSWORD_MUTATION);


// --- Status Message Handling ---
const profilePictureStatus = ref({message: '', type: 'info'});
const updateUserStatus = ref({message: '', type: 'info'});

// --- Computed Properties for Status Display ---
const profilePictureStatusType = computed(() => profilePictureStatus.value.type);
const profilePictureStatusMessage = computed(() => profilePictureStatus.value.message);

const updateUserStatusType = computed(() => updateUserStatus.value.type);
const updateUserStatusMessage = computed(() => updateUserStatus.value.message);

const passwordStatusType = computed(() => passwordChangeStatus.value.type);
const passwordStatusMessage = computed(() => passwordChangeStatus.value.message);


// --- Computed Properties ---
const formattedCreationDate = computed(() => formatDisplayDate(user.creationDate));
const formattedLastUpdated = computed(() => user.lastUpdated ? formatDisplayDate(user.lastUpdated, {timeStyle: 'short'}) : 'Never');
const isUserDataLoaded = computed(() => !!user.id && !isUserDataLoading.value);

// --- Watchers ---
watch(currentUserResult, (newMeData) => {
  const newUserData = newMeData?.me;
  if (newUserData) {
    user.id = newUserData.id;
    user.firstname = newUserData.firstName ?? '';
    user.lastname = newUserData.lastName ?? '';
    user.username = newUserData.username ?? '';
    user.email = newUserData.email ?? '';
    user.creationDate = newUserData.creationDate;
    user.lastUpdated = newUserData.lastUpdated;

    const profilePicFile = newUserData.files?.find(file => file?.contentType?.startsWith('image/'));
    if (profilePicFile?.filename && profilePicFile?.id) {
      // TODO: ADJUST BASE URL
      user.profilePicture = `http://localhost:8080/profile/${profilePicFile.filename}?userId=${user.id}&t=${Date.now()}`;
      user.profilePicFilename = profilePicFile.filename;
    } else {
      user.profilePicture = null;
      user.profilePicFilename = null;
    }
    updateUserStatus.value = {message: '', type: 'info'};
  } else if (!isUserDataLoading.value) {
    Object.assign(user, {
      id: null,
      profilePicture: null,
      profilePicFilename: null,
      firstname: "",
      lastname: "",
      username: "",
      email: "",
      creationDate: "",
      lastUpdated: ""
    });
  }
}, {immediate: true, deep: true});

watch([profilePictureStatus, updateUserStatus, passwordChangeStatus], () => {
  const clearStatus = (statusRef) => {
    if (statusRef.value.message) {
      setTimeout(() => {
        statusRef.value = {message: '', type: 'info'};
      }, 5000);
    }
  };
  clearStatus(profilePictureStatus);
  clearStatus(updateUserStatus);
  clearStatus(passwordChangeStatus);
}, {deep: true});


// --- Methods ---
function formatDisplayDate(dateString, options = {}) {
  if (!dateString) return '—';
  const defaultOptions = {year: 'numeric', month: 'short', day: 'numeric'};
  try {
    return new Intl.DateTimeFormat(navigator.language || 'en-US', {...defaultOptions, ...options}).format(new Date(dateString));
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    try {
      return dateString.split('T')[0] || 'Invalid Date';
    } catch {
      return 'Invalid Date';
    }
  }
}

function onImageError(event) {
  console.warn("Profile picture failed to load:", event.target.src);
  profilePictureStatus.value = {message: "Profile picture could not be loaded.", type: "error"};
  user.profilePicture = null;
  user.profilePicFilename = null;
}

// --- Mutation Handlers with Status Updates ---
onUploadDone((result) => {
  if (result?.data?.uploadProfilePicture) {
    profilePictureStatus.value = {message: "Profile picture updated!", type: "success"};
    addToast({msg: "Profile picture updated!", type: "success", duration: 4000});
    if (fileInputRef.value) fileInputRef.value.value = '';
  } else {
    profilePictureStatus.value = {message: "Upload succeeded but returned unexpected data.", type: "warning"};
  }
});
onUploadError((error) => {
  console.error("Upload profile picture error:", error);
  profilePictureStatus.value = {message: `Upload failed: ${error.message || 'Unknown error'}`, type: "error"};
  if (fileInputRef.value) fileInputRef.value.value = '';
});

onDeleteDone((result) => {
  if (!deleteProfilePicErrorRaw.value) {
    profilePictureStatus.value = {message: "Profile picture removed!", type: "success"};
    addToast({msg: "Profile picture removed!", type: "success", duration: 4000});
  } else {
    profilePictureStatus.value = {message: "Removal request sent, but server indicated an issue.", type: "warning"};
  }
});
onDeleteError((error) => {
  console.error("Delete profile picture error:", error);
  profilePictureStatus.value = {message: `Removal failed: ${error.message || 'Unknown error'}`, type: "error"};
});

onUpdateUserDone(async (result) => {
  if (result?.data?.updateUser) {
    const updatedUsername = result.data.updateUser.username;
    const originalUsername = currentUserResult.value?.me?.username;

    await refetchMeQuery();

    if (originalUsername && updatedUsername && originalUsername !== updatedUsername) {
      updateUserStatus.value = {message: "Username changed. Logging out...", type: "success"};
      addToast({msg: "Username changed. You will be logged out.", type: "success", duration: 4000});
      setTimeout(async () => {
        try {
          await apolloClient.clearStore();
          await router.push({name: 'login'});
        } catch (clearError) {
          console.error("Error during logout after username change:", clearError);
          updateUserStatus.value = {message: "Logout failed. Please logout manually.", type: "error"};
          addToast({
            msg: "Logout failed after username change. Please logout manually.",
            type: "error",
            duration: 4000
          });
        }
      }, 3000);
    } else {
      updateUserStatus.value = {message: "Account details saved successfully!", type: "success"};
    }
  } else {
    updateUserStatus.value = {message: "Save request sent, but server response was unexpected.", type: "warning"};
  }
});
onUpdateUserError((error) => {
  console.error("Update user error:", error);
  updateUserStatus.value = {message: `Failed to save: ${error.message || 'Unknown error'}`, type: "error"};
});


// --- Action Methods ---
async function handleUserUpdate() {
  if (!user.id || isUpdatingUser.value) return;

  updateUserStatus.value = {message: '', type: 'info'};

  const changes = {
    id: user.id,
    username: user.username.trim(),
    email: user.email.trim(),
    firstName: user.firstname.trim(),
    lastName: user.lastname.trim()
  };

  if (!changes.username || !changes.email || !changes.firstName) {
    updateUserStatus.value = {message: "First Name, Username, and Email cannot be empty.", type: "error"};
    return;
  }

  updateUserStatus.value = {message: "Saving...", type: "info"};
  try {
    await updateUserMutate(changes);
  } catch (error) {
    console.error("Unexpected error during updateUserMutate call:", error);
    updateUserStatus.value = {message: `An unexpected error occurred: ${error.message}`, type: "error"};
  }
}

async function handleProfilePictureUpload(event) {
  if (user.profilePicture) {
    profilePictureStatus.value = {message: "Remove current picture first.", type: "warning"};
    if (fileInputRef.value) fileInputRef.value.value = '';
    return;
  }

  const file = event.target.files?.[0];
  if (!file || isUploadingProfilePic.value || isDeletingProfilePic.value || !user.id) return;

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    profilePictureStatus.value = {message: `File too large (Max ${maxSize / 1024 / 1024}MB).`, type: "error"};
    if (fileInputRef.value) fileInputRef.value.value = '';
    return;
  }
  if (!file.type.startsWith('image/')) {
    profilePictureStatus.value = {message: "Please select an image file (JPG, PNG, GIF).", type: "error"};
    if (fileInputRef.value) fileInputRef.value.value = '';
    return;
  }

  profilePictureStatus.value = {message: 'Uploading...', type: 'info'};
  try {
    await uploadProfilePicMutate({input: file});
  } catch (error) {
    console.error("Unexpected error during uploadProfilePicMutate call:", error);
    profilePictureStatus.value = {message: `An unexpected upload error occurred: ${error.message}`, type: "error"};
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
}

async function handleProfilePictureDelete() {
  if (isDeletingProfilePic.value || isUploadingProfilePic.value || !user.profilePicture || !user.id) return;

  profilePictureStatus.value = {message: 'Removing...', type: 'info'};
  try {
    await deleteProfilePicMutate();
  } catch (error) {
    console.error("Unexpected error during deleteProfilePicMutate call:", error);
    profilePictureStatus.value = {message: `An unexpected removal error occurred: ${error.message}`, type: "error"};
  }
}

async function changePassword() {
  passwordChangeStatus.value = {message: '', type: 'info'};
  let isValid = true;
  let errorMessage = '';

  if (!passwordFields.current || !passwordFields.new || !passwordFields.confirm) {
    errorMessage = "Please fill in all password fields.";
    isValid = false;
  } else if (passwordFields.new !== passwordFields.confirm) {
    errorMessage = "New password and confirmation do not match.";
    isValid = false;
  } else if (passwordFields.new.length < 8) {
    errorMessage = "New password must be at least 8 characters long.";
    isValid = false;
  } else if (passwordFields.new === passwordFields.current) {
    errorMessage = "New password cannot be the same as the current password.";
    isValid = false;
  }

  if (!isValid) {
    passwordChangeStatus.value = {message: errorMessage, type: 'error'};
    return;
  }

  isChangingPassword.value = true;
  passwordChangeStatus.value = {message: 'Changing password...', type: 'info'};

  try {
    // --- TODO: Replace with actual GraphQL mutation call ---
    // CHANGE_PASSWORD_MUTATION:
    // const result = await changePasswordMutate({ currentPassword: passwordFields.current, newPassword: passwordFields.new });

    // --- Mock Implementation ---
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockSuccess = Math.random() > 0.3; // Simulate success/failure
    if (!mockSuccess) throw new Error("Incorrect current password or server error.");

    // --- Success Handling ---
    passwordChangeStatus.value = {message: "Password changed successfully!", type: "success"};
    passwordFields.current = '';
    passwordFields.new = '';
    passwordFields.confirm = '';

  } catch (error) {
    console.error("Change password error:", error);
    passwordChangeStatus.value = {
      message: `Failed to change password: ${error.message || 'Please try again.'}`,
      type: "error"
    };
  } finally {
    isChangingPassword.value = false;
  }
}

</script>

<style scoped>
.settings-content {
  font-family: 'Outfit', sans-serif;
  box-sizing: border-box;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
  color: var(--text-primary);
  background-color: var(--bg-primary);
}

.settings-content * {
  box-sizing: border-box;
}

.page-title {
  font-size: 1.8em;
  font-weight: 600;
  margin-bottom: 0;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

/* --- Section Styling --- */
.settings-section {
  background: var(--bg-secondary);
  padding: 25px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
}

.section-title-h3 {
  font-size: 1.3em;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 25px;
  color: var(--text-primary);
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

/* --- Subsection Styling --- */
.subsection {
  padding-top: 20px;
}

.settings-section > .subsection:first-of-type {
  padding-top: 0;
}

.settings-section > .subsection:not(:last-child) {
  padding-bottom: 25px;
  margin-bottom: 25px;
  border-bottom: 1px solid var(--border-color);
}

.subsection-title-h4 {
  font-size: 1.1em;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--text-primary);
  opacity: 0.9;
}

/* --- Profile Picture Section Specifics --- */
.profile-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.profile-image-wrapper {
  flex-shrink: 0;
  position: relative;
}

.profile-image-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--border-color);
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-tertiary);
  transition: border-color 0.3s ease;
}

.profile-image-container.has-picture {
  border-color: var(--sidebar-active);
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
  color: var(--text-secondary);
}

.placeholder-avatar.icon-placeholder .placeholder-icon {
  font-size: 4em;
  opacity: 0.6;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(var(--bg-secondary-rgb, 34, 41, 58), 0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--text-primary);
  z-index: 10;
  border-radius: 50%;
  text-align: center;
}

.loading-overlay span {
  font-size: 0.85em;
  margin-top: 8px;
  font-weight: 500;
}

.profile-controls-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex-grow: 0;
  width: 100%;
  max-width: 300px;
  text-align: center;
}

.action-button.disabled-look {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-input {
  display: none;
}

/* --- Forms, Inputs, Grids --- */
.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px 25px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  display: block;
  font-weight: 500;
  font-size: 0.9em;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.input-field {
  width: 100%;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.95em;
  outline: none;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.input-field:focus {
  border-color: var(--sidebar-active);
  box-shadow: 0 0 0 3px rgba(var(--sidebar-active-rgb), 0.2);
}

.input-field:disabled {
  background-color: rgba(var(--bg-tertiary-rgb), 0.7);
  opacity: 0.7;
  cursor: not-allowed;
}

.input-hint {
  font-size: 0.8em;
  color: var(--text-secondary);
  opacity: 0.9;
  margin-top: 2px;
  line-height: 1.3;
}

.read-only-group label {
  margin-bottom: 0;
}

.read-only-text {
  font-size: 0.95em;
  color: var(--text-primary);
  font-weight: 400;
  padding: 10px 0;
  display: block;
  word-break: break-word;
  line-height: 1.5;
}

/* --- Form Actions & Status Messages --- */
.form-actions {
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
}

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
  margin-top: 5px;
}

.status-message.form-status {
}

/* --- Base Button Styles --- */
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

.action-button.danger-button {
  background-color: var(--button-danger-bg);
  border-color: var(--button-danger-bg);
  color: #fff;
}

.action-button.danger-button:hover:not(:disabled) {
  background-color: var(--button-danger-hover-bg);
  border-color: var(--button-danger-hover-bg);
}

/* --- Loading/Error/Info States --- */
.loading-indicator, .error-message, .info-message {
  padding: 15px;
  text-align: center;
  border-radius: 8px;
  margin: 15px 0;
  font-size: 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.loading-indicator {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.error-message {
  background: rgba(var(--error-color-rgb), 0.1);
  color: var(--error-color);
  border: 1px solid var(--error-color);
}

.info-message {
  background: rgba(var(--info-color-rgb), 0.1);
  color: var(--info-color);
  border: 1px solid var(--info-color);
}

.full-page-state {
  padding: 40px 20px;
  min-height: 250px;
  justify-content: center;
  background-color: var(--bg-secondary);
  margin-top: 0;
}

.full-page-state p {
  font-size: 1.1em;
  color: var(--text-primary);
  margin: 5px 0 0 0;
}

.full-page-state pre {
  background-color: rgba(var(--bg-tertiary-rgb), 0.5);
  color: var(--text-secondary);
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 15px;
  font-size: 0.85em;
  white-space: pre-wrap;
  word-break: break-all;
  text-align: left;
  max-width: 90%;
  border: 1px solid var(--border-color);
}

.full-page-state.error-message pre {
  background-color: rgba(var(--error-color-rgb), 0.05);
  color: var(--error-color);
  border-color: rgba(var(--error-color-rgb), 0.3);
}


/* --- Responsive Adjustments --- */
@media (max-width: 768px) {
  .settings-section {
    padding: 20px;
  }

  .page-title {
    font-size: 1.6em;
  }

  .section-title-h3 {
    font-size: 1.2em;
  }

  .subsection-title-h4 {
    font-size: 1.05em;
  }

  .input-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .profile-controls-status .action-button,
  .form-actions .action-button {
    width: 100%;
    max-width: 280px;
  }

  .form-actions {
    align-items: center;
  }
}
</style>
