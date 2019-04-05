<template>
<div>
    <h1>{{$t("link-images")}}</h1>

    <p>{{$t("link-view-with")}}</p>
    <p v-for="(map, idx) in maps" v-if="idx !== index" :key="idx">
        <b-checkbox
            :value="revisionCheckboxes && linkedIndexes.includes(idx)"
            @input="value => handleCheckboxChange(idx, value)"
        >
            {{$t("viewer-view")}} {{idx + 1}} (<image-name :image="map.imageInstance" />)
        </b-checkbox>
    </p>
</div>
</template>

<script>
import ImageName from "@/components/image/ImageName";

export default {
    name: "link-panel",
    components: {ImageName},
    props: {
        idViewer: String,
        index: Number
    },
    data() {
        return {
            revisionCheckboxes: 1
        };
    },
    computed: {
        viewerWrapper() {
            return this.$store.state.images.viewers[this.idViewer];
        },
        maps() {
            return this.viewerWrapper.maps;
        },
        linkedIndexes() {
            return this.viewerWrapper.links.find(group => group.includes(this.index)) || [];
        },
        trackedUser() {
            return this.viewerWrapper.maps[this.index].trackedUser;
        },
    },
    methods: {
        handleCheckboxChange(indexLinked, checked) {
            if(checked) {
                if(this.trackedUser) {
                    this.$dialog.confirm({
                        title: this.$t("possible-conflict"),
                        message: this.$t("confirm-untrack-to-link-view"),
                        confirmText: this.$t("button-confirm"),
                        cancelText: this.$t("button-cancel"),
                        onConfirm: () => {
                            this.$store.commit("setTrackedUser", {idViewer: this.idViewer, index: this.index, idUser: null});
                            this.linkMaps(indexLinked);
                        },
                        onCancel: () => this.revisionCheckboxes++ // To force the update of the checkbox state
                    });
                }
                else {
                    this.linkMaps(indexLinked);
                }
            }
            else {
                this.$store.commit("unlinkMap", {idViewer: this.idViewer, index: this.index});
            }
        },

        linkMaps(indexLinked) {
            this.$store.commit("linkMaps", {idViewer: this.idViewer, indexes: [this.index, indexLinked]});
        }
    }
};
</script>
