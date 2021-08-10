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
<cytomine-modal :active="active" :title="$t('add-users-to-storage')" @close="$emit('update:active', false)">
    <b-loading :is-full-page="false" :active="loading" class="small" />
    <template v-if="!loading">
      <b-field>
        <domain-tag-input v-model="selectedUsers" :domains="notStorageUsers" placeholder="search-user" displayedProperty="fullName" searchedProperty="fullName"/>
      </b-field>

      <b-field>
        <b-radio-button v-model="permission" native-value="READ" type="is-success is-light">
          <span>Read</span>
        </b-radio-button>

        <b-radio-button v-model="permission" native-value="WRITE" type="is-primary is-light">
          <span>Read and Write</span>
        </b-radio-button>

        <b-radio-button v-model="permission" native-value="ADMINISTRATION" type="is-danger is-light">
          <span>Administration</span>
        </b-radio-button>
      </b-field>

    </template>

    <template #footer>
      <button class="button" @click="$emit('update:active', false)">
        {{$t('button-cancel')}}
      </button>
      <button class="button is-link" @click="addUsers">
        {{$t('button-add')}}
      </button>
    </template>
</cytomine-modal>
</template>

<script>
import {get} from '@/utils/store-helpers';

import {UserCollection, StorageUserCollection} from 'cytomine-client';
import DomainTagInput from '@/components/utils/DomainTagInput';
import CytomineModal from '@/components/utils/CytomineModal';
import {fullName} from '@/utils/user-utils.js';

export default {
  name: 'add-user-to-storage-modal',
  props: {
    active: Boolean,
    storage: Object,
  },
  components: {
    CytomineModal,
    DomainTagInput,
  },
  data() {
    return {
      loading: true,
      users: [],
      usersIdAlreadyInStorage: [],
      selectedUsers: [],
      permission: 'READ'
    };
  },
  computed: {
    project: get('currentProject/project'),
    userInStorageIds() {
      let userInStorageIds = this.usersIdAlreadyInStorage.concat(this.selectedUsers.map(u => u.id));
      return userInStorageIds;
    },
    notStorageUsers() {
      return this.users.filter(user => !this.userInStorageIds.includes(user.id));
    }
  },
  watch: {
    active() {
      this.selectedUsers = [];
    }
  },
  methods: {
    async addUsers() {
      try {
        console.log('users', this.selectedUsers.map(user => user.id), 'permission', this.permission);
        await this.storage.addUsers(this.selectedUsers.map(user => user.id), this.permission);
        console.log('emit addUsersInStorage');
        this.$emit('addUsersInStorage');
        this.$notify({type: 'success', text: this.$t('notif-success-add-storage-users')});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-add-storage-users')});
      }

      this.$emit('update:active', false);
    }
  },
  async created() {
    let users = (await UserCollection.fetchAll()).array;
    users.forEach(u => u.fullName = fullName(u));
    this.users = users;

    let usersAlreadyInStorage = (await StorageUserCollection.fetchAll({filterKey: 'storage', filterValue: this.storage.id})).array;
    this.usersIdAlreadyInStorage = usersAlreadyInStorage.map(u => u.id);

    this.loading = false;
  }
};
</script>

<style scoped>
>>> .modal-card, >>> .modal-card-body {
  overflow: visible !important;
  width: 60vw !important;
}
</style>
