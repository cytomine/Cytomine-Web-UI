<template>
<table class="table">
    <tbody>
        <tr>
            <td class="prop-label"><strong>{{$t("description")}}</strong></td>
            <td class="prop-content">
                <cytomine-description :object="image"></cytomine-description>
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("tags")}}</strong></td>
            <td class="prop-content">
                <div class="tags"> <!-- TODO: handle in backend, and retrieve dynamically -->
                    <span class="tag is-rounded is-info">Demo</span>
                    <span class="tag is-rounded is-info">CHU</span>
                </div>
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("thumbnail")}}</strong></td>
            <td class="prop-content">
                <img :src="image.macroURL" :alt="image.instanceFilename" class="image-overview">
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("originalFilename")}}</strong></td>
            <td class="prop-content">
                {{image.originalFilename}}
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("format")}}</strong></td>
            <td class="prop-content format">
                {{image.extension}}
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("vendor")}}</strong></td>
            <td class="prop-content">
                <!-- vendor defined in parent component -->
                <img v-if="image.vendor" :src="image.vendor.imgPath" :alt="image.vendor.name"
                    :title="image.vendor.name" class="vendor-img">
                <template v-else>{{$t("unknown")}}</template>
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("image-size")}}</strong></td>
            <td class="prop-content">
                {{`${image.width} x ${image.height} ${$t("pixels")}`}}
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("resolution")}}</strong></td>
            <td class="prop-content">
                {{image.resolutionFormatted}}
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("actions")}}</strong></td>
            <td class="prop-content">
                <div class="buttons">
                    <button class="button is-small">{{$t("button-rename")}}</button> <!-- TODO -->
                    <button class="button is-small">{{$t("button-properties")}}</button> <!-- TODO -->
                    <a class="button is-small" href="">{{$t("button-download")}}</a> <!-- TODO -->
                    <button class="button is-danger is-small" @click="deleteImage()">{{$t("button-delete")}}</button>
                </div>
            </td>
        </tr>
    </tbody>
</table>
</template>

<script>
import CytomineDescription from "@/components/utils/CytomineDescription";

export default {
    name: "image-details",
    components: {CytomineDescription},
    props: ["image"],
    methods: {
        deleteImage() {
            this.$dialog.confirm({
                title: this.$t("delete-image"),
                message: this.$t("delete-image-confirmation-message", {imageName: this.image.instanceFilename}),
                type: "is-danger",
                confirmText: this.$t("button-confirm"),
                cancelText: this.$t("button-cancel"),
                onConfirm: () => this.$emit("delete")
            });
        }
    }
};
</script>

<style scoped>
.table {
    background: none;
    position: relative;
}

td.prop-label {
    white-space: nowrap;
}

td.prop-content {
    width: 100%;
}

.tag {
    font-size: 10px !important;
    font-weight: bold;
}

.format {
    text-transform: uppercase;
}

.vendor-img {
    max-height: 40px;
    max-width: 150px;
}
</style>
