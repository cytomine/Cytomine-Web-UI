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
        <domain-tag-input v-model="selectedUsers" :domains="notGuestAndNotStorageUsers" placeholder="search-user" displayedProperty="fullName" searchedProperty="fullName"/>
      </b-field>

      <!--<b-field>
        <b-radio-button v-model="permission" native-value="READ" type="is-success is-light">
          <span>Read</span>
        </b-radio-button>

        <b-radio-button v-model="permission" native-value="WRITE" type="is-primary is-light">
          <span>Read and Write</span>
        </b-radio-button>

        <b-radio-button v-model="permission" native-value="ADMINISTRATION" type="is-danger is-light">
          <span>Administration</span>
        </b-radio-button>
      </b-field>-->

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

import {UserCollection} from 'cytomine-client';
import DomainTagInput from '@/components/utils/DomainTagInput';
import CytomineModal from '@/components/utils/CytomineModal';
import {fullName} from '@/utils/user-utils.js';
import {ROLES} from '../../utils/role-utils';

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
      let userInStorageIds = this.$store.state.currentStorage.users.map(u => u.id).concat(this.selectedUsers.map(u => u.id));
      return userInStorageIds;
    },
    notStorageUsers() {
      return this.users.filter(user => !this.userInStorageIds.includes(user.id));
    },
    /**
     * Return an array of users without users already in the storage or guest users
     */
    notGuestAndNotStorageUsers() {
      return this.notStorageUsers.filter(user => user.role !== ROLES.ROLE_GUEST)
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
        await this.storage.addUsers(this.selectedUsers.map(user => user.id), this.permission);
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
    /**
     * A guest user can't have a storage, and it currently can't be added to one.
     * The API doesn't support a request like getAllUserWhereRoleIsNot('GUEST').
     * The filtering will happen on the frontend.
     * To filter user of type GUEST, we need to have the roles in the API response.
     */
    const userCollection = new UserCollection({withRoles: true})
    let users = (await userCollection.fetchAll()).array;
    users.forEach(u => u.fullName = fullName(u));
    this.users = users;
    this.loading = false;
  }
};
</script>

<style scoped>
::v-deep .modal-card, ::v-deep .modal-card-body {
  overflow: visible !important;
  width: 60vw !important;
}
</style>
