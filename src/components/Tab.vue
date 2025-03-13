<template>
    <div v-if="isActive" class="tab-content">
      <slot></slot>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      title: {
        type: String,
        default: "Tab"
      }
    },
    data() {
      return {
        isActive: false
      };
    },
    mounted() {
      this.$parent.registerTab(this);
    }
  };
  </script>
  
  <style>
  .tab {
    display: block;
    padding: 20px;
    min-width: 800px;
    min-height: 400px;
    border-radius: 10px;
  }
  
  .tabs__light .tab {
    background-color: #fff;
    color: rgb(255, 255, 255);
  }
  
  .tabs__dark .tab {
    background-color: #555;
    color: #eee;
  }
  </style>
  