<template>
  <component :is="iconComponent" v-if="iconComponent" :isFocused="isFocused" />
</template>

<script>
import EmailProperty from "./EmailProperty.vue";
import LockProperty from "./LockProperty.vue";

export default {
  name: "BaseIcon",
  props: {
    name: {
      type: String,
      required: true
    },
    isFocused: Boolean
  },
  computed: {
    iconComponent() {
      const icons = {
        email: EmailProperty,
        lock: LockProperty
      };
      return icons[this.name] || null;
    }
  }
};
</script>

<style scoped>
</style>
