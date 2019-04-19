<template>
  <div class="box" v-if="!loading">
    <b-message v-if="error" type="is-danger" has-icon icon-size="is-small">
      <h2> {{ $t('error') }} </h2>
      <p> {{ $t('unexpected-error-info-message') }} </p>
    </b-message>
    <template v-else>
      <div class="columns">
        <h2 class="column is-marginless">{{$t('members-activity')}}</h2>
        <p class="column has-text-right is-size-7 has-text-grey">
          {{$t('data-last-updated-on', {time: $options.filters.moment(lastUpdate, 'LTS')})}}
        </p>
      </div>

      <div class="columns">
        <div class="column is-one-quarter">
          <b-input v-model="searchString" :placeholder="$t('search-placeholder')" type="search" icon="search" />
        </div>

        <div class="column">
          <button class="button" @click="filtersOpened = !filtersOpened">
            <span class="icon">
              <i class="fas fa-filter"></i>
            </span>
            <span>{{filtersOpened ? $t('button-hide-filters') : $t('button-show-filters')}}</span>
          </button>
        </div>
      </div>

      <b-collapse :open="filtersOpened">
        <div class="filters columns">
          <div class="column filter">
            <div class="filter-label">
              {{$t('status')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect v-model="selectedStatus" :options="availableStatus" :multiple="true"
                :searchable="false" disabled />
            </div>
          </div>

          <div class="column filter">
            <div class="filter-label">
              {{$t('role')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect v-model="selectedRoles" :options="availableRoles" :multiple="true"
                :searchable="false" />
            </div>
          </div>
        </div>
      </b-collapse>

      <b-table
        :data="filteredMembers"
        default-sort="username"
        :paginated="true"
        :per-page="perPage"
        pagination-size="is-small"
      >
        <template #default="{row: member}">
          <b-table-column field="username" :label="$t('username')" sortable width="100">
            <username :user="member" :online="onlineIds ? onlineIds.includes(member.id) : null" :displayFullName="false" />
          </b-table-column>

          <b-table-column field="name" :label="$t('name')" sortable width="150">
            {{ member.name }}
          </b-table-column>

          <b-table-column field="role" :label="$t('role')" centered sortable width="20">
            <i class="fas fa-user-cog" :title="$t('project-manager')" v-if="member.role === managerRole"></i>
          </b-table-column>

          <b-table-column field="lastImageName" :label="$t('last-image')" sortable width="100">
            <template v-if="member.lastImageId">
              <router-link :to="`/project/${project.id}/image/${member.lastImageId}`">
                {{member.lastImageName}}
              </router-link>
            </template>
            <em v-else class="has-text-grey">{{$t('no-record')}}</em>
          </b-table-column>

          <b-table-column field="lastConnection" :label="$t('last-connection')" sortable width="100">
            <template v-if="member.lastConnection">
              {{Number(member.lastConnection) | moment('ll LT')}}
            </template>
            <em v-else class="has-text-grey">{{$t('no-record')}}</em>
          </b-table-column>

          <b-table-column field="frequency" :label="$t('number-connections')" sortable width="100">
            {{member.frequency}}
          </b-table-column>

          <b-table-column label="" centered width="50">
            <router-link :to="`/project/${project.id}/activity/user/${member.id}`" class="button is-small is-link">
              {{$t('button-details')}}
            </router-link>
          </b-table-column>
        </template>

        <template #empty>
          <div class="content has-text-grey has-text-centered">
            <p>{{$t('no-member-fitting-criteria')}}</p>
          </div>
        </template>

        <template #footer v-if="isManager">
          <p class="has-text-centered">
            <router-link class="button is-link add-member" :to="`/project/${project.id}/configuration?tab=members`">
              {{$t('button-manage-members')}}
            </router-link>
          </p>
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
          <i class="fas fa-user-cog"></i>: {{$t('project-manager')}}
        </p>
      </div>
    </template>
  </div>
</template>

<script>
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import Username from '@/components/user/Username';

import constants from '@/utils/constants.js';

export default {
  name: 'members-activity',
  components: {
    CytomineMultiselect,
    Username
  },
  data() {
    return {
      loading: true,
      error: false,

      searchString: '',
      filtersOpened: false,
      perPage: 25,
      members: [],
      onlineIds: null,

      contributorRole: this.$t('contributor'),
      managerRole: this.$t('manager'),
      availableRoles: [],
      selectedRoles: [],

      onlineStatus: this.$t('online'),
      offlineStatus: this.$t('offline'),
      availableStatus: [],
      selectedStatus: [],

      lastUpdate: null,
      timeout: null
    };
  },
  computed: {
    project() {
      return this.$store.state.currentProject.project;
    },
    isManager() {
      return this.$store.getters.canManageProject;
    },
    idManagers() {
      return this.$store.state.currentProject.managers.map(manager => manager.id);
    },
    filteredMembers() {
      let str = this.searchString.toLowerCase();
      let statusKnown = Boolean(this.onlineIds); // whether or not the info regarding online users could be fetched
      let includeOnline = this.selectedStatus.includes(this.onlineStatus);
      let includeOffline = this.selectedStatus.includes(this.offlineStatus);
      return this.members.filter(member => {
        let online = statusKnown ? this.onlineIds.includes(member.id) : null;
        return (member.name.toLowerCase().indexOf(str) >= 0 || member.username.toLowerCase().indexOf(str) >= 0)
                    && (!statusKnown || (includeOnline && online) || (includeOffline && !online))
                    && this.selectedRoles.includes(member.role);
      });
    }
  },
  methods: {
    async fetchData() {
      try {
        await Promise.all([
          this.fetchMembers(),
          this.fetchOnlines()
        ]);
      }
      catch(error) {
        console.log(error);
        this.error = true;
        return;
      }

      this.lastUpdate = new Date();
      clearTimeout(this.timeout);
      this.timeout = setTimeout(this.fetchData, constants.MEMBERS_ACTIVITY_REFRESH_INTERVAL);
    },
    async fetchMembers() {
      let members = (await this.project.fetchUsersActivity()).array;
      members.forEach(member => {
        member.name = `${member.firstname} ${member.lastname}`;
        member.role = this.idManagers.includes(member.id) ? this.managerRole : this.contributorRole;
      });
      this.members = members;
    },
    async fetchOnlines() {
      try {
        let onlines = await this.project.fetchConnectedUsers();
        this.onlineIds = onlines.map(o => o.id);
      }
      catch(error) {
        console.log(error);
        this.onlineIds = null;
      }
    }
  },
  async created() {
    this.availableRoles = [this.contributorRole, this.managerRole];
    this.selectedRoles = this.availableRoles;

    this.availableStatus = [this.onlineStatus, this.offlineStatus];
    this.selectedStatus = this.availableStatus;
  },
  async activated() {
    await this.fetchData();
    this.loading = false;
  },
  deactivated() {
    clearTimeout(this.timeout);
  }
};
</script>

<style scoped>
.legend {
  margin-top: 0.8rem;
  margin-bottom: 1rem;
  border-radius: 10px;
  padding: 1.4em;
  background: #f8f8f8;
}

.fas.fa-user-cog {
  width: 20px;
}
</style>
