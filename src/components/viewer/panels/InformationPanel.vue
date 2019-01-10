<template>
<div>
    <h1>{{$t("information")}}</h1>
    <table class="table">
        <tbody>
            <tr>
                <td><strong>{{$t("filename")}}</strong></td>
                <td>{{image.instanceFilename}}</td>
            </tr>
            <tr>
                <td><strong>{{$t("width")}}</strong></td>
                <td>{{image.width}}</td>
            </tr>
            <tr>
                <td><strong>{{$t("height")}}</strong></td>
                <td>{{image.height}}</td>
            </tr>
            <tr>
                <td><strong>{{$t("resolution")}}</strong></td>
                <td>{{resolution}}</td>
            </tr>
            <tr>
                <td><strong>{{$t("magnification")}}</strong></td>
                <td>{{magnification}}</td>
            </tr>
        </tbody>
    </table>

    <div class="buttons">
        <button class="button is-small" @click="calibrationModal = true">
            {{$t("button-set-calibration")}}
        </button>
        <router-link :to="`/project/${image.project}/image/${image.id}/information`" class="button is-small">
            {{$t("button-more-info")}}
        </router-link>
    </div>

    <calibration-modal :image="image"
                       :active.sync="calibrationModal"
                       @setResolution="setResolution"
                       @setScale="startCalibration()" />
</div>
</template>

<script>
import CalibrationModal from "@/components/image/CalibrationModal";

export default {
    name: "information-panel",
    components: {CalibrationModal},
    props: [
        "idViewer",
        "index"
    ],
    data() {
        return {
            calibrationModal: false
        };
    },
    computed: {
        image() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index].imageInstance;
        },
        resolution() {
            if(this.image.resolution != null) {
                return this.image.resolution.toFixed(3);
            }
            else {
                return this.$t("unknown");
            }
        },
        magnification() {
            return this.image.magnification || this.$t("unknown");
        }
    },
    methods: {
        setResolution(resolution) {
            this.$store.commit("setResolution", {idViewer: this.idViewer, idImage: this.image.id, resolution});
        },
        startCalibration() {
            this.calibrationModal = false;
            this.$store.dispatch("startCalibration", {idViewer: this.idViewer, index: this.index});
        }
    }
};
</script>

<style scoped>
.table {
    margin-bottom: 10px !important;
    width: 100%;
    table-layout: fixed;
}

td {
    word-wrap: break-word;
}

td:first-child {
    width: 120px;
}

.buttons {
    justify-content: center;
}
</style>
