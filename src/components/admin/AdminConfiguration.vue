<template>
<div class="admin-config-wrapper">
    <h2>{{$t("welcome-message")}}</h2>
    <cytomine-quill-editor v-model="welcomeConfig.value" />
    <p class="has-text-right">
        <button class="button is-link" @click="save">{{$t("button-save")}}</button>
    </p>
</div>
</template>

<script>
import CytomineQuillEditor from "@/components/form/CytomineQuillEditor";
import {Configuration} from "cytomine-client";
import constants from "@/utils/constants.js";

export default {
    name: "admin-configuration",
    components: {CytomineQuillEditor},
    data() {
        return {
            welcomeConfig: new Configuration({key: constants.CONFIG_KEY_WELCOME, value: "", readingRole: "all"})
        };
    },
    methods: {
        async save() {
            try {
                if(this.welcomeConfig.value.length === 0) {
                    await this.welcomeConfig.delete();
                }
                else {
                    await this.welcomeConfig.save();
                }
                this.$notify({type: "success", text: this.$t("notif-success-welcome-message-update")});
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-welcome-message-update")});
            }
        }
    },
    async created() {
        try {
            await this.welcomeConfig.fetch();
        }
        catch(error) {
            // no welcome message currently set
        }
    }
};
</script>

<style>
.admin-config-wrapper .cytomine-quill-editor {
    min-height: 25em !important;
    max-height: 25em !important;
}
</style>

<style scoped>
.button {
    margin-top: 1em;
}
</style>

