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
              <p>Drop in your study document and instantly turn it into smart flashcards!</p>
            </div>
            <img src="@/assets/book.svg" class="page-icon" alt="Book Icon" />
          </div>

          <div class="progress-container">
            <ProgressCircle :number="1" :isActive="progressStep >= 1" subText="Upload" />
            <ProgressLine :isActive="progressStep >= 2" />
            <ProgressCircle :number="2" :isActive="progressStep >= 2" subText="Review" />
            <ProgressLine :isActive="progressStep >= 3" />
            <ProgressCircle :number="3" :isActive="progressStep >= 3" subText="Organize" />
          </div>

          <UploadBox v-if="progressStep === 1" />

          <div  v-if="progressStep === 1" class="button-container">
            <PrimaryButton text="Generate" @click="goToReview" />
          </div>

          <div v-if="progressStep === 2" class="flashcard-container">
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

          <div  v-if="progressStep === 2" class="button-container">
            <PrimaryButton text="Organize" @click="goToOrganize" />
          </div>

          <div v-if="progressStep === 3" class="organize-section">

            <div class="form-group">
              <label>Institution</label>
              <input
                  type="text"
                  v-model="searchInstitution"
                  @focus="toggleDropdown('institution')"
                  @input="filterInstitutions"
                  placeholder="Search Institution"
              />
              <ul v-if="showDropdown === 'institution'" class="dropdown">
                <li
                    v-for="(institution, index) in filteredInstitutions"
                    :key="index"
                    @click="selectInstitution(institution)"
                >
                  {{ institution }}
                </li>
              </ul>
            </div>

            <div class="form-group">
              <label>Course</label>
              <input
                  type="text"
                  v-model="searchCourse"
                  @focus="toggleDropdown('course')"
                  @input="filterCourses"
                  placeholder="Search Course"
              />
              <ul v-if="showDropdown === 'course'" class="dropdown">
                <li
                    v-for="(course, index) in filteredCourses"
                    :key="index"
                    @click="selectCourse(course)"
                >
                  {{ course }}
                </li>
              </ul>
            </div>

            <div class="form-group">
              <label>Title</label>
              <input
                  type="text"
                  v-model="courseCode"
                  placeholder="Enter Title for Flashcard Set"
              />
            </div>

            <div class="form-group privacy-toggle">
              <label>Privacy</label>
              <label class="custom-switch">
                <input type="checkbox" v-model="isPrivate" />
                <span class="custom-slider">{{ isPrivate ? 'Private' : 'Public' }}</span>
              </label>
            </div>

          </div>
          <div  v-if="progressStep === 3" class="button-container">
            <PrimaryButton text="Save" @click="saveFlashCards" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SidebarNavigation from "@/components/SideNavigation.vue";
import NavigationBar from "@/components/TopNavigation.vue";
import ProgressCircle from "@/components/ProgressCircle.vue";
import ProgressLine from "@/components/ProgressLine.vue";
import UploadBox from "@/components/UploadBox.vue";
import PrimaryButton from "@/components/PrimaryButton.vue";
import Flashcard from "@/components/GeneratedFlashcard.vue";

export default {
  name: "AddFlashcard",
  components: {
    PrimaryButton,
    ProgressLine,
    ProgressCircle,
    SidebarNavigation,
    NavigationBar,
    UploadBox,
    Flashcard,
  },
  data() {
    return {
      isSidebarCollapsed: false,
      progressStep: 1,
      flashcards: [],
      selectedInstitution: null,
      selectedCourse: null,
      searchInstitution: "",
      searchCourse: "",
      courseCode: "",
      isPrivate: true,
      showDropdown: null,
      institutions: [
        "Farmingdale State College",
        "Stonybrook University",
        "New York University",
        "Yale University",
        "Columbia University",
        "Cornell University",
        "Princeton University",
        "Harvard University",
        "Massachusetts Institute of Technology",
        "University of Pennsylvania",
        "Boston University",
        "Syracuse University",
        "University at Buffalo",
        "Binghamton University",
        "Hofstra University",
      ],
      courses: [
        "BIO101",
        "CHEM 130",
        "CHEM 101",
        "CSC 343",
        "MATH 201",
        "PHY 102",
        "ENG 101",
        "PSY 110",
        "SOC 210",
        "HIS 105",
        "ART 100",
        "CSC 101",
        "MATH 130",
        "BIO 202",
        "CHEM 240",
        "PHY 201",
        "CSC 212",
        "PHIL 101",
        "ECO 102",
        "MUS 105",
        "CSC 410",
        "MATH 301",
        "BIO 150",
        "AST 100",
        "CHM 120",
        "CSC 230",
        "ENG 205",
        "PSY 250",
        "HIS 210",
        "CSC 350",
        "PHY 301",
      ],
      filteredInstitutions: [],
      filteredCourses: []
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    goToReview() {
      if (this.progressStep === 1) {
        this.progressStep = 2;
        this.flashcards = [
          {
            question: "What is atomic theory?",
            answer: "A theoretical model stating that atoms are tiny, submicroscopic particles that make up all chemical substances and everything in the macroscopic world.",
          },
          {
            question: "What does the plum pudding model show?",
            answer: "An atom is a ball of positively charged material with negatively charged particles floating around inside.",
          },
          {
            question: "What did Lavoisier contribute toward the Atomic Theory?",
            answer: "Proposed the Law of Conservation of Matter and created the metric system.",
          },
          {
            question: "What does the Law of Conservation of Matter state?",
            answer: "Matter cannot be created or destroyed. It can only be converted into other matter.",
          },
        ];
      }
    },

    handleAccept(number) {
      //backend
    },
    handleReject(number) {
      //backend
    },
    goToOrganize() {
      this.progressStep = 3;
    },
    toggleDropdown(type) {
      this.showDropdown = this.showDropdown === type ? null : type;
    },
    selectInstitution(institution) {
      this.selectedInstitution = institution;
      this.searchInstitution = institution;
      this.showDropdown = null;
    },
    selectCourse(course) {
      this.selectedCourse = course;
      this.searchCourse = course;
      this.showDropdown = null;
    },
    filterInstitutions() {
      this.filteredInstitutions = this.institutions.filter(inst =>
          inst.toLowerCase().includes(this.searchInstitution.toLowerCase())
      );
    },
    filterCourses() {
      this.filteredCourses = this.courses.filter(course =>
          course.toLowerCase().includes(this.searchCourse.toLowerCase())
      );
    }
  },
  mounted() {
    this.filteredInstitutions = [...this.institutions];
    this.filteredCourses = [...this.courses];
  }
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
  justify-content: flex-end;
  padding: 20px;
  margin-top: 20px;
}

.button-container >>> .primary-button {
  width: 30%;
  max-width: 200px;
}
.organize-section {
  background: #121729;
  padding: 25px;
  border-radius: 12px;
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: "Outfit", sans-serif;
  color: #fff;
}


.form-group {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  width: 100%;
  gap: 20px;
}

.form-group label {
  width: 120px;
  font-size: 18px;
  font-weight: 500;
  text-align: left;
}

.privacy-toggle .toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
}

.privacy-toggle {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  gap: 20px;
}


.form-group input {
  flex-grow: 1;
  padding: 15px 20px;
  border-radius: 8px;
  border: 2px solid transparent;
  font-size: 16px;
  font-family: "Outfit", sans-serif;
  background-color: #252939;
  color: #fff;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  border-color: #5F98EF;
}


.dropdown {
  background: #252939;
  color: #fff;
  border-radius: 8px;
  margin-top: 8px;
  width: 100%;
  list-style: none;
  padding: 0;
  border: 1px solid #444;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown li {
  padding: 15px 20px;
  cursor: pointer;
  font-size: 14px;
  font-family: "Outfit", sans-serif;
}

.dropdown li:hover {
  background: #5F98EF;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  width: 100%;
}

</style>
