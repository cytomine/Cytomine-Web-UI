<template>
<div class="list-members-wrapper">
    <b-loading :is-full-page="false" :active="loading"></b-loading>
    <template v-if="!loading">
        <div class="columns">
            <div class="column is-one-quarter">
                <b-input class="" v-model="searchString" :placeholder="$t('search-placeholder')"
                    type="search" icon="search"></b-input>
            </div>

            <div class="column">
                <button class="button" @click="toggleFilterDisplay()">
                    <span class="icon">
                        <i class="fas fa-filter"></i>
                    </span>
                    <span>{{filtersOpened ? $t("button-hide-filters") : $t("button-show-filters")}}</span>
                </button>
            </div>
            <div class="column is-one-half has-text-right-desktop buttons">
                <button class="button is-link add-member" @click="addMemberModal = true">
                    {{$t('button-add-members')}}
                </button>

                <button class="button is-danger" @click="confirmMembersRemoval()" :disabled="selectedMembers.length == 0">
                    {{$t('button-remove-selected-members')}}
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
                            label="label" track-by="value" :searchable="false">
                        </cytomine-multiselect>
                    </div>
                </div>
            </div>
        </b-collapse>

        <b-table :data="filteredMembers"
                 class="table-members"
                 default-sort="username"
                 :paginated="true"
                 :per-page="perPage"
                 pagination-size="is-small">

            <template slot-scope="props" slot="header">
                <template v-if="props.column.label == 'SELECTOR'">
                    <input type="checkbox" v-model="selectAll" :disabled="filteredMembers.length == 0">
                </template>
                <template v-else>{{ props.column.label }}</template>
            </template>

            <template slot-scope="props">
                <b-table-column label="SELECTOR" width="20">
                    <input type="checkbox" v-model="props.row.selected" :disabled="props.row.id == currentUser.id">
                </b-table-column>

                <b-table-column field="username" :label="$t('username')" sortable width="100">
                    <username :user="props.row" 
                              :online="onlineIds.includes(props.row.id)" 
                              :displayFullName="false">
                    </username>
                </b-table-column>

                <b-table-column field="name" :label="$t('name')" sortable width="150">
                    {{ props.row.name }}
                </b-table-column>

                <b-table-column field="role.value" :label="$t('role')" sortable width="50">
                    <span class="icons">
                        <a @click="confirmToggleManager(props.row)">
                            <i class="fas fa-cog" :class="{disabled: props.row.role == contributorRole}"></i>
                        </a>
                        <a v-if="props.row.role != contributorRole" @click="toggleRepresentative(props.row)">
                            <i class="fas fa-cog" :class="{disabled: props.row.representativeId == null}">
                                <i class="superscript fas fa-plus" :class="{disabled: props.row.representativeId == null}"></i>
                            </i>
                        </a>
                    </span>
                </b-table-column>

                <b-table-column field="email" :label="$t('email')" sortable width="200">
                    <a :href="`mailto:${props.row.email}`">{{ props.row.email }}</a>
                </b-table-column>

                <b-table-column field="LDAP" :label="$t('source')" centered sortable width="50">
                    <span class="tag ldap is-rounded is-info" :class="{ldap: props.row.LDAP}">
                        {{$t(props.row.LDAP ? "LDAP" : "manual")}}
                    </span>
                </b-table-column>

                <b-table-column field="lastImage" :label="$t('last-image')" centered sortable width="100">
                    - <!-- TODO in backend -->
                </b-table-column>

                <b-table-column field="lastConnection" :label="$t('last-connection')" centered sortable width="100">
                    - <!-- TODO in backend -->
                </b-table-column>

                <b-table-column field="numberConnections" :label="$t('number-connections')" centered sortable width="100">
                    - <!-- TODO in backend -->
                </b-table-column>

                <b-table-column label="" centered width="50">
                    <router-link :to="``" class="button is-small is-link">
                        {{$t("button-details")}} <!-- TODO -->
                    </router-link>
                </b-table-column>
            </template>

            <template slot="empty">
                <div class="content has-text-grey has-text-centered">
                    <p>{{$t("no-member-fitting-criteria")}}</p>
                </div>
            </template>

            <p class="has-text-centered" slot="footer">
                <button class="button is-link">{{$t("export-as-csv")}}</button> <!-- TODO -->
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
                <span class="icons">
                    <i class="fas fa-cog disabled"></i> 
                </span>
                {{$t('project-contributor')}}
            </p>
            <p>
                <span class="icons">
                    <i class="fas fa-cog"></i> 
                    <i class="fas fa-cog disabled"><i class="superscript disabled fas fa-plus"></i></i> 
                </span>
                {{$t('project-manager')}}
            </p>
            <p>
                <span class="icons">
                    <i class="fas fa-cog"></i> 
                    <i class="fas fa-cog"><i class="superscript fas fa-plus"></i></i>
                </span>
                {{$t('project-representative')}}
            </p>
        </div>
    </template>

    <add-member-modal :active.sync="addMemberModal" @addMembers="refreshMembers()">
    </add-member-modal>
</div>
</template>

<script>
import CytomineMultiselect from "@/components/form/CytomineMultiselect";
import Username from "@/components/user/Username";
import AddMemberModal from "./AddMemberModal";
import {fullName} from "@/utils/user-utils.js";
import {ProjectRepresentative, ProjectRepresentativeCollection} from "cytomine-client";

export default {
    name: "projet-members",
    components: {
        CytomineMultiselect,
        AddMemberModal,
        Username
    },
    data() {
        return {
            loading: true,
            addMemberModal: false,

            perPage: 25,
            filtersOpened: false,
            searchString: "",
            
            contributorRole: null,
            managerRole: null,
            representativeRole: null,
            availableRoles: [],
            selectedRoles: [],

            onlineStatus: "",
            offlineStatus: "",
            availableStatus: [],
            selectedStatus: [],

            allMembers: [],

            representatives: [],
            onlineIds: []
        };
    },
    computed: {
        currentUser() {
            return this.$store.state.currentUser.user;
        },
        project() {
            return this.$store.state.project.project;
        },
        contributors() {
            return this.$store.state.project.contributors;
        },
        managers() {
            return this.$store.state.project.managers;
        },
        filteredMembers() {
            let filtered = this.allMembers;

            if(this.searchString != "") {
                let str = this.searchString.toLowerCase();
                filtered = filtered.filter(member => {
                    return member.name.toLowerCase().indexOf(str) >= 0 || member.username.toLowerCase().indexOf(str) >= 0;
                });
            }

            filtered = filtered.filter(member => this.selectedRoles.includes(member.role));
            filtered = filtered.filter(member => {
                let online = this.onlineIds.includes(member.id);
                return (this.selectedStatus.includes(this.onlineStatus) && online) || 
                    (this.selectedStatus.includes(this.offlineStatus) && !online); 
            });

            return filtered;
        },
        selectedMembers() {
            return this.allMembers.filter(member => member.selected);
        },
        selectAll: {
            get() {
                return this.filteredMembers.length > 0 && this.filteredMembers.every(member => member.selected);
            },
            set(value) {
                this.filteredMembers.forEach(member => member.selected = value);
            }
        }
    },
    methods: {
        formatMembers() {
            let selectedIds = this.selectedMembers.map(m => m.id); // store current selection to be able to reselect it

            let managers = this.managers.map(manager => {
                let member = manager.clone();
                member.role = this.managerRole;
                return member;
            });

            let contributors = this.contributors.map(contrib => {
                let member = contrib.clone();
                member.role = this.contributorRole;
                return member;
            });

            let members = contributors.concat(managers);
            members.forEach(member => {
                member.selected = selectedIds.includes(member.id);
                member.name = `${member.firstname} ${member.lastname}`;
                let representative = this.representatives.find(r => r.user == member.id);
                if(representative != null) {
                    member.role = this.representativeRole;
                    member.representativeId = representative.id;
                }
            });

            this.allMembers = members;
        },
        async fetchRepresentatives() {
            this.representatives = (await ProjectRepresentativeCollection.fetchAll({
                filterKey: "project",
                filterValue: this.project.id
            })).array;
        },
        async fetchOnlines() {
            let onlines = await this.project.fetchConnectedUsers();
            this.onlineIds = onlines.map(o => o.id);
        },

        toggleFilterDisplay() {
            this.filtersOpened = !this.filtersOpened;
        },

        confirmMembersRemoval() {
            this.$dialog.confirm({
                title: this.$t("remove-members"),
                message: this.$tc("remove-members-confirmation-message", this.selectedMembers.length, {
                    count: this.selectedMembers.length, 
                    username: fullName(this.selectedMembers[0])
                }),
                type: "is-danger",
                confirmText: this.$t("button-confirm"),
                cancelText: this.$t("button-cancel"),
                onConfirm: () => this.removeSelectedMembers()
            });
        },
        async removeSelectedMembers() {
            let updatedProject = this.project.clone();
            updatedProject.users = this.allMembers.reduce((ids, member) => {
                if(!member.selected) {
                    ids.push(member.id);
                }
                return ids;
            }, []);

            try {
                await updatedProject.save();
                await this.refreshMembers();
                this.$notify({type: "success", text: this.$t("notif-success-remove-project-members")});
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-remove-project-members")});
            }
        },

        confirmToggleManager(member) {
            if(member.id == this.currentUser.id && member.role != this.contributorRole) {
                this.$dialog.confirm({
                    title: this.$t("remove-yourself-from-manager"),
                    message: this.$tc("remove-yourself-from-manager-confirmation-message"),
                    type: "is-danger",
                    confirmText: this.$t("button-confirm"),
                    cancelText: this.$t("button-cancel"),
                    onConfirm: () => this.toggleManager(member)
                });
            }
            else {
                this.toggleManager(member);
            }
        },
        async toggleManager(member) {
            try {
                if(member.role != this.contributorRole) {
                    if(member.representativeId != null) {
                        await ProjectRepresentative.delete(member.representativeId, this.project.id);
                        await this.fetchRepresentatives();
                    }
                    await this.project.deleteAdmin(member.id);
                }
                else {
                    await this.project.addAdmin(member.id);
                }
                await this.refreshMembers();

                if(member.id == this.currentUser.id) {
                    await this.$store.dispatch("fetchUIConfig");
                    if(!this.$store.state.project.configUI["project-configuration-tab"]) {
                        this.$router.push(`/project/${this.project.id}`);
                    }
                }
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-change-role", {username: fullName(member)})});
            }
        },
        async toggleRepresentative(member) {
            try {
                if(member.representativeId != null) {
                    await ProjectRepresentative.delete(member.representativeId, this.project.id);
                }
                else {
                    await new ProjectRepresentative({user: member.id, project: this.project.id}).save();
                }
                await this.fetchRepresentatives();
                this.formatMembers();
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-change-role", {username: fullName(member)})});
            }
        },

        async refreshMembers() {
            await this.$store.dispatch("fetchProjectMembers");
            this.formatMembers();
        }

    },
    async created() {
        this.contributorRole = {value: 0, label: this.$t("contributor")};
        this.managerRole = {value: 1, label: this.$t("manager")};
        this.representativeRole = {value: 2, label: this.$t("representative")};
        this.availableRoles = [this.contributorRole, this.managerRole, this.representativeRole];
        this.selectedRoles = this.availableRoles;

        this.onlineStatus = this.$t("online");
        this.offlineStatus = this.$t("offline");
        this.availableStatus = [this.onlineStatus, this.offlineStatus];
        this.selectedStatus = this.availableStatus;

        await Promise.all([
            this.fetchRepresentatives(),
            this.fetchOnlines()
        ]);

        this.formatMembers();
        this.loading = false;
    }
};
</script>

<style scoped>
.list-members-wrapper {
    min-height: 200px;
}

.tag {
    font-size: 11px !important;
    font-weight: 600;
}

.tag.ldap {
    background-color: #A0C0E6;
}

.table-footer {
    text-align: center;
}

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

.legend .icons {
    display: inline-block;
    width: 40px;
    margin-right: 10px;
}

a:hover .fas {
    color: rgb(35, 102, 216);
}

a:hover .fas.disabled {
    color: rgba(35, 102, 216, 0.5);
}

.fas {
    color: black;
}

.fas.fa-cog {
    width: 20px;
    position: relative;
}

.fas.disabled {
    color: rgba(0, 0, 0, 0.1);
}

.superscript {
    font-size: 8px;
    position: absolute;
    top: -3px;
}

</style>

<style>
.table-members {
    margin-top: 20px;
}
</style>
