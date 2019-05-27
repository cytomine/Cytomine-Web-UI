<template>
<div class="list-projects-wrapper content-wrapper">
  <b-loading :is-full-page="false" :active="loading" />
  <div class="box error" v-if="error">
    <h2> {{ $t('error') }} </h2>
    <p>{{ $t('unexpected-error-info-message') }}</p>
  </div>
  <div v-else-if="!loading" class="panel">
    <p class="panel-heading">
      {{$t('projects')}}
      <button v-if="!currentUser.guestByNow" class="button is-link" @click="creationModal = true">
        {{$t('new-project')}}
      </button>
    </p>
    <div class="panel-block">
      <div class="search-block">
        <b-input
          class="search-projects"
          v-model="searchString"
          :placeholder="$t('search-placeholder')"
          type="search" icon="search"
        />
        <button class="button" @click="toggleFilterDisplay()">
          <span class="icon">
            <i class="fas fa-filter"></i>
          </span>
          <span>
            {{filtersOpened ? $t('button-hide-filters') : $t('button-show-filters')}}
          </span>
          <span v-if="nbActiveFilters" class="nb-active-filters">
            {{nbActiveFilters}}
          </span>
        </button>
      </div>

      <b-collapse :open="filtersOpened">
        <div class="filters">
          <div class="columns">
            <div class="column filter">
              <div class="filter-label">
                {{$t('ontology')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect v-model="selectedOntologies" :options="ontologies"
                  label="name" track-by="id" multiple :allPlaceholder="$t('all-ontologies')" />
              </div>
            </div>

            <div class="column filter">
              <div class="filter-label">
                {{$t('my-role')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect v-model="selectedRoles" :options="availableRoles" multiple :searchable="false" />
              </div>
            </div>

            <div class="column"></div>
          </div>

          <div class="columns">
              <div class="column filter">
                <div class="filter-label">
                  {{$t('members')}}
                </div>
                <div class="filter-body">
                  <cytomine-slider v-model="boundsMembers" :max="maxNbMembers" />
                </div>
              </div>

              <div class="column filter">
                <div class="filter-label">
                  {{$t('images')}}
                </div>
                <div class="filter-body">
                  <cytomine-slider v-model="boundsImages" :max="maxNbImages" />
                </div>
              </div>

              <div class="column"></div>
          </div>

          <div class="columns">
            <div class="column filter">
              <div class="filter-label">
                {{$t('user-annotations')}}
              </div>
              <div class="filter-body">
                <cytomine-slider v-model="boundsUserAnnotations" :max="maxNbUserAnnotations" />
              </div>
            </div>

            <div class="column filter">
              <div class="filter-label">
                {{$t('analysis-annotations')}}
              </div>
              <div class="filter-body">
                <cytomine-slider v-model="boundsJobAnnotations" :max="maxNbJobAnnotations" />
              </div>
            </div>

            <div class="column filter">
              <div class="filter-label">
                {{$t('reviewed-annotations')}}
              </div>
              <div class="filter-body">
                <cytomine-slider v-model="boundsReviewedAnnotations" :max="maxNbReviewedAnnotations" />
              </div>
            </div>
          </div>
        </div>
      </b-collapse>


      <b-table
        :data="filteredProjects"
        class="table-projects"
        :paginated="true"
        :current-page.sync="currentPage"
        :per-page="perPage"
        pagination-size="is-small"
        detailed
        detail-key="id"
        :opened-detailed.sync="openedDetails"
        :default-sort="sort.field"
        :default-sort-direction="sort.order"
        @sort="updateSort"
      >
        <template #default="{row: project}">
          <b-table-column :visible="showRole" field="roleIndex" label="" centered width="1" sortable>
            <i
              v-if="project.currentUserRoles.admin"
              class="fas fa-user-cog"
              :title="$t(project.currentUserRoles.representative ? 'representative-icon-label' : 'manager-icon-label')"
            >
              <i v-if="project.currentUserRoles.representative" class="superscript fas fa-flag"></i>
            </i>
          </b-table-column>

          <b-table-column field="name" :label="$t('name')" sortable width="250">
            <router-link :to="`/project/${project.id}`">
              {{ project.name }}
            </router-link>
          </b-table-column>

          <b-table-column field="membersCount" :label="$t('members')" centered sortable width="150">
            {{ project.membersCount }}
          </b-table-column>

          <b-table-column field="numberOfImages" :label="$t('images')" centered sortable width="150">
            <router-link :to="`/project/${project.id}/images`">{{ project.numberOfImages }}</router-link>
          </b-table-column>

          <b-table-column field="numberOfAnnotations" :label="$t('user-annotations')" centered sortable width="150">
            <router-link :to="`/project/${project.id}/annotations?type=user`">
              {{ project.numberOfAnnotations }}
            </router-link>
          </b-table-column>

          <b-table-column field="numberOfJobAnnotations" :label="$t('analysis-annotations')" centered sortable width="150">
            <router-link :to="`/project/${project.id}/annotations?type=algo`">
              {{ project.numberOfJobAnnotations }}
            </router-link>
          </b-table-column>

          <b-table-column field="numberOfReviewedAnnotations" :label="$t('reviewed-annotations')" centered sortable width="150">
            <router-link :to="`/project/${project.id}/annotations?type=reviewed`">
              {{ project.numberOfReviewedAnnotations }}
            </router-link>
          </b-table-column>

          <b-table-column field="lastActivity" :label="$t('last-activity')" centered sortable width="180">
            {{ Number(project.lastActivity) | moment('ll') }}
          </b-table-column>

          <b-table-column label=" " centered width="150">
            <router-link :to="`/project/${project.id}`" class="button is-small is-link">
              {{$t('button-open')}}
            </router-link>
          </b-table-column>
        </template>

        <template #detail="{row: project}">
          <project-details
            :project="project"
            :excluded-properties="excludedProperties"
            @update="updateProject"
            @delete="deleteProject(project)"
          />
        </template>

        <template #empty>
          <div class="content has-text-grey has-text-centered">
            <p>{{$t('no-project')}}</p>
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

      <div class="legend" v-if="showRole">
          <h2>{{$t('legend')}}</h2>
          <p><i class="fas fa-user-cog"></i> : {{$t('manager-icon-label')}}</p>
          <p><i class="fas fa-user-cog">
            <i class="superscript fas fa-flag"></i>
          </i> : {{$t('representative-icon-label')}}</p>
      </div>
    </div>
  </div>

  <add-project-modal :active.sync="creationModal" />
</div>
</template>

<script>
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineSlider from '@/components/form/CytomineSlider';
import ProjectDetails from './ProjectDetails';
import AddProjectModal from './AddProjectModal';

import {isBetweenBounds} from '@/utils/bounds';
import {get, sync, syncBoundsFilter, syncMultiselectFilter} from '@/utils/store-helpers';

import {ProjectCollection} from 'cytomine-client';

export default {
  name: 'list-projects',
  components: {
    ProjectDetails,
    AddProjectModal,
    CytomineMultiselect,
    CytomineSlider
  },
  data() {
    return {
      loading: true,
      error: false,

      projects: [],

      contributorLabel: this.$t('contributor'),
      managerLabel: this.$t('manager'),

      creationModal: false,

      excludedProperties: [
        'name',
        'membersCount',
        'numberOfImages',
        'numberOfAnnotations',
        'numberOfJobAnnotations',
        'numberOfReviewedAnnotations',
        'lastActivity'
      ]
    };
  },
  computed: {
    currentUser: get('currentUser/user'),

    searchString: sync('listProjects/searchString'),
    filtersOpened: sync('listProjects/filtersOpened'),

    availableRoles() {
      return [this.contributorLabel, this.managerLabel];
    },
    maxNbMembers() {
      return Math.max(10, ...this.projects.map(project => project.membersCount));
    },
    maxNbImages() {
      return Math.max(10, ...this.projects.map(project => project.numberOfImages));
    },
    maxNbUserAnnotations() {
      return Math.max(100, ...this.projects.map(project => project.numberOfAnnotations));
    },
    maxNbJobAnnotations() {
      return Math.max(100, ...this.projects.map(project => project.numberOfJobAnnotations));
    },
    maxNbReviewedAnnotations() {
      return Math.max(100, ...this.projects.map(project => project.numberOfReviewedAnnotations));
    },
    ontologies() {
      let seenIds = [];
      let ontologies = [];
      this.projects.forEach(project => {
        if(!seenIds.includes(project.ontology)) {
          ontologies.push({id: project.ontology, name: project.ontologyName || this.$t('no-ontology')});
          seenIds.push(project.ontology);
        }
      });
      return ontologies;
    },

    selectedOntologies: syncMultiselectFilter('listProjects', 'selectedOntologies', 'ontologies'),
    selectedRoles: syncMultiselectFilter('listProjects', 'selectedRoles', 'availableRoles'),
    boundsMembers: syncBoundsFilter('listProjects', 'boundsMembers', 'maxNbMembers'),
    boundsImages: syncBoundsFilter('listProjects', 'boundsImages', 'maxNbImages'),
    boundsUserAnnotations: syncBoundsFilter('listProjects', 'boundsUserAnnotations', 'maxNbUserAnnotations'),
    boundsJobAnnotations: syncBoundsFilter('listProjects', 'boundsJobAnnotations', 'maxNbJobAnnotations'),
    boundsReviewedAnnotations: syncBoundsFilter('listProjects', 'boundsReviewedAnnotations', 'maxNbReviewedAnnotations'),

    nbActiveFilters() {
      return this.$store.getters['listProjects/nbActiveFilters'];
    },

    selectedOntologiesIds() {
      return this.selectedOntologies.map(ontology => ontology.id);
    },

    filteredProjects() {
      let filtered = this.projects;

      if(this.searchString) {
        let str = this.searchString.toLowerCase();
        filtered = filtered.filter(project => project.name.toLowerCase().indexOf(str) >= 0);
      }

      let includeContributor = this.selectedRoles.includes(this.contributorLabel);
      let includeManager = this.selectedRoles.includes(this.managerLabel);

      filtered = filtered.filter(project => {
        let managedProject = project.currentUserRoles.admin;
        let roleIncluded = (includeContributor && !managedProject) || (includeManager && managedProject);
        return this.selectedOntologiesIds.includes(project.ontology) &&
          roleIncluded &&
          isBetweenBounds(project.numberOfImages, this.boundsImages) &&
          isBetweenBounds(project.membersCount, this.boundsMembers) &&
          isBetweenBounds(project.numberOfAnnotations, this.boundsUserAnnotations) &&
          isBetweenBounds(project.numberOfJobAnnotations, this.boundsJobAnnotations) &&
          isBetweenBounds(project.numberOfReviewedAnnotations, this.boundsReviewedAnnotations);
      });

      return filtered;
    },

    showRole() { // show role iff the current user is manager or representative of at least one project
      return this.projects.some(project => project.currentUserRoles.admin || project.currentUserRoles.representative);
    },

    currentPage: sync('listProjects/currentPage'),
    perPage: sync('listProjects/perPage'),
    sort: sync('listProjects/sort'),
    openedDetails: { // HACK cannot use sync because buefy modifies the property => vuex warning because modif outside store
      get() {
        return this.$store.state.listProjects.openedDetails.slice();
      },
      set(value) {
        this.$store.commit('listProjects/setOpenedDetails', value);
      }
    }
  },
  methods: {
    toggleFilterDisplay() {
      this.filtersOpened = !this.filtersOpened;
    },
    updateSort(field, order) {
      this.sort = {field, order};
    },
    updateProject(updatedProject) {
      let project = this.projects.find(project => project.id === updatedProject.id);
      if(project) {
        project.populate({...updatedProject});
      }
    },
    async deleteProject(projectToDelete) {
      try {
        await projectToDelete.delete();
        this.projects = this.projects.filter(project => project.id !== projectToDelete.id);
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-project-deletion', {projectName: projectToDelete.name})
        });
      }
      catch(error) {
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-project-deletion', {projectName: projectToDelete.name})
        });
      }
    }
  },
  async created() {
    try {
      let projects = await ProjectCollection.fetchAll({
        withMembersCount: true,
        withLastActivity: true,
        withCurrentUserRoles: true
      });

      this.projects = projects.array.map(project => {
        let roles = project.currentUserRoles;
        project.roleIndex = Number(roles.admin) + Number(roles.representative); // to allow sorting
        return project;
      });

      // if a project was deleted, the currentPage value might not be valid => reinitialize it
      if((this.currentPage - 1)*this.perPage >= this.filteredProjects.length) {
        this.currentPage = 1;
      }
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

.fas.fa-user-cog {
  width: 20px;
  position: relative;
  text-align: center;
}

.superscript {
  font-size: 8px;
  position: absolute;
  top: -4px;
  right: 0;
}
</style>

<style>
.search-projects {
  max-width: 25em;
  margin-right: 1em;
}

.table-projects {
  margin-top: 1rem;
}

.list-projects-wrapper td, .list-projects-wrapper th {
  vertical-align: middle !important;
}
</style>
