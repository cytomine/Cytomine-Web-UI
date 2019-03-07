<template>
<div>
    <b-modal :active="active" @close="$emit('update:active', false)" :has-modal-card="true">
        <div class="modal-card add-member-modal">
            <header class="modal-card-head">
                <p class="modal-card-title">{{$t("add-members-to-project")}}</p>
            </header>
            <section class="modal-card-body">
                <b-loading :is-full-page="false" :active="loading" class="small"></b-loading>
                <template v-if="!loading">
                    <b-field>
                        <b-taginput v-model="selectedUsers"
                                    :data="filteredUsers"
                                    autocomplete
                                    :open-on-focus="true"
                                    field="fullName"
                                    :placeholder="$t('search-user')"
                                    @typing="filterUsers"
                                    :allow-duplicates="false">
                        </b-taginput>
                    </b-field>
                </template>
            </section>
            <footer class="modal-card-foot">
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
import {fullName} from "@/utils/user-utils.js";

export default {
    name: "add-member-modal",
    props: ["active"],
    data() {
        return {
            loading: true,
            users: [],
            searchString: "",
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
    },
    watch: {
        projectMembersIds() {
            this.filterUsers();
        },
        active() {
            this.searchString = "";
            this.selectedUsers = [];
        }
    },
    methods: {
        filterUsers(searchString=this.searchString) {
            let str = searchString.toLowerCase();
            this.searchString = str;
            this.filteredUsers = this.users.filter(user => {
                return user.fullName.toLowerCase().indexOf(this.searchString) >= 0 &&
                    !this.projectMembersIds.includes(user.id);
            });
        },
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
        this.filterUsers();
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
