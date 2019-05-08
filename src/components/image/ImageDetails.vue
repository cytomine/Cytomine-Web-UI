<template>
<div class="image-details-wrapper">
    <table class="table">
        <tbody>
            <tr v-if="isPropDisplayed('overview')">
                <td class="prop-label">{{$t("overview")}}</td>
                <td class="prop-content" colspan="3">
                    <router-link :to="`/project/${image.project}/image/${image.id}`">
                        <img :src="image.thumb" class="image-overview">
                    </router-link>
                </td>
            </tr>
            <tr v-if="isPropDisplayed('numberOfAnnotations')">
                <td class="prop-label">{{$t("user-annotations")}}</td>
                <td class="prop-content" colspan="3">
                    <router-link :to="`/project/${image.project}/annotations?image=${image.id}`">
                        {{ image.numberOfAnnotations }}
                    </router-link>
                </td>
            </tr>
            <tr v-if="isPropDisplayed('numberOfJobAnnotations')">
                <td class="prop-label">{{$t("analysis-annotations")}}</td>
                <td class="prop-content" colspan="3">
                    <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=algo`">
                        {{ image.numberOfJobAnnotations }}
                    </router-link>
                </td>
            </tr>
            <tr v-if="isPropDisplayed('numberOfReviewedAnnotations')">
                <td class="prop-label">{{$t("reviewed-annotations")}}</td>
                <td class="prop-content" colspan="3">
                    <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=reviewed`">
                        {{ image.numberOfReviewedAnnotations }}
                    </router-link>
                </td>
            </tr>
            <tr v-if="isPropDisplayed('description')">
                <td class="prop-label">{{$t("description")}}</td>
                <td class="prop-content" colspan="3">
                    <cytomine-description :object="image" />
                </td>
            </tr>
            <tr v-if="isPropDisplayed('properties')">
                <td class="prop-label">{{$t("properties")}}</td>
                <td class="prop-content" colspan="3">
                    <cytomine-properties :object="image" />
                </td>
            </tr>
            <tr v-if="isPropDisplayed('attachedFiles')">
                <td class="prop-label">{{$t("attached-files")}}</td>
                <td class="prop-content" colspan="3">
                    <attached-files :object="image" />
                </td>
            </tr>
            <tr v-if="isPropDisplayed('slidePreview')">
                <td class="prop-label">{{$t("slide-preview")}}</td>
                <td class="prop-content" colspan="3">
                    <a v-if="image.macroURL" @click="isMetadataModalActive = true">
                        <img :src="image.macroURL" class="image-overview">
                    </a>
                    <em v-else>
                        {{$t("slide-preview-not-available")}}
                    </em>
                </td>
            </tr>
            <tr v-if="isPropDisplayed('originalFilename') && (!blindMode || canManageProject)">
                <td class="prop-label">{{$t("originalFilename")}}</td>
                <td class="prop-content" colspan="3">
                    {{image.originalFilename}}
                </td>
            </tr>
            <tr v-if="isPropDisplayed('format')">
                <td class="prop-label">{{$t("format")}}</td>
                <td class="prop-content format" colspan="3">
                    {{image.contentType}}
                </td>
            </tr>
            <tr v-if="isPropDisplayed('vendor')">
                <td class="prop-label">{{$t("vendor")}}</td>
                <td class="prop-content" colspan="3">
                    <!-- vendor defined in parent component -->
                    <img v-if="image.vendor" :src="image.vendor.imgPath" :alt="image.vendor.name"
                        :title="image.vendor.name" class="vendor-img">
                    <template v-else>{{$t("unknown")}}</template>
                </td>
            </tr>
            <tr v-if="isPropDisplayed('width')">
                <td class="prop-label">{{$t("image-width")}}</td>
                <td class="prop-content-half">
                    {{image.width}} {{$t("pixels")}}
                    <template v-if="image.physicalSizeX">({{(image.width * image.physicalSizeX).toFixed(3)}} {{$t("um")}})</template>
                </td>
                <template v-if="isPropDisplayed('resolution')">
                    <td class="prop-label">{{$t("resolution")}}</td>
                    <td class="prop-content-half">
                        <template v-if="image.resolution">{{image.resolution.toFixed(3)}} {{$t("um-per-pixel")}}</template>
                        <template v-else>{{$t("unknown")}}</template>
                    </td>
                </template>
            </tr>
            <tr v-if="isPropDisplayed('height')">
                <td class="prop-label">{{$t("image-height")}}</td>
                <td class="prop-content-half">
                    {{image.height}} {{$t("pixels")}}
                    <template v-if="image.physicalSizeY">({{(image.height * image.physicalSizeY).toFixed(3)}} {{$t("um")}})</template>
                </td>
                <template v-if="isPropDisplayed('resolution')">
                    <td class="prop-label">{{$t("resolution")}}</td>
                    <td class="prop-content">
                        <template v-if="image.resolution">{{image.resolution.toFixed(3)}} {{$t("um-per-pixel")}}</template>
                        <template v-else>{{$t("unknown")}}</template>
                    </td>
                </template>
            </tr>
            <tr v-if="isPropDisplayed('depth')">
                <td class="prop-label">{{$t("image-depth")}}</td>
                <td class="prop-content-half">
                    {{$tc("count-slices", image.depth, {count: image.depth})}}
                    <template v-if="image.physicalSizeZ && image.depth > 0">
                        {{(image.depth * image.physicalSizeZ).toFixed(3)}} {{$t("um")}})
                    </template>
                </td>
                <template v-if="isPropDisplayed('resolution')">
                    <td class="prop-label">{{$t("resolution")}}</td>
                    <td class="prop-content">
                        <template v-if="image.resolution">{{image.resolution.toFixed(3)}} {{$t("um-per-pixel")}}</template>
                        <template v-else>{{$t("unknown")}}</template>
                    </td>
                </template>
            </tr>
            <tr v-if="isPropDisplayed('time')">
                <td class="prop-label">{{$t("image-time")}}</td>
                <td class="prop-content-half">
                    {{$tc("count-frames", image.duration, {count: image.duration})}}
                    <template v-if="image.fps && image.duration > 0">
                        ({{formatMinutesSeconds(image.duration / image.fps)}})
                    </template>
                </td>
                <template v-if="isPropDisplayed('fps')">
                    <td class="prop-label">{{$t("frame-rate")}}</td>
                    <td class="prop-content-half">
                        <template v-if="image.fps">{{image.fps.toFixed(3)}} {{$t("frame-per-second")}}</template>
                        <template v-else-if="image.time < 2">-</template>
                        <template v-else>{{$t("unknown")}}</template>
                    </td>
                </template>
            </tr>
            <tr v-if="isPropDisplayed('channels')">
                <td class="prop-label">{{$t("image-channels")}}</td>
                <td class="prop-content" colspan="3">
                    {{$tc("count-bands", image.channels, {count: image.channels})}}
                </td>
            </tr>
            <tr v-if="isPropDisplayed('magnification')">
                <td class="prop-label">{{$t("magnification")}}</td>
                <td class="prop-content" colspan="3">
                    <template v-if="image.magnification">{{image.magnification}}</template>
                    <template v-else>{{$t("unknown")}}</template>
                </td>
            </tr>
            <tr>
                <td class="prop-label">{{$t("actions")}}</td>
                <td class="prop-content" colspan="3">
                    <div class="buttons">
                        <button class="button is-small" @click="isMetadataModalActive = true">
                            {{$t("button-metadata")}}
                        </button>
                        <template v-if="canEdit">
                            <button
                                v-if="!blindMode || canManageProject"
                                class="button is-small"
                                @click="isRenameModalActive = true"
                            >
                                {{$t("button-rename")}}
                            </button>
                            <button class="button is-small" @click="isCalibrationModalActive = true">
                                {{$t("button-set-calibration")}}
                            </button>
                            <button class="button is-small" @click="isMagnificationModalActive = true">
                                {{$t("button-set-magnification")}}
                            </button>
                            <a class="button is-small" :href="image.downloadURL">
                                {{$t("button-download")}}
                            </a>
                            <button class="button is-danger is-small" @click="confirmDeletion()">
                                {{$t("button-delete")}}
                            </button>
                        </template>
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
                        <b-input v-model="newName" />
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

import {formatMinutesSeconds} from "@/utils/video-utils.js";

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
        blindMode() {
            return this.$store.state.project.project.blindMode;
        },
        canManageProject() {
            return this.$store.getters.canManageProject;
        },
        canEdit() {
            return this.$store.getters.canEditImage(this.image);
        },
        emptyNewName() {
            return !this.newName;
        },
        imageNameNotif() {
            return this.blindMode ? this.image.blindedName : this.image.instanceFilename;
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
                message: this.$t("delete-image-confirmation-message", {imageName: this.imageNameNotif}),
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
                    text: this.$t("notif-success-image-deletion", {imageName: this.imageNameNotif})
                });
                this.$emit("delete");
            }
            catch(err) {
                console.log(err);
                this.$notify({
                    type: "error",
                    text: this.$t("notif-error-image-deletion", {imageName: this.imageNameNotif})
                });
            }
        },
        formatMinutesSeconds(time) {
            return formatMinutesSeconds(time);
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

td.prop-content-half {
    width: 50%;
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

.image-overview {
    max-height: 200px;
    max-width: 50vw;
}
</style>
