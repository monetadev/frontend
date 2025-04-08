
<template>
  <div
      class="chat-bubble"
      :class="{
        'user-bubble': sender === 'user',
        'bot-bubble': sender === 'bot',
        'loading-bubble': isLoading
      }"
  >
    <span v-if="isLoading" class="loading-dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </span>
    <div v-else-if="isMarkdown" v-html="renderedMarkdown"></div>
    <span v-else>{{ message }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true
});

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    validator: (value) => ['user', 'bot'].includes(value),
    default: 'bot'
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  isMarkdown: {
    type: Boolean,
    default: false
  }
});

const renderedMarkdown = computed(() => {
  if (!props.message) return '';
  return md.render(props.message);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');

.chat-bubble {

  max-width: 70%;
  margin: 8px;
  padding: 10px 15px;
  border-radius: 18px;
  word-wrap: break-word;
  clear: both;
  position: relative;
  font-size: 14px;
  line-height: 1.4;
  font-family: "outfit", sans-serif;
}

.user-bubble {
  background-color: #007bff;
  color: white;
  align-self: flex-end;
  margin-left: auto;
}

.bot-bubble {
  background-color: #f0f0f0;
  color: black;
  align-self: flex-start;
  margin-right: auto;
}

:deep(p) {
  margin: 0.5em 0;
}

:deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

:deep(pre) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.5em;
  border-radius: 5px;
  overflow-x: auto;
}

:deep(a) {
  color: #0366d6;
  text-decoration: none;
}

:deep(a:hover) {
  text-decoration: underline;
}

:deep(blockquote) {
  margin: 0.5em 0;
  padding-left: 1em;
  border-left: 3px solid #ddd;
  color: #6a737d;
}

:deep(ul), :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}
</style>