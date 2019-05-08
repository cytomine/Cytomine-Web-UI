<template>
<div>
    <b-modal :active="active" @close="$emit('update:active', false)" :has-modal-card="true">
        <div class="modal-card add-member-modal">
            <header class="modal-card-head">
                <p class="modal-card-title">{{$t("add-members-to-project")}}</p>
            </header>
            <section class="modal-card-body">
                <b-loading :is-full-page="false" :active="loading" class="small" />
                <template v-if="!loading">
                    <b-field>
                        <user-taginput v-model="selectedUsers" :users="notMemberUsers" />
                    </b-field>
                </template>
            </section>
            <footer class="modal-card-foot">
                <button class="button" @click="$emit('update:active', false)">
                    {{$t("button-cancel")}}
                </button>
                <button class="button is-link" @click="addMembers">
                    {{$t("button-add")}}
                </button>
            </footer>
        </div>
    </b-modal>
</div>
</template>

<script>
import {UserCollection} from "cytomine-client";
import UserTaginput from "@/components/user/UserTaginput";
import {fullName} from "@/utils/user-utils.js";

export default {
    name: "add-member-modal",
    components: {UserTaginput},
    props: {
        active: Boolean
    },
    data() {
        return {
            loading: true,
            users: [],
            filteredUsers: [],
            selectedUsers: []
        };
    },
    computed: {
        project() {
            return this.$store.state.project.project;
        },
        projectMembersIds() {
            let projectMembers = this.$store.state.project.members;
            let excluded = projectMembers.concat(this.selectedUsers);
            return excluded.map(u => u.id);
        },
        notMemberUsers() {
            return this.users.filter(user => !this.projectMembersIds.includes(user.id));
        }
    },
    watch: {
        active() {
            this.selectedUsers = [];
        }
    },
    methods: {
        async addMembers() {
            let updatedProject = this.project.clone();
            updatedProject.users = this.projectMembersIds;

            try {
                await updatedProject.save();
                this.$emit("addMembers");
                this.$notify({type: "success", text: this.$t("notif-success-add-project-members")});
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-add-project-members")});
            }

            this.$emit("update:active", false);
        }
    },
    async created() {
        let users = (await UserCollection.fetchAll()).array;
        users.forEach(u => u.fullName = fullName(u));
        this.users = users;
        this.loading = false;
    }
};
</script>

<style>
.add-member-modal, .add-member-modal .modal-card-body {
    overflow: visible !important;
    width: 60vw !important;
}
</style>
