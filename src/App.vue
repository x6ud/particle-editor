<template>
    <div id="app">
        <editor/>
    </div>
</template>

<script>
    import Editor from './Editor.vue'

    export default {
        components: {Editor}
    }
</script>

<style>
    html {
        width: 100%;
        height: 100%;
    }

    body {
        width: 100%;
        height: 100%;
        margin: 0;
    }

    #app {
        width: 100%;
        height: 100%;
    }
</style>
