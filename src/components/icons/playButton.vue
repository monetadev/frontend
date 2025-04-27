<template>
  <svg
      :class="{ 'playing': playing, 'active': active }"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
  >
    <g v-if="!playing">
      <!-- Play icon -->
      <path d="M8 5v14l11-7z" />
    </g>
    <g v-else>
      <!-- Pause icon -->
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </g>
  </svg>
</template>

<script>
export default {
  props: {
    active: {
      type: Boolean,
      default: false
    },
    playing: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
svg {
  fill: #777;
  transition: fill 0.3s ease;
}
svg.active {
  fill: #fff;
}
svg.playing {
  fill: #5f98ef; /* Blue color when playing */
}
svg:hover {
  cursor: pointer;
}
</style>