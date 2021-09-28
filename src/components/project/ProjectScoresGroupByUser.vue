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
<div class="box error" v-if="false && !configUI['project-scores-tab']">
  <h2> {{ $t('access-denied') }} </h2>
  <p>{{ $t('insufficient-permission') }}</p>
</div>
<div class="box error" v-else-if="error">
  <h2> {{ $t('error') }} </h2>
  <p>{{ $t('unexpected-error-info-message') }}</p>
</div>
<div v-else class="content-wrapper">
  <b-loading :is-full-page="false" :active="loading" />
  <div v-if="!loading" class="panel">
    <p class="panel-heading">
      {{$t('images')}}
    </p>
    <div class="panel-block">
      <div class="search-block">
        <b-input
          class="search-images"
          v-model="searchUserString"
          :placeholder="$t('search-placeholder')"
          type="search" icon="search"
        />
      </div>

      <cytomine-table
        :collection="statsCollection"
        :currentPage.sync="currentPage"
        :perPage.sync="perPage"
        :sort.sync="sortField"
        :order.sync="sortOrder"
        :revision="revision"
        :detailed="false"
      >
        <template #default="{row: user}">
          <b-table-column :label="$t('username')" width="100">
            <username :user="user" :online="onlineIds ? onlineIds.includes(user.id) : null" :displayFullName="false" />
          </b-table-column>

          <b-table-column
            :label="$t('name')"
            sortable
            width="400"
          >
            {{ retrieveFullName(user) }}
          </b-table-column>

          <b-table-column field="role" :label="$t('role')" centered sortable width="20">
            <icon-project-member-role :is-manager="user.role === managerRole" />
          </b-table-column>

          <b-table-column :field="score.name" :label="score.name" centered sortable width="100" v-for="score in scores" :key="score.id">
            {{user[score.id]}}
          </b-table-column>

        </template>


        <template #empty>
          <div class="content has-text-grey has-text-centered">
            <p>{{$t('no-users')}}</p>
          </div>
        </template>
      </cytomine-table>
    </div>
  </div>

  <div class="box">
    <h2 class="has-text-centered"> {{ $t('download-results') }} </h2>
    <div class="buttons is-centered">
      <a class="button is-link" :href="downloadCSV">{{$t('download-CSV')}}</a>
    </div>
  </div>
</div>
</template>

<script>
import {get, sync} from '@/utils/store-helpers';
import {fullName} from '@/utils/user-utils.js';
import CytomineTable from '@/components/utils/CytomineTable';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineSlider from '@/components/form/CytomineSlider';

import { GenericCollection, Cytomine} from 'cytomine-client';
import Username from '../user/Username';
import constants from '../../utils/constants';
import IconProjectMemberRole from '@/components/icons/IconProjectMemberRole';
// store options to use with store helpers to target projects/currentProject/listImages module
const storeOptions = {rootModuleProp: 'storeModule'};

export default {
  name: 'project-scores-group-by-user',
  components: {
    CytomineTable,
    CytomineMultiselect,
    CytomineSlider,
    Username,
    IconProjectMemberRole
  },
  data() {
    return {
      loading: true,
      error: false,
      users: [],
      maxWidth: 100,
      maxHeight: 100,
      revision: 0,
      imageScoresByUsers: {},
      onlineIds: null,
      contributorRole: this.$t('contributor'),
      managerRole: this.$t('manager'),
      searchUserString: ''
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    configUI: get('currentProject/configUI'),
    project: get('currentProject/project'),
    scores: get('currentProject/scores'),
    canManageProject() {
      return this.$store.getters['currentProject/canManageProject'];
    },
    storeModule() { // path to the vuex module in which state of this component is stored (projects/currentProject/listImages)
      return this.$store.getters['currentProject/currentProjectModule'] + 'listImages';
    },
    // searchUserString: sync('searchUserString', {...storeOptions, debounce: 500}),
    statsCollection() {
      let collection = new GenericCollection({
        path: `project/${this.project.id}/image-score/stats-group-by-user.json`
      });
      if(this.searchUserString) {
        collection['name'] = {
          ilike: encodeURIComponent(this.searchUserString)
        };
      }
      return collection;
    },
    downloadCSV() {
      let filter = '';
      if(this.searchUserString) {
        filter = '?name[ilike]=' + this.searchUserString;
      }
      return Cytomine.instance.host + `/api/project/${this.project.id}/image-score/stats-group-by-user.csv${filter}`;
    },
    currentPage: sync('currentPage', storeOptions),
    perPage: sync('perPage', storeOptions),
    sortField: sync('sortField', storeOptions),
    sortOrder: sync('sortOrder', storeOptions)
  },
  methods: {
    retrieveFullName(user) {
      return fullName(user);
    },
    async fetchData() {
      try {
        await Promise.all([
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
    async fetchOnlines() {
      try {
        let onlines = await this.project.fetchConnectedUsers();
        this.onlineIds = onlines.map(o => o.id);
      }
      catch(error) {
        console.log(error);
        this.onlineIds = null;
      }
    },
    toggleFilterDisplay() {
      this.filtersOpened = !this.filtersOpened;
    }
  },
  async created() {
    this.loading = false;
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
.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-overview {
  max-height: 4rem;
  max-width: 10rem;
}

.search-block {
  display: flex;
}

>>> .search-images {
  max-width: 30rem;
  margin-right: 1rem;
}

>>> td, >>> th {
  vertical-align: middle !important;
}
</style>
