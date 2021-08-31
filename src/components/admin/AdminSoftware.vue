<template>
  <div>
    <b-loading :is-full-page="false" :active="loading" />
    <template v-if="!loading">
      <b-message v-if="!trustedSources" type="is-danger" has-icon icon-size="is-small">
        <h2> {{ $t('error') }} </h2>
        <p> {{ $t('unexpected-error-info-message') }} </p>
      </b-message>
      <template v-else>
        <div class="columns">
          <div class="column is-one-quarter">
            <b-input v-model="searchString" :placeholder="$t('search-placeholder')" type="search" icon="search" />
          </div>

          <div class="column is-one-half has-text-right-desktop">
            <button class="button is-link" @click="startSourceCreation()">
              {{$t('button-new-trusted-source')}}
            </button>
          </div>
        </div>

        <b-table
          :data="filteredTrustedSources"
          :paginated="true"
          :per-page="perPage"
          pagination-size="is-small"
        >

          <template #default="{row: source}">

            <b-table-column field="source" :label="$t('trusted-source')" width="400">
              <software-source :source="source" />
            </b-table-column>

            <b-table-column label="" width="50">
              <div class="buttons">
                <button class="button is-link is-small" @click="startSourceEdition(source)">
                  {{$t('button-edit')}}
                </button>
                <button class="button is-link is-small" @click="refresh(source)">
                  {{$t('button-refresh')}}
                </button>
                <button class="button is-danger is-small" @click="deleteSourceDialog(source)">
                  {{$t('button-delete')}}
                </button>
              </div>
            </b-table-column>
          </template>

          <template #empty>
            <div class="content has-text-grey has-text-centered">
              <p>{{$t('no-trusted-source-fitting-criteria')}}</p>
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

        <trusted-source-modal :active.sync="modal" :source="editedSource" @addSource="addSource" @updateSource="updateSource" />
      </template>
    </template>
  </div>
</template>

<script>
import {TrustedSourceCollection} from 'cytomine-client';
import TrustedSourceModal from './TrustedSourceModal';
import {getWildcardRegexp} from '@/utils/string-utils';
import SoftwareSource from '@/components/software/SoftwareSource';

export default {
  name: 'admin-software',
  components: {
    SoftwareSource,
    TrustedSourceModal,
  },
  data() {
    return {
      loading: true,
      trustedSources: null,
      addSourceModal: false,
      searchString: '',
      perPage: 25,
      modal: false,
      editedSource: null
    };
  },
  computed: {
    regexp() {
      return getWildcardRegexp(this.searchString);
    },
    filteredTrustedSources() {
      if(!this.searchString) {
        return this.trustedSources;
      }

      return this.trustedSources.filter(ts => this.regexp.test(ts.name) ||
        this.regexp.test(ts.username) || this.regexp.test(ts.provider) ||
        this.regexp.test(ts.dockerUsername) || this.regexp.test(ts.environmentProvider));
    }
  },
  methods: {
    formatSource(source) {
      source.environmentProvider = 'docker';
    },
    async refresh(source) {
      try {
        await source.refresh();
        this.$notify({type: 'success', text: this.$t('notif-success-source-refresh')});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-source-refresh')});
      }
    },
    startSourceCreation() {
      this.editedSource = null;
      this.modal = true;
    },
    addSource(source) {
      console.log('addSource', source);
      this.formatSource(source);
      this.trustedSources.push(source);
    },
    startSourceEdition(source) {
      this.editedSource = source;
      this.modal = true;
    },
    updateSource(source) {
      this.formatSource(source);
      this.editedSource.populate(source);
    },
    deleteSourceDialog(source) {
      this.$buefy.dialog.confirm({
        title: this.$t('delete'),
        message: this.$t('delete-source-confirmation-message', {username: source.username, dockerUsername: source.dockerUsername}),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => this.deleteSource(source)
      });
    },
    deleteSource(source) {
      try {
        console.log('source', source);
        source.delete();
        this.trustedSources.splice(this.trustedSources.indexOf(source), 1);
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-source-delete', {username: source.username, dockerUsername: source.dockerUsername})
        });
      }
      catch(error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-source-delete', {username: source.username, dockerUsername: source.dockerUsername})
        });
      }
    },
  },
  async created() {
    try {
      let sources = (await TrustedSourceCollection.fetchAll()).array;
      sources.forEach(source => this.formatSource(source));
      this.trustedSources = sources;
    }
    catch(error) {
      console.log(error);
    }
    this.loading = false;
  }
};
</script>
