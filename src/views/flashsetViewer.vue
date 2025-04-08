<template>
  <div class="flashset-set-viewer">
    <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
      <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
      <div class="Top">
        <div class="my-Stuffs">
          <h1>My Sets</h1>
        </div>
      </div>
      <div class="Search_Bar">
        <setBar />
      </div>
      <div class='wrapper'>
        <tabs :mode="mode">
          <tab title="Flashcard Sets" class="panel-container">
            <!-- Loading state -->
            <div v-if="loading">Loading your flashcard sets...</div>

            <!-- Error state -->
            <div v-if="error">Error loading flashcard sets: {{ error.message }}</div>

            <!-- Data display -->
            <template v-if="myFlashcardSets.length">
              <!-- Today's sets -->
              <div v-if="groupedSets.today.length" class="divide">
                <divider time="Today"/>
              </div>
              <div v-for="set in groupedSets.today" :key="set.id" class="panel-wrapper">
                <div class="panel-container-with-delete">
                  <Panel
                      :number="set.flashcards.length"
                      :username="set.author.username"
                      :title="set.title"
                      :description="set.description"
                      :id="set.id"
                  />
                  <div class="action-buttons">
                    <button @click.stop="editSet(set)" class="edit-button">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click.stop="confirmDelete(set)" class="delete-button">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Last week's sets -->
              <div v-if="groupedSets.lastWeek.length" class="divide">
                <divider time="Last week"/>
              </div>
              <div v-for="set in groupedSets.lastWeek" :key="set.id" class="panel-wrapper">

                <div class="panel-container-with-delete">
                  <Panel
                      :number="set.flashcards.length"
                      :username="set.author.username"
                      :title="set.title"
                      :description="set.description"
                      :id="set.id"
                  />
                  <div class="action-buttons">
                    <button @click.stop="editSet(set)" class="edit-button">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click.stop="confirmDelete(set)" class="delete-button">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Older sets -->
              <div v-if="groupedSets.older.length" class="divide">
                <divider time="Older"/>
              </div>
              <div v-for="set in groupedSets.older" :key="set.id" class="panel-wrapper">

                <div class="panel-container-with-delete">
                  <Panel
                      :number="set.flashcards.length"
                      :username="set.author.username"
                      :title="set.title"
                      :description="set.description"
                      :id="set.id"
                  />
                  <div class="action-buttons">
                    <button @click.stop="editSet(set)" class="edit-button">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click.stop="confirmDelete(set)" class="delete-button">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <!-- No data state -->
            <div v-else-if="!loading && !error">
              No flashcard sets found. Create your first set!
            </div>
          </tab>
        </tabs>
      </div>
    </div>
    <div v-if="showDeleteConfirm" class="delete-modal">
      <div class="delete-modal-content">
        <h2>Delete Flashcard Set</h2>
        <p>Are you sure you want to delete "<strong>{{ setToDelete?.title }}</strong>"?</p>
        <p class="warning">This action cannot be undone.</p>
        <div class="button-group">
          <button @click="cancelDelete" class="cancel-button">Cancel</button>
          <button @click="deleteSet" class="confirm-delete-button">Delete</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import {computed, ref} from 'vue';
import SidebarNavigation from "@/components/SideNavigation.vue";
import NavigationBar from "@/components/TopNavigation.vue";
import setBar from "@/components/SetBar.vue";
import Tab from "@/components/Tab.vue";
import Tabs from "@/components/Tabs.vue";
import Panel from "@/components/panelSets.vue";
import divider from "@/components/timeDivider.vue";
import { useQuery, useMutation} from '@vue/apollo-composable';
import {DELETE_FLASHCARD_SET, GET_ALL_MY_SETS} from '@/graphql/auth';
import eventBus from "@/eventBus.js";
import { ApolloClient } from '@apollo/client/core';
import { useRouter } from 'vue-router';
import { useApolloClient } from '@vue/apollo-composable';

const apolloClient = useApolloClient();
const router = useRouter();

// State
const isSidebarCollapsed = ref(false);
const mode = ref('default');
const showDeleteConfirm = ref(false);
const setToDelete = ref(null);

// Exec GraphQL Query
const {result, loading, error, refetch} = useQuery(GET_ALL_MY_SETS);

//setup delete mutation
const {mutate: deleteFlashcardSet, loading: deleteLoading } = useMutation(DELETE_FLASHCARD_SET);

const userId = computed(() => result.value?.me?.id);

const myFlashcardSets = computed(() => {
  return result.value?.me?.flashcardSets || [];
});

// Group sets by date for your dividers
const groupedSets = computed(() => {
  const sets = myFlashcardSets.value;
  // Group logic here - you can separate by today, last week, etc.
  // Example basic grouping:
  return {
    today: sets.filter(set => isToday(new Date(set.creationDate))),
    lastWeek: sets.filter(set => isLastWeek(new Date(set.creationDate))),
    older: sets.filter(set => !isToday(new Date(set.creationDate)) && !isLastWeek(new Date(set.creationDate)))
  };
});

// Methods
function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

//Helper date functions
function isToday(date) {
  // Implement date comparison logic
  const today = new Date();
  return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
}

function isLastWeek(date) {
  // Implement date comparison logic
  const today = new Date();
  const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
  return date >= lastWeek && date < today && !isToday(date);
}

function confirmDelete(set) {
  setToDelete.value = set;
  showDeleteConfirm.value = true;
}

function cancelDelete() {
  showDeleteConfirm.value = false;
  setToDelete.value = null;
}





async function deleteSet() {
  if (!setToDelete.value) {
    toastFunction("Error: No set selected", "error");
    return;
  }

  const userIdToUse = userId.value;
  const setIdToUse = setToDelete.value.id;

  if (!userIdToUse || !setIdToUse) {
    console.error("Missing UUID values:", { userId: userIdToUse, setId: setIdToUse });
    toastFunction("Error: Missing UUID values", "error");
    return;
  }

  try {
    // Get the actual Apollo client instance
    const client = apolloClient.client;  // Access the actual client

    console.log("Sending deletion request with:", {
      userId: userIdToUse,
      setId: setIdToUse
    });

    // Use the actual client instance
    const result = await client.mutate({
      mutation: DELETE_FLASHCARD_SET,
      variables: {
        userId: userIdToUse,
        setId: setIdToUse
      }
    });

    console.log("Result from server:", result);

    if (result.data?.deleteFlashcardSet) {
      toastFunction("Flashcard set deleted successfully", "success");
      await refetch();
    } else {
      toastFunction("Failed to delete flashcard set", "error");
    }
  } catch (error) {
    console.error("Error deleting flashcard set:", error);
    toastFunction("Failed to delete flashcard set: " + error.message, "error");
  } finally {
    showDeleteConfirm.value = false;
    setToDelete.value = null;
  }
}

function toastFunction(message, type) {
  eventBus.emit('toast', {
    msg: message,
    type: type,
    duration: 3000
  });
}

function editSet(set) {
  router.push(`/edit-flashcard-set/${set.id}`);
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.flashset-set-viewer {
  display: flex;
  background-color: #22293A;
  min-height: 100vh;
  font-family: "Outfit", sans-serif;
}

.SidebarNavigation {
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  height: 100vh;
  z-index: 50;
  background-color: #22293A;
}

.main-content {
  margin-left: 250px;
  flex: 1;
  transition: margin-left 0.3s ease-in-out;
  position: relative;
  z-index: 100;
  padding: 20px;
  margin-top: 60px;
}

.main-content.collapsed {
  margin-left: 80px;
}

.Top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-top: 1rem;
  background-color: #22293A;
  width: 50%;
  position: relative;
  z-index: 110;
}

.Top h1 {
  font-size: 2rem;
  font-weight: bold;
  padding: 10px;
  color: white;
}

.Search_Bar {
  padding-left: 2%;
}

.wrapper {
  padding-left: 2%;
  padding-top: 5%;
}

.panel-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 2%;
}

.panel-wrapper {
  margin-bottom: 20px;
}

.panel-wrapper:last-child {
  margin-bottom: 0;
}
.panel-container-with-delete {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.panel-container-with-delete:hover .delete-button {
  opacity: 1;
}

.delete-button:hover {
  background-color: #c0392b;
}

.delete-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.delete-modal-content {
  background-color: #1b2233;
  padding: 30px;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  color: white;
}

.delete-modal-content h2 {
  margin-top: 0;
  color: white;
}

.delete-modal-content .warning {
  color: #e74c3c;
  font-weight: bold;
  margin-top: 20px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.cancel-button {
  background-color: #34495e;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.confirm-delete-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.cancel-button:hover {
  background-color: #2c3e50;
}

.confirm-delete-button:hover {
  background-color: #c0392b;
}


.action-buttons {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 20px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 5;
}

.panel-container-with-delete:hover .action-buttons {
  opacity: 1;
}

.edit-button {
  background-color: #5F98EF;
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 10px;
}

.edit-button:hover {
  background-color: #4a86e8;
}

.divide {

}
</style>