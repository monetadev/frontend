<template>
  <button class="primary-button" @mousedown="isClicked = true" @mouseup="isClicked = false" @mouseleave="isClicked = false">
    {{ text }}
  </button>
</template>

<script>
export default {
  name: "PrimaryButton",
  props: {
    text: String,
  },
  data() {
    return {
      isClicked: false
    };
  }
};
</script>

<style scoped>
.primary-button {
  background-color: #5F98EF;
  color: #ffffff;
  padding: 15px;
  border-radius: 5px;
  border: none;
  font-size: 18px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease-in-out, transform 0.1s ease-in-out;
}
</style>