<template>
  <div class="software-wrapper">
    <b-loading :is-full-page="false" :active="loading" />
    <div class="content-wrapper" v-if="!loading">
      <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li><router-link :to="`/software`">{{$t('algorithms')}}</router-link></li>
          <li class="is-active"><a href="#" aria-current="page">{{software.fullName}}</a></li>
        </ul>
      </nav>

      <div class="box">
        <b-message v-if="error" type="is-danger" has-icon icon-size="is-small">
          <h2> {{ $t('error') }} </h2>
          <p> {{ $t('unexpected-error-info-message') }} </p>
        </b-message>

        <template v-else>
          <h1>{{software.fullName}}</h1>

          <div class="description">
            <cytomine-description :object="software" :canEdit="canManageSoftware" />
          </div>

          <hr>

          <div class="columns">
            <div class="column">
              <h2>{{$t('projects')}}</h2>
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
            </div>
            <div class="column">
              <h2>{{$t('statistics')}}</h2>
              <div class="chart-container">
                <software-statistics-chart
                  css-classes="chart"
                  :software="software"
                />
              </div>

            </div>
          </div>

          <hr>

          <h2>{{$t('software-parameters')}}</h2>

          <b-table
            :data="softwareParameters"
            default-sort="created"
            default-sort-direction="desc"
            :paginated="true"
            :per-page="softwareParametersPerPage"
            pagination-size="is-small"
            detailed detail-key="id"
          >
            <template #default="{row: parameter}">
              <b-table-column :label="$t('name')" field="name" sortable>
                {{parameter.humanName}}
              </b-table-column>

              <b-table-column :label="$t('type')" field="type" sortable>
                {{$t(parameter.type.toLowerCase())}}
              </b-table-column>

              <b-table-column :label="$t('default-value')" field="defaultValue">
                {{parameter.defaultParamValue}}
              </b-table-column>

              <b-table-column :label="$t('mandatory')" field="mandatory">
                <template v-if="parameter.required">{{$t('yes')}}</template>
                <template v-else>{{$t('no')}}</template>
              </b-table-column>
            </template>

            <template #empty>
              <div class="content has-text-grey has-text-centered">
                <p>{{$t('no-software-parameter')}}</p>
              </div>
            </template>

            <template #detail="{row: parameter}">
              <software-parameter-details :parameter="parameter" :key="parameter.id" />
            </template>

            <template #bottom-left>
              <b-select v-model="softwareParametersPerPage" size="is-small">
                <option value="10">{{$t('count-per-page', {count: 10})}}</option>
                <option value="25">{{$t('count-per-page', {count: 25})}}</option>
                <option value="50">{{$t('count-per-page', {count: 50})}}</option>
                <option value="100">{{$t('count-per-page', {count: 100})}}</option>
              </b-select>
            </template>
          </b-table>

          <hr>

          <h2>{{$t('other-information')}}</h2>

          <software-details :software="software" :excluded-properties="['projects', 'name', 'description']"/>

        </template>
      </div>
    </div>
  </div>
</template>

<script>
import {get} from '@/utils/store-helpers';

import {Software, SoftwareParameterCollection, ProjectCollection} from 'cytomine-client';

import CytomineDescription from '@/components/description/CytomineDescription';
import CytomineProperties from '@/components/property/CytomineProperties';
import AttachedFiles from '@/components/attached-file/AttachedFiles';
import SoftwareParameterDetails from '@/components/software/SoftwareParameterDetails';
import SoftwareStatisticsChart from '@/components/charts/SoftwareStatisticsChart';
import SoftwareDetails from '@/components/software/SoftwareDetails';


export default {
  name: 'software-information',
  components: {
    SoftwareDetails,
    SoftwareStatisticsChart,
    SoftwareParameterDetails,
    CytomineDescription,
    CytomineProperties,
    AttachedFiles
  },
  data() {
    return {
      loading: true,
      error: false,

      software: null,

      softwareParameters: [],
      softwareParametersPerPage: 10,

      projects: [],

      chartRevision: 0,
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    idSoftware() {
      return Number(this.$route.params.idSoftware);
    },
    canManageSoftware() {
      return this.currentUser.adminByNow;
    },
    nbProjects() {
      return this.projects.length;
    }
  },
  watch: {
    async idSoftware() {
      this.loading = true;
      await this.loadSoftware();
    },
    async software() {
      this.chartRevision++;
    }
  },
  methods: {
    async loadSoftware() {
      try {
        await Promise.all([
          this.fetchSoftware(),
          this.fetchSoftwareParameters(),
          this.fetchProjects()
        ]);
      }
      catch(error) {
        console.log(error);
        this.error = true;
        return;
      }

      this.chartRevision++;
    },
    async fetchSoftware() {
      this.software = await Software.fetch(this.idSoftware);
    },
    async fetchSoftwareParameters() {
      this.softwareParameters = (await SoftwareParameterCollection.fetchAll({filterKey: 'software', filterValue: this.idSoftware})).array;
    },
    async fetchProjects() {
      this.projects = (await ProjectCollection.fetchAll({filterKey: 'software', filterValue: this.idSoftware})).array;
    },
  },
  async created() {
    await this.loadSoftware();
    this.loading = false;
  },
};
</script>

<style scoped>
h1 {
  text-transform: initial;
  letter-spacing: initial;
  font-weight: 400;
  font-size: 1.8rem;
  margin-bottom: 0.7rem;
}

li {
  margin-bottom: 0.5em;
}

.box {
  position: relative;
}

.chart-container {
  margin-top: 2em;
  height: 10em;
  position: relative;
}
</style>

<style lang="scss">
.software-wrapper {
  .table-wrapper {
    margin-bottom: 0;
  }

  .chart {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .field.is-horizontal {
    align-items: center;
  }

  .field-label {
    margin-right: 1em !important;
    padding-top: 0 !important;
  }
}

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

.description {
  font-size: 14px;
}
</style>
