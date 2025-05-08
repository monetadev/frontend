// FilterableDropdown.vue
<template>
  <div class="dropdown">
    <label v-if="label" class="dropdown-label">{{ label }}</label>
    <div
        class="dropdown-control"
        @click="toggleDropdown"
        tabindex="0"
        @focusin="isOpen = true"
        @focusout="handleFocusOut"
        @keydown.esc="isOpen = false"
    >
      <input
          type="text"
          v-model="searchText"
          :placeholder="placeholder"
          class="dropdown-input"
          @input="handleInput"
      />
    </div>

    <div v-show="isOpen" class="dropdown-menu">
      <div
          v-for="(option, index) in filteredOptions"
          :key="getOptionKeyValue(option, index)"
          class="dropdown-option"
          @mousedown.prevent="selectOption(option)"
      >
        {{ getOptionDisplayLabel(option) }}
      </div>
      <div v-if="filteredOptions.length === 0 && (options && options.length > 0 && searchText)" class="dropdown-empty">
        No results found for "{{ searchText }}"
      </div>
      <div v-if="filteredOptions.length === 0 && (options && options.length > 0 && !searchText)" class="dropdown-empty">
        Type to search or select an option
      </div>
      <div v-if="!options || options.length === 0" class="dropdown-empty">
        No options available
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterableDropdown',
  props: {
    label: String,
    options: {
      type: Array,
      default: () => []
    },
    modelValue: [String, Number, Object, null],
    placeholder: {
      type: String,
      default: 'Search and select...'
    },
    optionLabel: {
      type: String,
      default: 'label'
    },
    optionValue: {
      type: String,
      default: 'value'
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isOpen: false,
      searchText: '',
    };
  },
  computed: {
    filteredOptions() {
      if (!this.options || this.options.length === 0) return [];
      if (!this.searchText) return this.options;

      const search = this.searchText.toLowerCase();
      return this.options.filter(option => {
        const labelString = String(this.getOptionDisplayLabel(option)).toLowerCase();
        return labelString.includes(search);
      });
    }
  },
  watch: {
    modelValue: {
      handler(newVal) {
        this.updateSearchTextFromModelValue(newVal);
      },
      immediate: true
    },
    options() {
      this.updateSearchTextFromModelValue(this.modelValue);
    }
  },
  methods: {
    getOptionDisplayLabel(option) {
      if (typeof option === 'object' && option !== null && this.optionLabel && option.hasOwnProperty(this.optionLabel)) {
        return option[this.optionLabel];
      }
      return String(option);
    },
    getOptionActualValue(option) {
      if (typeof option === 'object' && option !== null && this.optionValue && option.hasOwnProperty(this.optionValue)) {
        return option[this.optionValue];
      }
      return option;
    },
    getOptionKeyValue(option, index) {
      const val = this.getOptionActualValue(option);
      if (val !== null && val !== undefined && typeof val !== 'object') return val;
      // Fallback for complex objects or missing values, use label or index
      const label = this.getOptionDisplayLabel(option);
      if (label !== null && label !== undefined && typeof label !== 'object') return `${label}-${index}`;
      return index;
    },
    updateSearchTextFromModelValue(val) {
      if (val === null || val === undefined || val === '') {
        // Only clear searchText if user is not actively typing (dropdown is closed)
        // or if the current searchText is not already empty (prevents clearing during typing and deleting all text)
        if (!this.isOpen || this.searchText !== '') {
          this.searchText = '';
        }
        return;
      }

      const foundOption = this.options.find(opt => this.getOptionActualValue(opt) === val);
      if (foundOption) {
        this.searchText = this.getOptionDisplayLabel(foundOption);
      } else {
        // If modelValue is an ID not in current options, clear searchText if dropdown is closed.
        // If dropdown is open, user might be typing a new value or modelValue is stale.
        if (!this.isOpen) {
          this.searchText = '';
        }
      }
    },
    selectOption(option) {
      const valueToEmit = this.getOptionActualValue(option);
      this.$emit('update:modelValue', valueToEmit);
      this.searchText = this.getOptionDisplayLabel(option);
      this.isOpen = false;
    },
    toggleDropdown() {
      this.isOpen = !this.isOpen;
      if (!this.isOpen) { // If closing, ensure searchText reflects modelValue
        this.updateSearchTextFromModelValue(this.modelValue);
      }
    },
    handleFocusOut(event) {
      // Check if the relatedTarget (where focus is going) is part of this component's interactive elements
      // $el refers to the root element of this component.
      // If relatedTarget is null (e.g., focus lost to browser window) or not part of $el, then close.
      if (event.relatedTarget === null || (this.$el && !this.$el.contains(event.relatedTarget))) {
        this.isOpen = false;
        this.updateSearchTextFromModelValue(this.modelValue); // Ensure consistency on blur
      }
    },
    handleInput() {
      this.isOpen = true;
      // If user clears input, we might want to emit null or undefined for modelValue
      if (this.searchText === '') {
        this.$emit('update:modelValue', null);
      }
    }
  },
  mounted() {
    this.updateSearchTextFromModelValue(this.modelValue);
  }
};
</script>

<style scoped>
.dropdown {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  color: #fff;
  width: 100%;
}

.dropdown-label {
  font-weight: 500;
  font-size: 15px;
  /* margin-bottom: 4px; */ /* As per original user-provided file */
}

.dropdown-control {
  display: flex;
  align-items: center;
  background: #121729;
  border-radius: 10px;
  padding: 14px 16px;
  position: relative;
  cursor: pointer;
}

.dropdown-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 16px;
  font-family: inherit;
  outline: none;
  /* height: 28px; */ /* As per original user-provided file (no height specified) */
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px); /* Ensure a small gap */
  left: 0;
  width: 100%;
  background: #121729;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-sizing: border-box;
}

.dropdown-option {
  padding: 12px 16px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-option:hover {
  background: #5f98ef;
}

.dropdown-empty {
  padding: 12px 16px;
  font-size: 14px;
  color: #ccc;
  font-style: italic;
}
</style>