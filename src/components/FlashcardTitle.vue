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
.flashcard-title {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 24px;
    font-weight: bold;
}
</style>