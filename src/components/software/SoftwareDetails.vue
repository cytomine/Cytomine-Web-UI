<template>
<b-message v-if="error" type="is-danger" has-icon icon-size="is-small" size="is-small">
  <h2> {{ $t('error') }} </h2>
  <p> {{ $t('unexpected-error-info-message') }} </p>
</b-message>
<table v-else class="table">
  <b-loading :is-full-page="false" :active="loading" class="small" />
  <tbody v-if="!loading">
  <tr v-if="isPropDisplayed('name')">
    <td class="prop-label">{{$t('name')}}</td>
    <td class="prop-content">
      {{software.name}}
    </td>
  </tr>
  <tr v-if="isPropDisplayed('projects')">
    <td class="prop-label">{{$t('projects')}}</td>
    <td class="prop-content">
      <template v-if="projects.length">
            <span v-for="(project, index) in projects" :key="project.id">
              <router-link :to="`/project/${project.id}`">{{project.name}}</router-link>
              <span v-if="index < projects.length - 1">, </span>
            </span>
      </template>
      <em class="has-text-grey" v-else-if="nbProjects > 0">
        {{$t('used-in-project-no-access')}}
      </em>
      <em class="has-text-grey" v-else>
        {{$t('not-used-in-any-project')}}
      </em>
    </td>
  </tr>
  <tr v-if="isPropDisplayed('description')">
    <td class="prop-label">{{$t('description')}}</td>
    <td class="prop-content">
      <cytomine-description :object="software" :canEdit="canManageSoftware" />
    </td>
  </tr>
  <tr v-if="isPropDisplayed('properties')">
    <td class="prop-label">{{$t('properties')}}</td>
    <td class="prop-content">
      <cytomine-properties :object="software" :canEdit="canManageSoftware" />
    </td>
  </tr>
  <tr v-if="isPropDisplayed('attachedFiles')">
    <td class="prop-label">{{$t('attached-files')}}</td>
    <td class="prop-content">
      <attached-files :object="software" :canEdit="canManageSoftware" />
    </td>
  </tr>
  <tr v-if="isPropDisplayed('created')">
    <td class="prop-label">{{$t('created-on')}}</td>
    <td class="prop-content">
      {{ Number(software.created) | moment('ll') }}
    </td>
  </tr>
<!--  <tr v-if="canManageSoftware">-->
<!--    <td class="prop-label">{{$t('actions')}}</td>-->
<!--    <td class="prop-content">-->
<!--      <software-actions :software="software" @update="$emit('update', $event)" @delete="$emit('delete')" />-->
<!--    </td>-->
<!--  </tr>-->
  </tbody>
</table>
</template>

<script>
import {get} from '@/utils/store-helpers';
import {ProjectCollection} from 'cytomine-client';
import RenameModal from '@/components/utils/RenameModal';
import CytomineDescription from '@/components/description/CytomineDescription';
import CytomineProperties from '@/components/property/CytomineProperties';
import AttachedFiles from '@/components/attached-file/AttachedFiles';

export default {
  name: 'ontology-details',
  props: {
    software: Object,
    excludedProperties: {type: Array, default: () => []}
  },
  components: {
    CytomineDescription,
    CytomineProperties,
    AttachedFiles,
    RenameModal
  },
  data() {
    return {
      loading: true,
      error: false,

      projects: [],
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    canManageSoftware() {
      return this.currentUser.adminByNow;
    },
    nbProjects() {
      return this.projects.length;
    }
  },
  methods: {
    isPropDisplayed(prop) {
      return !this.excludedProperties.includes(prop);
    },
    async fetchProjects() {
      this.loading = true;
      this.error = false;

      try {
        this.projects = (await ProjectCollection.fetchAll({filterKey: 'software', filterValue: this.software.id})).array;
      }
      catch(error) {
        console.log(error);
        this.error = true;
      }

      this.loading = false;
    },
  },
  created() {
    this.fetchProjects();
  }
};
</script>

<style>
  .table {
    background: none;
    position: relative;
    height: 3em;
  }

  td.prop-label {
    white-space: nowrap;
    font-weight: 600;
  }

  td.prop-content {
    width: 100%;
  }
</style>
