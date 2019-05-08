<template>
<div class="attached-files-wrapper">
    <template v-if="!loading">
        <em v-if="error">{{$t("error-attached-files")}}</em>
        <template v-else-if="attachedFiles.length > 0">
            <span class="file-item" v-for="(file, index) in attachedFiles" :key="file.id">
                <a :href="host + file.url">{{file.filename}}</a>
                <button v-if="canEdit" class="delete is-small" @click="confirmDeletion(file, index)"></button>
                <template v-if="index < attachedFiles.length - 1">,</template>
            </span>
        </template>
        <em v-else>{{$t("no-attached-file")}} </em>
        <button v-if="canEdit" class="button is-small" @click="displayModal()">{{$t("button-add")}}</button>
    </template>
</div>
</template>

<script>
import {Cytomine, AttachedFileCollection} from "cytomine-client";
import AttachedFileModal from "./AttachedFileModal";

export default {
    name: "attached-files",
    props: {
        object: {type: Object},
        canEdit: {type: Boolean, default: true}
    },
    data() {
        return {
            loading: true,
            error: false,
            attachedFiles: []
        };
    },
    computed: {
        host() {
            return Cytomine.instance.host;
        }
    },
    methods: {
        displayModal() {
            // required to use programmatic modal because the description is sometimes displayed in elements with a
            // CSS transform (e.g. popover) that conflict with the fixed position of the modal 
            // (http://meyerweb.com/eric/thoughts/2011/09/12/un-fixing-fixed-elements-with-css-transforms/)
            
            this.$modal.open({
                parent: this,
                component: AttachedFileModal,
                props: {object: this.object},
                hasModalCard: true,
                events: {"addAttachedFile": this.addAttachedFile}
            });
        },
        addAttachedFile(attachedFile) {
            this.attachedFiles.push(attachedFile);
        },
        confirmDeletion(attachedFile, idx) {
            this.$dialog.confirm({
                title: this.$t("confirm-deletion"),
                message: this.$t("confirm-deletion-attached-file", {filename: attachedFile.filename}),
                type: "is-danger",
                confirmText: this.$t("button-confirm"),
                cancelText: this.$t("button-cancel"),
                onConfirm: () => this.deleteAttachedFile(attachedFile, idx)
            });
        },
        async deleteAttachedFile(attachedFile, idx) {
            try {
                await attachedFile.delete();
                this.attachedFiles.splice(idx, 1);
                this.$notify({
                    type: "success", 
                    text: this.$t("notif-success-attached-file-deletion", {filename: attachedFile.filename})
                });
            }
            catch(error) {
                console.log(error);
                this.$notify({
                    type: "error", 
                    text: this.$t("notif-error-attached-file-deletion", {filename: attachedFile.filename})
                });
            }
        }
    },
    async created() {
        try {
            this.attachedFiles = (await AttachedFileCollection.fetchAll({object: this.object})).array;
        }
        catch(error) {
            console.log(error);
            this.error = true;
        }
        this.loading = false;
    }

};
</script>

<style scoped>
.attached-files-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.file-item {
    margin-right: 5px;
}

.file-item .delete {
    margin-left: 5px;
    margin-right: 2px;
    position: relative;
    top: 2px;
}

.button {
    margin-left: 5px;
}
</style>