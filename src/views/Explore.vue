<template>
  <div class="flashset-set-viewer">
    <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
      <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
      <div class="Top">
        <div class="my-Stuffs">
          <h1>Explore Sets</h1>
        </div>
      </div>
      <div class="Search_Bar">
        <setBar />
      </div>
      <div class='wrapper'>
        <tabs :mode="mode">
          <tab title="Public Flashcard Sets" class="panel-container">
            <!-- Loading state -->
            <div v-if="loading" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i> Loading public flashcard sets...
            </div>

            <!-- Error state -->
            <div v-if="error" class="error-state">
              Error loading flashcard sets: {{ error.message }}
            </div>

            <!-- Data display -->
            <template v-if="publicSets.length">
              <div class="public-sets-container">
                <div v-for="set in publicSets" :key="set.id" class="panel-wrapper">
                  <Panel
                      :number="set.flashcards.length"
                      :username="set.author.username"
                      :title="set.title"
                      :description="set.description"
                      :id="set.id"
                      :creationDate="set.creationDate"
                  />
                </div>
              </div>

              <!-- Pagination -->
              <div class="pagination-controls">
                <button
                    @click="prevPage"
                    :disabled="currentPage === 0"
                    class="pagination-button"
                >
                  <i class="fas fa-chevron-left"></i> Previous
                </button>

                <div class="pagination-info">
                  Page {{ currentPage + 1 }} of {{ totalPages }}
                </div>

                <button
                    @click="nextPage"
                    :disabled="currentPage >= totalPages - 1"
                    class="pagination-button"
                >
                  Next <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </template>

            <!-- No data state -->
            <div v-else-if="!loading && !error" class="empty-state">
              <i class="fas fa-search"></i>
              <p>No public flashcard sets found.</p>
            </div>
          </tab>
        </tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, ref, watch} from 'vue';
import SidebarNavigation from "@/components/SideNavigation.vue";
import NavigationBar from "@/components/TopNavigation.vue";
import setBar from "@/components/SetBar.vue";
import Tab from "@/components/Tab.vue";
import Tabs from "@/components/Tabs.vue";
import Panel from "@/components/panelSets.vue";
import { useQuery } from '@vue/apollo-composable';
import {DELETE_FLASHCARD_SET, GET_ALL_MY_SETS, FIND_PUBLIC_FLASHCARD_SETS} from '@/graphql/auth';
import eventBus from "@/eventBus.js";
import { useRouter } from 'vue-router';
import { useApolloClient } from '@vue/apollo-composable';
import debounce from 'lodash/debounce';

const apolloClient = useApolloClient();
const router = useRouter();

// State
const isSidebarCollapsed = ref(false);
const mode = ref('default');
const currentPage = ref(0);
const pageSize = ref(10);
const searchQuery = ref('');

const { result, loading, error, refetch } = useQuery(
    FIND_PUBLIC_FLASHCARD_SETS,
    {
      filter: computed(() => searchQuery.value ? { titleContains: searchQuery.value } : null),
      page: computed(() => currentPage.value),
      size: computed(() => pageSize.value)
    }
);

// Computed properties for data access
const publicSets = computed(() => {
  return result.value?.findPublicFlashcardSets?.items || [];
});

const totalPages = computed(() => {
  return result.value?.findPublicFlashcardSets?.pageInfo?.totalPages || 0;
});

const totalItems = computed(() => {
  return result.value?.findPublicFlashcardSets?.pageInfo?.totalElements || 0;
});

// Methods
function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

function nextPage() {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 0) {
    currentPage.value--;
  }
}

// Debounced search handler
const handleSearch = debounce((query) => {
  searchQuery.value = query;
  currentPage.value = 0; // Reset to first page on new search
}, 300);

// Watch for changes in query parameters to trigger refetch
watch([currentPage, searchQuery], () => {
  refetch();
});

function toastFunction(message, type) {
  eventBus.emit('toast', {
    msg: message,
    type: type,
    duration: 3000
  });
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

.public-sets-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #a4aabf;
  text-align: center;
  gap: 15px;
}

.empty-state i, .loading-state i {
  font-size: 2.5rem;
  margin-bottom: 15px;
  color: #5F98EF;
}

.error-state {
  color: #e74c3c;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  padding: 15px;
  gap: 20px;
}

.pagination-button {
  background-color: #1a2233;
  color: #5F98EF;
  border: 1px solid #2a335a;
  border-radius: 6px;
  padding: 8px 15px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background-color: #2a335a;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #a4aabf;
  font-size: 14px;
}
</style>