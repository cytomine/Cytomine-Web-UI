<template>
<table class="table">
    <b-loading :is-full-page="false" :active.sync="isLoading"></b-loading>
    <tbody>
        <tr>
            <td class="prop-label"><strong>{{$t("description")}}</strong></td>
            <td class="prop-content">
                <cytomine-description :object="project"></cytomine-description>
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
                <list-usernames :users="managers" :onlines="onlines"></list-usernames>
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("contributors")}} ({{contributors.length}})</strong></td>
            <td class="prop-content">
                <list-usernames :users="contributors" :onlines="onlines"></list-usernames>
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("contacts")}} ({{contacts.length}})</strong></td>
            <td class="prop-content">
                <list-usernames :users="contacts" :onlines="onlines"></list-usernames>
            </td>
        </tr>
        <tr v-if="showImages">
            <td class="prop-label"><strong>{{$t("images")}}</strong></td>
            <td class="prop-content">
                <images-preview :idProject="project.id"></images-preview>
            </td>
        </tr>
        <tr>
            <td class="prop-label"><strong>{{$t("actions")}}</strong></td>
            <td class="prop-content">
                <button class="button is-danger is-small" @click="deleteProject()">{{$t("button-delete")}}</button>
            </td>
        </tr>
    </tbody>
</table>
</template>

<script>
import ImagesPreview from "@/components/image/ImagesPreview";
import ListUsernames from "@/components/user/ListUsernames";
import CytomineDescription from "@/components/description/CytomineDescription";

export default {
    name: "project-details",
    components: {ImagesPreview, ListUsernames, CytomineDescription},
    props: {
        project: {type: Object},
        showImages: {type: Boolean, default: true}
    },
    data() {
        return {
            creator: null,
            managers: [],
            members: [],
            onlines: [],
            contacts: [],
            isLoading: true
        };
    },
    computed: {
        managersIds() {
            return this.managers.map(manager => manager.id);
        },
        contributors() {
            return this.members.filter(member => !this.managersIds.includes(member.id));
        }
    },
    methods: {
        async fetchCreator() {
            this.creator = await this.project.fetchCreator();
        },
        async fetchManagers() {
            this.managers = (await this.project.fetchAdministrators()).array;
        },
        async fetchContacts() {
            this.contacts = (await this.project.fetchRepresentatives()).array;
        },
        async fetchMembers() {
            this.members = (await this.project.fetchUsers()).array;
        },
        async fetchOnlines() {
            this.onlines = await this.project.fetchConnectedUsers();
        },

        deleteProject() {
            this.$dialog.confirm({
                title: this.$t("delete-project"),
                message: this.$t("delete-project-confirmation-message", {projectName: this.project.name}),
                type: "is-danger",
                confirmText: this.$t("button-confirm"),
                cancelText: this.$t("button-cancel"),
                onConfirm: () => this.$emit("delete")
            });
        }
    },
    async created() {
        await Promise.all([
            this.fetchCreator(),
            this.fetchManagers(),
            this.fetchContacts(),
            this.fetchMembers(),
            this.fetchOnlines()
        ]);

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
    font-weight: 600;
}
</style>
