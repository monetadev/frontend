<template>
    <div class="search-container">
      <div class="search-box">
        <span class="icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
            <g clip-path="url(#clip0_113_199)">
            <path d="M7.77801 14.8493C5.89334 14.8493 4.12068 14.1133 2.78801 12.7753C0.0353442 10.0127 0.0353442 5.51934 2.78801 2.75868C4.12068 1.42001 5.89334 0.682678 7.77801 0.682678C9.66334 0.682678 11.4363 1.42001 12.7697 2.75868C15.5223 5.51934 15.5223 10.0127 12.7697 12.7747C11.4363 14.1133 9.66401 14.8493 7.77801 14.8493ZM7.77801 1.34934C6.07068 1.34934 4.46601 2.01668 3.26001 3.22868C0.766677 5.73001 0.766677 9.80135 3.26001 12.3047C4.46734 13.5153 6.07201 14.182 7.77801 14.182C9.48534 14.182 11.0907 13.5153 12.2983 12.304C14.7907 9.80134 14.7907 5.72934 12.2983 3.22868C11.09 2.01734 9.48534 1.34934 7.77801 1.34934Z" fill="white"/>
            <path d="M17.9607 19.3173C17.6273 19.3173 17.3133 19.1873 17.0783 18.9503L11.375 13.225L13.2037 11.3883L18.9113 17.1143C19.3977 17.603 19.3977 18.3973 18.91 18.885L18.845 18.9506C18.608 19.187 18.2957 19.3173 17.9607 19.3173ZM12.3167 13.2266L17.5513 18.4806C17.77 18.6993 18.154 18.7006 18.374 18.4806L18.4393 18.4153C18.6673 18.1863 18.6687 17.8153 18.4407 17.5866L13.2043 12.3346L12.3167 13.2266Z" fill="white"/>
            </g>
          </svg>
        </span>
        <input
            type="text"
            placeholder="Search for Sets with my Library"
            v-model="query"
            @input="handleInput"
        />
        <span v-if="query" class="reset-icon" @click="clearSearch">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
            <g>
            <path fill="#FFFFFF" d="M12,1c6.064,0,11,4.935,11,11c0,6.064-4.936,11-11,11C5.935,23,1,18.064,1,12C1,5.935,5.935,1,12,1 M12,0
              C5.373,0,0,5.373,0,12s5.373,12,12,12s12-5.373,12-12S18.627,0,12,0L12,0z"/>
            <g>
              <path fill="#FFFFFF" d="M7.5,17c-0.128,0-0.256-0.049-0.354-0.146c-0.195-0.193-0.195-0.512,0-0.707l9-9
                c0.193-0.195,0.512-0.195,0.707,0c0.193,0.195,0.193,0.512,0,0.707l-9,9C7.756,16.951,7.628,17,7.5,17z"/>
              <path fill="#FFFFFF" d="M16.5,17c-0.128,0-0.256-0.049-0.354-0.146l-9-9c-0.195-0.195-0.195-0.512,0-0.707s0.512-0.195,0.707,0
                l9,9c0.193,0.195,0.193,0.514,0,0.707C16.756,16.951,16.628,17,16.5,17z"/>
            </g>
          </g>
          </svg>
        </span>
      </div>
  
      <ul v-if="showDropdown" class="search-dropdown">
        <li v-for="(result, index) in filteredResults" :key="index" @click="selectResult(result)">
          {{ result }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: "SearchBar",
    data() {
      return {
        query: "",
        showDropdown: false,
        searchResults: [
          "Physics PHY101 - Chapter 1",
          "Calculus MAT101 - Chapter 4",
          "Chemistry CHM153 - Chapter 2",
          "Chemistry CHM270 - Chapter 4",
          "History HIS101 - Chapter 2",
          "History HIS101 - Chapter 3",
          "Computer Science CSC329 - Chapter 4",
        ]
      };
    },
    computed: {
      filteredResults() {
        return this.searchResults.filter(item =>
            item.toLowerCase().includes(this.query.toLowerCase())
        );
      }
    },
    methods: {
      handleInput() {
        this.showDropdown = this.query.length > 0;
      },
      clearSearch() {
        this.query = "";
        this.showDropdown = false;
      },
      selectResult(result) {
        this.query = result;
        this.showDropdown = false;
        this.$emit("search", result);
      }
    }
  };
  </script>
  
  <style scoped>
  .search-container {
    position: relative;
    width: 40%;
  }
  
  .search-box {
    display: flex;
    align-items: center;
    background: #141a28;
    padding: 10px;
    border-radius: 20px;
    width: 100%;
  }
  
  .icon {
    margin: 0 10px;
    display: flex;
    align-items: center;
  }
  
  .reset-icon {
    margin-left: auto;
    margin-right: 10px;
    cursor: pointer;
  }
  
  input {
    background: transparent;
    border: none;
    outline: none;
    color: white;
    flex: 1;
    font-size: 14px;
  }
  
  .search-dropdown {
    position: absolute;
    width: 100%;
    background: #1b2233;
    border-radius: 8px;
    margin-top: 5px;
    padding: 5px;
    list-style: none;
    color: white;
  }
  
  .search-dropdown li {
    padding: 8px;
    cursor: pointer;
  }
  
  .search-dropdown li:hover {
    background: #5f98ef;
    border-radius: 6px;
  }
  </style>
  