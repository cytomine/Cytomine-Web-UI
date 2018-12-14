<template>
<div class="image-details-wrapper">
    <table class="table">
        <tbody>
            <tr>
                <td class="prop-label"><strong>{{$t("description")}}</strong></td>
                <td class="prop-content">
                    <cytomine-description :object="image"></cytomine-description>
                </td>
            </tr>
            <tr>
                <td class="prop-label"><strong>{{$t("tags")}}</strong></td>
                <td class="prop-content">
                    <div class="tags"> <!-- TODO: handle in backend, and retrieve dynamically -->
                        <span class="tag is-rounded is-info">Demo</span>
                        <span class="tag is-rounded is-info">CHU</span>
                    </div>
                </td>
            </tr>
            <tr>
                <td class="prop-label"><strong>{{$t("properties")}}</strong></td>
                <td class="prop-content">
                    <cytomine-properties :object="image"></cytomine-properties>
                </td>
            </tr>
            <tr>
                <td class="prop-label"><strong>{{$t("thumbnail")}}</strong></td>
                <td class="prop-content">
                    <img :src="image.macroURL" :alt="image.instanceFilename" class="image-overview">
                </td>
            </tr>
            <tr>
                <td class="prop-label"><strong>{{$t("originalFilename")}}</strong></td>
                <td class="prop-content">
                    {{image.originalFilename}}
                </td>
            </tr>
            <tr>
                <td class="prop-label"><strong>{{$t("format")}}</strong></td>
                <td class="prop-content format">
                    {{image.extension}}
                </td>
            </tr>
            <tr>
                <td class="prop-label"><strong>{{$t("vendor")}}</strong></td>
                <td class="prop-content">
                    <!-- vendor defined in parent component -->
                    <img v-if="image.vendor" :src="image.vendor.imgPath" :alt="image.vendor.name"
                        :title="image.vendor.name" class="vendor-img">
                    <template v-else>{{$t("unknown")}}</template>
                </td>
            </tr>
            <tr>
                <td class="prop-label"><strong>{{$t("image-size")}}</strong></td>
                <td class="prop-content">
                    {{`${image.width} x ${image.height} ${$t("pixels")}`}}
                </td>
            </tr>
            <tr>
                <td class="prop-label"><strong>{{$t("resolution")}}</strong></td>
                <td class="prop-content">
                    {{image.resolutionFormatted}}
                </td>
            </tr>
            <tr>
                <td class="prop-label"><strong>{{$t("actions")}}</strong></td>
                <td class="prop-content">
                    <div class="buttons">
                        <button class="button is-small" @click="isRenameModalActive = true">
                            {{$t("button-rename")}}
                        </button>
                        <button class="button is-small" @click="isCalibrationModalActive = true">
                            {{$t("button-set-calibration")}}
                        </button>
                        <a class="button is-small" href="">{{$t("button-download")}}</a> <!-- TODO -->
                        <button class="button is-danger is-small" @click="deleteImage()">{{$t("button-delete")}}</button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>

    <b-modal :active="isRenameModalActive" has-modal-card @close="isRenameModalActive = false">
        <form>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">{{$t("rename-image")}}</p>
                </header>
                <section class="modal-card-body">
                    <b-field :label="$t('enter-new-name-of-image')"
                             :type="emptyNewName ? 'is-danger' : null"
                             :message="emptyNewName ? $t('field-cannot-be-empty') : ''">
                        <b-input v-model="newName"></b-input>
                    </b-field>
                </section>
                <footer class="modal-card-foot">
                    <button class="button" type="button" @click="isRenameModalActive = false">
                        {{$t("button-cancel")}}
                    </button>
                    <button class="button is-link" @click="rename()" :disabled="emptyNewName">
                        {{$t("button-save")}}
                    </button>
                </footer>
            </div>
        </form>
    </b-modal>

    <b-modal :active="isCalibrationModalActive" has-modal-card @close="isCalibrationModalActive = false">
        <form>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">{{$t("calibrate-image")}}</p>
                </header>
                <section class="modal-card-body">
                    <div class="modal-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        {{ $t("warning-calibration-applies-in-all-projects") }}
                    </div>

                    <b-field :label="`${$t('resolution')} (${$t('um-per-pixel')})`">
                        <b-input v-model="newResolution"></b-input>
                    </b-field>
                    <b-field :label="$t('magnification')">
                        <b-input v-model="newMagnification"></b-input>
                    </b-field>
                </section>
                <footer class="modal-card-foot">
                    <button class="button" type="button" @click="isCalibrationModalActive = false">
                        {{$t("button-cancel")}}
                    </button>
                    <button class="button is-link" @click="setCalibration()">
                        {{$t("button-save")}}
                    </button>
                </footer>
            </div>
        </form>
    </b-modal>
</div>
</template>

<script>
import CytomineDescription from "@/components/description/CytomineDescription";
import CytomineProperties from "@/components/property/CytomineProperties";

import {AbstractImage} from "cytomine-client";

export default {
    name: "image-details",
    components: {
        CytomineDescription,
        CytomineProperties
    },
    props: ["image"],
    data() {
        return {
            isRenameModalActive: false,
            newName: "",

            isCalibrationModalActive: false,
            newResolution: "",
            newMagnification: "",
        };
    },
    computed: {
        emptyNewName() {
            return this.newName.length == 0;
        }
    },
    watch: {
        isRenameModalActive(val) {
            if(val) {
                this.newName = this.image.instanceFilename;
            }
        },
        isCalibrationModalActive(val) {
            if(val) {
                this.newResolution = this.image.resolution;
                this.newMagnification = this.image.magnification;
            }
        }
    },
    methods: {
        async rename() {
            let oldName = this.image.instanceFilename;
            try {
                this.image.instanceFilename = this.newName;
                await this.image.save();
                this.$notify({
                    type: "success",
                    text: this.$t("notif-success-image-rename", {imageName: this.image.instanceFilename})
                });
            }
            catch(error) {
                console.log(error);
                this.$notify({
                    type: "error",
                    text: this.$t("notif-error-image-rename", {imageName: oldName})
                });
            }
            this.isRenameModalActive = false;
        },

        async setCalibration() {
            try {
                let baseImage = await AbstractImage.fetch(this.image.baseImage);
                baseImage.resolution = this.newResolution;
                baseImage.magnification = this.newMagnification;
                await baseImage.save();

                this.$emit("setCalibration", {
                    resolution: baseImage.resolution,
                    magnification: baseImage.magnification
                });

                this.$notify({
                    type: "success",
                    text: this.$t("notif-success-image-calibration", {imageName: baseImage.originalFilename})
                });
            }
            catch(error) {
                console.log(error);
                this.$notify({
                    type: "error",
                    text: this.$t("notif-error-image-calibration", {imageName: this.image.originalFilename})
                });
            }
            this.isCalibrationModalActive = false;
        },

        deleteImage() {
            this.$dialog.confirm({
                title: this.$t("delete-image"),
                message: this.$t("delete-image-confirmation-message", {imageName: this.image.instanceFilename}),
                type: "is-danger",
                confirmText: this.$t("button-confirm"),
                cancelText: this.$t("button-cancel"),
                onConfirm: () => this.$emit("delete")
            });
        }
    }
};
</script>

<style scoped>
.table {
    background: none;
    position: relative;
    margin-bottom: 0px !important;
}

td.prop-label {
    white-space: nowrap;
}

td.prop-content {
    width: 100%;
}

.tag {
    font-size: 10px !important;
    font-weight: 600;
}

.format {
    text-transform: uppercase;
}

.vendor-img {
    max-height: 40px;
    max-width: 150px;
}

.modal-warning {
    display: flex;
    margin-bottom: 15px;
    align-items: center;
    padding: 5px;
    border: 2px solid rgb(255, 120, 0);
    border-width: 2px 0px 2px;
    border-radius: 5px;
    background: rgba(255, 69, 0, 0.05);
}
.modal-warning .fas {
    margin-left: 10px;
    margin-right: 20px;
    font-size: 16px;
    color: rgb(255, 120, 0);
}
</style>
