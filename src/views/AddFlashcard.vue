<template>
  <div class="page">
    <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
      <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
      <div class="content-wrapper">
        <div class="content-container">
          <div class="content-header">
            <div class="content-text">
              <h1>Upload Document</h1>
              <p>Drop in your study document and instantly turn it into smart flashcards!</p>
            </div>
            <img src="@/assets/book.svg" class="page-icon" alt="Book Icon" />
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script>
import SidebarNavigation from "@/components/SideNavigation.vue";
import NavigationBar from "@/components/TopNavigation.vue";
import ProgressCircle from "@/components/ProgressCircle.vue";
import ProgressLine from "@/components/ProgressLine.vue";

export default {
  name: "AddFlashcard",
  components: {
    ProgressLine,
    ProgressCircle,
    SidebarNavigation,
    NavigationBar,
  },
  data() {
    return {
      isSidebarCollapsed: false,
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.page {
  display: flex;
}

.main-content {
  flex-grow: 1;
  transition: margin-left 0.3s ease-in-out;
  margin-left: 250px;
  display: flex;
  width: 100%;
  padding-top: 80px;
}

.main-content.collapsed {
  margin-left: 80px;
}

.content-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.content-container {
  background: #22293A;
  padding: 50px;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 900px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px;
}

.content-text {
  text-align: left;
  max-width: 70%;
}

.content-text h1 {
  color: #ffffff;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
  font-family: "Outfit", sans-serif;
}

.content-text p {
  color: #ffffff;
  font-size: 16px;
  margin-bottom: 0;
  font-family: "Outfit", sans-serif;
}

.page-icon {
  width: 170px;
  height: 110px;
}

</style>
