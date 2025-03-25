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
                <Panel
                    :number="set.flashcards.length"
                    :username="set.author.username"
                    :title="set.title"
                    :id="set.id"
                />
              </div>

              <!-- Last week's sets -->
              <div v-if="groupedSets.lastWeek.length" class="divide">
                <divider time="Last week"/>
              </div>
              <div v-for="set in groupedSets.lastWeek" :key="set.id" class="panel-wrapper">
                <Panel
                    :number="set.flashcards.length"
                    :username="set.author.username"
                    :title="set.title"
                    :id="set.id"
                />
              </div>

              <!-- Older sets -->
              <div v-if="groupedSets.older.length" class="divide">
                <divider time="Older"/>
              </div>
              <div v-for="set in groupedSets.older" :key="set.id" class="panel-wrapper">
                <Panel
                    :number="set.flashcards.length"
                    :username="set.author.username"
                    :title="set.title"
                    :id="set.id"
                />
              </div>
            </template>

            <!-- No data state -->
            <div v-else-if="!loading && !error">
              No flashcard sets found. Create your first set!
            </div>
          </tab>
          <tab title="Practice Test">Contents2</tab>
          <tab title="Study Guides">Contents3</tab>
          <tab title="Expert solutions">Contents4</tab>
        </tabs>
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
import { useQuery } from '@vue/apollo-composable';
import { GET_ALL_MY_SETS } from '@/graphql/auth';

// State
const isSidebarCollapsed = ref(false);

const mode = ref('default');

// Exec GraphQL Query
const {result, loading, error} = useQuery(GET_ALL_MY_SETS);

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

// Helper date functions (implement as needed)
function isToday(date) {
  // Implement date comparison logic
}

function isLastWeek(date) {
  // Implement date comparison logic
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
.divide {

}
</style>