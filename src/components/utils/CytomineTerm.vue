<template>
<span v-if="term">
    <div class="color-preview" :style="{background: term.color}"></div>
    {{term.name}}
</span>
</template>

<script>
export default {
    name: "cytomine-term",
    props: ["term"]
};
</script>

<style scoped>
.color-preview {
    width: 12px;
    height: 12px;
    display: inline-block;
    margin-right: 3px;
    border-radius: 3px;
    box-shadow: 0px 0px 1px #777;
    position: relative;
    top: 2px;
}
</style>
