<template>
  <div
      class="chat-bubble"
      :class="{
        'user-bubble': sender === 'user',
        'bot-bubble': sender === 'bot',
        'loading-bubble': isLoading,
        'structured-bubble': sender === 'bot' && hasContextAndResponse
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
        <div class="response-content" v-html="responseContent"></div>
      </div>
    </div>
    <div v-else-if="sender === 'bot' || isMarkdown" v-html="renderedMarkdown"></div>
    <span v-else>{{ message }}</span>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/tokyo-night-dark.css';

// Configure MarkdownIt with syntax highlighting and custom renderer
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="code-block" data-language="${lang || 'plaintext'}"><div class="code-header"><div class="code-language">${lang || 'plaintext'}</div><button class="code-copy-btn" title="Copy code"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button></div><code class="language-${lang}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch (__) {}
    }

    // Use external default escaping for languages not supported by highlight.js
    return `<pre class="code-block" data-language="plaintext"><div class="code-header"><div class="code-language">plaintext</div><button class="code-copy-btn" title="Copy code"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button></div><code>${md.utils.escapeHtml(str)}</code></pre>`;
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

// Define emits
const emit = defineEmits(['contextToggled']);

// State for collapsible context
const isContextVisible = ref(false);

const toggleContext = () => {
  isContextVisible.value = !isContextVisible.value;

  // Emit an event to the parent to update scrolling
  setTimeout(() => {
    emit('contextToggled');
  }, 100);
};

// Detect if message has the specific structure of context and response
const hasContextAndResponse = computed(() => {
  if (props.sender !== 'bot') return false;
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

// Add copy functionality to code blocks after DOM updates
const setupCopyButtons = () => {
  nextTick(() => {
    const copyButtons = document.querySelectorAll('.code-copy-btn');

    copyButtons.forEach(btn => {
      // Skip if already processed
      if (btn.hasAttribute('data-processed')) return;
      btn.setAttribute('data-processed', 'true');

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Find the code element (parent's sibling)
        const pre = btn.closest('.code-block');
        const code = pre.querySelector('code');
        if (!code) return;

        // Copy to clipboard
        navigator.clipboard.writeText(code.textContent).then(() => {
          // Show success state
          btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          btn.classList.add('copied');

          // Reset after 2 seconds
          setTimeout(() => {
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
            btn.classList.remove('copied');
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy: ', err);
        });
      });
    });
  });
};

// Setup copy functionality when the component mounts
onMounted(() => {
  setupCopyButtons();
});

// Setup copy functionality when content changes
watch([renderedMarkdown, responseContent, contextContent], () => {
  // Use nextTick to wait for the DOM update
  setupCopyButtons();
});

// Setup copy buttons when context visibility changes
watch(isContextVisible, () => {
  if (isContextVisible.value) {
    setupCopyButtons();
  }
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.user-bubble {
  background-color: #5F98EF;
  color: white;
  align-self: flex-end;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.bot-bubble {
  background-color: #1a2233;
  color: white;
  align-self: flex-start;
  margin-right: auto;
  border-bottom-left-radius: 4px;
}

.structured-bubble {
  padding: 0;
  width: 95%;
}

/* Structured response styling */
.structured-response {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.context-section {
  border-bottom: 1px solid rgba(42, 51, 90, 0.5);
  background-color: rgba(18, 23, 41, 0.5);
}

.context-header {
  display: flex;
  align-items: center;
  border-radius: 14px 14px 0 0;
  padding: 10px 14px;
  background-color: rgba(26, 34, 51, 0.5);
  cursor: pointer;
  font-weight: 500;
  user-select: none;
  transition: background-color 0.2s ease;
}

.context-header:hover {
  background-color: rgba(32, 41, 66, 0.7);
}

.context-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.context-icon svg {
  transition: transform 0.2s ease;
}

.context-icon .rotated {
  transform: rotate(90deg);
}

.context-title {
  color: #9aa1b3;
  font-size: 13px;
}

.context-content {
  padding: 12px 14px;
  font-size: 13px;
  color: #9aa1b3;
}

.response-section {
  background: transparent;
  border: none;
}

.response-content {
  padding: 14px;
  color: white;
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
  background-color: #2a335a;
  color: #e0e0e0;
}

/* Code block styling with header */
:deep(.code-block) {
  margin: 1em 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  background-color: #1a2233;
}

:deep(.code-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2a335a;
  padding: 6px 12px;
  border-bottom: 1px solid #3d4a7d;
}

:deep(.code-language) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 12px;
  color: #9aa1b3;
  text-transform: lowercase;
}

:deep(.code-copy-btn) {
  background: rgba(95, 152, 239, 0.1);
  border: none;
  border-radius: 4px;
  color: #5F98EF;
  padding: 4px 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.code-copy-btn:hover) {
  background: rgba(95, 152, 239, 0.2);
}

:deep(.code-copy-btn.copied) {
  background: rgba(70, 201, 137, 0.2);
  color: #46c989;
}

:deep(pre code) {
  display: block;
  padding: 1em;
  overflow-x: auto;
  line-height: 1.5;
  background-color: #1a2233;
  border-radius: 0;
  font-size: 13px;
}

/* Override hljs background for dark theme in user bubble */
.user-bubble :deep(.hljs) {
  background: rgba(0, 0, 0, 0.3);
}

/* Handle code in user bubble with light text */
.user-bubble :deep(code) {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.user-bubble :deep(.code-header) {
  background-color: rgba(0, 0, 0, 0.2);
}

.user-bubble :deep(.code-copy-btn) {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.user-bubble :deep(.code-copy-btn:hover) {
  background: rgba(255, 255, 255, 0.25);
}

.user-bubble :deep(.code-language) {
  color: rgba(255, 255, 255, 0.7);
}

:deep(a) {
  color: #5F98EF;
  text-decoration: none;
  border-bottom: 1px dotted #5F98EF;
  transition: all 0.2s ease;
}

:deep(a:hover) {
  opacity: 0.85;
  border-bottom: 1px solid #5F98EF;
}

:deep(blockquote) {
  margin: 0.8em 0;
  padding: 0.5em 1em;
  border-left: 3px solid #2a335a;
  color: #9aa1b3;
  background-color: rgba(26, 34, 51, 0.5);
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
  color: white;
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
  border: 1px solid #2a335a;
  padding: 6px 10px;
}

:deep(th) {
  background-color: #1a2233;
  font-weight: 600;
}

:deep(tr:nth-child(even)) {
  background-color: #202942;
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
  background-color: #9aa1b3;
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
</style>

