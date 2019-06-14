<template>
<div>
  <b-loading :is-full-page="false" :active="loading" />
  <template v-if="!loading">
    <b-message v-if="!users" type="is-danger" has-icon icon-size="is-small">
      <h2> {{ $t('error') }} </h2>
      <p> {{ $t('unexpected-error-info-message') }} </p>
    </b-message>
    <template v-else>
      <div class="columns">
        <div class="column is-one-quarter">
          <b-input v-model="searchString" :placeholder="$t('search-placeholder')" type="search" icon="search" />
        </div>

        <div class="column is-one-half has-text-right-desktop">
          <button class="button is-link" @click="startUserCreation()">
            {{$t('button-new-user')}}
          </button>
        </div>
      </div>

      <b-table
        :data="filteredUsers"
        default-sort="username"
        :paginated="true"
        :per-page="perPage"
        pagination-size="is-small"
        detailed
        detail-key="id"
      >

        <template #default="{row: user}">

          <b-table-column field="username" :label="$t('username')" sortable width="100">
            {{user.username}}
          </b-table-column>

          <b-table-column field="name" :label="$t('name')" sortable width="150">
            {{ user.name }}
          </b-table-column>

          <b-table-column field="roleObject.index" :label="$t('role')" sortable width="50">
            <span class="tag" :class="user.roleObject.class">{{$t(user.roleObject.label)}}</span>
          </b-table-column>

          <b-table-column field="email" :label="$t('email')" sortable width="150">
            <a :href="`mailto:${user.email}`">{{ user.email }}</a>
          </b-table-column>

          <b-table-column field="LDAP" :label="$t('source')" centered sortable width="50">
            <span :class="['tag', user.LDAP ? 'is-link' : 'is-grey']">
              {{$t(user.LDAP ? 'LDAP' : 'manual')}}
            </span>
          </b-table-column>

          <b-table-column field="created" :label="$t('created')" sortable width="150">
            {{Number(user.created) | moment('ll LT')}}
          </b-table-column>

          <b-table-column field="updated" :label="$t('updated')" sortable width="150">
            <template v-if="user.updated">{{Number(user.updated) | moment('ll LT')}}</template>
            <template v-else>-</template>
          </b-table-column>

          <b-table-column label="" width="100">
            <div class="buttons">
              <button class="button is-link is-small" @click="startUserEdition(user)">
                {{$t('button-edit')}}
              </button>
              <button v-if="user.enabled" class="button is-danger is-small" @click="lock(user)">
                {{$t('button-lock')}}
              </button>
              <button v-else class="button is-success is-small" @click="unlock(user)">
                {{$t('button-unlock')}}
              </button>
            </div>
          </b-table-column>
        </template>

        <template #detail="{row: user}">
          <user-details :user="user" />
        </template>

        <template #empty>
          <div class="content has-text-grey has-text-centered">
            <p>{{$t('no-user-fitting-criteria')}}</p>
          </div>
        </template>

        <template #bottom-left>
          <b-select v-model="perPage" size="is-small">
            <option value="10">{{$t('count-per-page', {count: 10})}}</option>
            <option value="25">{{$t('count-per-page', {count: 25})}}</option>
            <option value="50">{{$t('count-per-page', {count: 50})}}</option>
            <option value="100">{{$t('count-per-page', {count: 100})}}</option>
          </b-select>
        </template>
      </b-table>

      <user-modal :active.sync="modal" :user="editedUser" @addUser="addUser" @updateUser="updateUser" />
    </template>
  </template>
</div>
</template>

<script>
import {UserCollection} from 'cytomine-client';
import UserModal from './UserModal';
import UserDetails from './UserDetails';
import {rolesMapping} from '@/utils/role-utils';
import {getWildcardRegexp} from '@/utils/string-utils';

export default {
  name: 'admin-users',
  components: {
    UserModal,
    UserDetails
  },
  data() {
    return {
      loading: true,
      users: null,
      addUserModal: false,
      searchString: '',
      perPage: 25,
      modal: false,
      editedUser: null
    };
  },
  computed: {
    roles() {
      return rolesMapping;
    },
    regexp() {
      return getWildcardRegexp(this.searchString);
    },
    filteredUsers() {
      if(!this.searchString) {
        return this.users;
      }

      return this.users.filter(user => this.regexp.test(user.name) || this.regexp.test(user.username));
    }
  },
  methods: {
    formatUser(user) {
      user.name = `${user.firstname} ${user.lastname}`;
      user.roleObject = this.roles[user.role];
    },
    async lock(user) {
      try {
        await user.lock();
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-user-lock')});
      }
    },
    async unlock(user) {
      try {
        await user.unlock();
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-user-unlock')});
      }
    },
    startUserCreation() {
      this.editedUser = null;
      this.modal = true;
    },
    addUser(user) {
      this.formatUser(user);
      this.users.push(user);
    },
    startUserEdition(user) {
      this.editedUser = user;
      this.modal = true;
    },
    updateUser(user) {
      this.formatUser(user);
      this.editedUser.populate(user);
    }
  },
  async created() {
    try {
      let users = (await UserCollection.fetchAll({withRoles: true})).array;
      users.forEach(user => this.formatUser(user));
      this.users = users;
    }
    catch(error) {
      console.log(error);
    }
    this.loading = false;
  }
};
</script>
