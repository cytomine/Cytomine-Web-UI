<template>
<div class="image-magnification-wrapper">
    <b-modal :active="active" has-modal-card @close="$emit('update:active', false)">
        <form>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">{{$t("set-magnification")}}</p>
                </header>
                <section class="modal-card-body">
                    <div class="modal-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        {{ $t("warning-change-applies-in-project-only") }}
                    </div>

                    <b-field :label="$t('magnification')" :type="fieldType" :message="errorMessage">
                        <b-input v-model="newMagnification" />
                    </b-field>
                </section>
                <footer class="modal-card-foot">
                    <button class="button" type="button" @click="$emit('update:active', false)">
                        {{$t("button-cancel")}}
                    </button>
                    <button class="button is-link" :disabled="errorMessage" @click="setMagnification()">
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
        errorMessage() {
            if(this.displayErrors && this.newMagnification != "" && (isNaN(this.newMagnification) || +this.newMagnification <= 0)) {
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
            if(this.newMagnification != this.image.magnification) {
                this.displayErrors = true;
            }
        }
    },
    methods: {
        async setMagnification() {
            try {
                let updateImage = this.image.clone();
                updateImage.magnification = this.newMagnification;
                await updateImage.save();

                this.$emit("setMagnification", updateImage.magnification);

                this.$notify({
                    type: "success",
                    text: this.$t("notif-success-magnification-update", {imageName: this.image.instanceFilename})
                });
            }
            catch(error) {
                console.log(error);
                this.$notify({
                    type: "error",
                    text: this.$t("notif-error-magnification-update", {imageName: this.image.instanceFilename})
                });
            }
            this.$emit("update:active", false);
        },
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
