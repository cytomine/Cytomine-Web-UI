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
<div class="project-actions-wrapper">
  <rename-modal
    :title="$t('rename-project')"
    :currentName="project.name"
    :active.sync="isRenameModalActive"
    @rename="rename"
  />

  <form @submit.prevent="saveOntology()">
    <cytomine-modal :active="isOntologyModalActive" :title="$t('change-ontology')" @close="isOntologyModalActive = false">
      <b-message v-if="errorOntologies" type="is-danger" has-icon icon-size="is-small">
        <h2> {{ $t('error') }} </h2>
        <p> {{ $t('unexpected-error-info-message') }} </p>
      </b-message>
      <template v-else>
        <b-message v-if="project.ontology" type="is-warning" has-icon icon-size="is-small">
          {{$t('change-ontology-warning-message')}}
        </b-message>
        <b-field :label="$t('ontology')">
          <b-select
            v-model="selectedOntology"
            :placeholder="$t('no-ontology')"
            :disabled="loadingOntologies"
            :loading="loadingOntologies"
          >
            <option :value="null">
              {{$t('no-ontology')}}
            </option>
            <option v-for="ontology in ontologies" :value="ontology.id" :key="ontology.id">
              {{ontology.name}}
            </option>
          </b-select>
        </b-field>
      </template>

      <template #footer>
        <button
          class="button"
          type="button"
          @click="isOntologyModalActive = false"
          :disabled="savingOntology"
        >
          {{$t('button-cancel')}}
        </button>
        <button
          v-if="!errorOntologies"
          class="button is-link"
          :class="{'is-loading': savingOntology}"
          :disabled="loadingOntologies || savingOntology"
        >
          {{$t('button-save')}}
        </button>
      </template>
    </cytomine-modal>
  </form>

  <form @submit.prevent="saveProjectAdmittance()">
    <cytomine-modal :active="isAdmittanceModalActive" :title="$t('change-admittance')" @close="isAdmittanceModalActive = false">
      <template>
        <b-field :label="$t('open-to-admittance')" horizontal>
          <b-switch v-model="internalAdmittanceProject['openToAdmittance']" class="switch">
            <template v-if="internalAdmittanceProject['openToAdmittance']">{{$t('yes')}}</template>
            <template v-else>{{$t('no')}}</template>
          </b-switch>
        </b-field>

        <b-field v-if="internalAdmittanceProject['openToAdmittance']" :label="$t('visibility-for-all')" horizontal>
          <b-switch v-model="internalAdmittanceProject['visibilityForAll']" class="switch">
            <template v-if="internalAdmittanceProject['visibilityForAll']">{{$t('yes')}}</template>
            <template v-else>{{$t('no')}}</template>
          </b-switch>
        </b-field>

        <b-field v-if="internalAdmittanceProject['openToAdmittance']" :key="'keyForAdmittance'"
          :label="$t('key-for-admittance')"
          horizontal
        >
          <b-input
            v-model="internalAdmittanceProject['keyForAdmittance']"
            :name="'keyForAdmittance'"
            :type="'text'"
          />
        </b-field>

        <b-field horizontal v-if="isChangingAdmittanceToOpen()">
          <b-checkbox v-model="admittanceOpenConfirm">
            {{$t('change-admittance-warning-message')}}
          </b-checkbox>
        </b-field>

        <b-field v-if="internalAdmittanceProject['openToAdmittance'] && !internalAdmittanceProject['visibilityForAll']" :label="$t('url-to-send-to-users')" horizontal>
          <div class="columns">
            <div class="column is-one-quarter">
              <button class="level-item button is-small" @click="copyURL">
                {{ $t('button-copy-url') }}
              </button>
            </div>
            <div class="column">
              <b-message type="is-info" has-icon size="is-small">
                {{$t('copy-url-admittance-explanation')}}
              </b-message>
            </div>
          </div>
        </b-field>
      </template>

      <template #footer>
        <button
          class="button"
          type="button"
          @click="isAdmittanceModalActive = false"
          :disabled="savingAdmittance"
        >
          {{$t('button-cancel')}}
        </button>
        <button
          class="button is-link"
          :class="{'is-loading': savingAdmittance}"
          :disabled="savingAdmittance || !isAdmittanceOpenConfirmed()"
        >
          {{$t('button-save')}}
        </button>
      </template>
    </cytomine-modal>
  </form>

  <div class="buttons">
    <button class="button" :class="size" @click="isRenameModalActive = true">
      {{$t('button-rename')}}
    </button>
    <button class="button" :class="size" @click="isOntologyModalActive = true" :disabled="cannotDeleteOntology">
      {{$t('button-change-ontology')}}
    </button>
    <button class="button" :class="size" @click="isAdmittanceModalActive = true">
      {{$t('button-change-admittance')}}
    </button>
    <button class="button is-danger" :class="size" @click="deleteProject()">
      {{$t('button-delete')}}
    </button>
  </div>
</div>
</template>

<script>
import {Cytomine,Project,OntologyCollection} from 'cytomine-client';
import CytomineModal from '@/components/utils/CytomineModal';
import RenameModal from '@/components/utils/RenameModal';
import copyToClipboard from 'copy-to-clipboard';

export default {
  name: 'project-actions',
  props: {
    project: {type: Object},
    size: {type: String, default: 'is-small'}
  },
  components: {
    CytomineModal,
    RenameModal
  },
  data() {
    return {
      isRenameModalActive: false,
      isOntologyModalActive: false,
      isAdmittanceModalActive: false,
      loadingOntologies: true,
      errorOntologies: false,
      ontologies: null,
      selectedOntology: null,
      cannotDeleteOntology: false,
      savingOntology: false,
      savingAdmittance: false,
      internalAdmittanceProject: {},
      admittanceOpenConfirm: false,
    };
  },
  watch: {
    async isOntologyModalActive(val) {
      if(val) {
        if(this.loadingOntologies) { // first opening of the ontology modal => load ontologies
          try {
            this.ontologies = (await OntologyCollection.fetchAll({light: true})).array;
            this.ontologies.sort((a, b) => a.name.localeCompare(b.name));
            this.loadingOntologies = false;
          }
          catch(error) {
            console.log(error);
            this.errorOntologies = true;
          }
        }

        // preselect the ontology of the project
        this.selectedOntology = this.project.ontology;
        this.savingOntology = false;
      }
    },
    changedAdmittance() {
      this.admittanceOpenConfirm = !this.isChangingAdmittanceToOpen();
    },
    async isAdmittanceModalActive(val) {
      if(val) {
        this.internalAdmittanceProject = this.project.clone();
        this.savingAdmittance = false;
      }
    }
  },
  methods: {
    async rename(newName) {
      let updatedProject = this.project.clone();
      try {
        updatedProject.name = newName;
        await updatedProject.save();
        this.$emit('update', updatedProject);
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-project-rename', {projectName: updatedProject.name})
        });
      }
      catch(error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-project-rename', {projectName: this.project.name})
        });
      }
      this.isRenameModalActive = false;
    },
    copyURL(e) {
      copyToClipboard(window.location.origin + '/#/project/' + this.project.id);
      this.$notify({type: 'success', text: this.$t('notif-success-project-URL-copied')});
      e.preventDefault();
    },
    async saveOntology(forceOntologyUpdate=false) {
      this.savingOntology = true; // possibly long operation => give user visual indication that it is in progress
      let updatedProject = this.project.clone();
      try {
        updatedProject.ontology = this.selectedOntology;
        updatedProject.forceOntologyUpdate = forceOntologyUpdate; // to delete annotationterms if some exist
        await updatedProject.save();
        this.$emit('update', updatedProject);
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-project-ontology-change', {projectName: this.project.name})
        });
      }
      catch(error) {
        console.log(error);
        if(error.response && error.response.data.errorValues) {
          let counts = error.response.data.errorValues;

          // if the only terms associations are performed by users, ask confirmation and delete them
          if(counts.algoAssociatedTermsCount === 0 && counts.reviewedAssociatedTermsCount === 0) {
            this.$buefy.dialog.confirm({
              title: this.$t('confirm-ontology-change'),
              message: this.$t('confirm-ontology-change-delete-user-terms', {count: counts.userAssociatedTermsCount}),
              type: 'is-danger',
              confirmText: this.$t('button-confirm'),
              cancelText: this.$t('button-cancel'),
              onConfirm: () => this.saveOntology(true)
            });
          }
          else { // otherwise, backend does not allow automatic deletion => notify of error
            this.cannotDeleteOntology = true;
            this.$notify({
              type: 'error',
              text: this.$t('notif-error-project-ontology-change-' +
                                (counts.algoAssociatedTermsCount ? 'job-terms' : 'reviewed-terms'))
            });
          }
        }
        else {
          this.$notify({
            type: 'error',
            text: this.$t('notif-error-project-ontology-change', {projectName: this.project.name})
          });
        }
      }
      this.savingOntology = false;
      this.isOntologyModalActive = false;
    },


    async saveProjectAdmittance() {
      this.savingAdmittance = true;
      this.admittanceOpenConfirm = false;
      try {

        try {
          this.loading = true;
          const options = {
            headers: {'content-type': 'application/json'}
          };
          let params = {};
          params['openToAdmittance'] = this.internalAdmittanceProject['openToAdmittance'];
          params['visibilityForAll'] = this.internalAdmittanceProject['visibilityForAll'];
          params['keyForAdmittance'] = this.internalAdmittanceProject['keyForAdmittance'];
          await Cytomine.instance.api.put(`${Cytomine.instance.host}/api/project/${this.internalAdmittanceProject.id}/admittance.json`, JSON.stringify(params), options);
          this.success = true;
        }
        catch(error) {
          this.$notify({type: 'error', text: this.$t('notif-error-admittance')});
        }
        let updatededProject = await Project.fetch(this.internalAdmittanceProject.id);
        this.$emit('update', updatededProject);
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-project-admittance-change', {projectName: this.project.name})
        });
      }
      catch(error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-project-admittance-change', {projectName: this.project.name})
        });
      }
      this.savingAdmittance = false;
      this.isAdmittanceModalActive = false;
    },


    isChangingAdmittanceToOpen() {
      return !this.project.openToAdmittance && this.internalAdmittanceProject.openToAdmittance;
    },
    isAdmittanceOpenConfirmed(){
      return this.admittanceOpenConfirm || !this.isChangingAdmittanceToOpen();
    },

    deleteProject() {
      this.$buefy.dialog.confirm({
        title: this.$t('delete-project'),
        message: this.$t('delete-project-confirmation-message', {projectName: this.project.name}),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => this.$emit('delete')
      });
    }
  }
};
</script>
