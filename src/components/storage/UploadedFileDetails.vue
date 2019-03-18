<template>
<div class="uploaded-file-details-wrapper">
    <h2>
        {{$t("file-tree")}}
    </h2>
    <b-message v-if="error" type="is-danger" has-icon icon-size="is-small" size="is-small">
        <h2> {{ $t("error") }} </h2>
        <p> {{ $t("unexpected-error-info-message") }} </p>
    </b-message>
    <sl-vue-tree v-else v-model="nodes" :allowMultiselect="false">
        <template v-slot:toggle="{node}">
            <template v-if="!node.isLeaf">
                <i :class="['tree-toggle', 'fas', node.isExpanded ? 'fa-angle-down' : 'fa-angle-right']"></i>
            </template>
        </template>

        <template v-slot:title="{node}">
            <p :class="{'target-element': node.data.id == file.id}">{{node.title}}</p>
        </template>

        <template v-slot:sidebar="{node}">
            <div class="filesize">
                {{filesize(node.data.size)}}
            </div>
            <div class="status">
                <uploaded-file-status :file="node.data" :iconOnly="true"></uploaded-file-status>
            </div>
            <div class="buttons">
                <a class="button is-small is-link" :href="node.data.downloadURL">
                    {{$t("button-download")}}
                </a>
                <button class="button is-small is-danger" @click="confirmDeletion(node.data)">
                    {{$t("button-delete")}}
                </button>
            </div>
            <div class="preview">
                <a v-if="node.data.thumbURL" @click="preview = node.data">
                    {{$t("see-preview")}}
                </a>
            </div>
        </template>
    </sl-vue-tree>

    <template v-if="preview">
        <h2>
            {{$t("preview-of", {filename: preview.originalFilename})}}
            <button class="button is-small" @click="preview = null">{{$t("button-hide")}}</button>
        </h2>
        <img :src="preview.thumbURL">
    </template>
</div>
</template>

<script>
import SlVueTree from "sl-vue-tree";
import {UploadedFile, UploadedFileCollection} from "cytomine-client";
import UploadedFileStatus from "./UploadedFileStatus";
import filesize from "filesize";

export default {
    name: "uploaded-file-details",
    components: {
        SlVueTree,
        UploadedFileStatus
    },
    props: [
        "file", // WARNING: the root of the tree will be the file or its direct parent
        "revision" // change its value to force refresh
    ],
    data() {
        return {
            rootId: null,
            uploadedFiles: [],
            nodes: [],
            preview: null,
            error: false
        };
    },
    watch: {
        file() {
            this.findRoot();
            this.makeTree();
        },
        revision() {
            this.findRoot();
            this.makeTree();
        }
    },
    methods: {
        findRoot() {
            this.rootId = this.file.parentId || this.file.id;
        },
        async makeTree() {
            try {
                this.uploadedFiles = (await UploadedFileCollection.fetchAll({root: this.rootId})).array;
                this.nodes = this.createNodes(null);
            }
            catch(error) {
                console.log(error);
                this.error = true;
            }
        },
        createNodes(idParent) {
            let directChildren = this.uploadedFiles.filter(file => file.parentId == idParent);
            return directChildren.map(file => {
                let children = this.createNodes(file.id);
                return {
                    title: file.originalFilename,
                    isLeaf: children.length == 0,
                    isDraggable: false,
                    isExpanded: true,
                    data: {downloadURL: file.downloadURL, ...file}, // data converted to object by sl-vue-tree => need to define downloadURL as property
                    children
                };
            });
        },
        filesize(size) {
            return filesize(size, {base: 10});
        },
        confirmDeletion(file) {
            this.$dialog.confirm({
                title: this.$t("confirm-deletion"),
                message: this.$t("confirm-deletion-file"),
                type: "is-danger",
                confirmText: this.$t("button-confirm"),
                cancelText: this.$t("button-cancel"),
                onConfirm: () => this.deleteFile(file)
            });
        },
        async deleteFile(file) {
            try {
                await UploadedFile.delete(file.id);
                this.$emit("update");
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: error.response.data.errors}); // TODO: translate (core should return data to populate translation)
            }
        }
    },
    created() {
        this.findRoot();
        this.makeTree();
    }
};
</script>

<style scoped>
.target-element {
    font-weight: 600;
}

.filesize {
    width: 100px;
    margin-left: 15px;
}

.status {
    width: 60px;
}

.preview {
    width: 100px;
}

.buttons {
    margin-right: 20px;
    margin-bottom: 0px !important;
}

.buttons .button {
    margin-bottom: 5px !important;
    margin-top: 2px !important;
}

h2:not(:first-child) {
    margin-top: 15px;
    border-bottom: 2px solid #ddd;
}

h2 .button {
    position: relative;
    bottom: 3px;
    margin-left: 10px;
    text-transform: none;
}
</style>

<style>
.uploaded-file-details-wrapper .sl-vue-tree {
    max-width: 900px;
}

.uploaded-file-details-wrapper .sl-vue-tree-sidebar {
    display: flex;
    align-items: top;
    justify-content: flex-end;
}

.uploaded-file-details-wrapper .sl-vue-tree-gap {
    border: 0px dotted #bbb;
    border-left-width: 1px;
    position: relative;
    right: 11px;
    bottom: 17px;
    /* background:red ; */
}

.uploaded-file-details-wrapper .sl-vue-tree-toggle {
    background: #fafafa;
    z-index: 1;
}

.uploaded-file-details-wrapper .sl-vue-tree-gap:nth-last-child(3) {
    border-width: 0px 0px 1px 1px !important;
}
</style>
