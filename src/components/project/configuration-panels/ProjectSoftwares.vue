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
<div class="project-softwares-wrapper">
  <b-loading :is-full-page="false" :active="loading" />
  <b-message v-if="error" type="is-danger" has-icon icon-size="is-small">
    <h2> {{ $t('error') }} </h2>
    <p> {{ $t('unexpected-error-info-message') }} </p>
  </b-message>
  <template v-else-if="!loading">
    <b-input class="search-field" v-model="searchString" :placeholder="$t('search-placeholder')" type="search" icon="search" />

    <b-table
      :data="filteredSoftwares"
      default-sort="selected"
      default-sort-direction="desc"
      :paginated="true"
      :per-page="perPage"
      pagination-size="is-small"
    >
      <template #default="{row: software}">
        <b-table-column field="name" :label="$t('name')" sortable width="100">
          <router-link :to="`/software/${software.id}`">
            {{ software.fullName }}
          </router-link>
        </b-table-column>

        <b-table-column field="softwareStatus" :label="$t('version')" centered sortable width="100" :custom-sort="sortBySoftwareStatus">
          <software-status :software="software" />
        </b-table-column>

        <b-table-column field="executable" :label="$t('ui-runnable')" centered sortable width="100">
          <boolean-item :value="software.executable" />
        </b-table-column>

        <b-table-column field="selected" :label="$t('status')" sortable width="100">
          <button :disabled="loadingToggleSoftware[software.id]" :class="['button', software.selected ? 'is-success' : 'is-danger']" @click="toggleSoftware(software)">
            {{$t(software.selected ? 'enabled' : 'disabled')}}
          </button>
        </b-table-column>
      </template>

      <template #empty>
        <div class="content has-text-grey has-text-centered">
          <p>{{$t('no-algorithm')}}</p>
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
  </template>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import {SoftwareCollection, SoftwareProject, SoftwareProjectCollection} from 'cytomine-client';
import {getWildcardRegexp} from '@/utils/string-utils';
import SoftwareStatus from '@/components/software/SoftwareStatus';
import BooleanItem from '@/components/utils/BooleanItem';

export default {
  name: 'project-softwares',
  components: {
    BooleanItem,
    SoftwareStatus
  },
  data() {
    return {
      loading: true,
      error: false,

      searchString: '',
      perPage: 10,

      softwares: [],
      loadingToggleSoftware: {}
    };
  },
  computed: {
    project: get('currentProject/project'),

    filteredSoftwares() {
      let regexp = getWildcardRegexp(this.searchString);
      return this.softwares.filter(software => regexp.test(software.name));
    }
  },
  methods: {
    async toggleSoftware(software) {
      try {
        this.$set(this.loadingToggleSoftware, software.id, true);
        if(software.selected) {
          await software.softwareProject.delete();
          software.selected = false;
        }
        else {
          let softwareProject = await new SoftwareProject({
            software: software.id,
            project: this.project.id
          }).save();
          software.softwareProject = softwareProject;
          software.selected = true;
        }
      }
      catch(error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-change-status-algorithm-project', {softwareName: software.name})
        });
      }
      this.$set(this.loadingToggleSoftware, software.id, false);
    },
    sortBySoftwareStatus(a, b, asc) {
      return ((asc) ? 1 : -1) * (this.getSoftwareStatusValue(a) - this.getSoftwareStatusValue(b));
    },
    getSoftwareStatusValue(software) {
      if (!software.softwareVersion) return 0;
      if (software.deprecated) return 1;
      return 2;
    }
  },
  async created() {
    try {
      let promiseSoftwares = SoftwareCollection.fetchAll();
      let promiseSoftwareProjects = SoftwareProjectCollection.fetchAll({
        filterKey: 'project',
        filterValue: this.project.id
      });

      let softwares = (await promiseSoftwares).array;
      let softwareProjects = (await promiseSoftwareProjects).array;

      softwares.forEach(software => {
        software.softwareProject = softwareProjects.find(sp => sp.software === software.id);
        software.selected = (software.softwareProject !== undefined);
      });

      this.softwares = softwares;
    }
    catch(error) {
      console.log(error);
      this.error = true;
    }
    this.loading = false;
  }
};
</script>

<style scoped>
.project-softwares-wrapper {
  min-height: 40vh;
}
</style>

<style>
.project-softwares-wrapper .search-field {
  max-width: 25em;
}

.project-softwares-wrapper .table {
  margin-top: 1.5em;
}

.project-softwares-wrapper .table .button {
  padding: 0 3em;
}
</style>
