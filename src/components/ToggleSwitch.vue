<template>
  <div class="toggle-container">
    <label class="toggle-label">{{ label }}</label>
    <div class="switch" @click="toggle">
      <div :class="['slider', { active: modelValue }]"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: String,
    modelValue: Boolean
  },
  emits: ['update:modelValue'],
  methods: {
    toggle() {
      this.$emit('update:modelValue', !this.modelValue);
    }
  }
};
</script>

<style scoped>
.toggle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2f3a52;
  padding: 14px 20px;
  border-radius: 10px;
  font-family: 'Outfit', sans-serif;
  color: white;
  margin-bottom: 10px;
}

.toggle-label {
  font-size: 15px;
  font-weight: 500;
}

.switch {
  width: 50px;
  height: 26px;
  background-color: #5f98ef;
  border-radius: 15px;
  position: relative;
  cursor: pointer;
}

.slider {
  width: 22px;
  height: 22px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
}

.slider.active {
  left: 26px;
}
</style>
