<!-- src/components/icons/GameControllerIconIcon.vue -->
<template>
  <svg
      :class="{ active }"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
  >
    <path
        d="M21 6H3C1.9 6 1 6.9 1 8V16C1 17.1 1.9 18 3 18H21C22.1 18 23 17.1 23 16V8C23 6.9 22.1 6 21 6ZM10 14H8V16H6V14H4V12H6V10H8V12H10V14ZM15 15C14.45 15 14 14.55 14 14C14 13.45 14.45 13 15 13C15.55 13 16 13.45 16 14C16 14.55 15.55 15 15 15ZM19 13C18.45 13 18 12.55 18 12C18 11.45 18.45 11 19 11C19.55 11 20 11.45 20 12C20 12.55 19.55 13 19 13Z"
        fill="currentColor"
    />
  </svg>
</template>

<script>
export default {
  name: "GameControllerIcon",
  props: {
    active: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
svg {
  color: #5A6A8A;
  cursor: pointer;
  transition: color 0.3s ease;
}

svg.active {
  color: #5F98EF;
}

svg:hover {
  color: #F9F9F9;
}
</style>
