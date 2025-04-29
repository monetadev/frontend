<template>
  <div class="flashcard" @click="handleClick" :class="{ 'clickable': true }">
    <div class="header">
      <div class="left-section">
        <!-- Only show the profile picture if showProfilePic is true -->
        <img
            v-if="showProfilePic && authorId"
            :src="profilePictureUrl"
            alt="Author"
            class="profile-picture"
            @error="handleImageError"
        />
        <span class="number">{{ number }} terms | </span>
        <span class="username">{{ username }}</span>
      </div>
    </div>
    <div class="content">
      <h2 class="title">{{ title }}</h2>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import {computed} from "vue";

// Define props
const props = defineProps({
  number: Number,
  username: String,
  title: String,
  description: String,
  id: {
    type: [Number, String],
    default: null
  },
  authorId: String,
  showProfilePic: {
    type: Boolean,
    default: false
  }
});

// Define emits
const emit = defineEmits(['panel-click']);

// Setup router
const router = useRouter();

// Compute profile picture URL
const profilePictureUrl = computed(() => {
  return props.authorId ? `http://localhost:8080/profile/${props.authorId}` : '/path/to/default-avatar.png';
});

// Click handler
const handleClick = () => {
  // Emit event with data
  emit('panel-click', {
    id: props.id,
    title: props.title,
    number: props.number
  });

  // Navigate WITH the ID
  if (props.id) {
    router.push(`/library/view/${props.id}`);
  }
};



const handleImageError = (e) => {
  // Simple colored circle as default avatar
  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%235F98EF"/><text x="50%" y="50%" font-size="20" text-anchor="middle" dominant-baseline="middle" font-family="Arial" fill="white">' + (props.username ? props.username[0].toUpperCase() : '?') + '</text></svg>';
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

  .profile-picture {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 10px;
    border: 2px solid #2a335a;
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