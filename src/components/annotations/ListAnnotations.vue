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
          <div class="column filter is-one-quarter">
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

          <div class="column filter is-one-quarter">
            <div class="filter-label">
              {{$t('images')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect
                v-model="selectedImages"
                :options="images"
                :label="blindMode ? 'blindedName' : 'instanceFilename'"
                track-by="id"
                multiple
                :allPlaceholder="$t('all-images')"
              />
            </div>
          </div>

          <div v-if="ontology" class="column filter is-one-quarter">
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

          <div v-if="selectedAnnotationType === jobAnnotationOption" class="column filter is-one-quarter">
           <div class="filter-label">
             {{$t('analyses')}}
           </div>
           <div class="filter-body">
             <cytomine-multiselect
               v-model="selectedUserJobs"
               :options="userJobs"
               label="fullName"
               track-by="id"
               multiple
               :allPlaceholder="$t('all-analyses')"
             />
           </div>
          </div>

          <div v-else-if="selectedAnnotationType === userAnnotationOption" class="column filter is-one-quarter">
           <div class="filter-label">
             {{$t('members')}}
           </div>
           <div class="filter-body">
             <cytomine-multiselect
               v-model="selectedMembers"
               :options="filteredMembers"
               label="fullName"
               track-by="id"
               multiple
             />
           </div>
          </div>

          <div v-else class="column filter is-one-quarter">
           <div class="filter-label">
             {{$t('reviewers')}}
           </div>
           <div class="filter-body">
             <cytomine-multiselect
               v-model="selectedReviewers"
               :options="members"
               label="fullName"
               track-by="id"
               multiple
             />
           </div>
          </div>
        </div>

        <div class="columns">
          <div class="column filter is-one-quarter">
            <div class="filter-label">
              {{$t('tags')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect v-model="selectedTags" :options="availableTags"
                label="name" track-by="id" :multiple="true" :allPlaceholder="$t('all')" />
            </div>
          </div>
          <div class="column filter is-one-quarter"></div>

          <div class="column filter is-one-quarter">
            <div class="filter-label">
              {{$t('from')}}
            </div>
            <div class="filter-body">
              <cytomine-datepicker v-model="fromDate" :styles="['multiselect']" :maxDate="toDate || new Date()" />
            </div>
          </div>

          <div class="column filter is-one-quarter">
            <div class="filter-label">
              {{$t('to')}}
            </div>
            <div class="filter-body">
              <cytomine-datepicker v-model="toDate" :styles="['multiselect']" :minDate="fromDate" />
            </div>
          </div>

        </div>
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
      :tagsIds="tagsIdsNotNull"
      :noTag="noTag"
      :reviewed="reviewed"
      :reviewUsersIds="reviewUsersIds"
      :afterThan="afterThan"
      :beforeThan="beforeThan"

      :revision="revision"

      v-show="selectedTermsIds.includes(term.id)"

      @addTerm="addTerm"
      @update="revision++"
    />

    <div class="box">
      <h2 class="has-text-centered"> {{ $t('download-results') }} </h2>
      <div class="buttons is-centered">
        <a class="button is-link" :href="downloadURL('pdf')">{{$t('download-PDF')}}</a>
        <a class="button is-link" :href="downloadURL('csv')">{{$t('download-CSV')}}</a>
        <a class="button is-link" :href="downloadURL('xls')">{{$t('download-excel')}}</a>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import {get, sync, syncMultiselectFilter} from '@/utils/store-helpers';

import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineDatepicker from '@/components/form/CytomineDatepicker';
import OntologyTreeMultiselect from '@/components/ontology/OntologyTreeMultiselect';

import ListAnnotationsByTerm from './ListAnnotationsByTerm';

import {ImageInstanceCollection, UserCollection, UserJobCollection, AnnotationCollection, TagCollection} from 'cytomine-client';

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
    CytomineDatepicker,
    OntologyTreeMultiselect,
    ListAnnotationsByTerm
  },
  data() {
    return {
      loading: true,
      error: false,
      revision: 0,

      projectUsers: [],
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
      availableTags:[],

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
      return this.projectUsers.concat(this.userJobs);
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
    selectedTags: localSyncMultiselectFilter('tags', 'availableTags'),
    selectedTermsIds: localSyncMultiselectFilter('termsIds', 'termOptionsIds'),
    fromDate: sync('fromDate', storeOptions),
    toDate: sync('toDate', storeOptions),

    afterThan() {
      return this.fromDate ? this.fromDate.getTime() : null;
    },
    beforeThan() {
      return this.toDate ? this.toDate.setHours(23, 59, 59, 999) : null;
    },

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

    querySearchImage() {
      return this.$route.query.image;
    },
    querySearchTags() {
      return this.$route.query.tags;
    },
    selectedImagesIds() {
      return this.selectedImages.map(img => img.id);
    },
    selectedTagsIds() {
      return this.selectedTags.map(t => t.id);
    },
    tagsIdsNotNull() {
      if(this.selectedTagsIds.indexOf('null') >= 0) {
        let x = this.selectedTagsIds.slice();
        x.splice(x.indexOf('null'), 1);
        return x;
      }
      return this.selectedTagsIds;
    },
    noTag() {
      return this.selectedTagsIds.indexOf('null') >= 0;
    },
    collection() {
      let collection = new AnnotationCollection({
        project: this.project.id,
        terms: this.selectedTermsIds,
        images: this.selectedImagesIds,
        users: this.selectedUsersIds,
        reviewed: this.reviewed,
        reviewUsers: this.reviewUsersIds,
        noTerm: this.selectedTermsIds.includes(this.noTermOption.id),
        multipleTerms: this.selectedTermsIds.includes(this.multipleTermsOption.id),
        afterThan: this.afterThan,
        beforeThan: this.beforeThan
      });

      if(this.selectedTagsIds.length > 0 && this.selectedTagsIds.length < this.availableTags.length) {
        collection['tags'] = this.selectedTagsIds;
        collection['noTag'] = this.noTag;
      }

      return collection;
    },
  },
  methods: {
    async fetchImages() {
      this.images = (await ImageInstanceCollection.fetchAll({
        filterKey: 'project',
        filterValue: this.project.id,
        light: true
      })).array;
    },
    async fetchUsers() {

      let collection = new UserCollection({
        filterKey: 'project',
        filterValue: this.project.id,
      });

      this.projectUsers = (await collection.fetchAll()).array;
      this.projectUsers.forEach(user => {
        user.fullName = fullName(user);
      });
    },
    async fetchUserJobs() {
      this.userJobs = (await UserJobCollection.fetchAll({filterKey: 'project', filterValue: this.project.id})).array;
      this.userJobs.forEach(userJob => {
        userJob.fullName = fullName(userJob);
      });
    },
    async fetchTags() {
      this.availableTags = [{id: 'null', name: this.$t('no-tag')}, ...(await TagCollection.fetchAll()).array];
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
  watch: {
    querySearchTags(values) {
      if(values) {
        this.selectedTags = [];
        let queriedTags = this.availableTags.filter(tag => values.split(',').includes(tag.name));
        if(queriedTags) {
          this.resetPagesAndFilters(); // we want all annotations of the job => reset state
          this.selectedTags = queriedTags;
        }
      }
    },
    querySearchImage(val) {
      if(val) {
        this.selectedImages = [];
        let queriedImage = this.images.find(image => image.id === Number(val));
        if(queriedImage) {
          this.resetPagesAndFilters(); // we want all annotations of the image => reset state
          this.selectedImages = [queriedImage];
        }
      }
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
        this.fetchUserJobs(),
        this.fetchTags()
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
    if(this.$route.query.tags) {
      let queriedTags = this.availableTags.filter(tag => this.$route.query.tags.split(',').includes(tag.name));
      if(queriedTags) {
        this.resetPagesAndFilters(); // we want all annotations of the tags => reset state
        this.selectedTags = queriedTags;
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

.filter.column {
  padding: 0.4em 0.75em;
}
</style>
