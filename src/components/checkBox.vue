<template>
    <div class="paragraph">
      <label>
        <input type="checkbox" :checked="modelValue" @change="updateValue" />
        {{ label }}
      </label>
    </div>
  </template>
  
  <script>
  export default {
    name: 'checkBox',
    props: {
      modelValue: {
        type: Boolean,
        default: false,
      },
      label: {
        type: String,
        required: true,
      },
    },
    methods: {
      updateValue(event) {
        this.$emit('update:modelValue', event.target.checked); // Emit the updated value
      },
    },
  };
  </script>
  
  <style scoped>
  .paragraph {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  
  label {
    font-size: 1rem;
  }
  </style>
  