<template>
  <div class="progress-line" :class="{active: isActive}"></div>
</template>

<script>
export default {
  props: {
    isActive:{
      type: Boolean,
      default: false
    }
  }
};
</script>


<style scoped>
.progress-line{
  width: 30%;
  height: 2px;
  background-color: #121729;
  margin-left: 20px;
  margin-right: 20px;
  transition: background-color 0.3s ease;
}
.progress-line.active {
  background-color: #5F98EF;
}

</style>