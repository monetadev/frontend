<template>
  <div class="progress-wrapper">
    <div class="progress-circle" :class="{ active: isActive }">
      <span class="number">{{ number }}</span>
    </div>
    <span v-if="subText" class="sub-text">{{ subText }}</span>
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
    },
    subText: {
      type: String,
      default: null
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.progress-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #121729;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.progress-circle.active {
  background-color: #5F98EF;
}

.number {
  font-family: "Outfit", sans-serif;
  font-size: 16px;
}

.sub-text {
  font-family: "Outfit", sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: white;
  margin-top: 5px;
}
</style>
