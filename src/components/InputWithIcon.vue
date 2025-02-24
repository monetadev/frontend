<template>
  <div class="input-container" :class="{ 'focused': isFocused || modelValue }">
    <span class="icon-wrapper">
      <BaseIcon :name="iconName" :isFocused="isFocused" />
    </span>
    <input
        :type="type"
        class="input-field"
        :value="modelValue"
        placeholder=" "
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="isFocused = true"
        @blur="isFocused = !!modelValue"
    />
    <label class="input-label">{{ label }}</label>
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
  position: relative;
  width: 100%;
  border: 2px solid #686868;
  border-radius: 5px;
  padding: 14px 16px;
  transition: border-color 0.3s ease-in-out;
  background: transparent;
  height: 56px;
}

.input-container.focused {
  border-color: #5F98EF;
}

.icon-wrapper {
  position: absolute;
  left: 12px;
  display: flex;
  align-items: center;
  height: 100%;
}

.icon-wrapper svg {
  width: 24px;
  height: 24px;
}

.input-field {
  flex: 1;
  width: 100%;
  padding-left: 40px;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: #ffffff;
  height: 24px;
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
  background: #22293A;
  padding: 2px 6px;
}

.focused .input-label,
.input-field:focus ~ .input-label,
.input-field:not(:placeholder-shown) ~ .input-label {
  top: 1px;
  font-size: 12px;
  color: #5F98EF;
}
</style>
