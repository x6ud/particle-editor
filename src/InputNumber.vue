<template>
    <input type="text" :value="value" @change="input" ref="input">
</template>

<script>
    export default {
        props: {
            value: {}
        },
        methods: {
            input() {
                this.$emit('input', this.$refs.input.value - 0);
            }
        }
    };
</script>
