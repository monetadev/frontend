<template>
    <div class="paragraph">
      <label>
        <input type="checkbox" v-model="modelValue" /> {{ label }}
      </label>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      label: String,
      modelValue: Boolean
    }
  };
  </script>
  