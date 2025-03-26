<template>
  <div class="dropdown">
    <label class="dropdown-label">{{ label }}</label>
    <div
        class="dropdown-control"
        @click="toggleDropdown"
        @focusin="open = true"
        @focusout="handleBlur"
    >
      <input
          type="text"
          v-model="search"
          :placeholder="placeholder"
          class="dropdown-input"
      />
    </div>

    <div v-show="open" class="dropdown-menu">
      <div
          v-for="option in filteredOptions"
          :key="option"
          class="dropdown-option"
          @click="selectOption(option)"
      >
        {{ option }}
      </div>
      <div v-if="filteredOptions.length === 0" class="dropdown-empty">
        No results found
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: String,
    options: Array,
    modelValue: String,
    placeholder: {
      type: String,
      default: 'Search and select...'
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      search: '',
      open: false
    };
  },
  computed: {
    filteredOptions() {
      return this.options.filter(option =>
          option.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },
  watch: {
    modelValue(newVal) {
      this.search = newVal;
    }
  },
  mounted() {
    this.search = this.modelValue || '';
  },
  methods: {
    selectOption(option) {
      this.$emit('update:modelValue', option);
      this.search = option;
      this.open = false;
    },
    toggleDropdown() {
      this.open = !this.open;
    },
    handleBlur() {
      setTimeout(() => {
        this.open = false;
      }, 100);
    }
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
  margin-bottom: 4px;
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
  height: 28px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #121729;
  border-radius: 10px;
  margin-top: 6px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.dropdown-option {
  padding: 12px 16px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
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
