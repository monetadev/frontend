<template>
    <div class="flashcard-title">
      <h1>{{ title }}</h1>
    </div>
  </template>
  
  <script>
  export default {
    name: 'FlashcardTitle',
    props: {
      title: {
        type: String,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');
  
  .flashcard-title {
    width: 100%;
    text-align: left;
    padding-left: 12%;
    margin-bottom: 30px;
  }
  
  .flashcard-title h1 {
    font-size: 40px;
    font-weight: 700;
    font-family: 'Outfit', sans-serif;
    font-style: normal;
    line-height: normal;
    color: white; 
  }
  
  .content {
    position: relative;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .flashcards-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  </style>