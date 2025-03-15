<template>
    <div class="time-divider">
        <!-- datetime -->
        <span>{{ time }}</span> 
        <hr />
    </div>
</template>

<script>
export default {
    name: 'TimeDivider',
    props: {
        time: {
            time: String,
            required: true
        }
    }
}
</script>

<style scoped>
.time-divider {
    display: flex;
    align-items: center;
}

.time-divider hr {
    flex-grow: 1;
    margin-left: 10px;
    width: 75%;
}
</style>