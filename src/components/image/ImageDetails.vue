<template>
<div class="image-details-wrapper">
    <table class="table">
        <tbody>
            <tr v-if="isPropDisplayed('overview')">
                <td class="prop-label">{{$t("overview")}}</td>
                <td class="prop-content">
                    <router-link :to="`/project/${image.project}/image/${image.id}`">
                        <img :src="image.thumb" :alt="image.instanceFilename" class="image-overview">
                    </router-link>
                </td>
            </tr>
            <tr v-if="isPropDisplayed('numberOfAnnotations')">
                <td class="prop-label">{{$t("user-annotations")}}</td>
                <td class="prop-content">
                    <router-link :to="`/project/${image.project}/annotations?image=${image.id}`">
                        {{ image.numberOfAnnotations }}
                    </router-link>
                </td>
            </tr>
            <tr v-if="isPropDisplayed('numberOfJobAnnotations')">
                <td class="prop-label">{{$t("analysis-annotations")}}</td>
                <td class="prop-content">
                    <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=algo`">
                        {{ image.numberOfJobAnnotations }}
                    </router-link>
                </td>
            </tr>
            <tr v-if="isPropDisplayed('numberOfReviewedAnnotations')">
                <td class="prop-label">{{$t("reviewed-annotations")}}</td>
                <td class="prop-content">
                    <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=reviewed`">
                        {{ image.numberOfReviewedAnnotations }}
                    </router-link>
                </td>
            </tr>
            <tr v-if="isPropDisplayed('description')">
                <td class="prop-label">{{$t("description")}}</td>
                <td class="prop-content">
                    <cytomine-description :object="image"></cytomine-description>
                </td>
            </tr>
            <tr v-if="isPropDisplayed('properties')">
                <td class="prop-label">{{$t("properties")}}</td>
                <td class="prop-content">
                    <cytomine-properties :object="image"></cytomine-properties>
                </td>
            </tr>
            <tr v-if="isPropDisplayed('attachedFiles')">
                <td class="prop-label">{{$t("attached-files")}}</td>
                <td class="prop-content">
                    <attached-files :object="image"></attached-files>
                </td>
            </tr>
            <tr v-if="isPropDisplayed('thumbnail')">
                <td class="prop-label">{{$t("thumbnail")}}</td>
                <td class="prop-content">
                    <a @click="isMetadataModalActive = true">
                        <img :src="image.macroURL" :alt="image.instanceFilename" class="image-overview"> <!-- TODO in backend: do not return anything when thumb not available instead of returning overview? -->
                    </a>
                </td>
            </tr>
            <tr v-if="isPropDisplayed('originalFilename')">
                <td class="prop-label">{{$t("originalFilename")}}</td>
                <td class="prop-content">
                    {{image.originalFilename}}
                </td>
            </tr>
            <tr v-if="isPropDisplayed('format')">
                <td class="prop-label">{{$t("format")}}</td>
                <td class="prop-content format">
                    {{image.extension}}
                </td>
            </tr>
            <tr v-if="isPropDisplayed('vendor')">
                <td class="prop-label">{{$t("vendor")}}</td>
                <td class="prop-content">
                    <!-- vendor defined in parent component -->
                    <img v-if="image.vendor" :src="image.vendor.imgPath" :alt="image.vendor.name"
                        :title="image.vendor.name" class="vendor-img">
                    <template v-else>{{$t("unknown")}}</template>
                </td>
            </tr>
            <tr v-if="isPropDisplayed('size')">
                <td class="prop-label">{{$t("image-size")}}</td>
                <td class="prop-content">
                    {{`${image.width} x ${image.height} ${$t("pixels")}`}}
                </td>
            </tr>
            <tr v-if="isPropDisplayed('resolution')">
                <td class="prop-label">{{$t("resolution")}}</td>
                <td class="prop-content">
                    <template v-if="image.resolution">{{image.resolution.toFixed(3)}} {{$t("um-per-pixel")}}</template>
                    <template v-else>{{$t("unknown")}}</template>
                </td>
            </tr>
            <tr v-if="isPropDisplayed('magnification')">
                <td class="prop-label">{{$t("magnification")}}</td>
                <td class="prop-content">
                    <template v-if="image.magnification">{{image.magnification}}</template>
                    <template v-else>{{$t("unknown")}}</template>
                </td>
            </tr>
            <tr>
                <td class="prop-label">{{$t("actions")}}</td>
                <td class="prop-content">
                    <div class="buttons">
                        <button class="button is-small" @click="isRenameModalActive = true">
                            {{$t("button-rename")}}
                        </button>
                        <button class="button is-small" @click="isMetadataModalActive = true">
                            {{$t("button-metadata")}}
                        </button>
                        <button class="button is-small" @click="isCalibrationModalActive = true">
                            {{$t("button-set-calibration")}}
                        </button>
                        <button class="button is-small" @click="isMagnificationModalActive = true">
                            {{$t("button-set-magnification")}}
                        </button>
                        <a class="button is-small" :href="image.downloadURL">{{$t("button-download")}}</a>
                        <button class="button is-danger is-small" @click="confirmDeletion()">{{$t("button-delete")}}</button>
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

    <magnification-modal
        :image="image"
        :active.sync="isMagnificationModalActive"
        @setMagnification="(event) => $emit('setMagnification', event)"
    />

    <calibration-modal
        :image="image"
        :active.sync="isCalibrationModalActive"
        @setResolution="(event) => $emit('setResolution', event)"
    />

    <image-metadata-modal
        :active.sync="isMetadataModalActive"
        :idAbstractImage="image.baseImage"
    />
</div>
</template>

<script>
import CytomineDescription from "@/components/description/CytomineDescription";
import CytomineProperties from "@/components/property/CytomineProperties";
import AttachedFiles from "@/components/attached-file/AttachedFiles";
import MagnificationModal from "./MagnificationModal";
import CalibrationModal from "./CalibrationModal";
import ImageMetadataModal from "./ImageMetadataModal";

import {ImageInstance} from "cytomine-client";

export default {
    name: "image-details",
    components: {
        CytomineDescription,
        CytomineProperties,
        AttachedFiles,
        MagnificationModal,
        CalibrationModal,
        ImageMetadataModal
    },
    props: {
        image: {type: Object},
        excludedProperties: {type: Array, default: () => []}
    },
    data() {
        return {
            isRenameModalActive: false,
            newName: "",
            isCalibrationModalActive: false,
            isMagnificationModalActive: false,
            isMetadataModalActive: false,
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
        }
    },
    methods: {
        isPropDisplayed(prop) {
            return !this.excludedProperties.includes(prop);
        },

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

        confirmDeletion() {
            this.$dialog.confirm({
                title: this.$t("delete-image"),
                message: this.$t("delete-image-confirmation-message", {imageName: this.image.instanceFilename}),
                type: "is-danger",
                confirmText: this.$t("button-confirm"),
                cancelText: this.$t("button-cancel"),
                onConfirm: this.deleteImage
            });
        },
        async deleteImage() {
            try {
                await ImageInstance.delete(this.image.id);
                this.$notify({
                    type: "success",
                    text: this.$t("notif-success-image-deletion", {imageName: this.image.instanceFilename})
                });
                this.$emit("delete");
            }
            catch(err) {
                console.log(err);
                this.$notify({
                    type: "error",
                    text: this.$t("notif-error-image-deletion", {imageName: this.image.instanceFilename})
                });
            }
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
    font-weight: 600;
}

td.prop-content {
    width: 100%;
}

.format {
    text-transform: uppercase;
}

.vendor-img {
    max-height: 40px;
    max-width: 150px;
}

.image-overview {
    max-height: 200px;
    max-width: 50vw;
}
</style>
