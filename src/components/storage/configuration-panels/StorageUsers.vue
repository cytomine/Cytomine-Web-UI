<!-- Copyright (c) 2009-2021. Authors: see NOTICE file.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.-->

<template>
<div class="storage-members-wrapper" v-if="!loading">
  <b-loading :is-full-page="false" :active="loading" />
  <b-message v-if="error" type="is-danger" has-icon icon-size="is-small">
    <h2> {{ $t('error') }} </h2>
    <p> {{ $t('unexpected-error-info-message') }} </p>
  </b-message>

  <template v-else-if="!loading">
    <div class="columns">
      <div class="column is-one-half has-text-right-desktop buttons">
        <button class="button is-link add-member" @click="addUserToStorageModal = true">
          {{$t('add-users-to-storage')}}
        </button>

        <button class="button is-danger" @click="confirmUsersRemoval()" :disabled="selectedUsers.length === 0">
          {{$t('remove-users-from-storage')}}
        </button>
      </div>
    </div>

    <cytomine-table
      :collection="UserStatCollection"
      :currentPage.sync="currentPage"
      :perPage.sync="perPage"
      :sort.sync="sortField"
      :order.sync="sortOrder"
      :detailed=false
      :checkable=true
      :isRowCheckable="(row) => row.id !== storage.user"
      :checkedRows.sync="selectedUsers"
      :revision="revision"
    >

      <template #default="{row: userStat}">
        <b-table-column field="username" :label="$t('username')" sortable width="100">
          {{userStat.username}}
        </b-table-column>

        <b-table-column field="fullName" :label="$t('name')" sortable width="150">
          {{userStat.firstname}} {{userStat.lastname}}
        </b-table-column>

        <b-table-column field="role" :label="$t('role')" sortable width="50" >
          <icon-storage-user-role
            v-if="userStat.id !== storage.user"
            :is-read-write="userStat.role !== readOnlyRole.value"
            :is-administrator="userStat.role === administrationRole.value"
            editable
            @toggleReadWrite="toggleReadWrite(userStat)"
            @toggleAdministrator="confirmToggleAdministrator(userStat)"
          />

          <span class="tag is-rounded is-info"  v-if="userStat.id === storage.user">
              {{$t('owner')}}
          </span>
        </b-table-column>

        <b-table-column field="numberOfFiles" :label="$t('uploaded-files-number')" sortable width="150">
          {{userStat.numberOfFiles}}
        </b-table-column>

        <b-table-column field="totalSize" :label="$t('total-size')" sortable width="150">
          {{filesize(userStat.totalSize)}}
        </b-table-column>


      </template>

      <template #empty>
        <div class="content has-text-grey has-text-centered">
          <p>{{$t('no-member-fitting-criteria')}}</p>
        </div>
      </template>
    </cytomine-table>

    <div class="legend">
      <h2>{{$t('legend')}}</h2>
      <p><icon-storage-user-role /> : {{$t('read-only-role')}}</p>
      <p><icon-storage-user-role :is-read-write="true" /> : {{$t('read-write-role')}}</p>
      <p><icon-storage-user-role :is-read-write="true" :is-administrator="true" /> : {{$t('administration')}}</p>
    </div>

   <add-user-to-storage-modal :active.sync="addUserToStorageModal" :storage="storage" @addUsersInStorage="refreshUsers()" />
  </template>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';

import {Storage, StorageUserCollection} from 'cytomine-client';

import CytomineTable from '@/components/utils/CytomineTable';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import IconStorageUserRole from '@/components/icons/IconStorageUserRole';
import filesize from 'filesize';
import AddUserToStorageModal from '../AddUserToStorageModal';
import {fullName} from '../../../utils/user-utils';

export default {
  name: 'storage-users',
  components: {
    AddUserToStorageModal,
    IconStorageUserRole,
    CytomineTable,
    CytomineMultiselect,
  },
  data() {
    return {
      loading: true,
      error: false,
      currentPage: 1,
      perPage: 25,
      sortField: '',
      sortOrder: '',

      readOnlyRole: {label:this.$t('read-only-role'), value : 'READ'},
      readWriteRole: {label:this.$t('read-write-role'), value: 'WRITE'},
      administrationRole: {label:this.$t('administration'), value: 'ADMINISTRATION'},

      selectedUsers: [],

      storage: null,
      addUserToStorageModal: false,

      revision: 0
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    idStorage() {
      return Number(this.$route.params.idStorage);
    },
    UserStatCollection() {
      let collection = new StorageUserCollection({
        filterKey: 'storage',
        filterValue: this.storage.id,
      });
      return collection;
    }
  },
  watch: {
    async idStorage() {
      this.loading = true;
      await this.loadStorage();
    },
  },
  methods: {
    async loadStorage() {
      try {
        await Promise.all([
          this.fetchStorage()
        ]);
      }
      catch(error) {
        console.log(error);
        this.error = true;
        return;
      }

      this.chartRevision++;
    },
    filesize(size) {
      return (size) ? filesize(size, {base: 10}) : null;
    },
    async fetchStorage() {
      this.storage = await Storage.fetch(this.idStorage);
    },
    async refreshUsers() {
      try {
        this.revision++;
        await this.$store.dispatch('currentStorage/fetchStorageUsers');
      }
      catch(error) {
        console.log(error);
        this.error = true;
      }
    },
    confirmUsersRemoval() {
      this.$buefy.dialog.confirm({
        title: this.$t('remove-users'),
        message: this.$tc('remove-users-confirmation-message', this.selectedUsers.length, {
          count: this.selectedUsers.length,
          username: fullName(this.selectedUsers[0])
        }),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => this.removeSelectedUsers()
      });
    },
    async removeSelectedUsers() {
      try {
        await this.storage.deleteUsers(this.selectedUsers.map(member => member.id));
        await this.refreshUsers();
        this.$notify({type: 'success', text: this.$t('notif-success-remove-storage-users')});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-remove-storage-users')});
      }
    },
    confirmToggleAdministrator(user) {
      if(user.id === this.currentUser.id && user.role !== this.readOnlyRole.value && user.role !== this.readWriteRole.value) {
        this.$buefy.dialog.confirm({
          title: this.$t('remove-yourself-from-administrator'),
          message: this.$tc('remove-yourself-from-administrator-confirmation-message'),
          type: 'is-danger',
          confirmText: this.$t('button-confirm'),
          cancelText: this.$t('button-cancel'),
          onConfirm: () => this.toggleAdministrator(user)
        });
      }
      else {
        this.toggleAdministrator(user);
      }
    },
    async toggleAdministrator(user) {
      try {
        if(user.role === this.administrationRole.value) {
          await this.storage.changePermission(user.id, this.readWriteRole.value);
        }
        else {
          await this.storage.changePermission(user.id, this.administrationRole.value);
        }
        this.revision++;
        this.refreshUsers();
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-change-role', {username: fullName(user)})});
      }
    },
    async toggleReadWrite(user) {
      try {
        if(user.role === this.readOnlyRole.value) {
          await this.storage.changePermission(user.id, this.readWriteRole.value);
        }
        else {
          await this.storage.changePermission(user.id, this.readOnlyRole.value);
        }
        this.revision++;
        this.refreshUsers();
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-change-role', {username: fullName(user)})});
      }
    },

  },
  async created() {
    await this.loadStorage();
    this.revision++;
    this.loading = false;
  },
};
</script>

<style scoped>
h1 {
  text-transform: initial;
  letter-spacing: initial;
  font-weight: 400;
  font-size: 1.8rem;
  margin-bottom: 0.7rem;
}

li {
  margin-bottom: 0.5em;
}

.box {
  position: relative;
}

</style>

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

.storage-members-wrapper {
  min-height: 40vh;
}

.tag {
  font-size: 0.75em !important;
  font-weight: 600;
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
