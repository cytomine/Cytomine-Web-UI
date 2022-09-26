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
<div class="content-wrapper">
  <b-loading :is-full-page="false" :active="loading" />

  <template v-if="!loading">

    <div class="columns">
      <div class="column is-one-third is-offset-one-third">
        <div class="panel small-panel" v-if="this.selectedProject">
          <p class="panel-heading">
            {{selectedProject ? selectedProject.name : $t('not-found')}}
          </p>
          <div class="panel-block panel-main-content has-text-centered">
            <div>
              {{$t('admittance-message', {projectName: selectedProject.name})}}
            </div>



            <div v-if="selectedProject.needKey">
              {{$t('admittance-key-message')}}

              <b-field :label="$t('key')">
                <b-input v-model="key" name="key" v-validate="'required'" />
              </b-field>
            </div>
          </div>
          <div class="panel-block has-text-right" >
            <button class="button explore-btn" type="button" @click="cancelSubscription()">
              {{$t('button-cancel')}}
            </button>
            <button class="button is-link" @click="confirmSubscription()">
              {{$t('button-confirm')}}
            </button>
          </div>
        </div>
        <div class="panel small-panel" v-else>
          <p class="panel-heading">
            {{selectedProject ? selectedProject.name : $t('not-found')}}
          </p>
          <div class="panel-block panel-main-content has-text-centered">
            {{ $t('admittance-not-available') }}
          </div>
          <div class="panel-block has-text-right" >
            <button class="button" type="button" @click="cancelSubscription()">
              {{$t('button-cancel')}}
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import {Cytomine, ProjectCollection} from 'cytomine-client';

export default {
  name: 'project-subscriptions',
  data() {
    return {
      loading: true,
      selectedProject: {},
      openedProjects: null,
      key: null
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    idTargetProject() {
      return Number(this.$route.params.idProject);
    }
  },
  watch: {
    idTargetProject() {
      if(!this.idTargetProject) {
        throw new Error('No project selected');
      }
      if(this.selectedProject && this.selectedProject.id === this.idTargetProject) {
        return;
      }
      this.selectTargetProject();
    }
  },
  methods: {
    async selectTargetProject() {
      this.selectedProject = this.openedProjects.array.find(project => project.id == this.idTargetProject);
      if (!this.selectedProject) {
        let collection = new ProjectCollection({
          openToAdmittance: true,
          targetProject: this.idTargetProject
        });
        this.openedProjects = await collection.fetchAll();
        if (this.openedProjects.array.length===1) {
          this.selectedProject = this.openedProjects.array[0];
        }
      }
    },
    async confirmSubscription() {
      try {
        await Cytomine.instance.api.post(`${Cytomine.instance.host}/api/project/${this.selectedProject.id}/subscribe.json?key=${this.key}`);
        this.$notify({type: 'success', text: this.$t('admittance-confirmed', {projectName: this.selectedProject.name})});
        this.$router.replace(`/project/${this.selectedProject.id}`);
      }
      catch(error) {
        if (error && error.response.data && error.response.data.errors && error.response.data.errors.indexOf('access key')!==-1) {
          this.$notify({type: 'error', text: this.$t('admittance-error-key-not-valid')});
        }
        else {
          this.$notify({type: 'error', text: this.$t('admittance-error')});
        }
      }
    },
    cancelSubscription() {
      this.$router.replace('/');
    }
  },
  async created() {
    try {
      let collection = new ProjectCollection({
        openToAdmittance: true,
      });
      this.openedProjects = await collection.fetchAll();
      console.log('this.openedProjects', this.openedProjects);
      this.selectTargetProject();
      this.loading = false;
    }
    catch(error) {
      console.log(error);
      this.loading = false;
      return;
    }
  }
};
</script>

<style scoped>

.explore-btn {
  margin-right: 6px;
}

.content-wrapper {
  height: 100%;
}

.columns {
  height: 100%;
}

.panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.small-panel {
  max-height: 250px;
}

.panel-icon {
  font-size: 1.2em;
}

.panel-main-content {
  overflow: auto;
  flex-grow: 1;
}

.box.error .columns {
  align-items: center;
}
</style>
