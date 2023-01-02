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
<div class="box error" v-if="!configUI['project-scores-tab']">
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
      {{$t('scores-report')}}
    </p>
    <div class="panel-block">

      <div class="sub-panel">
        <h2 class="has-text-centered"> {{ $t('download-results') }} </h2>
        <div class="buttons is-centered">
          <a class="button is-link" :href="downloadCSV">{{$t('download-CSV')}}</a>
        </div>
      </div>
      <hr/>
      <div class="sub-panel">
        <h2 class="has-text-centered"> {{ $t('upload-report') }} </h2>
        <div class="buttons is-centered">
          <attached-files :object="project" :atkey="'globalReport'" :canEdit="canManageProject" />
        </div>
      </div>
      <hr/>
      <div class="sub-panel">
        <h2 class="has-text-centered"> {{ $t('project-locking') }}
          <span v-if="!project.isLocked" class="tag is-success">
              {{$t('unlocked')}}
          </span>
          <span v-else class="tag is-danger">
              {{$t('locked')}}
          </span>
        </h2>
        <div class="buttons is-centered">
            <router-link :to="`/project/${project.id}/configuration`">
              {{ $t('go-to-project-configuration') }}
            </router-link>
        </div>
      </div>
    </div>
  </div>


</div>
</template>

<script>
import {get} from '@/utils/store-helpers';

import CytomineTable from '@/components/utils/CytomineTable';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineSlider from '@/components/form/CytomineSlider';
import ImageName from '../image/ImageName';
import ImageDetails from '../image/ImageDetails';

import {Cytomine} from 'cytomine-client';
import AttachedFiles from '../attached-file/AttachedFiles';

// store options to use with store helpers to target projects/currentProject/listImages module

export default {
  name: 'project-scores-report',
  components: {
    AttachedFiles,
    ImageName,
    ImageDetails,
    CytomineTable,
    CytomineMultiselect,
    CytomineSlider,
  },
  data() {
    return {
      loading: true,
      error: false,
      revision: 0
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    configUI: get('currentProject/configUI'),
    project: get('currentProject/project'),
    blindMode() {
      return this.project.blindMode;
    },
    canManageProject() {
      return this.$store.getters['currentProject/canManageProject'];
    },
    storeModule() { // path to the vuex module in which state of this component is stored (projects/currentProject/listImages)
      return this.$store.getters['currentProject/currentProjectModule'] + 'listImages';
    },
    downloadCSV() {
      return Cytomine.instance.host + `/api/project/${this.project.id}/image-score/stats-report.csv`;
    }
  },
  methods: {

    async refreshData() {
      try {
        await Promise.all([
        ]);
        this.revision++;
      }
      catch(error) {
        console.log(error);
        this.error = true;
      }
    },
    async lock(project) {
      try {
        let {data} = await Cytomine.instance.api.post(`${Cytomine.instance.host}/api/project/${project.id}/lock.json`);
        await this.$store.dispatch('currentProject/loadProject', data.data.project.id);
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-project-lock')});
      }
    },
    async unlock(project) {
      try {
        let {data} = await Cytomine.instance.api.delete(`${Cytomine.instance.host}/api/project/${project.id}/lock.json`);
        await this.$store.dispatch('currentProject/loadProject', data.data.project.id);
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-project-unlock')});
      }
    },

    toggleFilterDisplay() {
      this.filtersOpened = !this.filtersOpened;
    }
  },
  async created() {
    try {
      await Promise.all([
      ]);
      this.loading = false;
    }
    catch(error) {
      console.log(error);
      this.error = true;
    }
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

.sub-panel {
  margin-top: 1.5em;
  margin-bottom: 1.5em;
}

>>> td, >>> th {
  vertical-align: middle !important;
}
</style>
