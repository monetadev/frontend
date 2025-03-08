<template>
    <div class="flashcard" :class="{ flipped: isFlipped }" @click="flipCard">
        <div class="flashcard-inner">
            <div class="flashcard-front">
                <slot name="front" v-if="!frontContent">{{ frontContent }}</slot>
            </div>
            <div class="flashcard-back">
                <slot name="back" v-if="!backContent">{{ backContent }}</slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'FlashCard',
    props: {
        frontContent: {
            type: String,
            default: ''
        },
        backContent: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            isFlipped: false
        };
    },
    methods: {
        flipCard() {
            this.isFlipped = !this.isFlipped;
        }
    }
};
</script>

<style scoped>
.flashcard {
    perspective: 1000px;
    width: 1071px;
    height: 584.44px;
    margin: auto;
    cursor: pointer;
    border-radius: 50px;
    border: 1px solid #000;
    background: var(--Black, #121729);
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
}

.flashcard-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.6s;
    transform-style: preserve-3d;
}

.flashcard.flipped .flashcard-inner {
    transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    color: white;  
    display: flex; 
    align-items: center; 
    justify-content: center;
    padding: 20px; 
}

.flashcard-back {
    transform: rotateY(180deg);
}

</style>