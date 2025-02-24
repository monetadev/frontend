<template>
  <div class="input-container" :class="{ 'focused': isFocused || modelValue }">
    <span class="icon-wrapper">
      <BaseIcon :name="iconName" :isFocused="isFocused || modelValue" />
    </span>
    <label class="input-label" :class="{ 'label-up': isFocused || modelValue }">{{ label }}</label>
    <input
        :type="type"
        class="input-field"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="isFocused = true"
        @blur="isFocused = !!modelValue"
    />
  </div>
</template>

<script>
import BaseIcon from "./BaseIcon.vue";

export default {
  name: "InputWithIcon",
  components: { BaseIcon },
  props: {
    iconName: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: "text"
    },
    modelValue: String,
    label: {
      type: String,
      required: true
    }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      isFocused: false,
    };
  }
};
</script>

<style scoped>
.input-container {
  display: flex;
  align-items: center;
  border: 2px solid #686868;
  border-radius: 5px;
  padding: 10px;
  background-color: transparent;
  position: relative;
  transition: border-color 0.3s ease-in-out;
  width: 300px;
}

.input-container.focused {
  border-color: #5F98EF;
}

.icon-wrapper {
  position: absolute;
  left: 10px;
  display: flex;
  align-items: center;
}

.input-field {
  flex: 1;
  width: 100%;
  padding-left: 40px;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: #fff;
  padding-top: 10px;
  padding-bottom: 5px;
}

.input-label {
  position: absolute;
  left: 40px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #686868;
  transition: all 0.3s ease-in-out;
  pointer-events: none;
}

.label-up {
  top: 5px;
  font-size: 12px;
  color: #5F98EF;
  background: #fff;
  padding: 0 5px;
}
</style>
