<template>
    <div class="definition-row">
      <div class="term-container">
        <div class="term-content">{{ term }}</div>
      </div>
      <div class="definition-container">
        <div class="definition-content">{{ definition }}</div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'DefinitionRow',
    props: {
      term: {
        type: String,
        default: ''
      },
      definition: {
        type: String,
        default: ''
      }
    }
  };
  </script>
  
  <style scoped>
  .definition-row {
    display: flex;
    width: 100%; 
    margin-bottom: 10px; 
    border-radius: 10px;
    overflow: hidden; 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .term-container,
  .definition-container {
    flex: 1;
    background: var(--Black, #121729);
    color: white;
    padding: 15px;
    box-sizing: border-box;
    font-family: 'Outfit', sans-serif;
    font-size: 1.1rem; 
    display: flex;
    align-items: center;
    min-height: 50px; 
  }
  
  .term-container {
    border-right: 1px solid #22293a; 
    text-align: left;
  }
  
  .definition-container {
    text-align: left;
  }
  
  .term-content,
  .definition-content {
    padding: 10px;
  }
  </style>