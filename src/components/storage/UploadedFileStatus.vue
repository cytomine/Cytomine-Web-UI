<template>
<div v-if="!iconOnly">
    <span v-if="!isConverted || !file.nbChildren" class="tag" :class="tagClass">
        {{$t(labels[file.status])}}
    </span>
    <div v-else class="tags has-addons">
        <span class="tag is-success">{{$t("converted")}}</span>
        <span class="tag is-light">{{$tc("count-files", file.nbChildren, {count: file.nbChildren})}}</span>
    </div>
</div>
<span v-else :class="['icon', textClass]">
    <i :class="['fas', iconClass]" :title="$t(labels[file.status])"></i>
</span>
</template>

<script>
import {UploadedFileStatus} from "cytomine-client";

export default {
    name: "uploaded-file-status",
    props: {
        file: Object,
        iconOnly: {type: Boolean, default: false}
    },
    computed: {
        isConverted() {
            return this.file.status == UploadedFileStatus.CONVERTED;
        },
        labels() {
            return {
                [UploadedFileStatus.UPLOADED]: "uploaded",
                [UploadedFileStatus.CONVERTED]: "converted",
                [UploadedFileStatus.DEPLOYED]: "deployed",
                [UploadedFileStatus.ERROR_FORMAT]: "error-format",
                [UploadedFileStatus.ERROR_CONVERT]: "error-convert",
                [UploadedFileStatus.UNCOMPRESSED]: "uncompressed",
                [UploadedFileStatus.TO_DEPLOY]: "to-deploy",
                [UploadedFileStatus.TO_CONVERT]: "to-convert",
                [UploadedFileStatus.ERROR_DEPLOYMENT]: "error-deployment",
            };
        },
        result() {
            switch(this.file.status) {
                case UploadedFileStatus.UPLOADED:
                case UploadedFileStatus.TO_DEPLOY:
                case UploadedFileStatus.TO_CONVERT:
                case UploadedFileStatus.UNCOMPRESSED:
                    return "info";
                case UploadedFileStatus.CONVERTED:
                case UploadedFileStatus.DEPLOYED:
                    return "success";
                case UploadedFileStatus.ERROR_FORMAT:
                case UploadedFileStatus.ERROR_CONVERT:
                case UploadedFileStatus.ERROR_DEPLOYMENT:
                    return "danger";
            }
        },
        tagClass() {
            return "is-" + this.result;
        },
        textClass() {
            return "has-text-" + this.result;
        },
        iconClass() {
            switch(this.result) {
                case "info":
                    return "fa-spinner";
                case "success":
                    return "fa-check-square";
                case "danger":
                    return "fa-times-circle";
            }
        }
    }
};
</script>

<style scoped>
.fas {
    font-size: 18px;
}
</style>
