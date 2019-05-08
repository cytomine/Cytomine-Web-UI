<template>
<div class="image-calibration-wrapper">
    <b-modal :active="active" @close="$emit('update:active', false)" :has-modal-card="true">
        <form>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">{{$t("calibrate-image")}}</p>
                </header>
                <section class="modal-card-body">
                    <b-message type="is-warning" has-icon icon-size="is-small">
                         {{ $t("warning-change-applies-in-project-only") }}
                    </b-message>

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
        blindMode() {
            return this.$store.state.project.project.blindMode;
        },
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
            if(this.calibrationField !== this.image.resolution) {
                this.displayErrors = true;
            }
        }
    },
    methods: {
        async setResolution() {
            let imageName = this.blindMode ? this.image.blindedName : this.image.instanceFilename;
            try {
                let updateImage = this.image.clone();
                updateImage.resolution = this.calibrationField*this.calibrationFactor;
                await updateImage.save();

                this.$emit("setResolution", updateImage.resolution);

                this.$notify({
                    type: "success",
                    text: this.$t("notif-success-image-calibration", {imageName})
                });
            }
            catch(error) {
                console.log(error);
                this.$notify({
                    type: "error",
                    text: this.$t("notif-error-image-calibration", {imageName})
                });
            }
            this.$emit("update:active", false);
        }
    }
};
</script>
