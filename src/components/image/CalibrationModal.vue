<template>
<div class="image-calibration-wrapper">
    <b-modal :active="active" @close="$emit('update:active', false)" :has-modal-card="true">
        <form>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">{{$t("calibrate-image")}}</p>
                </header>
                <section class="modal-card-body">
                    <div class="modal-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        {{ $t("warning-change-applies-in-all-projects") }}
                    </div>

                    <div class="columns">
                        <b-field class="column" :type="fieldType" :message="fieldMessage" :label="$t('resolution')">
                            <b-field :type="fieldType">
                                <b-input v-model="calibrationField" expanded></b-input>
                                <b-select v-model="calibrationFactor">
                                    <option :value="0.001"> {{ $t('nm-per-pixel') }}</option>
                                    <option :value="1">{{ $t('um-per-pixel') }}</option>
                                    <option :value="1000">{{ $t('mm-per-pixel') }}</option>
                                </b-select>
                            </b-field>
                        </b-field>
                    </div>
                </section>
                <footer class="modal-card-foot">
                    <button class="button" type="button" @click="$emit('update:active', false)">
                        {{$t("button-cancel")}}
                    </button>
                    <button class="button is-link" :disabled="!validField" @click="setResolution()">
                        {{$t("button-save")}}
                    </button>
                </footer>
            </div>
        </form>
    </b-modal>
</div>
</template>

<script>
import {AbstractImage} from "cytomine-client";

export default {
    name: "calibration-modal",
    props: {
        active: {type: Boolean},
        image: {type: Object}
    },
    data() {
        return {
            calibrationField: "",
            calibrationFactor: 1,
            displayErrors: false
        };
    },
    computed: {
        validField() {
            return !isNaN(this.calibrationField) && +this.calibrationField > 0;
        },
        fieldType() {
            return !this.validField && this.displayErrors ? "is-danger" : null;
        },
        fieldMessage() {
            return !this.validField && this.displayErrors ? this.$t("must-be-positive-number") : "";
        }
    },
    watch: {
        active(val) {
            if(val) {
                this.calibrationField = this.image.resolution;
                this.displayErrors = false;
            }
        },
        calibrationField() {
            if(this.calibrationField != this.image.resolution) {
                this.displayErrors = true;
            }
        }
    },
    methods: {
        async setResolution() {
            try {
                let baseImage = await AbstractImage.fetch(this.image.baseImage);
                baseImage.resolution = this.calibrationField*this.calibrationFactor;
                await baseImage.save(); // TODO in core: update the permiter and area properties of annotations created in this image (https://github.com/cytomine/Cytomine-core/issues/1147)

                this.$emit("setResolution", baseImage.resolution);

                this.$notify({
                    type: "success",
                    text: this.$t("notif-success-image-calibration", {imageName: this.image.originalFilename})
                });
            }
            catch(error) {
                console.log(error);
                this.$notify({
                    type: "error",
                    text: this.$t("notif-error-image-calibration", {imageName: this.image.originalFilename})
                });
            }
            this.$emit("update:active", false);
        }
    }
};
</script>

<style scoped>
.button {
    margin-right: 0.5rem;
}

.modal-warning {
    display: flex;
    margin-bottom: 15px;
    align-items: center;
    padding: 5px;
    border-left: 3px solid rgb(255, 120, 0);
    border-radius: 4px;
    background: rgba(255, 69, 0, 0.05);
}
.modal-warning .fas {
    margin-left: 10px;
    margin-right: 20px;
    font-size: 16px;
    color: rgb(255, 120, 0);
}

.columns {
    align-items: flex-end;
    margin-bottom: 0px !important;
}
</style>

<style>
.image-calibration-wrapper .field {
    margin-bottom: 0px !important;
}

.image-calibration-wrapper .modal .button {
    margin-bottom: 0px !important;
}
</style>