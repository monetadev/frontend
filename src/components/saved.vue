<template>
  <div v-if="show">
    <p>{{ text }}</p>
  </div>
</template>

<script>
export default {
  name: "Saved",
  props: {
    text: {
      type: String,
      default: "Saved",
    },
    show: {
      type: Boolean,
      default: false,
    },
    class: {
      type: String,
      default: "saved-text",
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

p {
  font-size: 16px;
  color: #a1a1a1;
  font-family: "Outfit", sans-serif;
}
</style>