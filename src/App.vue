<script>
import { ref } from "vue";
import PrimaryButton from "./components/PrimaryButton.vue";

export default {
  name: "App",
  components: {
    PrimaryButton
  },
  setup() {
    const email = ref("");

    return { email };
  }
};
</script>

<template>
  <PrimaryButton text="Sign-In" />
</template>
