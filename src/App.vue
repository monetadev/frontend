<script>
import { ref } from "vue";
import InputWithIcon from "./components/InputWithIcon.vue";

export default {
  name: "App",
  components: {
    InputWithIcon
  },
  setup() {
    const email = ref("");

    return { email };
  }
};
</script>

<template>
  <InputWithIcon iconName="email" label="Email" type="email" v-model="email" />
  <InputWithIcon iconName="lock" label="Password" type="password" v-model="password" />


</template>
