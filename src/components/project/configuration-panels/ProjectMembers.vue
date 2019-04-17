<template>
<div class="list-members-wrapper">
  <b-loading :is-full-page="false" :active="loading" />
  <b-message v-if="error" type="is-danger" has-icon icon-size="is-small">
    <h2> {{ $t('error') }} </h2>
    <p> {{ $t('unexpected-error-info-message') }} </p>
  </b-message>
  <template v-else-if="!loading">
    <div class="columns">
      <div class="column is-one-quarter">
        <b-input v-model="searchString" :placeholder="$t('search-placeholder')" type="search" icon="search" />
      </div>

      <div class="column filter is-one-quarter">
        <div class="filter-label">
          {{$t('role')}}
        </div>
        <div class="filter-body">
          <cytomine-multiselect v-model="selectedRoles" :options="availableRoles" :multiple="true"
            :searchable="false" />
        </div>
      </div>
      <div class="column is-one-half has-text-right-desktop buttons">
        <button class="button is-link add-member" @click="addMemberModal = true">
          {{$t('button-add-members')}}
        </button>

        <button class="button is-danger" @click="confirmMembersRemoval()" :disabled="selectedMembers.length === 0">
          {{$t('button-remove-selected-members')}}
        </button>
      </div>
    </div>

    <b-table
      :data="filteredMembers"
      class="table-members"
      default-sort="username"
      :paginated="true"
      :per-page="perPage"
      pagination-size="is-small"
    >
      <template #header="{column}">
        <template v-if="column.label === 'SELECTOR'">
          <b-checkbox v-model="selectAll" :disabled="filteredMembers.length === 0" />
        </template>
        <template v-else>{{ column.label }}</template>
      </template>

      <template #default="{row: member}">
        <b-table-column label="SELECTOR" width="20">
          <b-checkbox v-model="member.selected" :disabled="member.id === currentUser.id" />
        </b-table-column>

        <b-table-column field="username" :label="$t('username')" sortable width="100">
          {{member.username}}
        </b-table-column>

        <b-table-column field="name" :label="$t('name')" sortable width="150">
          {{ member.name }}
        </b-table-column>

        <b-table-column field="indexRole" :label="$t('role')" sortable width="50">
          <span class="icons">
            <a @click="confirmToggleManager(member)">
              <i class="fas fa-user-cog" :class="{disabled: member.role === contributorRole}"></i>
            </a>
            <a v-if="member.role !== contributorRole" @click="toggleRepresentative(member)">
              <i class="fas fa-flag" :class="{disabled: !member.representativeId}"></i>
            </a>
          </span>
        </b-table-column>

        <b-table-column field="LDAP" :label="$t('source')" centered sortable width="50">
          <span class="tag ldap is-rounded is-info" :class="{ldap: member.LDAP}">
            {{$t(member.LDAP ? 'LDAP' : 'manual')}}
          </span>
        </b-table-column>

        <b-table-column label="" centered width="50">
          <router-link :to="`/project/${project.id}/activity/user/${member.id}`" class="button is-small is-link">
            {{$t('button-view-activity')}}
          </router-link>
        </b-table-column>
      </template>

      <template #empty>
        <div class="content has-text-grey has-text-centered">
          <p>{{$t('no-member-fitting-criteria')}}</p>
        </div>
      </template>

      <template #footer>
        <div class="has-text-centered">
          <a :href="exportURL" target="_self" class="button is-link">{{$t('button-export-as-csv')}}</a>
        </div>
      </template>

      <template #bottom-left>
        <b-select v-model="perPage" size="is-small">
          <option value="10">10 {{$t('per-page')}}</option>
          <option value="25">25 {{$t('per-page')}}</option>
          <option value="50">50 {{$t('per-page')}}</option>
          <option value="100">100 {{$t('per-page')}}</option>
        </b-select>
      </template>
    </b-table>

    <div class="legend">
      <h2>{{$t('legend')}}</h2>
      <p>
        <span class="icons">
          <i class="fas fa-user-cog disabled"></i>
        </span>
        {{$t('project-contributor')}}
      </p>
      <p>
        <span class="icons">
          <i class="fas fa-user-cog"></i>
          <i class="fas fa-flag disabled"></i>
        </span>
        {{$t('project-manager')}}
      </p>
      <p>
        <span class="icons">
          <i class="fas fa-user-cog"></i>
          <i class="fas fa-flag"></i>
        </span>
        {{$t('project-representative')}}
      </p>
    </div>

    <add-member-modal :active.sync="addMemberModal" @addMembers="refreshMembers()" />
  </template>
</div>
</template>

<script>
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import AddMemberModal from './AddMemberModal';
import {fullName} from '@/utils/user-utils.js';
import {Cytomine, ProjectRepresentative, ProjectRepresentativeCollection} from 'cytomine-client';

export default {
  name: 'projet-members',
  components: {
    CytomineMultiselect,
    AddMemberModal
  },
  data() {
    return {
      loading: true,
      error: false,

      addMemberModal: false,

      perPage: 25,
      searchString: '',

      contributorRole: this.$t('contributor'),
      managerRole: this.$t('manager'),
      availableRoles: [],
      selectedRoles: [],

      allMembers: [],
      representatives: [],
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser.user;
    },
    project() {
      return this.$store.state.project.project;
    },
    unformattedMembers() {
      return this.$store.state.project.members;
    },
    idManagers() {
      return this.$store.state.project.managers.map(manager => manager.id);
    },
    filteredMembers() {
      let filtered = this.allMembers;

      if(this.searchString) {
        let str = this.searchString.toLowerCase();
        filtered = filtered.filter(member => {
          return member.name.toLowerCase().indexOf(str) >= 0 || member.username.toLowerCase().indexOf(str) >= 0;
        });
      }

      filtered = filtered.filter(member => this.selectedRoles.includes(member.role));

      return filtered;
    },
    selectedMembers() {
      return this.allMembers.filter(member => member.selected);
    },
    selectAll: {
      get() {
        return this.filteredMembers.length > 0 && this.filteredMembers.every(member => {
          return member.selected || member.id === this.currentUser.id;
        });
      },
      set(value) {
        this.filteredMembers.forEach(member => {
          member.selected = (member.id !== this.currentUser.id && value);
        });
      }
    },
    exportURL() {
      // TODO in core: should export only the filtered users
      return Cytomine.instance.host + Cytomine.instance.basePath + `project/${this.project.id}/user/download?format=csv`;
    }
  },
  methods: {
    formatMembers() {
      let selectedIds = this.selectedMembers.map(m => m.id); // store current selection to be able to reselect it

      this.allMembers = this.unformattedMembers.map(uMember => {
        let member = uMember.clone();
        member.selected = selectedIds.includes(member.id);
        member.name = `${member.firstname} ${member.lastname}`;

        if(this.idManagers.includes(member.id)) {
          member.role = this.managerRole;
          member.indexRole = 1; // to allow sorting
        }
        else {
          member.role = this.contributorRole;
          member.indexRole = 0; // to allow sorting
        }

        let representative = this.representatives.find(r => r.user === member.id);
        if(representative) {
          member.representativeId = representative.id;
          member.indexRole = 2; // to allow sorting
        }

        return member;
      });
    },
    async fetchRepresentatives() {
      this.representatives = (await ProjectRepresentativeCollection.fetchAll({
        filterKey: 'project',
        filterValue: this.project.id
      })).array;
    },

    confirmMembersRemoval() {
      this.$dialog.confirm({
        title: this.$t('remove-members'),
        message: this.$tc('remove-members-confirmation-message', this.selectedMembers.length, {
          count: this.selectedMembers.length,
          username: fullName(this.selectedMembers[0])
        }),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
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
        this.$notify({type: 'success', text: this.$t('notif-success-remove-project-members')});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-remove-project-members')});
      }
    },

    confirmToggleManager(member) {
      if(member.id === this.currentUser.id && member.role !== this.contributorRole) {
        this.$dialog.confirm({
          title: this.$t('remove-yourself-from-manager'),
          message: this.$tc('remove-yourself-from-manager-confirmation-message'),
          type: 'is-danger',
          confirmText: this.$t('button-confirm'),
          cancelText: this.$t('button-cancel'),
          onConfirm: () => this.toggleManager(member)
        });
      }
      else {
        this.toggleManager(member);
      }
    },
    async toggleManager(member) {
      try {
        if(member.role !== this.contributorRole) {
          if(member.representativeId) {
            await ProjectRepresentative.delete(member.representativeId, this.project.id);
            await this.fetchRepresentatives();
          }
          await this.project.deleteAdmin(member.id);
        }
        else {
          await this.project.addAdmin(member.id);
        }
        await this.refreshMembers();

        if(member.id === this.currentUser.id) {
          await this.$store.dispatch('fetchUIConfig');
          if(!this.$store.state.project.configUI['project-configuration-tab']) {
            this.$router.push(`/project/${this.project.id}`);
          }
        }
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-change-role', {username: fullName(member)})});
      }
    },
    async toggleRepresentative(member) {
      try {
        if(member.representativeId) {
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
        this.$notify({type: 'error', text: this.$t('notif-error-change-role', {username: fullName(member)})});
      }
    },

    async refreshMembers() {
      try {
        await this.$store.dispatch('fetchProjectMembers');
        await this.fetchRepresentatives();
        this.formatMembers();
      }
      catch(error) {
        console.log(error);
        this.error = true;
      }
    }

  },
  async created() {
    this.availableRoles = [this.contributorRole, this.managerRole];
    this.selectedRoles = this.availableRoles;
    await this.refreshMembers();
    this.loading = false;
  }
};
</script>

<style scoped>
.filter {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 1em;
  margin-bottom: 0 !important;
}

.filter-body {
  flex-grow: 1;
}

.list-members-wrapper {
  min-height: 40vh;
}

.tag {
  font-size: 0.75em !important;
  font-weight: 600;
}

.tag.ldap {
  background-color: #A0C0E6;
}

.legend {
  margin-top: 0.8rem;
  margin-bottom: 1rem;
  border-radius: 10px;
  padding: 1rem 1.5em;
  background: #f8f8f8;
}

.legend p {
  padding-bottom: 0.4em;
}

.legend .icons {
  display: inline-block;
  width: 40px;
  margin-right: 0.7em;
}

a:hover .fas {
  color: rgb(35, 102, 216);
}

a:hover .fas.disabled, a:hover .disabled .fas {
  color: rgba(35, 102, 216, 0.5);
}

.fas {
  color: black;
  width: 20px;
  position: relative;
}

.fas.fa-flag {
  font-size: 0.8em;
  bottom: 0.5em;
}

.fas.disabled, .disabled .fas {
  color: rgba(0, 0, 0, 0.1);
}
</style>

<style>
.table-members {
  margin-top: 1.2em;
}
</style>
