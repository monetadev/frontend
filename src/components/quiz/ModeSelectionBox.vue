<template>
  <div :class="['mode-box', { selected: isSelected }]" @click="$emit('click')">
    <font-awesome-icon :icon="icon" class="mode-icon" />
    <span>{{ label }}</span>
  </div>
</template>

<script>
// It's good practice to import if this component could be used standalone,
// but assuming FontAwesomeIcon is globally registered as in CreateQuiz.vue setup.
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default {
  name: 'ModeSelectionBox',
  // components: {
  //   FontAwesomeIcon // Register locally if not global
  // },
  props: {
    // Renamed prop for clarity and to match FontAwesomeIcon's prop
    icon: Object, // Expects the Font Awesome icon definition object
    label: String,
    isSelected: Boolean
  },
  // Declare the 'click' event to prevent fallthrough and ensure single emission handling
  emits: ['click']
};
</script>

<style scoped>
.mode-box {
  background: #121729; /* Original background */
  border-radius: 12px;
  padding: 20px;
  flex: 1;
  min-width: 150px; /* Ensure boxes have a decent minimum width */
  display: flex; /* For better alignment of icon and text */
  flex-direction: column; /* Stack icon and text vertically */
  align-items: center; /* Center content horizontally */
  justify-content: center; /* Center content vertically */
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s, background-color 0.3s; /* Smooth transition for background too */
}

.mode-box:hover {
  background: #1f2949; /* Slightly lighter background on hover */
  border-color: #3a4574; /* Subtle border on hover if not selected */
}

.mode-box.selected {
  border-color: #5f98ef;
  background: #2a335a; /* Optional: different background when selected */
}

.mode-box .mode-icon {
  font-size: 24px; /* Adjust icon size as needed */
  color: #a0a8c2; /* Default icon color */
  margin-bottom: 12px; /* Space between icon and label */
  transition: color 0.3s;
}

.mode-box.selected .mode-icon {
  color: #5f98ef; /* Icon color when selected */
}

.mode-box span {
  color: white;
  font-size: 15px; /* Slightly adjusted font size */
  font-weight: 500; /* Adjusted font weight */
  display: block;
  margin-top: 0; /* Removed margin-top as .mode-icon now provides margin-bottom */
  line-height: 1.3;
}
</style>