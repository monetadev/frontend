<template>
  <div class="upload-box-container">
    <div
        class="upload-box"
        :class="{ 'drag-over': isDragging }"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop"
    >
      <div class="upload-icon">
        <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                     width="90px" height="90px" viewBox="0 0 90 90"  xml:space="preserve">
        <g id="icomoon-ignore">
          <line fill="#5F98EF" stroke="#449FDB" x1="0" y1="0" x2="0" y2="0"/>
        </g>
                  <path fill="#5F98EF" d="M75.314,70.044c-0.264,0-0.527-0.065-0.768-0.207L66,64.746l-8.55,5.088
          c-0.712,0.426-1.636,0.189-2.062-0.521s-0.188-1.633,0.522-2.056l9.315-5.547c0.471-0.285,1.062-0.285,1.535,0l9.313,5.547
          c0.711,0.423,0.945,1.341,0.525,2.056C76.323,69.786,75.825,70.044,75.314,70.044z"/>
                  <path fill="#5F98EF" d="M66,88.5c-0.825,0-1.5-0.675-1.5-1.5V63c0-0.825,0.675-1.5,1.5-1.5s1.5,0.675,1.5,1.5v24
          C67.5,87.825,66.825,88.5,66,88.5z"/>
                  <path fill="#5F98EF" d="M49.5,90H12c-0.828,0-1.5-0.675-1.5-1.5V22.434c0-0.384,0.147-0.753,0.411-1.032L30.753,0.468
          C31.035,0.168,31.431,0,31.842,0H78c0.825,0,1.5,0.672,1.5,1.5V57c0,0.825-0.675,1.5-1.5,1.5s-1.5-0.675-1.5-1.5V3H32.487
          L13.5,23.031V87h36c0.825,0,1.5,0.675,1.5,1.5S50.325,90,49.5,90z"/>
                  <path fill="#5F98EF" d="M33,24H13.5c-0.828,0-1.5-0.672-1.5-1.5s0.672-1.5,1.5-1.5h18V3c0-0.828,0.672-1.5,1.5-1.5
          s1.5,0.672,1.5,1.5v19.5C34.5,23.328,33.828,24,33,24z"/>
        </svg>
      </div>
      <h2>Drag & Drop to Upload File</h2>

      <p class="or-text">OR</p>

      <button class="browse-btn" @click="triggerFileInput">
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                       width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
          <g>
            <g>
              <path fill="#FFFFFF" d="M23.5,10.5c-0.275,0-0.5-0.224-0.5-0.5V7c0-1.654-1.346-3-3-3h-8.375c-0.276,0-0.5-0.224-0.5-0.5
                c0-0.781-1.239-2.5-2.563-2.5h-5C2.246,1,1,2.367,1,3.813v6.188c0,0.276-0.224,0.5-0.5,0.5S0,10.277,0,10.001V3.813
                C0,1.818,1.697,0,3.563,0h5c1.673,0,3.165,1.695,3.495,3H20c2.207,0,4,1.794,4,4v3C24,10.276,23.775,10.5,23.5,10.5z"/>
              <path fill="#FFFFFF" d="M3.521,24C1.562,24,0,22.439,0,20.521V10c0-0.276,0.224-0.5,0.5-0.5S1,9.724,1,10v10.521
                C1,21.889,2.112,23,3.479,23C4.889,23,6,21.889,6,20.521V9.5C6,7.57,7.57,6,9.5,6h11C22.432,6,24,7.57,24,9.5V14
                c0,0.275-0.225,0.5-0.5,0.5S23,14.275,23,14V9.5C23,8.122,21.879,7,20.5,7h-11C8.123,7,7,8.122,7,9.5v11.021
                C7,22.439,5.439,24,3.521,24z"/>
              <path fill="#FFFFFF" d="M14,24H4c-0.276,0-0.5-0.225-0.5-0.5S3.725,23,4,23h10c0.275,0,0.5,0.225,0.5,0.5S14.275,24,14,24z"/>
            </g>
            <g>
              <path fill="#FFFFFF" d="M17.918,20.68c-0.801,0-1.555-0.312-2.121-0.878c-0.566-0.563-0.879-1.319-0.879-2.12
                c0-0.803,0.313-1.556,0.879-2.123c1.133-1.133,3.107-1.133,4.242,0c0.566,0.567,0.879,1.32,0.879,2.123
                c0,0.801-0.313,1.555-0.879,2.12C19.475,20.368,18.721,20.68,17.918,20.68z M17.918,15.682c-0.533,0-1.037,0.207-1.414,0.584
                c-0.377,0.379-0.586,0.881-0.586,1.416c0,0.533,0.209,1.036,0.586,1.414c0.756,0.754,2.074,0.754,2.828,0
                c0.377-0.378,0.586-0.881,0.586-1.414c0-0.535-0.209-1.037-0.586-1.416C18.955,15.889,18.453,15.682,17.918,15.682z"/>
              <path fill="#FFFFFF" d="M22.852,23.111c-0.129,0-0.258-0.049-0.354-0.146l-2.828-2.827c-0.194-0.195-0.194-0.513,0-0.707
                c0.194-0.195,0.513-0.195,0.707,0l2.828,2.827c0.194,0.195,0.194,0.513,0,0.707C23.105,23.063,22.979,23.111,22.852,23.111z"/>
            </g>
          </g>
          </svg>
        Browse File
      </button>

      <input type="file" ref="fileInput" @change="onFileSelect" hidden />

      <p class="file-types">.pdf, .doc, .docx, .txt</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isDragging: false,
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    onFileSelect(event) {
      const files = event.target.files;
      if (files.length) {
        this.handleFileUpload(files[0]);
      }
    },

    onDrop(event) {
      this.isDragging = false;
      const files = event.dataTransfer.files;
      if (files.length) {
        this.handleFileUpload(files[0]);
      }
    },

    onDragOver() {
      this.isDragging = true;
    },

    onDragLeave() {
      this.isDragging = false;
    },

    handleFileUpload(file) {
      alert(`file ${file.name}`);
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.upload-box-container {
  background: #121729;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90%;
}

.upload-box {
  background: #121729;
  border: 3px dashed #5F98EF;
  padding: 50px;
  border-radius: 12px;
  text-align: center;
  width: 100%;
  max-width: 1280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s ease-in-out, background-color 0.3s ease-in-out;
}


h2 {
  font-size: 22px;
  color: white;
  font-family: "Outfit", sans-serif;
  font-weight: 600;
  margin-bottom: 10px;
}

.or-text {
  color: white;
  font-size: 14px;
  margin-bottom: 15px;
  font-family: "Outfit", sans-serif;
}

.file-types {
  font-size: 14px;
  color: #888;
  margin-top: 10px;
  font-family: "Outfit", sans-serif;
}

.upload-icon {
  margin-bottom: 15px;
}
.browse-btn {
  background: #5F98EF;
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  font-family: "Outfit", sans-serif;
  font-weight: 600;
  transition: background 0.3s ease;
  width: 100%;
  max-width: 250px;
}

.browse-btn:hover {
  background: #4a7dd6;
}

.upload-box.drag-over {
  border-color: #88b6ff;
  background-color: #1a2233;
}
</style>
