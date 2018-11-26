<template>
<div>
    <h1>{{$t("link-images")}}</h1>
    <p>{{$t("link-view-with")}}</p>
    <p v-for="(map, idx) in maps" v-if="idx != index" :key="idx">
        <input type="checkbox" 
               :checked="linkedIndexes.includes(idx)" 
               @change="event => handleCheckboxChange(idx, event.target.checked)">
        {{$t("viewer-view")}} {{idx + 1}} ({{map.imageInstance.instanceFilename}}) 
    </p>
</div>
</template>

<script>
export default {
    name: "link-panel",
    props: [
        "idViewer",
        "index"
    ],
    computed: {
        viewerWrapper() {
            return this.$store.state.images.viewers[this.idViewer];
        },
        maps() {
            return this.viewerWrapper.maps;
        },
        linkedIndexes() {
            return this.viewerWrapper.links.find(group => group.includes(this.index)) || [];
        }
    },
    methods: {
        handleCheckboxChange(indexLinked, checked) {
            if(checked) {
                this.$store.commit("linkMaps", {idViewer: this.idViewer, indexes: [this.index, indexLinked]});
            }
            else {
                this.$store.commit("unlinkMap", {idViewer: this.idViewer, index: this.index});
            }
        }
    }
};
</script>