<template>
    <div class="box">
        <h2>{{$t("members-activity")}}</h2>

        <div class="columns">
            <div class="column is-one-quarter">
                <b-input v-model="searchString" :placeholder="$t('search-placeholder')" type="search" icon="search"></b-input>
            </div>

            <div class="column">
                <button class="button" @click="filtersOpened = !filtersOpened">
                    <span class="icon">
                        <i class="fas fa-filter"></i>
                    </span>
                    <span>{{filtersOpened ? $t("button-hide-filters") : $t("button-show-filters")}}</span>
                </button>
            </div>
        </div>

        <b-collapse :open="filtersOpened">
            <div class="filters columns">
                <div class="column filter">
                    <div class="filter-label">
                        {{$t("status")}}
                    </div>
                    <div class="filter-body">
                        <cytomine-multiselect v-model="selectedStatus" :options="availableStatus" :multiple="true"
                            :searchable="false">
                        </cytomine-multiselect>
                    </div>
                </div>

                <div class="column filter">
                    <div class="filter-label">
                        {{$t("role")}}
                    </div>
                    <div class="filter-body">
                        <cytomine-multiselect v-model="selectedRoles" :options="availableRoles" :multiple="true"
                            :searchable="false">
                        </cytomine-multiselect>
                    </div>
                </div>
            </div>
        </b-collapse>

        <b-table :data="filteredMembers" default-sort="username"
                 :paginated="true" :per-page="perPage" pagination-size="is-small">

            <template slot-scope="{row: member}">
                <b-table-column field="username" :label="$t('username')" sortable width="100">
                    <username :user="member" :online="onlineIds.includes(member.id)" :displayFullName="false"></username>
                </b-table-column>

                <b-table-column field="name" :label="$t('name')" sortable width="150">
                    {{ member.name }}
                </b-table-column>

                <b-table-column field="role" :label="$t('role')" centered sortable width="20">
                    <i class="fas fa-cog" :title="$t('manager-icon-label')" v-if="member.role === contributorRole"></i>
                </b-table-column>

                <b-table-column field="email" :label="$t('email')" sortable width="200">
                    <a :href="`mailto:${member.email}`">{{ member.email }}</a>
                </b-table-column>

                <b-table-column field="lastImageName" :label="$t('last-image')" sortable width="100">
                    <template v-if="member.lastImageId">
                        <router-link :to="`project/${project.id}/image/${member.lastImageId}`">
                            {{member.lastImageName}}
                        </router-link>
                    </template>
                    <em v-else class="has-text-grey">{{$t("no-record")}}</em>
                </b-table-column>

                <b-table-column field="lastConnection" :label="$t('last-connection')" sortable width="100">
                    <template v-if="member.lastConnection">
                        {{Number(member.lastConnection) | moment("ll LT")}}
                    </template>
                    <em v-else class="has-text-grey">{{$t("no-record")}}</em>
                </b-table-column>

                <b-table-column field="frequency" :label="$t('number-connections')" sortable width="100">
                    {{member.frequency}}
                </b-table-column>

                <b-table-column label="" centered width="50">
                    <router-link :to="`/project/${project.id}/activity/user/${member.id}`" class="button is-small is-link">
                        {{$t("button-details")}}
                    </router-link>
                </b-table-column>
            </template>

            <template slot="empty">
                <div class="content has-text-grey has-text-centered">
                    <p>{{$t("no-member-fitting-criteria")}}</p>
                </div>
            </template>

            <p class="has-text-centered" v-if="isManager" slot="footer">
                <router-link class="button is-link add-member" :to="`/project/${project.id}/configuration?tab=members`">
                    {{$t('button-manage-members')}}
                </router-link>
            </p>

            <template slot="bottom-left">
                <b-select v-model="perPage" size="is-small">
                    <option value="10">10 {{$t("per-page")}}</option>
                    <option value="25">25 {{$t("per-page")}}</option>
                    <option value="50">50 {{$t("per-page")}}</option>
                    <option value="100">100 {{$t("per-page")}}</option>
                </b-select>
            </template>
        </b-table>

        <div class="legend">
            <h2>{{$t("legend")}}</h2>
            <p>
                <i class="fas fa-cog"></i>: {{$t('project-manager')}}
            </p>
        </div>

    </div>
</template>

<script>
// TODO: refresh interval (+ display last update date)
import CytomineMultiselect from "@/components/form/CytomineMultiselect";
import Username from "@/components/user/Username";

export default {
    name: "members-activity",
    components: {
        CytomineMultiselect,
        Username
    },
    data() {
        return {
            searchString: "",
            filtersOpened: false,
            perPage: 25,
            members: [],
            onlineIds: [],

            contributorRole: this.$t("contributor"),
            managerRole: this.$t("manager"),
            availableRoles: [],
            selectedRoles: [],

            onlineStatus: this.$t("online"),
            offlineStatus: this.$t("offline"),
            availableStatus: [],
            selectedStatus: [],
        };
    },
    computed: {
        project() {
            return this.$store.state.project.project;
        },
        isManager() {
            return this.$store.getters.canManageProject;
        },
        idManagers() {
            return this.$store.state.project.managers.map(manager => manager.id);
        },
        filteredMembers() {
            let str = this.searchString.toLowerCase();
            let includeOnline = this.selectedStatus.includes(this.onlineStatus);
            let includeOffline = this.selectedStatus.includes(this.offlineStatus);
            return this.members.filter(member => {
                let online = this.onlineIds.includes(member.id);
                return (member.name.toLowerCase().indexOf(str) >= 0 || member.username.toLowerCase().indexOf(str) >= 0)
                    && ((includeOnline && online) || (includeOffline && !online))
                    && this.selectedRoles.includes(member.role);
            });
        }
    },
    methods: {
        async fetchMembers() {
            let members = (await this.project.fetchUsersActivity()).array;
            members.forEach(member => {
                member.name = `${member.firstname} ${member.lastname}`;
                member.role = this.idManagers.includes(member.id) ? this.managerRole : this.contributorRole;
            });
            this.members = members;
        },
        async fetchOnlines() {
            let onlines = await this.project.fetchConnectedUsers();
            this.onlineIds = onlines.map(o => o.id);
        }
    },
    async created() {
        this.availableRoles = [this.contributorRole, this.managerRole];
        this.selectedRoles = this.availableRoles;

        this.availableStatus = [this.onlineStatus, this.offlineStatus];
        this.selectedStatus = this.availableStatus;

        await Promise.all([
            this.fetchMembers(),
            this.fetchOnlines()
        ]);

        this.loading = false;
    }
};
</script>

<style scoped>
.legend {
    margin-top: 10px;
    margin-bottom: 15px;
    border-radius: 10px;
    padding: 20px;
    background: #f8f8f8;
}

.legend p {
    padding-bottom: 5px;
}
</style>
