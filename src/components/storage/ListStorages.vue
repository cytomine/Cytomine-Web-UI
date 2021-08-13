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
<div class="list-storages-wrapper content-wrapper">
  <b-loading :is-full-page="false" :active="loading" />
  <div class="box error" v-if="error">
    <h2> {{ $t('error') }} </h2>
    <p>{{ $t('unexpected-error-info-message') }}</p>
  </div>
  <div v-else-if="!loading" class="panel">
    <p class="panel-heading">
      {{$t('storages')}}
    </p>
    <div class="panel-block">
      <div class="search-block">
        <b-input
          class="search-storages"
          v-model="searchString"
          :placeholder="$t('search-placeholder')"
          type="search" icon="search"
        />
      </div>

      <cytomine-table
        :collection="storageCollection"
        class="table-storages"
        :currentPage.sync="currentPage"
        :perPage.sync="perPage"
        :sort.sync="sortField"
        :order.sync="sortOrder"
        :revision="revision"
        :detailed=false
      >
        <template #default="{row: storage}">
          <b-table-column field="currentUserRole" label="" centered width="1">
            <icon-storage-user-role
              :is-read-write="retrieveCurrentUserRole(storage) !== readOnlyRole.value"
              :is-administrator="retrieveCurrentUserRole(storage) === administrationRole.value"
            />
          </b-table-column>

          <b-table-column field="name" :label="$t('name')" sortable width="250">
            <router-link :to="`/storage/${storage.id}`">
              {{ storage.name }}
            </router-link>
          </b-table-column>

          <b-table-column label=" " centered width="150">
            <router-link :to="`/storage/${storage.id}`" class="button is-small is-link">
              {{$t('button-open')}}
            </router-link>
          </b-table-column>
        </template>



        <template #empty>
          <div class="content has-text-grey has-text-centered">
            <p>{{$t('no-storage')}}</p>
          </div>
        </template>
      </cytomine-table>

      <div class="legend">
        <h2>{{$t('legend')}}</h2>
        <p><icon-storage-user-role /> : {{$t('read-only-role')}}</p>
        <p><icon-storage-user-role :is-read-write="true" /> : {{$t('read-write-role')}}</p>
        <p><icon-storage-user-role :is-read-write="true" :is-administrator="true" /> : {{$t('administration')}}</p>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import CytomineTable from '@/components/utils/CytomineTable';

import {get, sync} from '@/utils/store-helpers';

import {StorageCollection, StorageAccessCollection} from 'cytomine-client';
import IconStorageUserRole from '@/components/icons/IconStorageUserRole';

export default {
  name: 'list-storages',
  components: {
    IconStorageUserRole,
    CytomineTable
  },
  data() {
    return {
      loading: true,
      error: false,

      storagesById: {},
      accessByStorageId: {},

      readOnlyRole: {label:this.$t('read-only-role'), value : 'READ'},
      readWriteRole: {label:this.$t('read-write-role'), value: 'WRITE'},
      administrationRole: {label:this.$t('administration'), value: 'ADMINISTRATION'},

      revision: 0
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    searchString: sync('listStorages/searchString', {debounce: 500}),

    storageCollection() {
      let collection = new StorageCollection({});
      if(this.searchString) {
        collection['searchString'] = encodeURIComponent(this.searchString);
      }
      return collection;
    },
    currentPage: sync('listStorages/currentPage'),
    perPage: sync('listStorages/perPage'),
    sortField: sync('listStorages/sortField'),
    sortOrder: sync('listStorages/sortOrder')
  },
  methods: {
    retrieveCurrentUserRole(storage) {
      return this.accessByStorageId[storage.id];
    },
    async fetchStorages() {
      try {

        let storageAccessList = (await StorageAccessCollection.fetchAll()).array;
        this.accessByStorageId = {};
        storageAccessList.forEach(access => {
          this.accessByStorageId[access.id] = access.permission;
        });

        console.log('this.storages', this.storages);
      }
      catch (error) {
        console.log(error);
        this.newUploadError = true;
      }
    }
  },
  async created() {
    this.fetchStorages();
    this.loading = false;
  }
};
</script>

<style scoped>
.panel-block {
  padding-top: 0.8em;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-block {
  display: flex;
}

.legend {
  margin-top: 0.8rem;
  margin-bottom: 1rem;
  border-radius: 10px;
  padding: 1rem 1.5em;
  background: #f8f8f8;
}

.legend p:not(:last-child) {
  margin-bottom: 0.4em;
}
</style>

<style>
.search-storages {
  max-width: 25em;
  margin-right: 1em;
}

.table-storages {
  margin-top: 1rem;
}

.list-storages-wrapper td, .list-storages-wrapper th {
  vertical-align: middle !important;
}
</style>
