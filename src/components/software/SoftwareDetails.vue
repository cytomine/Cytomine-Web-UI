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
      {{software.fullName}}
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
  <tr v-if="isPropDisplayed('trustedSource')">
    <td class="prop-label">{{$t('trusted-source')}}</td>
    <td class="prop-content">
      <software-source :source="source" />
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
  <tr v-if="isPropDisplayed('status')">
    <td class="prop-label">{{$t('status')}}</td>
    <td class="prop-content">
      <software-status :software="software" />
    </td>
  </tr>
  <tr v-if="isPropDisplayed('executable')">
    <td class="prop-label">{{$t('ui-runnable')}}</td>
    <td class="prop-content">
      <boolean-item :value="software.executable" />
    </td>
  </tr>
  <tr v-if="isPropDisplayed('created')">
    <td class="prop-label">{{$t('created-on')}}</td>
    <td class="prop-content">
      {{ Number(software.created) | moment('ll') }}
    </td>
  </tr>
  <tr v-if="isPropDisplayed('executeCommand')">
    <td class="prop-label">{{$t('execute-command')}}</td>
    <td class="prop-content">
      <code>{{software.executeCommand}}</code>
    </td>
  </tr>
  <tr v-if="isPropDisplayed('pullingCommand')">
    <td class="prop-label">{{$t('pulling-command')}}</td>
    <td class="prop-content">
      <code>{{software.pullingCommand}}</code>
    </td>
  </tr>
  <tr v-if="source">
    <td class="prop-label">{{$t('actions')}}</td>
    <td class="prop-content">
      <software-source-buttons :source="source" :software="software" />
    </td>
  </tr>
  </tbody>
</table>
</template>

<script>
import {get} from '@/utils/store-helpers';
import {ProjectCollection, TrustedSource} from 'cytomine-client';

import RenameModal from '@/components/utils/RenameModal';
import CytomineDescription from '@/components/description/CytomineDescription';
import CytomineProperties from '@/components/property/CytomineProperties';
import AttachedFiles from '@/components/attached-file/AttachedFiles';
import SoftwareStatus from '@/components/software/SoftwareStatus';
import BooleanItem from '@/components/utils/BooleanItem';
import SoftwareSource from '@/components/software/SoftwareSource';
import SoftwareSourceButtons from '@/components/software/SoftwareSourceButtons';

export default {
  name: 'software-details',
  props: {
    software: Object,
    excludedProperties: {type: Array, default: () => []}
  },
  components: {
    SoftwareSourceButtons,
    SoftwareSource,
    BooleanItem,
    SoftwareStatus,
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
      source: null
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
  watch: {
    async excludedProperties() {
      await this.fetchData();
    }
  },
  methods: {
    isPropDisplayed(prop) {
      return !this.excludedProperties.includes(prop);
    },
    async fetchData() {
      let promises = [];
      if (this.isPropDisplayed('projects')) {
        promises.push(this.fetchProjects());
      }

      if (this.isPropDisplayed('trustedSource')) {
        promises.push(this.fetchSource());
      }

      this.loading = true;
      this.error = false;

      try {
        await Promise.all(promises);
      }
      catch(error) {
        console.log(error);
        this.error = true;
      }

      this.loading = false;
    },
    async fetchProjects() {
      this.projects = (await ProjectCollection.fetchAll({filterKey: 'software', filterValue: this.software.id})).array;
    },
    async fetchSource() {
      this.source = (this.software.softwareUserRepository) ? await TrustedSource.fetch(this.software.softwareUserRepository) : null;
    }
  },
  created() {
    this.fetchData();
  }
};
</script>

<style scoped>
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
