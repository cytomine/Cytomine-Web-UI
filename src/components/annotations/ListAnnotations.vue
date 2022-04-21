<!-- Copyright (c) 2009-2022. Authors: see NOTICE file.

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
              {{$t('categorization')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect
                v-model="selectedCategorization"
                :options="allowedCategorizations"
                label="label"
                track-by="categorization"
                :allow-empty="false"
                :searchable="false"
              />
            </div>
          </div>
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

          <div v-if="ontology" class="column filter">
            <div class="filter-label">
              {{$t('terms')}}
            </div>
            <div class="filter-body">
              <ontology-tree-multiselect
                :ontology="ontology"
                :additionalNodes="additionalTermNodes"
                v-model="selectedTermsIds"
              />
            </div>
          </div>

          <div v-if="tracks" class="column filter">
            <div class="filter-label">
              {{$t('tracks')}}
            </div>
            <div class="filter-body">
              <track-tree-multiselect
                :tracks="filteredTracks"
                :additional-nodes="additionalTrackNodes"
                v-model="selectedTracksIds"
              />
            </div>
          </div>

          <div class="column filter">
            <div class="filter-label">
              {{$t('tags')}}
            </div>
            <div class="filter-body">
              <cytomine-multiselect v-model="selectedTags" :options="tagsOptions"
                                    label="name" track-by="id" :multiple="true" :allPlaceholder="$t('all')" />
            </div>
          </div>
        </div>

        <div class="columns">

          <div v-if="selectedAnnotationType === jobAnnotationOption" class="column filter is-one-third">
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

          <div v-else-if="selectedAnnotationType === userAnnotationOption" class="column filter is-one-third">
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

          <div v-else class="column filter is-one-third">
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

          <div class="column filter is-one-third">
            <div class="filter-label">
              {{$t('images')}}
            </div>
            <div class="filter-body">
              <b-input
                v-if="tooManyImages && selectedImages.length === 0"
                :placeholder="$t('all-images')"
                disabled
              />
              <cytomine-multiselect
                v-model="selectedImages"
                :options="images"
                :label="blindMode ? 'blindedName' : 'instanceFilename'"
                track-by="id"
                multiple
                :allPlaceholder="$t('all-images')"
                v-else
              />
            </div>
          </div>

          <div class="column filter">
            <div class="filter-label">
              {{$t('from')}}
            </div>
            <div class="filter-body">
              <cytomine-datepicker v-model="fromDate" :styles="['multiselect']" :maxDate="toDate || new Date()" />
            </div>
          </div>

          <div class="column filter">
            <div class="filter-label">
              {{$t('to')}}
            </div>
            <div class="filter-body">
              <cytomine-datepicker v-model="toDate" :styles="['multiselect']" :minDate="fromDate" position="is-bottom-left" />
            </div>
          </div>

        </div>
      </div>
    </div>

    <list-annotations-by v-for="prop in categoryOptions" :key="`${selectedCategorization.categorization}${prop.id}`"
      :categorization="selectedCategorization.categorization"
      :size="selectedSize.size"
      :color="selectedColor.hexaCode"
      :nbPerPage="nbPerPage"

      :allTerms="terms"
      :allUsers="allUsers"
      :allImages="images"
      :allTracks="tracks"
      :allTags="tags"

      :prop="prop"
      :multiple-terms="(isByTerm && prop.id === multipleTermsOption.id)"
      :no-term="(isByTerm && prop.id === noTermOption.id) || (!isByTerm && noTerm)"
      :multiple-tracks="(isByTrack && prop.id === multipleTracksOption.id)"
      :no-track="(isByTrack && prop.id === noTrackOption.id) || (!isByTrack && noTrack)"
      :terms-ids="selectedTermsIds"
      :tracks-ids="selectedTracksIds"
      :tags-ids="selectedTagsIds"
      :no-tag="(isByTag && prop.id === noTagOption.id) || (!isByTag && noTag)"
      :imagesIds="selectedImagesIds"
      :usersIds="selectedUsersIds"
      :reviewed="reviewed"
      :reviewUsersIds="reviewUsersIds"
      :afterThan="afterThan"
      :beforeThan="beforeThan"

      :revision="revision"

      v-show="showList(prop)"
      :visible="showList(prop)"

      @addTerm="addTerm"
      @addTrack="addTrack"
      @updateTermsOrTracks="revision++"
      @delete="revision++"
      @update="revision++"
      @select="viewAnnot($event)"
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
import constants from '@/utils/constants.js';

import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineDatepicker from '@/components/form/CytomineDatepicker';
import OntologyTreeMultiselect from '@/components/ontology/OntologyTreeMultiselect';

import ListAnnotationsBy from './ListAnnotationsBy';

import {ImageInstanceCollection, UserCollection, UserJobCollection, AnnotationCollection, TrackCollection, TagCollection, ImageInstance} from 'cytomine-client';

import {fullName} from '@/utils/user-utils.js';
import {defaultColors} from '@/utils/style-utils.js';
import TrackTreeMultiselect from '@/components/track/TrackTreeMultiselect';

// store options to use with store helpers to target projects/currentProject/listImages module
const storeOptions = {rootModuleProp: 'storeModule'};
// redefine helpers to use storeOptions and correct module path
const localSyncMultiselectFilter = (filterName, options) => syncMultiselectFilter(null, filterName, options, storeOptions);
import {appendShortTermToken} from '@/utils/token-utils.js';

export default {
  name: 'list-annotations',
  components: {
    TrackTreeMultiselect,
    CytomineMultiselect,
    CytomineDatepicker,
    OntologyTreeMultiselect,
    ListAnnotationsBy
  },
  data() {
    return {
      algoEnabled: constants.ALGORITHMS_ENABLED,
      loading: true,
      error: false,
      revision: 0,

      projectUsers: [],
      userJobs: [],

      tracks: [],

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
      tags:[],

      noTermOption: {id: 0, name: this.$t('no-term')},
      multipleTermsOption: {id: -1, name: this.$t('multiple-terms')},

      noTrackOption: {id: 0, name: this.$t('no-track')},
      multipleTracksOption: {id: -1, name: this.$t('multiple-tracks')},

      noTagOption: {id: 0, name: this.$t('no-tag')}
    };
  },
  computed: {
    allowedCategorizations() {
      let categorizations = [
        {label: this.$t('per-term'), categorization: 'TERM'},
        {label: this.$t('per-track'), categorization: 'TRACK'},
        {label: this.$t('per-user'), categorization: 'USER'},
      ];

      if (!this.tooManyImages) {
        categorizations.push({label: this.$t('per-image'), categorization: 'IMAGE'});
      }

      return categorizations;
    },
    currentUser: get('currentUser/user'),
    project: get('currentProject/project'),
    shortTermToken: get('currentUser/shortTermToken'),
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
      colors.push({label: this.$t('no-outline'), hexaCode: ''});
      return colors;
    },

    selectedSize: sync('previewSize', storeOptions),
    selectedCategorization: sync('categorization', storeOptions),
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
    additionalTermNodes() {
      let additionalNodes = [this.noTermOption];
      if(this.terms.length > 1 && this.isByTerm) {
        additionalNodes.push(this.multipleTermsOption);
      }
      return additionalNodes;
    },
    termsOptions() {
      return this.terms.concat(this.additionalTermNodes);
    },
    termOptionsIds() {
      return this.termsOptions.map(option => option.id);
    },

    filteredTracks() {
      return this.tracks.filter(track => this.selectedImagesIds.includes(track.image));
    },
    filteredTracksIds() {
      return this.filteredTracks.map(track => track.id);
    },
    additionalTrackNodes() {
      let additionalNodes = [this.noTrackOption];
      if (this.tracks.length > 1 && this.isByTrack) {
        additionalNodes.push(this.multipleTracksOption);
      }
      return additionalNodes;
    },
    tracksOptions() {
      return this.filteredTracks.concat(this.additionalTrackNodes);
    },
    trackOptionsIds() {
      return this.tracksOptions.map(option => option.id);
    },

    tagsOptions() {
      return [...this.tags, this.noTagOption];
    },

    selectedAnnotationType: sync('annotationType', storeOptions),
    selectedMembers: localSyncMultiselectFilter('members', 'filteredMembers'),
    selectedReviewers: localSyncMultiselectFilter('reviewers', 'members'),
    selectedUserJobs: localSyncMultiselectFilter('userJobs', 'userJobs'),
    selectedImages: localSyncMultiselectFilter('images', 'images'),
    selectedTags: localSyncMultiselectFilter('tags', 'tagsOptions'),
    selectedTracksIds: localSyncMultiselectFilter('tracksIds', 'trackOptionsIds'),
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

    categoryOptions() {
      switch (this.selectedCategorization.categorization) {
        case 'TERM':
          return this.termsOptions;
        case 'IMAGE':
          return this.images;
        case 'USER':
          if (this.selectedAnnotationType === this.jobAnnotationOption)
            return this.selectedUserJobs;
          if (this.reviewed)
            return this.selectedReviewers;
          return this.selectedMembers;
        case 'TRACK':
          return this.tracksOptions;
      }
      throw new Error('Cannot load a category options ' + this.selectedCategorization.categorization);
    },
    isByTerm() {
      return this.selectedCategorization.categorization === 'TERM';
    },
    isByTrack() {
      return this.selectedCategorization.categorization === 'TRACK';
    },
    isByTag() {
      return this.selectedCategorization.categorization === 'TAG';
    },
    noTerm() {
      return this.selectedTermsIds.includes(this.noTermOption.id);
    },
    noTrack() {
      return this.selectedTracksIds.includes(this.noTrackOption.id);
    },
    noTag() {
      return this.selectedTagsIds.includes(this.noTagOption.id);
    },

    selectedTagsIds() {
      return this.selectedTags.map(t => t.id);
    },
    collection() {
      let users = (this.selectedAnnotationType === this.jobAnnotationOption) ? this.userJobs : this.projectUsers;
      console.log('users', users);
      console.log('this.selectedUsersIds', this.selectedUsersIds);

      let collection = new AnnotationCollection({
        project: this.project.id,
        terms: this.selectedTermsIds.length===this.termsOptions.length ? null : this.selectedTermsIds,
        images: !(this.tooManyImages && this.selectedImages.length === 0) ? this.selectedImagesIds : null,
        users: this.selectedUsersIds!=null && this.selectedUsersIds.length===users.length ? null : this.selectedUsersIds,
        reviewed: this.reviewed,
        reviewUsers: this.reviewUsersIds,
        noTerm: this.noTerm,
        multipleTerms: this.selectedTermsIds.includes(this.multipleTermsOption.id),
        afterThan: this.afterThan,
        beforeThan: this.beforeThan
      });

      if(this.selectedTagsIds.length > 0 && this.selectedTagsIds.length < this.tags.length) {
        collection['tags'] = this.selectedTagsIds;
        collection['noTag'] = this.noTag;
      }

      return collection;
    },
    tooManyImages() {
      return this.project.numberOfImages > constants.MAX_IMAGES_FOR_FILTER;
    }
  },
  methods: {
    appendShortTermToken,
    viewAnnot(annot) {
      this.$router.push(`/project/${annot.project}/image/${annot.image}/annotation/${annot.id}`);
    },
    async fetchImages() {
      if (!this.tooManyImages) {
        this.images = (await ImageInstanceCollection.fetchAll({
          filterKey: 'project',
          filterValue: this.project.id,
          light: true
        })).array;
      }
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
    async fetchTracks() {
      this.tracks = (await TrackCollection.fetchAll({filterKey: 'project', filterValue: this.project.id})).array;
    },
    async fetchTags() {
      this.tags = (await TagCollection.fetchAll()).array;
    },
    downloadURL(format) {
      return appendShortTermToken(this.collection.getDownloadURL(format), this.shortTermToken);
    },
    addTerm(term) {
      this.terms.push(term);
      this.selectedTermsIds.push(term.id);
    },
    addTrack(track) {
      this.tracks.push(track);
    },
    resetPagesAndFilters() {
      this.$store.commit(this.storeModule + '/resetPagesAndFilters');
    },
    showList(prop) {
      switch (this.selectedCategorization.categorization) {
        case 'TERM':
          return this.selectedTermsIds.includes(prop.id);
        case 'IMAGE':
          return this.selectedImagesIds.includes(prop.id);
        case 'USER':
          return this.reviewed ? this.reviewUsersIds.includes(prop.id) : this.selectedUsersIds.includes(prop.id);
        case 'TRACK':
          return this.selectedTracksIds.includes(prop.id);
      }
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
    this.annotationTypes = [this.userAnnotationOption, this.reviewedAnnotationOption];
    if(this.algoEnabled) this.annotationTypes.splice(1, 0, this.jobAnnotationOption);

    // if store was not yet initialized, set default values
    if(!this.selectedSize) {
      this.selectedSize = this.allowedSizes[0];
    }
    if(!this.selectedCategorization) {
      this.selectedCategorization = this.allowedCategorizations[0];
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
        this.fetchTracks(),
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
      if(this.tooManyImages) {
        queriedImage = await ImageInstance.fetch(Number(this.$route.query.image));
      }
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
