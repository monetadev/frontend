<template>
    <div>
      <label :for="id"><b>{{ label }}</b></label>
      <input
        :type="type"
        v-model="inputValue"
        :placeholder="placeholder"
        :name="name"
        :required="required"
        :id="id"
      />
    </div>
  </template>
  
  <script>
  export default {
    props: {
      label: String,
      type: String,
      placeholder: String,
      name: String,
      required: Boolean,
      id: String,
      value: String,
    },
    data() {
      return {
        inputValue: this.value,
      };
    },
    watch: {
      inputValue(newValue) {
        this.$emit("input", newValue);
      },
    },
  };
  </script>
  
  <style scoped>
  input {
    width: 100%;
    padding: 10px;
    margin: 5px 0 22px 0;
    display: inline-block;
    border-radius: 5px;
    border: 1px solid #686868;
    font-family: 'Outfit', sans-serif;
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
    color: #686868;
  }
  
  input:focus {
    background-color: #ddd;
    outline: none;
  }
  </style>
  