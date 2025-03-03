<template>
  <div class="upload-box-container">
    <div
        class="upload-box"
        :class="{ 'drag-over': isDragging }"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop"
    >

      <h2>Drag & Drop to Upload File</h2>

      <p class="or-text">OR</p>

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
  max-width: 700px;
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
</style>
