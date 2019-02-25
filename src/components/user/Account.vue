<template>
    <div class="content-wrapper">

        <div class="panel">
            <p class="panel-heading">
                <i class="fas fa-user" aria-hidden="true"></i>
                {{ $t("profile") }}
            </p>
            <div class="panel-block">
                <form>
                    <b-field :label="$t('username')" horizontal>
                        <b-input :value="currentUser.username" disabled></b-input>
                    </b-field>

                    <b-field :label="$t('lastname')" horizontal>
                        <b-input v-model="updatedUser.lastname"></b-input>
                    </b-field>

                    <b-field :label="$t('firstname')" horizontal>
                        <b-input v-model="updatedUser.firstname"></b-input>
                    </b-field>

                    <b-field :label="$t('email')" horizontal>
                        <b-input v-model="updatedUser.email"></b-input>
                    </b-field>

                    <b-field grouped position="is-right">
                        <div class="control">
                            <button class="button is-link" @click="editDetails()"> {{$t("button-save")}}</button>
                        </div>
                    </b-field>
                </form>
            </div>
        </div>

        <div class="panel">
            <p class="panel-heading">
                <i class="fas fa-briefcase" aria-hidden="true"></i>
                {{ $t("password") }}
            </p>
            <div class="panel-block">
                <form>
                    <b-field :label="$t('password-current')" horizontal>
                        <div class="control">
                            <input class="input" type="password" :class="{'is-success': correctPassword}" v-model="currentPassword">
                        </div>
                    </b-field>

                    <b-field :label="$t('password-new')" horizontal>
                        <b-input type="password" v-model="newPassword" :disabled="!correctPassword"></b-input>
                    </b-field>

                    <b-field :label="$t('password-confirm')" horizontal>
                        <b-input type="password" v-model="confirmPassword" :disabled="newPassword == ''"></b-input>
                    </b-field>

                    <b-field grouped position="is-right">
                        <div class="control">
                            <button class="button is-link" :disabled="savePasswordDisabled" @click="savePassword()">
                                {{$t("button-save")}}
                            </button>
                        </div>
                    </b-field>
                </form>
            </div>
        </div>

        <div class="panel"> <!-- QUESTION: remove ? or only show for technical users ? -->
            <p class="panel-heading">
                <i class="fas fa-exchange-alt" aria-hidden="true"></i>
                {{ $t("api-keys") }}
            </p>
            <div class="panel-block">

                <b-field :label="$t('public-key')" horizontal>
                    <b-input :value="currentUser.publicKey" readonly></b-input>
                </b-field>

                <b-field :label="$t('private-key')" horizontal>
                    <b-input :value="currentUser.privateKey" readonly></b-input>
                </b-field>

                <b-field grouped position="is-right">
                    <div class="control">
                        <button class="button is-link" @click="regenerateKeys()">{{$t("regenerate-api-keys")}}</button>
                    </div>
                </b-field>

            </div>
        </div>
    </div>

</template>

<script>
import { mapState } from "vuex";
import _ from "lodash";

export default {
    name: "Account",
    data() {
        return {
            updatedUser: this.$store.state.currentUser.user.clone(),
            currentPassword: "",
            correctPassword: false,
            newPassword: "",
            confirmPassword: ""
        };
    },
    computed: {
        savePasswordDisabled() {
            return !(this.newPassword == this.confirmPassword && this.newPassword != "");
        },
        ...mapState({currentUser: state => state.currentUser.user})
    },
    watch: {
        currentPassword() {
            this.debouncedCheckPassword();
        }
    },
    created() {
        this.debouncedCheckPassword = _.debounce(this.checkPassword, 250);
    },
    methods: {
        async editDetails() {
            try {
                await this.$store.dispatch("updateUser", this.updatedUser);
                this.$notify({type: "success", text: this.$t("notif-success-user-details-saved")});
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-user-details-not-saved")});
            }
        },

        async savePassword() {
            if(this.newPassword != this.confirmPassword) {
                this.$notify({type: "error", text: "The provided passwords are not identical"});
                return;
            }

            let userNewPassword = this.currentUser.clone();
            userNewPassword.password = this.newPassword;
            try {
                await this.$store.dispatch("updateUser", userNewPassword);
                this.$notify({type: "success", text: this.$t("notif-success-password-saved")});
                this.currentPassword = "";
                this.newPassword = "";
                this.confirmPassword = "";
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-password-not-saved")});
            }
        },

        checkPassword() {
            // TODO: change ! should be possible to send API request to check correctness (in current frontend, use of
            // j_spring_security_check, but not ideal because it may lead to disconnection)
            if(this.currentPassword == "password") {
                this.correctPassword = true;

            }
            else {
                this.correctPassword = false;
                this.newPassword = "";
                this.confirmPassword = "";
            }
        },

        async regenerateKeys() {
            try {
                await this.$store.dispatch("regenerateKeys");
                this.$notify({type: "success", text: this.$t("notif-success-keys-regenerated")});
            }
            catch(err) {
                this.$notify({type: "error", text: this.$t("notif-error-keys-not-regenerated")});
            }
        }
    }
};
</script>

<style scoped>
.panel {
    max-width: 1200px;
    margin-left: auto;
    margin-right:auto;
}

.fas {
    margin-right: 5px;
}
</style>
