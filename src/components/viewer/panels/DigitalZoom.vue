<template>
<div>
    <h1>{{$t("digital-zoom")}}</h1>
    <b-checkbox v-model="digitalZoom">
        {{$t("digital-zoom-checkbox-label")}}
    </b-checkbox>
</div>
</template>

<script>
import constants from "@/utils/constants";

export default {
    name: "digital-zoom",
    props: {
        idViewer: String,
        index: Number
    },
    computed: {
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        image() {
            return this.imageWrapper.imageInstance;
        },

        digitalZoom: {
            get() {
                return this.imageWrapper.digitalZoom;
            },
            set(value) {
                this.$store.commit("setDigitalZoom", {
                    idViewer: this.idViewer,
                    index: this.index,
                    digitalZoom: Boolean(value)
                });
            }
        },

        maxZoom: {
            get() {
                return this.imageWrapper.maxZoom;
            },
            set(value) {
                this.$store.commit("setMaxZoom", {
                    idViewer: this.idViewer,
                    index: this.index,
                    maxZoom: Number(value)
                });
            }
        },
    },
    watch: {
        digitalZoom() {
            let increment = this.digitalZoom ? constants.DIGITAL_ZOOM_INCREMENT : 0;
            this.maxZoom = this.image.depth + increment;
        }
    }
};
</script>
