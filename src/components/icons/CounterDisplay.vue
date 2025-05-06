<template>
    <p>{{ current }} / {{ total }}</p>
  </template>
  
  <script>
  export default {
    name: "CounterDisplay",
    props: {
      current: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
    },
  };
  </script>
  
  <style scoped>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');

  p {
    font-size: 1.5rem;
    color: #fff;
    font-family: 'Outfit', sans-serif;
  }
  </style>
  