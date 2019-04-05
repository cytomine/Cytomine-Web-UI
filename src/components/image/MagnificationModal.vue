<template>
<div class="image-magnification-wrapper">
    <b-modal :active="active" has-modal-card @close="$emit('update:active', false)">
        <form @submit.prevent="setMagnification()">
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">{{$t("set-magnification")}}</p>
                </header>
                <section class="modal-card-body">
                    <b-message type="is-warning" has-icon icon-size="is-small">
                         {{ $t("warning-change-applies-in-project-only") }}
                    </b-message>

                    <b-field :label="$t('magnification')" :type="fieldType" :message="errorMessage">
                        <b-input v-model="newMagnification" />
                    </b-field>
                </section>
                <footer class="modal-card-foot">
                    <button class="button" type="button" @click="$emit('update:active', false)">
                        {{$t("button-cancel")}}
                    </button>
                    <button class="button is-link" :disabled="errorMessage">
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
    name: "magnification-modal",
    props: {
        active: {type: Boolean},
        image: {type: Object}
    },
    data() {
        return {
            newMagnification: "",
            displayErrors: false
        };
    },
    computed: {
        blindMode() {
            return this.$store.state.project.project.blindMode;
        },
        errorMessage() {
            if(this.displayErrors && this.newMagnification && (isNaN(this.newMagnification) || +this.newMagnification <= 0)) {
                return this.$t("must-be-positive-number");
            }
        },
        fieldType() {
            return this.errorMessage ? "is-danger" : null;
        }
    },
    watch: {
        active(val) {
            if(val) {
                this.newMagnification = this.image.magnification;
                this.displayErrors = false;
            }
        },
        newMagnification() {
            if(this.newMagnification !== this.image.magnification) {
                this.displayErrors = true;
            }
        }
    },
    methods: {
        async setMagnification() {
            let imageName = this.blindMode ? this.image.blindedName : this.image.instanceFilename;
            try {
                let updateImage = this.image.clone();
                updateImage.magnification = this.newMagnification;
                await updateImage.save();

                this.$emit("setMagnification", updateImage.magnification);

                this.$notify({
                    type: "success",
                    text: this.$t("notif-success-magnification-update", {imageName})
                });
            }
            catch(error) {
                console.log(error);
                this.$notify({
                    type: "error",
                    text: this.$t("notif-error-magnification-update", {imageName})
                });
            }
            this.$emit("update:active", false);
        },
    }
};
</script>

