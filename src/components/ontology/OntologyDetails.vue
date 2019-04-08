<template>
<b-message v-if="error" type="is-danger" has-icon icon-size="is-small">
  {{$t('unexpected-error-info-message')}}
</b-message>
<div v-else-if="!loading" class="ontology-details-wrapper">
  <table class="table is-fullwidth">
    <tbody>
      <tr>
        <td colspan="2">
          <strong>{{$t('terms')}}</strong>
          <ontology-tree :ontology="fullOntology" :allowSelection="false" :allowDrag="true" :allowEdition="true">
            <template #no-result>
              <em class="has-text-grey">{{$t('no-term')}}</em>
            </template>
          </ontology-tree>
        </td>
      </tr>
      <tr>
        <td><strong>{{$t('projects')}}</strong></td>
        <td>
          <span v-for="(project, index) in fullOntology.projects.array" :key="project.id">
            <router-link :to="`/project/${project.id}`">{{project.name}}</router-link>
            <span v-if="index < nbProjects - 1">, </span>
          </span>
          <em class="has-text-grey" v-if="nbProjects === 0">
            {{$t('not-used-in-any-project')}}
          </em>
        </td>
      </tr>
      <tr>
        <td><strong>{{$t('creator')}}</strong></td>
        <td>
          {{creatorFullname || $t('unknown')}}
        </td>
      </tr>
      <tr>
        <td><strong>{{$t('actions')}}</strong></td>
        <td>
          <div class="buttons">
            <button class="button" @click="isRenameModalActive = true">
              {{$t('button-rename')}}
            </button>
            <button class="button is-danger" @click="confirmDeletion()" :disabled="nbProjects > 0"
              :title="nbProjects ? $t('cannot-delete-ontology-with-projects') : ''"
            >
              {{$t('button-delete')}}
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>

  <b-modal :active="isRenameModalActive" has-modal-card @close="isRenameModalActive = false">
    <form @submit.prevent="rename()">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{$t('rename-ontology')}}</p>
        </header>
        <section class="modal-card-body">
          <b-field
            :label="$t('new-name')"
            :type="emptyNewName ? 'is-danger' : null"
            :message="emptyNewName ? $t('field-cannot-be-empty') : ''"
          >
            <b-input v-model="newName" />
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <button class="button" type="button" @click="isRenameModalActive = false">
            {{$t('button-cancel')}}
          </button>
          <button class="button is-link" :disabled="emptyNewName">
            {{$t('button-save')}}
          </button>
        </footer>
      </div>
    </form>
  </b-modal>
</div>
</template>

<script>
import {Ontology, User} from 'cytomine-client';
import OntologyTree from './OntologyTree';
import {fullName} from '@/utils/user-utils.js';

export default {
  name: 'ontology-details',
  props: {
    ontology: Object
  },
  components: {OntologyTree},
  data() {
    return {
      loading: true,
      error: false,

      fullOntology: {},
      creatorFullname: null,

      isRenameModalActive: false,
      newName: ''
    };
  },
  computed: {
    nbProjects() {
      return this.fullOntology.projects.length;
    },
    emptyNewName() {
      return !this.newName;
    }
  },
  watch: {
    ontology() {
      this.fetchOntology();
    },
    isRenameModalActive(val) {
      if(val) {
        this.newName = this.ontology.name;
      }
    },
  },
  methods: {
    async fetchOntology() {
      this.loading = true;
      this.error = false;

      try {
        this.fullOntology = await Ontology.fetch(this.ontology.id);
      }
      catch(error) {
        console.log(error);
        this.error = true;
      }

      try {
        let creator = await User.fetch(this.fullOntology.user);
        this.creatorFullname = fullName(creator);
      }
      catch(error) {
        console.log(error);
      }

      this.loading = false;
    },

    async rename() {
      let oldName = this.ontology.name;
      try {
        this.fullOntology.name = this.newName;
        await this.fullOntology.save();
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-ontology-rename', {name: this.fullOntology.name})
        });
        this.$emit('rename', this.newName);
      }
      catch(error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-ontology-rename', {name: oldName})
        });
      }
      this.isRenameModalActive = false;
    },

    confirmDeletion() {
      this.$dialog.confirm({
        title: this.$t('confirm-deletion'),
        message: this.$t('confirm-deletion-ontology', {name: this.ontology.name}),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => this.$emit('delete')
      });
    }
  },
  created() {
    this.fetchOntology();
  }
};
</script>

<style>
.ontology-details-wrapper .ontology-tree {
  max-width: 500px;
}

.ontology-details-wrapper td:first-child {
  width: 100px;
}
</style>
