<template>
    <div class="flashcard" @click="handleClick" :class="{ 'clickable': true }">
      <div class="header">
        <div class="left-section">
          <span class="number">{{ number }} terms | </span>
          <span class="username">{{ username }}</span>
        </div>
      </div>
      <div class="content">
        <h2 class="title">{{ title }}</h2>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "Flashcard",
    props: {
      number: Number,
      username: String,
      title: String,
      id: {
        type: [Number, String],
        default: null
      }
    },
    methods: {
      handleClick() {
        // Emit an event with the panel ID or other relevant data
        this.$emit('panel-click', {
          id: this.id,
          title: this.title,
          number: this.number
        });
        this.$router.push(`/define`);

        /*
        TODO: I will need to work with backend to have id of the specifc flashcard set route you to the specific flashcard View page
        */

        // this.$router.push(`/view/${this.uuuid}`);
      }
    }
  };
  </script>
  
  <style scoped>
  @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap");
  
  .flashcard {
    position: relative;
    width: 95%;
    height: 75px;
    background-color: #1b2233;
    border-radius: 20px;
    padding: 20px;
    color: white;
    font-family: "Outfit", sans-serif;
    overflow: hidden;
  }
  
  .clickable {
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
  }
  
  .clickable:hover {
    background-color: #263045;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .clickable:active {
    transform: translateY(0);
  }
  
  .header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .left-section {
    display: flex;
    align-items: center;
  }
  
  .number {
    font-size: 16px;
    color: #b8c4e0;
  }
  
  .username {
    font-size: 16px;
    color: #b8c4e0;
    margin-left: 4px;
  }
  
  .content {
    padding: 0 10px;
  }
  
  .title {
    font-size: 22px;
    font-weight: 700;
    text-align: left;
    color: white;
  }
  </style>