<template>
  <div class="box error" v-if="!configUI['project-images-tab']">
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
      <div class="panel-heading">
        <p>ROI Groups</p>
        <button class="button is-link" @click="startNewAnalysis">
          Start new analysis
        </button>
      </div>
      <div class="panel-block">
        <div>
          <p>ROI Groups content</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {get, sync} from '@/utils/store-helpers';

import {ImageInstanceCollection} from 'cytomine-client';

// store options to use with store helpers to target projects/currentProject/listImages module
const storeOptions = {rootModuleProp: 'storeModule'};
// redefine helpers to use storeOptions and correct module path

export default {
  name: 'analyze',
  data() {
    return {
      loading: true,
      error: false,
      revision: 0,
      images: [],
    };
  },
  methods: {
    startNewAnalysis() {
      // First add all the images to the globalState as a queue
      this.$store.commit(`${this.storeModule}/setQueuedImages`, this.images);
      this.$router.push({ path: `/project/${this.project.id}/image/${this.images[0].id}` });
    },
    async getAllImages() {
      const collection = await new ImageInstanceCollection({
        filterKey: 'project',
        filterValue: this.project.id,
        max: 10,
      });
      const resp = await collection.fetchAll();
      this.images = resp._data;
    },
  },
  computed: {
    currentUser: get('currentUser/user'),
    configUI: get('currentProject/configUI'),
    project: get('currentProject/project'),
    storeModule() { // path to the vuex module in which state of this component is stored (projects/currentProject/analysis)
      return this.$store.getters['currentProject/currentProjectModule'] + 'analysis';
    },
    currentPage: sync('currentPage', storeOptions),
    perPage: sync('perPage', storeOptions),
    sortField: sync('sortField', storeOptions),
    sortOrder: sync('sortOrder', storeOptions),
  },
  async created() {
    try {
      this.loading = false;
      this.getAllImages();
    }
    catch(error) {
      console.error(error);
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
</style>
