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
                        {{ $t("warning-change-applies-in-project-only") }}
                    </div>

                    <b-field :type="fieldType" :message="fieldMessage" :label="$t('resolution')">
                        <b-field :type="fieldType">
                            <b-input v-model="calibrationField" expanded />
                            <b-select v-model="calibrationFactor">
                                <option :value="0.001"> {{ $t('nm-per-pixel') }}</option>
                                <option :value="1">{{ $t('um-per-pixel') }}</option>
                                <option :value="1000">{{ $t('mm-per-pixel') }}</option>
                            </b-select>
                        </b-field>
                    </b-field>
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
                let updateImage = this.image.clone();
                updateImage.resolution = this.calibrationField*this.calibrationFactor;
                await updateImage.save();

                this.$emit("setResolution", updateImage.resolution);

                this.$notify({
                    type: "success",
                    text: this.$t("notif-success-image-calibration", {imageName: this.image.instanceFilename})
                });
            }
            catch(error) {
                console.log(error);
                this.$notify({
                    type: "error",
                    text: this.$t("notif-error-image-calibration", {imageName: this.image.instanceFilename})
                });
            }
            this.$emit("update:active", false);
        }
    }
};
</script>

<style scoped>
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
</style>
