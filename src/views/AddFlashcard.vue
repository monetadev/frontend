
<template>
  <div class="page">
    <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
      <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
      <div class="content-wrapper">
        <div class="content-container">
          <div class="content-header">
            <div class="content-text">
              <h1>Upload Document</h1>
              <p>Drop in your study document and turn it into smart flashcards!</p>
            </div>
            <img src="@/assets/book.svg" class="page-icon" alt="Book Icon" />
          </div>

          <div class="progress-container">
            <ProgressCircle :number="1" :isActive="progressStep >= 1" subText="Upload" />
            <ProgressLine :isActive="progressStep >= 2" />
            <ProgressCircle :number="2" :isActive="progressStep >= 2" subText="Review" />
          </div>

          <!-- Step 1: Create -->
          <div v-if="progressStep === 1" class="creation-container">
            <!-- Document Upload (Optional) -->
            <div class="upload-section">
              <div class="section-header">
              </div>
              <UploadBox
                  @file-selected="handleFileSelected"
                  :isUploading="isUploading"
                  :uploadProgress="uploadProgress"
                  :uploadedFile="uploadedDocument"
                  :error="uploadError"
              />
            </div>

            <!-- Prompt Generator (Required) -->
            <div class="prompt-section">
              <div class="section-header">
                <h2>Generate Flashcards</h2>
                <span class="required-badge">Required</span>
              </div>
              <PromptGenerator
                  v-model:prompt="generationPrompt"
                  v-model:count="flashcardCount"
              />
            </div>

            <!-- Generate Button -->
            <div class="button-container">
              <PrimaryButton
                  :text="isGenerating ? 'Generating...' : 'Generate Flashcards'"
                  @click="generateFlashcards"
                  :disabled="!canGenerate || isGenerating || isUploading"
              />
              <p v-if="generationError" class="generation-error">{{ generationError }}</p>
            </div>
          </div>

          <!-- Step 2: Review & Create -->
          <div v-if="progressStep === 2" class="review-container">
            <!-- Set Details -->
            <div class="set-details">
              <h2 class="set-title">{{ generatedSetTitle }}</h2>
              <p class="set-description">{{ generatedSetDescription }}</p>
              <div class="set-stats">
                <span class="stat-item">{{ flashcards.length }} Flashcards</span>
                <span class="stat-divider">•</span>
                <span class="stat-item">Generated {{ formattedDate }}</span>
              </div>
            </div>

            <!-- Visibility Toggle -->
            <div class="visibility-control">
              <div class="visibility-label">Set Visibility:</div>
              <div class="toggle-group">
                <button
                    @click="isPublic = true"
                    :class="['toggle-btn', isPublic ? 'active' : '']"
                >
                  Public
                </button>
                <button
                    @click="isPublic = false"
                    :class="['toggle-btn', !isPublic ? 'active' : '']"
                >
                  Private
                </button>
              </div>
              <div class="visibility-description">
                {{ isPublic ? 'Anyone can view this set' : 'Only you can view this set' }}
              </div>
            </div>

            <!-- Flashcards -->
            <div class="flashcard-container">
              <Flashcard
                  v-for="(card, index) in flashcards"
                  :key="index"
                  :number="index + 1"
                  :question="card.question"
                  :answer="card.answer"
                  @accept="handleAccept"
                  @reject="handleReject"
              />
            </div>

            <div class="button-container">
              <p v-if="setError" class="generation-error">{{ setError }}</p>
              <PrimaryButton
                  :text="isSubmitting ? 'Creating...' : 'Create Flashcard Set'"
                  @click="createFlashcardSet"
                  :disabled="isSubmitting"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref,  computed } from 'vue';
import apolloClient from '@/plugins/apollo.js';
import SidebarNavigation from "@/components/SideNavigation.vue";
import NavigationBar from "@/components/TopNavigation.vue";
import ProgressCircle from "@/components/ProgressCircle.vue";
import ProgressLine from "@/components/ProgressLine.vue";
import UploadBox from "@/components/UploadBox.vue";
import PromptGenerator from "@/components/PromptGenerator.vue"
import PrimaryButton from "@/components/PrimaryButton.vue";
import Flashcard from "@/components/GeneratedFlashcard.vue";
import eventBus from "@/eventBus.js";
import { useRouter } from 'vue-router';
import { UPLOAD_DOCUMENT, GENERATE_FLASHCARDS, CREATE_FLASHCARD_SET } from "@/graphql/auth.js";

// Reactive state
const isSidebarCollapsed = ref(false);
const progressStep = ref(1);
const flashcards = ref([]);
const isPublic = ref(true);

// Document upload state
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadedDocument = ref(null);
const uploadError = ref(null);

// Flashcard generation state
const generationPrompt = ref('');
const flashcardCount = ref(10);
const isGenerating = ref(false);
const generationError = ref(null);
const generatedSetTitle = ref('');
const generatedSetDescription = ref('');
const generationDate = ref(null);

// Flashcard set creation state
const isSubmitting = ref(false);
const setError = ref('');
const showSaved = ref(false);


// Computed properties
const canGenerate = computed(() => {
  return generationPrompt.value.trim().length > 0;
});


const formattedDate = computed(() => {
  if (!generationDate.value) return '';

  const date = new Date(generationDate.value);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
});

// Methods
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const handleFileSelected = async (file) => {
  if (!file) {
    // Reset upload state
    uploadedDocument.value = null;
    uploadError.value = null;
    return;
  }

  isUploading.value = true;
  uploadProgress.value = 0;
  uploadError.value = null;

  try {

    toastFunction("Uploading document...", "info");

    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10;
      }
    }, 300);


    const { data } = await apolloClient.mutate({
      mutation: UPLOAD_DOCUMENT,
      variables: {
        input: file
      }
    });

    clearInterval(progressInterval);
    uploadProgress.value = 90;
    toastFunction("Creating embeddings...", "info");

    const embeddingsInterval = setInterval(() => {
      if (uploadProgress.value < 100) {
        uploadProgress.value += 1;
      } else {
        clearInterval(embeddingsInterval);
      }
    }, 500);

    await new Promise(resolve => setTimeout(resolve, 5000));
    clearInterval(embeddingsInterval);
    uploadProgress.value = 100;

    // Process the upload result
    const uploadResult = data.uploadDocument;
    console.log("Document upload successful:", uploadResult);

    // Store the uploaded document info
    uploadedDocument.value = {
      filename: uploadResult.filename,
      originalFilename: uploadResult.originalFilename,
      size: uploadResult.size,
      contentType: uploadResult.contentType,
      path: `http://localhost:8080/docs/${uploadResult.filename}`
    };

    toastFunction("Document uploaded successfully!", "success");
  } catch (error) {
    console.error("Document upload error:", error);
    uploadError.value = error.message || "Failed to upload document";
    toastFunction("Failed to upload document", "error");
  } finally {
    if (uploadError.value) {
      isUploading.value = false;
    } else {
      setTimeout(() => {
        isUploading.value = false;
      }, 500);
    }
  }
};


const generateFlashcards = async () => {
  if (!canGenerate.value) {
    toastFunction("Please enter what flashcards you want to generate", "error");
    return;
  }

  isGenerating.value = true;
  generationError.value = null;

  try {
    toastFunction("Generating flashcards...", "info");

    const options = {
      query: generationPrompt.value,
      kQuestions: flashcardCount.value
    };

    const { data } = await apolloClient.mutate({
      mutation: GENERATE_FLASHCARDS,
      variables: { options }
    });

    const result = data.generateFlashcardSet;
    console.log("Flashcard generation successful:", result);

    generatedSetTitle.value = result.title || 'Generated Flashcard Set';
    generatedSetDescription.value = result.description || `Generated ${result.generatedFlashcards.length} flashcards`;

    // Set generation date
    generationDate.value = new Date();

    // Transform the generated flashcards to match the expected format
    flashcards.value = result.generatedFlashcards.map(card => ({
      question: card.term,
      answer: card.definition,
      position: card.position
    }));

    // Move to the review step
    progressStep.value = 2;

    toastFunction("Flashcards generated successfully!", "success");
  } catch (error) {
    console.error("Flashcard generation error:", error);
    generationError.value = error.message || "Failed to generate flashcards";
    toastFunction("Failed to generate flashcards", "error");
  } finally {
    isGenerating.value = false;
  }
};

const handleAccept = (number) => {
  // Handle flashcard acceptance logic
  console.log("Accepted flashcard:", number);
};

const handleReject = (number) => {
  // Handle flashcard rejection logic
  console.log("Rejected flashcard:", number);
};

const createFlashcardSet = async () => {
  isSubmitting.value = true;
  setError.value = '';

  try {
    // Create flashcard data in the format needed for the mutation
    const flashcardData = flashcards.value.map((card, index) => ({
      term: card.question,
      definition: card.answer,
      position: index // Zero-based position as required by the schema
    }));

    const { data } = await apolloClient.mutate({
      mutation: CREATE_FLASHCARD_SET,
      variables: {
        input: {
          title: generatedSetTitle.value,
          description: generatedSetDescription.value,
          isPublic: isPublic.value,
          flashcards: flashcardData
        }
      }
    });

    console.log("Flashcard set created:", data.createFlashcardSet);

    showSaved.value = true;
    toastFunction("Flashcard set created successfully!", "success");

    setTimeout(() => {
      router.push(`/view/${data.createFlashcardSet.id}`);
    }, 1500);

  } catch (error) {
    console.error("Error creating flashcard set:", error);
    setError.value = error.message || "Failed to create flashcard set";
    toastFunction("Failed to create flashcard set", "error");
  } finally {
    isSubmitting.value = false;
  }
};

const toastFunction = (message, type) => {
  eventBus.emit('toast', {
    msg: message,
    type: type,
    duration: 3000
  });
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.page {
  display: flex;
}

.main-content {
  flex-grow: 1;
  transition: margin-left 0.3s ease-in-out;
  margin-left: 250px;
  display: flex;
  width: calc(100% - 250px);
  padding-top: 80px;
}

.main-content.collapsed {
  margin-left: 80px;
  width: calc(100% - 80px);
}

.content-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.content-container {
  background: #22293A;
  padding: 50px;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 1000px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px;
}

.content-text {
  text-align: left;
  max-width: 70%;
}

.content-text h1 {
  color: #ffffff;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
  font-family: "Outfit", sans-serif;
}

.content-text p {
  color: #ffffff;
  font-size: 16px;
  margin-bottom: 0;
  font-family: "Outfit", sans-serif;
}

.page-icon {
  width: 170px;
  height: 110px;
}

.progress-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 30px 0;
}

.creation-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.upload-section, .prompt-section {
  width: 90%;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  text-align: left;
}

.section-header h2 {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  font-family: "Outfit", sans-serif;
}

.optional-badge {
  background-color: rgba(95, 152, 239, 0.15);
  color: #5F98EF;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 12px;
  font-family: "Outfit", sans-serif;
  font-weight: 500;
}

.required-badge {
  background-color: rgba(239, 95, 95, 0.15);
  color: #ef5f5f;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 12px;
  font-family: "Outfit", sans-serif;
  font-weight: 500;
}

.flashcard-container {
  background: #121729;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: 90%;
  gap: 20px;
}

.button-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 20px;
  margin-top: 20px;
}

.button-container >>> .primary-button {
  width: 30%;
  max-width: 200px;
}

.generation-error {
  color: #ff5e5e;
  background: rgba(255, 94, 94, 0.1);
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 15px;
  width: 100%;
  max-width: 400px;
  font-family: "Outfit", sans-serif;
  text-align: center;
  align-self: center;
}

.review-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.set-details {
  width: 90%;
  background: #121729;
  border-radius: 12px;
  padding: 25px;
  text-align: left;
}

.set-title {
  color: white;
  font-size: 26px;
  font-weight: 600;
  margin: 0 0 10px 0;
  font-family: "Outfit", sans-serif;
}

.set-description {
  color: #a4aabf;
  font-size: 16px;
  margin: 0 0 15px 0;
  font-family: "Outfit", sans-serif;
  line-height: 1.5;
}

.set-stats {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #5F98EF;
  font-family: "Outfit", sans-serif;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-divider {
  margin: 0 10px;
  color: #3d4663;
}

.success-message {
  color: #27AE60;
  background: rgba(39, 174, 96, 0.1);
  padding: 15px;
  border-radius: 8px;
  font-family: "Outfit", sans-serif;
  text-align: center;
  width: 90%;
  margin-top: 20px;
}

.visibility-control {
  width: 90%;
  background-color: #121729;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.visibility-label {
  color: white;
  font-size: 16px;
  font-weight: 500;
  font-family: "Outfit", sans-serif;
}

.toggle-group {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #2a335a;
}

.toggle-btn {
  background: #1a2233;
  color: #9aa1b3;
  border: none;
  padding: 8px 20px;
  font-family: "Outfit", sans-serif;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: #5F98EF;
  color: white;
}

.visibility-description {
  color: #a4aabf;
  font-size: 14px;
  font-family: "Outfit", sans-serif;
}

</style>
