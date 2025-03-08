<template>
    <div class="flashcard-title">
        <h1>{{ title }}</h1>
    </div>
</template>

<script>
export default {
    name: 'FlashcardTitle',
    props: {
        title: {
            type: String,
            required: true
        }
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');

.flashcard-title {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 40px;
    font-weight: 700;
    font-family: Outfit;
    font-style: normal;
    line-height: normal;
}
</style>