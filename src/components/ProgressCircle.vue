<template>
  <div class="progress-circle" :class="{active: isActive}">
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

.progress-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  color:white;
  font-size: 24px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}
.progress-circle.active {
  background-color:#5F98EF;
}
.number {
  font-size: 16px;
}

</style>