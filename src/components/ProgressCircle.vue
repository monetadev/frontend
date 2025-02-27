<template>
  <div class="progress circle" :class="{active: isActive}">
    <span class = "number">{{ number }}</span>
  </div>

</template>

<script>
export default {
  props: {
    number: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    }
  }

};
</script>

<style scoped>


</style>