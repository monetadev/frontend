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
    <div v-else-if="sender === 'bot' && hasContextAndResponse" class="structured-response">
      <div class="context-section">
        <div class="context-header" @click="toggleContext">
          <span class="context-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{'rotated': isContextVisible}">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
          <span class="context-title">Moneta's Thoughts</span>
        </div>
        <div v-show="isContextVisible" class="context-content" v-html="contextContent"></div>
      </div>
      <div class="response-section">
        <div class="response-header">
          <span class="response-title">Moneta's Response</span>
        </div>
        <div class="response-content" v-html="responseContent"></div>
      </div>
    </div>
    <div v-else-if="sender === 'bot' || isMarkdown" v-html="renderedMarkdown"></div>
    <span v-else>{{ message }}</span>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
// Import a highlight.js theme (you can choose different themes)
import 'highlight.js/styles/github.css';

// Configure MarkdownIt with syntax highlighting
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
            hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
            '</code></pre>';
      } catch (__) {}
    }

    // Use external default escaping for languages not supported by highlight.js
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
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
    default: true
  }
});

// State for collapsible context
const isContextVisible = ref(false);

const toggleContext = () => {
  isContextVisible.value = !isContextVisible.value;
};

// Detect if message has the specific structure of context and response
const hasContextAndResponse = computed(() => {
  if (props.sender !== 'bot') return false;

  // Check if message contains both the context and response headers
  return props.message.includes('# Context Provided') &&
      props.message.includes('# Moneta\'s Response');
});

// Extract context section
const contextContent = computed(() => {
  if (!hasContextAndResponse.value) return '';

  const startIndex = props.message.indexOf('# Context Provided');
  const endIndex = props.message.indexOf('# Moneta\'s Response');

  if (startIndex === -1 || endIndex === -1) return '';

  const contextText = props.message.substring(startIndex + '# Context Provided'.length, endIndex).trim();
  return md.render(contextText);
});

// Extract response section
const responseContent = computed(() => {
  if (!hasContextAndResponse.value) return '';

  const startIndex = props.message.indexOf('# Moneta\'s Response');

  if (startIndex === -1) return '';

  const responseText = props.message.substring(startIndex + '# Moneta\'s Response'.length).trim();
  return md.render(responseText);
});

const renderedMarkdown = computed(() => {
  if (!props.message) return '';
  return md.render(props.message);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');

.chat-bubble {
  max-width: 80%;
  margin: 8px 0;
  padding: 6px 14px;
  border-radius: 14px;
  word-wrap: break-word;
  clear: both;
  position: relative;
  font-size: 14px;
  line-height: 1.5;
  font-family: "Outfit", sans-serif;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.user-bubble {
  background-color: #007bff;
  color: white;
  align-self: flex-end;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.bot-bubble {
  background-color: #f5f5f5;
  color: #333;
  align-self: flex-start;
  margin-right: auto;
  border-bottom-left-radius: 4px;
}

/* Structured response styling */
.structured-response {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.context-section {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  overflow: hidden;
  background-color: #fafafa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease;
}

.context-section:hover {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
}

.context-header {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background-color: #f2f2f2;
  cursor: pointer;
  font-weight: 500;
  user-select: none;
  transition: background-color 0.2s ease;
}

.context-header:hover {
  background-color: #eaeaea;
}

.context-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  transition: transform 0.2s ease;
}

.context-icon .rotated {
  transform: rotate(90deg);
}

.context-title {
  color: #555;
  font-size: 13px;
}

.context-content {
  padding: 12px 14px;
  max-height: 200px;
  overflow-y: auto;
  border-top: 1px solid #eaeaea;
  font-size: 13px;
  color: #555;
  background-color: #fdfdfd;
}

.response-section {
  border: 1px solid #e6eef7;
  border-radius: 10px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 123, 255, 0.05);
}

.response-header {
  padding: 10px 14px;
  background-color: #f0f7ff;
  font-weight: 500;
}

.response-title {
  color: #0066cc;
  font-size: 13px;
}

.response-content {
  padding: 14px;
  color: #333;
}

:deep(p) {
  margin: 0.7em 0;
  line-height: 1.6;
}

:deep(code) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 85%;
  background-color: rgba(0, 0, 0, 0.04);
  color: #333;
}

:deep(pre) {
  margin: 1em 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

:deep(pre code) {
  display: block;
  padding: 1.2em;
  overflow-x: auto;
  line-height: 1.5;
  background-color: #f6f8fa;
  border-radius: 0;
  font-size: 13px;
}

/* Override hljs background for dark theme in user bubble */
.user-bubble :deep(.hljs) {
  background: rgba(0, 0, 0, 0.2);
}

/* Handle code in user bubble with light text */
.user-bubble :deep(code) {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

:deep(a) {
  color: #0366d6;
  text-decoration: none;
  border-bottom: 1px dotted #0366d6;
  transition: all 0.2s ease;
}

:deep(a:hover) {
  opacity: 0.85;
  border-bottom: 1px solid #0366d6;
}

:deep(blockquote) {
  margin: 0.8em 0;
  padding: 0.5em 1em;
  border-left: 3px solid #e1e4e8;
  color: #586069;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 0 4px 4px 0;
}

:deep(ul), :deep(ol) {
  padding-left: 1.5em;
  margin: 0.7em 0;
}

:deep(li) {
  margin: 0.4em 0;
}

:deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
  margin: 1em 0 0.5em;
  font-weight: 600;
  line-height: 1.3;
}

:deep(h1) { font-size: 1.6em; }
:deep(h2) { font-size: 1.4em; }
:deep(h3) { font-size: 1.2em; }
:deep(h4) { font-size: 1.1em; }

:deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.5em 0;
}

:deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
  font-size: 0.9em;
}

:deep(th), :deep(td) {
  border: 1px solid #e1e4e8;
  padding: 6px 10px;
}

:deep(th) {
  background-color: #f6f8fa;
  font-weight: 600;
}

:deep(tr:nth-child(even)) {
  background-color: #f8f8f8;
}

/* Dot animation styling */
.loading-dots {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
  height: 20px;
}

.dot {
  width: 6px;
  height: 6px;
  background-color: #aaa;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.6;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Scrollbar styling for context content */
.context-content::-webkit-scrollbar {
  width: 6px;
}

.context-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.context-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.context-content::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>