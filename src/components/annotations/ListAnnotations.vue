<template>
<div class="box error" v-if="!configUI['project-annotations-tab']">
  <h2> {{ $t('access-denied') }} </h2>
  <p>{{ $t('insufficient-permission') }}</p>
</div>
<div class="box error" v-else-if="error">
  <h2> {{ $t('error') }} </h2>
  <p>{{ $t('error-load-annotations-filters') }}</p>
</div>
<div v-else class="content-wrapper">
  <b-loading :is-full-page="false" :active="loading" />
  <div v-if="!loading">
    <div class="box">
      <h2> {{ $t('display') }} </h2>
      <div class="filters">
        <div class="columns">
          <div class="column filter">
            <div class="filter-label">
              {{$t('preview-size')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect
                v-model="selectedSize"
                :options="allowedSizes"
                label="label"
                track-by="size"
                :allow-empty="false"
                :searchable="false"
              />
            </div>
          </div>
          <div class="column filter">
            <div class="filter-label">
              {{$t('number-per-page')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect
                v-model="nbPerPage"
                :options="[10, 25, 50, 100]"
                :allow-empty="false"
                :searchable="false"
              />
            </div>
          </div>
          <div class="column filter">
            <div class="filter-label">
              {{$t('outline-color')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect
                v-model="selectedColor"
                :options="colors"
                label="label"
                track-by="name"
                :allow-empty="false"
                :searchable="false"
              />
            </div>
          </div>
        </div>
      </div>

      <h2> {{ $t('filters') }} </h2>
      <div class="filters">
        <div class="columns">
          <div class="column filter">
            <div class="filter-label">
              {{$t('annotation-type')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect
                v-model="selectedAnnotationType"
                :options="annotationTypes"
                :allow-empty="false"
                :searchable="false"
              />
            </div>
          </div>

          <div v-if="selectedAnnotationType === jobAnnotationOption" class="column filter">
            <div class="filter-label">
              {{$t('analyses')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect
                v-model="selectedUserJobs"
                :options="userJobs"
                label="fullName"
                track-by="id"
                :multiple="true"
              />
            </div>
          </div>

          <div v-else-if="selectedAnnotationType === userAnnotationOption" class="column filter">
            <div class="filter-label">
              {{$t('members')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect
                v-model="selectedMembers"
                :options="filteredMembers"
                label="fullName"
                track-by="id"
                :multiple="true"
              />
            </div>
          </div>

          <div v-else class="column filter">
            <div class="filter-label">
              {{$t('reviewers')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect
                v-model="selectedReviewers"
                :options="members"
                label="fullName"
                track-by="id"
                :multiple="true"
              />
            </div>
          </div>
        </div>

        <div class="columns">
          <div class="column filter is-half">
            <div class="filter-label">
              {{$t('images')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect
                v-model="selectedImages"
                :options="images"
                :label="blindMode ? 'blindedName' : 'instanceFilename'"
                track-by="id"
                :multiple="true"
              />
            </div>
          </div>

          <div v-if="ontology" class="column filter">
              <div class="filter-label">
                {{$t('terms')}}
              </div>
              <div class="filter-body">
                <ontology-tree-multiselect
                  :ontology="ontology"
                  :additionalNodes="additionalNodes"
                  v-model="selectedTermsIds"
                />
              </div>
          </div>

        </div>
      </div>

      <h2 class="has-text-right"> {{ $t('download-results') }} </h2>
      <div class="buttons download-buttons">
        <a class="button is-link" :href="downloadURL('pdf')">{{$t('download-PDF')}}</a>
        <a class="button is-link" :href="downloadURL('csv')">{{$t('download-CSV')}}</a>
        <a class="button is-link" :href="downloadURL('xls')">{{$t('download-excel')}}</a>
      </div>
    </div>

    <list-annotations-by-term v-for="term in termsOptions" :key="term.id"
      :size="selectedSize.size"
      :color="selectedColor.hexaCode"
      :nbPerPage="nbPerPage"

      :allTerms="terms"
      :allUsers="allUsers"
      :allImages="images"

      :term="term"
      :multipleTerms="term.id === multipleTermsOption.id"
      :noTerm="term.id === noTermOption.id"
      :imagesIds="selectedImagesIds"
      :usersIds="selectedUsersIds"
      :reviewed="reviewed"
      :reviewUsersIds="reviewUsersIds"

      :revision="revision"

      v-show="selectedTermsIds.includes(term.id)"

      @addTerm="addTerm"
      @update="revision++"
    />
  </div>
</div>
</template>

<script>
import {get, sync, syncMultiselectFilter} from '@/utils/store-helpers';

import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import OntologyTreeMultiselect from '@/components/ontology/OntologyTreeMultiselect';

import ListAnnotationsByTerm from './ListAnnotationsByTerm';

import {ImageInstanceCollection, UserCollection, UserJobCollection, AnnotationCollection} from 'cytomine-client';

import {fullName} from '@/utils/user-utils.js';
import {defaultColors} from '@/utils/style-utils.js';

// store options to use with store helpers to target projects/currentProject/listImages module
const storeOptions = {rootModuleProp: 'storeModule'};
// redefine helpers to use storeOptions and correct module path
const localSyncMultiselectFilter = (filterName, options) => syncMultiselectFilter(null, filterName, options, storeOptions);

export default {
  name: 'list-annotations',
  components: {
    CytomineMultiselect,
    OntologyTreeMultiselect,
    ListAnnotationsByTerm
  },
  data() {
    return {
      loading: true,
      error: false,
      revision: 0,

      users: [],
      userJobs: [],

      allowedSizes: [
        {label: this.$t('small'), size: 85},
        {label: this.$t('medium'), size: 125},
        {label: this.$t('large'), size: 200},
        {label: this.$t('huge'), size: 400},
      ],

      userAnnotationOption: this.$t('user-annotations'),
      jobAnnotationOption: this.$t('analysis-annotations'),
      reviewedAnnotationOption: this.$t('reviewed-annotations'),
      annotationTypes: [],

      images: [],

      noTermOption: {id: 0, name: this.$t('no-term')},
      multipleTermsOption: {id: -1, name: this.$t('multiple-terms')}
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    project: get('currentProject/project'),
    blindMode() {
      return this.project.blindMode;
    },
    canManageProject() {
      return this.$store.getters['currentProject/canManageProject'];
    },
    ontology: get('currentProject/ontology'),
    configUI: get('currentProject/configUI'),

    storeModule() { // path to the vuex module in which state of this component is stored (projects/currentProject/listAnnotations)
      return this.$store.getters['currentProject/currentProjectModule'] + 'listAnnotations';
    },

    colors() {
      let colors = defaultColors.map(color => ({label: this.$t(color.name), ...color}));
      colors.push({label: this.$t('no-outline')});
      return colors;
    },

    selectedSize: sync('previewSize', storeOptions),
    nbPerPage: sync('perPage', storeOptions),
    selectedColor: sync('outlineColor', storeOptions),

    targetAnnotationType() {
      switch(this.$route.query.type) {
        case 'user':
          return this.userAnnotationOption;
        case 'algo':
          return this.jobAnnotationOption;
        case 'reviewed':
          return this.reviewedAnnotationOption;
      }
    },

    allUsers() {
      return this.users.concat(this.userJobs);
    },
    members: get('currentProject/members'),
    managers: get('currentProject/managers'),
    filteredMembers() { // filter the members so as to return only those whose annotations can be seen by current user
      if(this.canManageProject || (!this.project.hideUsersLayers && !this.project.hideAdminsLayers)) {
        return this.members;
      }

      let idManagers = this.managers.map(m => m.id);
      return this.members.filter(member => {
        if(this.currentUser.id === member.id) {
          return true;
        }
        let isManager = idManagers.includes(member.id);
        return isManager ? !this.project.hideAdminsLayers : !this.project.hideUsersLayers;
      });
    },

    terms() {
      return this.$store.getters['currentProject/terms'] || [];
    },
    additionalNodes() {
      let additionalNodes = [this.noTermOption];
      if(this.terms.length > 1) {
        additionalNodes.push(this.multipleTermsOption);
      }
      return additionalNodes;
    },
    termsOptions() {
      return this.terms.concat(this.additionalNodes);
    },
    termOptionsIds() {
      return this.termsOptions.map(option => option.id);
    },

    selectedAnnotationType: sync('annotationType', storeOptions),
    selectedMembers: localSyncMultiselectFilter('members', 'filteredMembers'),
    selectedReviewers: localSyncMultiselectFilter('reviewers', 'members'),
    selectedUserJobs: localSyncMultiselectFilter('userJobs', 'userJobs'),
    selectedImages: localSyncMultiselectFilter('images', 'images'),
    selectedTermsIds: localSyncMultiselectFilter('termsIds', 'termOptionsIds'),

    reviewed() {
      return this.selectedAnnotationType === this.reviewedAnnotationOption;
    },
    selectedUsersIds() {
      if(this.reviewed) {
        return null;
      }
      let users = (this.selectedAnnotationType === this.jobAnnotationOption) ? this.selectedUserJobs : this.selectedMembers;
      return users.map(user => user.id);
    },
    reviewUsersIds() {
      return this.reviewed ? this.selectedReviewers.map(u => u.id) : null;
    },

    selectedImagesIds() {
      return this.selectedImages.map(img => img.id);
    },

    collection() {
      return new AnnotationCollection({
        project: this.project.id,
        terms: this.selectedTermsIds,
        images: this.selectedImagesIds,
        users: this.selectedUsersIds,
        reviewed: this.reviewed,
        reviewUsers: this.reviewUsersIds,
        noTerm: this.selectedTermsIds.includes(this.noTermOption.id),
        multipleTerms: this.selectedTermsIds.includes(this.multipleTermsOption.id)
      });
    },
  },
  methods: {
    async fetchImages() {
      this.images = (await ImageInstanceCollection.fetchAll({filterKey: 'project', filterValue: this.project.id})).array;
    },
    async fetchUsers() {
      this.users = (await UserCollection.fetchAll()).array;
      this.users.forEach(user => {
        user.fullName = fullName(user);
      });
    },
    async fetchUserJobs() {
      this.userJobs = (await UserJobCollection.fetchAll({filterKey: 'project', filterValue: this.project.id})).array;
      this.userJobs = this.userJobs.filter(uj => uj.id); // HACK because some returned jobs are empty objects
      this.userJobs.forEach(userJob => {
        userJob.fullName = fullName(userJob);
      });
    },
    downloadURL(format) {
      return this.collection.getDownloadURL(format);
    },
    addTerm(term) {
      this.terms.push(term);
      this.selectedTermsIds.push(term.id);
    },
    resetPagesAndFilters() {
      this.$store.commit(this.storeModule + '/resetPagesAndFilters');
    }
  },
  async created() {
    this.annotationTypes = [this.userAnnotationOption, this.jobAnnotationOption, this.reviewedAnnotationOption];

    // if store was not yet initialized, set default values
    if(!this.selectedSize) {
      this.selectedSize = this.allowedSizes[0];
    }
    if(!this.selectedColor) {
      this.selectedColor = this.colors[0];
    }
    if(!this.selectedAnnotationType) {
      this.selectedAnnotationType = this.userAnnotationOption;
    }
    // ---

    try {
      await Promise.all([
        this.fetchImages(),
        this.fetchUsers(),
        this.fetchUserJobs()
      ]);
    }
    catch(error) {
      console.log(error);
      this.error = true;
      return;
    }

    if(this.targetAnnotationType) {
      this.resetPagesAndFilters(); // we want all annotations of this type => reset state
      this.selectedAnnotationType = this.targetAnnotationType;
    }

    if(this.$route.query.image) {
      let queriedImage = this.images.find(image => image.id === Number(this.$route.query.image));
      if(queriedImage) {
        this.resetPagesAndFilters(); // we want all annotations of the image => reset state
        this.selectedImages = [queriedImage];
      }
    }

    if(this.$route.query.userJob) {
      let queriedUserJob = this.userJobs.find(uj => uj.id === Number(this.$route.query.userJob));
      if(queriedUserJob) {
        this.resetPagesAndFilters(); // we want all annotations of the job => reset state
        this.selectedAnnotationType = this.jobAnnotationOption;
        this.selectedUserJobs = [queriedUserJob];
      }
    }

    this.loading = false;
  }
};
</script>

<style scoped>
.filters:not(:last-child) {
  margin-bottom: 1.25rem;
}

.download-buttons {
  justify-content: flex-end;
}
</style>
