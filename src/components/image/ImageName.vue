<template>
<span v-if="resolvedBlindMode">
    <span class="blind-indication">[{{this.$t("blinded-name-indication")}}]</span>
    {{image.blindedName}}
</span>
<span v-else>{{image.instanceFilename}}</span>
</template>

<script>
export default {
    name: "image-name",
    props: {
        image: Object,
        blindMode: { // if not set, the mode of the project saved in store will be used
            type: Boolean,
            default: null
        }
    },
    computed: {
        defaultBlindMode() {
            return this.$store.state.project.project.blindMode;
        },
        resolvedBlindMode() {
            return this.blindMode != null ? this.blindMode : this.defaultBlindMode;
        }
    }
};
</script>

<style scoped>
.blind-indication {
    font-size: 0.9em;
    text-transform: uppercase;
}
</style>
