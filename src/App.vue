</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import NavBar from "./components/NavBar.vue";
import Sidebar from "./components/Sidebar.vue";

// Vue Router Hook to Check Current Route
const route = useRoute();

// Show Sidebar & Navbar Only for Logged-In Pages
const isAuthenticated = computed(() => {
  return !["/", "/reset-password", "/login"].includes(route.path);
});
</script>

<style scoped>

