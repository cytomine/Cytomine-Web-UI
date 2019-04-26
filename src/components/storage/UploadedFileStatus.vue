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
// import {UploadedFileStatus} from "cytomine-client";

//TODO: tmp
export const UploadedFileStatus = Object.freeze({
    UPLOADED: 0,
    DETECTING_FORMAT: 10,
    ERROR_FORMAT: 11,
    EXTRACTING_DATA: 20,
    ERROR_EXTRACTION: 21,
    CONVERTING: 30,
    ERROR_CONVERSION: 31,
    DEPLOYING: 40,
    ERROR_DEPLOYMENT: 41,
    DEPLOYED: 100,
    EXTRACTED: 102,
    CONVERTED: 104
});

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
                [UploadedFileStatus.ERROR_CONVERSION]: "error-convert",
                [UploadedFileStatus.EXTRACTED]: "uncompressed",
                [UploadedFileStatus.ERROR_DEPLOYMENT]: "error-deployment",
                [UploadedFileStatus.DETECTING_FORMAT]: "detecting-format",
                [UploadedFileStatus.EXTRACTING_DATA]: "extracting-data",
                [UploadedFileStatus.ERROR_EXTRACTION]: "error-extraction",
                [UploadedFileStatus.DEPLOYING]: "deploying",
            };
        },
        result() {
            if (this.file.status % 2 === 0 && this.file.status >= 100)
                return "success";
            else if (this.file.status % 2 === 0)
                return "info";
            else
                return "danger";
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
