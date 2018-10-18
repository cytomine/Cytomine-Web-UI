<template>
<table class="table">
    <b-loading :is-full-page="false" :active.sync="isLoading"></b-loading>
    <tbody>
        <tr>
            <td class="prop-label"><strong>{{$t("description")}}</strong></td>
            <td class="prop-content">
                <div v-if="description" v-html="description"></div> <!-- WARNING can lead to js injection -->
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
            <td class="prop-label"><strong>{{$t("ontology")}}</strong></td>
            <td class="prop-content"><router-link to="">{{project.ontologyName}}</router-link></td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("created-on")}}</strong></td>
            <td class="prop-content">
                {{ Number(project.created) | moment("ll") }}
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("creator")}}</strong></td>
            <td class="prop-content">
                <list-usernames :users="[creator]" :onlines="onlines"></list-usernames>
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("managers")}} ({{managers.length}})</strong></td>
            <td class="prop-content">
                <list-usernames :users="managers.array" :onlines="onlines"></list-usernames>
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("contributors")}} ({{contributors.length}})</strong></td>
            <td class="prop-content">
                <list-usernames :users="contributors.array" :onlines="onlines"></list-usernames>
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("contacts")}} ({{contacts.length}})</strong></td>
            <td class="prop-content">
                <list-usernames :users="contacts.array" :onlines="onlines"></list-usernames>
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("images")}}</strong></td>
            <td class="prop-content">
                <images-preview :idProject="project.id"></images-preview>
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("actions")}}</strong></td>
            <td class="prop-content">
                <button class="button is-danger is-small">{{$t("button-delete")}}</button> <!-- TODO -->
            </td>
        </tr>
    </tbody>
</table>
</template>

<script>
import ImagesPreview from "@/components/utils/ImagesPreview";
import ListUsernames from "@/components/utils/ListUsernames";

import {Description, ImageInstanceCollection} from "cytomine-client";

export default {
    name: "project-details",
    components: {ImagesPreview, ListUsernames},
    props: ["project"],
    data() {
        return {
            description: null,
            creator: null,
            managers: [],
            contributors: [],
            onlines: [],
            contacts: [],
            images: [],
            isLoading: true
        };
    },
    async created() {
        // create all promises, but do not await for them as we want requests to be parallellized
        let descriptionPromise = Description.fetch(this.project);
        let imagesPromise = new ImageInstanceCollection(3, "project", this.project.id).fetchPage();
        let creatorPromise = this.project.fetchCreator();
        let managersPromise = this.project.fetchAdministrators();
        let contactsPromise = this.project.fetchRepresentatives();
        let contributorsPromise = this.project.fetchUsers();
        let onlinesPromise = this.project.fetchConnectedUsers();

        try {
            this.description = (await descriptionPromise).data;
        }
        catch(err) {
            // nothing to do as the error may make sense if the project as no description
            // QUESTION: change behaviour in backend ?
        }

        this.images = (await imagesPromise).array;
        this.creator = await creatorPromise;
        this.managers = await managersPromise;
        this.contacts = await contactsPromise;
        this.contributors = await contributorsPromise; // TODO: exclude managers from contributors list (change in backend?)
        this.onlines = await onlinesPromise;

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
</style>
