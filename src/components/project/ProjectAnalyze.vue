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
        <b-table
          v-if="groups"
          :data="groups"
          :fields="fields"
          paginated
          hover
          pagination-size="is-small"
          :per-page="perPage"
          :current-page.sync="currentPage"
          :loading="loading"
        >
          <template #default="{row: group}">
            <b-table-column label="Name" width="200" centered>
              <h3>{{ group.name }}</h3>
            </b-table-column>

            <b-table-column label="ID" width="100" centered>
              <p>{{ group.id }}</p>
            </b-table-column>

            <b-table-column width="150" centered>
              <button @click="openModal(group)" class="button is-link">Results</button>
            </b-table-column>
          </template>

          <template #empty>
            <div class="content has-text-grey has-text-centered">
              <p>No groups found</p>
            </div>
          </template>

          <template #bottom-left>
            <b-select v-model="perPage" size="is-small">
              <option v-for="option in perPageOptions" :key="option" :value="option">
                {{$t('count-per-page', {count: option})}}
              </option>
            </b-select>
          </template>
        </b-table>
      </div>
    </div>
    <AnnotationGroupModal :isActive="isModalActive" :group="modalGroup" v-on:closeModal="closeModal"/>
  </div>
</template>

<script>
import {get, sync} from '@/utils/store-helpers';

import {ImageInstanceCollection} from 'cytomine-client';

import CytomineTable from '../utils/CytomineTable';

import AnnotationGroupModal from './AnnotationGroupModal';

// store options to use with store helpers to target projects/currentProject/listImages module
const storeOptions = {rootModuleProp: 'storeModule'};
// redefine helpers to use storeOptions and correct module path

export default {
  name: 'analyze',
  components: {
    AnnotationGroupModal,
    CytomineTable,
  },
  data() {
    return {
      loading: true,
      isModalActive: false,
      modalGroup: {},
      error: false,
      revision: 0,
      images: [],
      groups: [],
      perPageOptions: [10, 25, 50, 100],
      fields: [
        {
          key: 'name',
        },
        {
          key: 'id',
        },
      ],
    };
  },
  methods: {
    startNewAnalysis() {
      // First add all the images to the globalState as a queue
      this.$store.dispatch(`${this.storeModule}/startNewAnalysis`, this.images);
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
    openModal(group) {
      this.modalGroup = group;
      this.isModalActive = true;
    },
    closeModal() {
      this.isModalActive = false;
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
  },
  async created() {
    try {
      this.getAllImages();
      const fetchedGroups = await fetch(`http://localhost:9292/annotationGroup?projectId=${this.project.id}`);
      const response = await fetchedGroups.json();
      this.groups = response.groups;
      this.loading = false;
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

  h3 {
    font-size: 18px;
  }

  .tr {
    height: 50px;
  }
</style>
