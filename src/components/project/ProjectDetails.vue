<template>
<table class="table">
    <b-loading :is-full-page="false" :active.sync="isLoading"></b-loading>
    <tbody>
        <tr v-if="isPropDisplayed('name')">
            <td class="prop-label">{{$t("name")}}</td>
            <td class="prop-content">
                {{project.name}}
            </td>
        </tr>
        <tr v-if="isPropDisplayed('numberOfImages')">
            <td class="prop-label">{{$t("images")}}</td>
            <td class="prop-content">
                <router-link :to="`/project/${project.id}/images`">{{project.numberOfImages}}</router-link>
            </td>
        </tr>
        <tr v-if="isPropDisplayed('membersCount')">
            <td class="prop-label">{{$t("members")}}</td>
            <td class="prop-content">
                {{this.members.length}}
            </td>
        </tr>
        <tr v-if="isPropDisplayed('numberOfAnnotations')">
            <td class="prop-label">{{$t("user-annotations")}}</td>
            <td class="prop-content">
                <router-link :to="`/project/${project.id}/annotations`">
                    {{ project.numberOfAnnotations }}
                </router-link>
            </td>
        </tr>
        <tr v-if="isPropDisplayed('numberOfJobAnnotations')">
            <td class="prop-label">{{$t("job-annotations")}}</td>
            <td class="prop-content">
                <router-link :to="`/project/${project.id}/annotations?type=algo`">
                    {{ project.numberOfJobAnnotations }}
                </router-link>
            </td>
        </tr>
        <tr v-if="isPropDisplayed('numberOfReviewedAnnotations')">
            <td class="prop-label">{{$t("reviewed-annotations")}}</td>
            <td class="prop-content">
                <a>{{project.numberOfReviewedAnnotations}}</a> <!-- TODO: router link -->
            </td>
        </tr>
        <tr v-if="isPropDisplayed('description')">
            <td class="prop-label">{{$t("description")}}</td>
            <td class="prop-content">
                <cytomine-description :object="project"></cytomine-description>
            </td>
        </tr>
        <tr v-if="isPropDisplayed('tags')">
            <td class="prop-label">{{$t("tags")}}</td>
            <td class="prop-content">
                <div class="tags"> <!-- TODO: handle in backend, and retrieve dynamically -->
                    <span class="tag is-rounded is-info">Demo</span>
                    <span class="tag is-rounded is-info">CHU</span>
                </div>
            </td>
        </tr>
        <tr v-if="isPropDisplayed('attachedFiles')">
            <td class="prop-label">{{$t("attached-files")}}</td>
            <td class="prop-content">
                <attached-files :object="project"></attached-files>
            </td>
        </tr>
        <tr v-if="isPropDisplayed('ontology')">
            <td class="prop-label">{{$t("ontology")}}</td>
            <td class="prop-content">
                <router-link :to="`/ontology/${project.ontology}`">{{project.ontologyName}}</router-link>
            </td>
        </tr>
        <tr v-if="isPropDisplayed('created')">
            <td class="prop-label">{{$t("created-on")}}</td>
            <td class="prop-content">
                {{ Number(project.created) | moment("ll") }}
            </td>
        </tr>
        <tr v-if="isPropDisplayed('creator')">
            <td class="prop-label">{{$t("creator")}}</td>
            <td class="prop-content">
                <list-usernames :users="[creator]" :onlines="onlines"></list-usernames>
            </td>
        </tr>
        <tr v-if="isPropDisplayed('representatives')">
            <td class="prop-label">{{$t("representatives")}} ({{representatives.length}})</td>
            <td class="prop-content">
                <list-usernames :users="representatives" :onlines="onlines"></list-usernames>
            </td>
        </tr>
        <tr v-if="isPropDisplayed('managers')">
            <td class="prop-label">{{$t("managers")}} ({{managers.length}})</td>
            <td class="prop-content">
                <list-usernames :users="managers" :onlines="onlines"></list-usernames>
            </td>
        </tr>
        <tr v-if="isPropDisplayed('contributors')">
            <td class="prop-label">{{$t("contributors")}} ({{contributors.length}})</td>
            <td class="prop-content">
                <list-usernames :users="contributors" :onlines="onlines"></list-usernames>
            </td>
        </tr>
        <tr v-if="!excludedProperties.includes('imagesPreview')">
            <td class="prop-label">{{$t("images")}}</td>
            <td class="prop-content">
                <images-preview :idProject="project.id"></images-preview>
            </td>
        </tr>
        <tr>
            <td class="prop-label">{{$t("actions")}}</td>
            <td class="prop-content">
                <project-actions :project="project" @delete="$emit('delete')"></project-actions>
            </td>
        </tr>
    </tbody>
</table>
</template>

<script>
import ImagesPreview from "@/components/image/ImagesPreview";
import ListUsernames from "@/components/user/ListUsernames";
import ProjectActions from "./ProjectActions";
import CytomineDescription from "@/components/description/CytomineDescription";
import AttachedFiles from "@/components/attached-file/AttachedFiles";

export default {
    name: "project-details",
    components: {
        ImagesPreview,
        ListUsernames,
        ProjectActions,
        CytomineDescription,
        AttachedFiles
    },
    props: {
        project: {type: Object},
        excludedProperties: {type: Array, default: () => []}
    },
    data() {
        return {
            creator: null,
            managers: [],
            members: [],
            onlines: [],
            representatives: [],

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
        async fetchRepresentatives() {
            this.representatives = (await this.project.fetchRepresentatives()).array;
        },
        async fetchMembers() {
            this.members = (await this.project.fetchUsers()).array;
        },
        async fetchOnlines() {
            this.onlines = await this.project.fetchConnectedUsers();
        },

        isPropDisplayed(prop) {
            return !this.excludedProperties.includes(prop);
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
            this.fetchRepresentatives(),
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
    font-weight: 600;
}

td.prop-content {
    width: 100%;
}

.tag {
    font-size: 10px !important;
    font-weight: 600;
}
</style>
