<template>
  <div :class="['mode-box', { selected: isSelected }]" @click="$emit('click')">
    <component :is="iconComponent" :active="isSelected" />
    <span>{{ label }}</span>
  </div>
</template>

<script>
export default {
  props: {
    iconComponent: Object,
    label: String,
    isSelected: Boolean
  }
};
</script>

<style scoped>
.mode-box {
  background: #2f3a52;
  border-radius: 12px;
  padding: 20px;
  flex: 1;
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  transition: 0.3s;
}
.mode-box.selected {
  border-color: #5f98ef;
}
.mode-box span {
  color: white;
  font-size: 16px;
  font-weight: 600;
  display: block;
  margin-top: 10px;
}
</style>
