<template>
<b-modal class="user-modal" :active="active" @close="$emit('update:active', false)" :has-modal-card="true" :width="960">
    <form name="user-modal-form">
        <div class="modal-card add-image-modal">
            <header class="modal-card-head">
                <p class="modal-card-title">{{$t(editionMode ? "update-user" : "create-user")}}</p>
            </header>
            <section class="modal-card-body">
                <!-- HACK: fake fields to prevent autofill -->
                <input id="username" class="hidden" type="text">
                <input id="password" class="hidden" type="password">

                <b-field v-for="field in editableFields" :key="field"
                :label="$t(field === 'password' && editionMode ? 'password-new' : field)" horizontal
                :type="getError(field) && displayErrors ? 'is-danger' : null"
                :message="getError(field) && displayErrors ? getError(field) : ''">
                    <b-input v-model="internalUser[field]"
                        :type="field === 'password' ? 'password': 'text'"
                        :password-reveal="field == 'password'">
                    </b-input>
                </b-field>

                <b-field :label="$t('role')" horizontal>
                    <b-select v-model="selectedRole">
                        <option v-for="(value, key) in roles" :value="key" :key="key">
                            {{value.label}}
                        </option>
                    </b-select>
                </b-field>
            </section>
            <footer class="modal-card-foot">
                <button class="button" type="button" @click="$emit('update:active', false)">
                    {{$t("button-cancel")}}
                </button>
                <button class="button is-link" :disabled="!validForm && displayErrors" @click="save()">
                    {{$t("button-save")}}
                </button>
            </footer>
        </div>
    </form>
</b-modal>
</template>

<script>
import {User, RoleCollection} from "cytomine-client";
const defaultRole = "ROLE_GUEST";

export default {
    name: "user-modal",
    props: [
        "active",
        "user",
        "roles"
    ],
    data() {
        return {
            internalUser: {},
            rolesWithIds: [],
            selectedRole: defaultRole,
            displayErrors: false
        };
    },
    computed: {
        editionMode() {
            return this.user != null;
        },
        editableFields() {
            let fields = ["firstname", "lastname", "username", "email", "password"];
            return fields;
        },
        validForm() {
            return this.editableFields.every(field => this.getError(field) == null);
        },
        idRole() {
            return this.rolesWithIds.find(role => role.authority === this.selectedRole).id;
        }
    },
    watch: {
        active(val) {
            if(val) {
                this.internalUser = this.user ? this.user.clone() : new User();
                this.selectedRole = this.user ? this.user.role : defaultRole;
                this.displayErrors = false;
            }
        }
    },
    methods: {
        getError(field) {
            let value = this.internalUser[field];
            if(field === "password" && this.editionMode && (value == null || value.length === 0)) {
                return;
            }

            if(value == null || value.length === 0) {
                return this.$t("field-cannot-be-empty");
            }

            if(field == "password" && value.length < 4) {
                return this.$t("field-not-enough-characters", {minLength: 4});
            }
            
            if(field == "email") {
                var regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/; // source: https://gist.github.com/gregseth/5582254
                if(!regex.test(String(value).toLowerCase())) {
                    return this.$t("field-invalid-email-address");
                }
            }
        },
        async save() {
            if(!this.validForm) {
                this.displayErrors = true;
                return;
            }

            let labelTranslation = this.editionMode ? "update" : "creation";

            try {
                await this.internalUser.save();
                if(!this.editionMode || this.selectedRole !== this.user.role) {
                    await this.internalUser.defineRole(this.idRole);
                    this.internalUser.role = this.selectedRole; // for correct rendering in list
                }
                if(this.editionMode && this.internalUser.password != null && this.internalUser.password.length > 0) {
                    await this.internalUser.savePassword(this.internalUser.password);
                }
                this.$notify({type: "success", text: this.$t("notif-success-user-" + labelTranslation)});
                this.$emit("update:active", false);
                this.$emit(this.editionMode ? "updateUser" : "addUser", this.internalUser);
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-user-" + labelTranslation)});
            }
        },
    },
    async created() {
        this.rolesWithIds = (await RoleCollection.fetchAll()).array;
    }
};
</script>

<style scoped>
.hidden {
    display: none;
}
</style>


<style>
.user-modal .modal-card, .user-modal .modal-card-body {
    width: 100vw;
    max-width: 800px;
}
</style>
