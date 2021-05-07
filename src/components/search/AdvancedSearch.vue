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
<div class="box error" v-if="error">
  <h2> {{ $t('error') }} </h2>
  <p>{{ $t('unexpected-error-info-message') }}</p>
</div>
<div v-else class="content-wrapper">
  <div class="panel">
    <p class="panel-heading">
      {{$t('advanced-search')}}
    </p>
    <div class="panel-block">
      <div class="search-block">
        <b-input class="search-projects" :value="searchString" @input="debounceSearchString" :placeholder="$t('search-placeholder')" type="search" icon="search" />
      </div>

      <b-collapse open>
        <div class="filters">
          <div class="columns">
            <div class="column filter">
              <div class="filter-label">
                {{$t('tags')}}
              </div>
              <div class="filter-body">
                <cytomine-multiselect v-model="selectedTags" :options="availableTags"
                  label="name" track-by="id" :multiple="true" :allPlaceholder="$t('all')" />
              </div>
            </div>
            <div class="column filter">
            </div>
            <div class="column filter">
            </div>
          </div>
        </div>
      </b-collapse>


    </div>
    <p class="panel-tabs">
      <a :class="{'is-active': activeTab === 'projects'}" @click="activeTab = 'projects'">
        {{$t('projects')}} ({{this.projects.totalNbItems}})
      </a>
      <a :class="{'is-active': activeTab === 'images'}" @click="activeTab = 'images'">
        {{$t('images')}} ({{this.images.totalNbItems}})
      </a>
    </p>
    <div class="panel-block">
      <b-loading :is-full-page="false" :active="loading" />

      <div
        v-show="activeTab === 'projects'"
        :key="'projects'"
      >
        <cytomine-table
          :collection="projectCollection"
          class="table-projects"
          :currentPage.sync="currentPage"
          :perPage.sync="perPage"
          :openedDetailed.sync="openedDetails"
          :sort.sync="sortField"
          :order.sync="sortOrder"
          :data.sync="projects"
          :revision="revision"
        >
          <template #default="{row: project}">
            <b-table-column field="currentUserRole" label="" centered width="1" sortable>
              <icon-project-member-role
                :is-manager="project.currentUserRoles.admin"
                :is-representative="project.currentUserRoles.representative"
              />
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
              @update="updateProject()"
              @delete="deleteProject(project)"
            />
          </template>

          <template #empty>
            <div class="content has-text-grey has-text-centered">
              <p>{{$t('no-project')}}</p>
            </div>
          </template>
        </cytomine-table>

        <div class="legend">
            <h2>{{$t('legend')}}</h2>
          <p><icon-project-member-role /> : {{$t('contributor-icon-label')}}</p>
          <p><icon-project-member-role :is-manager="true" /> : {{$t('manager-icon-label')}}</p>
          <p><icon-project-member-role :is-manager="true" :is-representative="true" /> : {{$t('representative-icon-label')}}</p>
        </div>
      </div>


      <div
      v-show="activeTab === 'images'"
      :key="'images'"
      >
        <cytomine-table
          :collection="imageCollection"
          :currentPage.sync="currentPage"
          :perPage.sync="perPage"
          :openedDetailed.sync="openedDetails"
          :sort.sync="sortField"
          :order.sync="sortOrder"
          :data.sync="images"
          :revision="revision"
        >
          <template #default="{row: image}">
            <b-table-column :label="$t('overview')" width="100">
              <router-link :to="`/project/${image.project}/image/${image.id}`">
                <img :src="image.thumb" class="image-overview">
              </router-link>
            </b-table-column>

            <b-table-column
              :field="image.projectBlind ? 'blindedName' : 'instanceFilename'"
              :label="$t('name')"
              sortable
              width="400"
            >
              <router-link :to="`/project/${image.project}/image/${image.id}`">
                <image-name :image="image" showBothNames />
              </router-link>
            </b-table-column>

            <b-table-column
              :field="'projectName'"
              :label="$t('project')"
              width="200"
            >
              <router-link :to="`/project/${image.project}`">
                {{ image.projectName }}
              </router-link>
            </b-table-column>

            <b-table-column field="magnification" :label="$t('magnification')" centered sortable width="100">
              {{ image.magnification || $t('unknown') }}
            </b-table-column>

            <b-table-column field="numberOfAnnotations" :label="$t('user-annotations')" centered sortable width="100">
              <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=user`">
                {{ image.numberOfAnnotations }}
              </router-link>
            </b-table-column>

            <b-table-column field="numberOfJobAnnotations" :label="$t('analysis-annotations')" centered sortable width="100">
              <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=algo`">
                {{ image.numberOfJobAnnotations }}
              </router-link>
            </b-table-column>

            <b-table-column field="numberOfReviewedAnnotations" :label="$t('reviewed-annotations')" centered sortable width="100">
              <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=reviewed`">
                {{ image.numberOfReviewedAnnotations }}
              </router-link>
            </b-table-column>

            <b-table-column label=" " centered width="150">
              <router-link :to="`/project/${image.project}/image/${image.id}`" class="button is-small is-link">
                {{$t('button-open')}}
              </router-link>
            </b-table-column>
          </template>

          <template #detail="{row: image}">
            <image-details
              :image="image"
              :excludedProperties="excludedProperties"
            />
          </template>

          <template #empty>
            <div class="content has-text-grey has-text-centered">
              <p>{{$t('no-image')}}</p>
            </div>
          </template>
        </cytomine-table>
      </div>


    </div>
  </div>
</div>
</template>

<script>
import _ from 'lodash';
import {get} from '@/utils/store-helpers';
import ImageName from '@/components/image/ImageName';
import CytomineTable from '@/components/utils/CytomineTable';
import ProjectDetails from '@/components/project/ProjectDetails';
import ImageDetails from '@/components/image/ImageDetails';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import {ImageInstanceCollection, ProjectCollection, TagCollection} from 'cytomine-client';
import {getWildcardRegexp} from '@/utils/string-utils';
import IconProjectMemberRole from '@/components/icons/IconProjectMemberRole';

export default {
  name: 'advanced-search',
  components: {
    IconProjectMemberRole,
    ImageName,
    CytomineTable,
    ProjectDetails,
    ImageDetails,
    CytomineMultiselect
  },
  data() {
    return {
      loading: true,
      error: false,

      searchString: '',
      projects:[],
      images: [],
      activeTab: 'projects',
      perPage: 10,

      selectedTags: [],
      availableTags:[],

      currentPage: 1,
      sortField: 'created',
      sortOrder: 'desc',
      openedDetails: [],
      revision: 0,

      excludedProperties: [
        'name',
        'imagesPreview',
        'lastActivity',
      ],


    };
  },
  methods: {
    debounceSearchString: _.debounce(async function(value) {
      this.searchString = value;
    }, 500)
  },
  computed: {
    currentUser: get('currentUser/user'),

    pathSearchString() {
      return this.$route.params.searchString;
    },
    querySearchString() {
      return this.$route.query.searchString;
    },
    querySearchTags() {
      return this.$route.query.tags;
    },
    regexp() {
      return getWildcardRegexp(this.searchString);
    },
    projectCollection() {
      let collection = new ProjectCollection({
        withMembersCount: true,
        withLastActivity: true,
        withCurrentUserRoles: true
      });
      if(this.searchString) {
        collection['name'] = {
          ilike: encodeURIComponent(this.searchString)
        };
      }

      if(this.selectedTags.length > 0 && this.selectedTags.length < this.availableTags.length){
        collection['tag'] = {
          in: this.selectedTags.map(t => t.id).join()
        };
      }
      return collection;
    },
    imageCollection() {
      let collection = new ImageInstanceCollection({
        filterKey: 'user',
        filterValue: this.currentUser.id,
      });

      if(this.searchString) {
        collection['name'] = {
          ilike: encodeURIComponent(this.searchString)
        };
      }
      if(this.selectedTags.length > 0 && this.selectedTags.length < this.availableTags.length){
        collection['tag'] = {
          in: this.selectedTags.map(t => t.id).join()
        };
      }
      return collection;
    },



  },
  watch: {
    pathSearchString(val) {
      if(val) {
        this.searchString = val;
      }
    },
    querySearchString(val) {
      if(val && !this.pathSearchString) {
        this.searchString = val;
      }
    },
    querySearchTags(values) {
      if(values) {
        this.selectedTags = [];
        let queriedTags = this.availableTags.filter(tag => values.split(',').includes(tag.name));
        if(queriedTags) {
          this.selectedTags = queriedTags;
        }
      }
    },
  },
  async created() {
    this.searchString = this.pathSearchString || this.querySearchString || '';
    try {
      this.availableTags = [{id: 'null', name: this.$t('no-tag')}, ...(await TagCollection.fetchAll()).array];
    }
    catch(error) {
      console.log(error);
      this.error = true;
    }
    if(this.$route.query.tags) {
      let queriedTags = this.availableTags.filter(tag => this.$route.query.tags.split(',').includes(tag.name));
      if(queriedTags) {
        this.selectedTags = queriedTags;
      }
    }

    this.loading = false;
  }
};
</script>

<style scoped>
.search-block {
  display: flex;
  background: #fff;
  padding: 0.5em 0.75em;
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

</style>
