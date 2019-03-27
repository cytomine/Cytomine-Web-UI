<template>
<b-message v-if="error" type="is-danger" has-icon icon-size="is-small" size="is-small">
    <h2> {{ $t("error") }} </h2>
    <p> {{ $t("unexpected-error-info-message") }} </p>
</b-message>
<table v-else class="table">
    <b-loading :is-full-page="false" :active="loading" class="small" />
    <tbody v-if="!loading">
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
            <td class="prop-label">{{$t("analysis-annotations")}}</td>
            <td class="prop-content">
                <router-link :to="`/project/${project.id}/annotations?type=algo`">
                    {{ project.numberOfJobAnnotations }}
                </router-link>
            </td>
        </tr>
        <tr v-if="isPropDisplayed('numberOfReviewedAnnotations')">
            <td class="prop-label">{{$t("reviewed-annotations")}}</td>
            <td class="prop-content">
                <router-link :to="`/project/${project.id}/annotations?type=reviewed`">
                    {{project.numberOfReviewedAnnotations}}
                </router-link>
            </td>
        </tr>
        <tr v-if="isPropDisplayed('description')">
            <td class="prop-label">{{$t("description")}}</td>
            <td class="prop-content">
                <cytomine-description :object="project" />
            </td>
        </tr>
        <tr v-if="isPropDisplayed('attachedFiles')">
            <td class="prop-label">{{$t("attached-files")}}</td>
            <td class="prop-content">
                <attached-files :object="project" />
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
                <list-usernames :users="[creator]" :onlines="onlines" />
            </td>
        </tr>
        <tr v-if="isPropDisplayed('representatives')">
            <td class="prop-label">{{$t("representatives")}} ({{representatives.length}})</td>
            <td class="prop-content">
                <list-usernames :users="representatives" :onlines="onlines" />
            </td>
        </tr>
        <tr v-if="isPropDisplayed('managers')">
            <td class="prop-label">{{$t("managers")}} ({{managers.length}})</td>
            <td class="prop-content">
                <list-usernames :users="managers" :onlines="onlines" />
            </td>
        </tr>
        <tr v-if="isPropDisplayed('contributors')">
            <td class="prop-label">{{$t("contributors")}} ({{contributors.length}})</td>
            <td class="prop-content">
                <list-usernames :users="contributors" :onlines="onlines" />
            </td>
        </tr>
        <tr v-if="!excludedProperties.includes('imagesPreview')">
            <td class="prop-label">{{$t("images")}}</td>
            <td class="prop-content">
                <list-images-preview :idProject="project.id" />
            </td>
        </tr>
        <tr>
            <td class="prop-label">{{$t("actions")}}</td>
            <td class="prop-content">
                <project-actions :project="project" @delete="$emit('delete')" />
            </td>
        </tr>
    </tbody>
</table>
</template>

<script>
import ListImagesPreview from "@/components/image/ListImagesPreview";
import ListUsernames from "@/components/user/ListUsernames";
import ProjectActions from "./ProjectActions";
import CytomineDescription from "@/components/description/CytomineDescription";
import AttachedFiles from "@/components/attached-file/AttachedFiles";

export default {
    name: "project-details",
    components: {
        ListImagesPreview,
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
            loading: true,
            error: false,

            creator: null,
            managers: [],
            members: [],
            onlines: [],
            representatives: []
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
        try {
            await Promise.all([
                this.fetchCreator(),
                this.fetchManagers(),
                this.fetchRepresentatives(),
                this.fetchMembers(),
                this.fetchOnlines()
            ]);
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
.table {
    background: none;
    position: relative;
    height: 3em;
}

td.prop-label {
    white-space: nowrap;
    font-weight: 600;
}

td.prop-content {
    width: 100%;
}
</style>
