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
        <p v-if="description" class="description">{{ description }}</p>
      </div>
    </div>
  </template>

<script setup>
import { useRouter } from 'vue-router';

// Define props
const props = defineProps({
  number: Number,
  username: String,
  title: String,
  description: String,
  id: {
    type: [Number, String],
    default: null
  }
});

// Define emits
const emit = defineEmits(['panel-click']);

// Setup router
const router = useRouter();

// Click handler
const handleClick = () => {

  console.log('Clicked flashcard set with ID:', props.id);

  // Emit event with data
  emit('panel-click', {
    id: props.id,
    title: props.title,
    number: props.number
  });

  // Navigate WITH the ID
  if (props.id) {
    router.push(`/library/view/${props.id}`);
  } else {
    console.error('No ID available for this flashcard set');
    router.push('/view'); // Fallback to default view
  }

};
</script>
  
  <style scoped>
  @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap");
  
  .flashcard {
    position: relative;
    width: 95%;
    min-height: 75px;
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
    margin-bottom: 4px;
  }

  .description {
    font-size: 14px;
    color: #b8c4e0;
    text-align: left;
    margin-top: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  </style>