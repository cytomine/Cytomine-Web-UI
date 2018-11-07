<template>
<table class="table">
    <b-loading :is-full-page="false" :active.sync="isLoading"></b-loading>
    <tbody>
        <tr>
            <td class="prop-label"><strong>{{$t("description")}}</strong></td>
            <td class="prop-content">
                <div v-if="description" v-html="description.data"></div> <!-- WARNING can lead to js injection -->
                <template v-else><em>{{$t("no-description")}}</em></template>
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
                <div class="buttons"> <!-- TODO add handler for actions -->
                    <button class="button is-small">{{$t("button-rename")}}</button>
                    <button class="button is-small">{{$t("button-properties")}}</button>
                    <button class="button is-small">{{$t("button-download")}}</button>
                    <button class="button is-danger is-small">{{$t("button-delete")}}</button>
                </div>
            </td>
        </tr>
    </tbody>
</table>
</template>

<script>
import {Description} from "cytomine-client";

export default {
    name: "image-details",
    props: ["image"],
    data() {
        return {
            description: null,
            isLoading: true
        };
    },
    async created() {
        try {
            this.description = await Description.fetch(this.image);
        }
        catch(err) {
            // nothing to do as the error may make sense if the image has no description
            // QUESTION: change behaviour in backend ?
        }
        this.isLoading = false;
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
