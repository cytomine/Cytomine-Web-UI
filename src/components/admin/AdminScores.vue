<template>
  <div>
    <b-loading :is-full-page="false" :active="loading" />
    <template v-if="!loading">
      <b-message v-if="!scores" type="is-danger" has-icon icon-size="is-small">
        <h2> {{ $t('error') }} </h2>
        <p> {{ $t('unexpected-error-info-message') }} </p>
      </b-message>
      <template v-else>
        <div class="columns">
          <div class="column is-one-quarter">
            <b-input v-model="searchString" :placeholder="$t('search-placeholder')" type="search" icon="search" />
          </div>

          <div class="column is-one-half has-text-right-desktop">
            <button class="button is-link" @click="startScoreCreation()">
              {{$t('button-new-score')}}
            </button>
          </div>
        </div>

        <b-table
          :data="filteredScores"
          :paginated="true"
          :per-page="perPage"
          pagination-size="is-small"
        >

          <template #default="{row: score}">
            <b-table-column
              :field="'name'"
              :label="$t('name')"
              sortable
            >
            {{score.name}}
            </b-table-column>

            <b-table-column
              :field="'values'"
              :label="$t('values')"
            >
              {{score.values.map(x => x.value).join(', ')}}
            </b-table-column>

            <b-table-column
              :field="'created'"
              :label="$t('created')"
              sortable
            >
              {{ Number(score.created) | moment('ll') }}
            </b-table-column>

            <b-table-column label=" " centered>
              <div class="buttons">
                <button class="button is-small is-link" @click="startScoreEdition(score)">
                  {{$t('rename')}}
                </button>
                <button class="button is-small is-link" @click="startScoreManagement(score)">
                  {{$t('management')}}
                </button>
                <button class="button is-small is-danger" @click="deleteScoreDialog(score)">
                  {{$t('button-delete')}}
                </button>
              </div>
            </b-table-column>
          </template>

          <template #empty>
            <div class="content has-text-grey has-text-centered">
              <p>{{$t('no-score-fitting-criteria')}}</p>
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

        <score-modal :active.sync="modal" :score="editedScore" @addScore="addScore" @updateScore="updateScore" />
        <score-value-modal :active.sync="modalManagement" :score="managedScore" @updateScore="refresh"/>
      </template>
    </template>
  </div>
</template>

<script>
import {ScoreCollection} from 'cytomine-client';
import {getWildcardRegexp} from '@/utils/string-utils';
import ScoreModal from '@/components/score/ScoreModal';
import ScoreValueModal from '@/components/score/ScoreValueModal';

export default {
  name: 'admin-scores',
  components: {
    ScoreModal,
    ScoreValueModal
  },
  data() {
    return {
      loading: true,
      scores: null,
      addScoreModal: false,
      searchString: '',
      perPage: 25,
      modal: false,
      modalManagement: false,
      editedScore: null,
      managedScore: null
    };
  },
  computed: {
    regexp() {
      return getWildcardRegexp(this.searchString);
    },
    filteredScores() {
      if(!this.searchString) {
        return this.scores;
      }
      console.log('this.scores', this.scores);
      return this.scores.filter(ts => this.regexp.test(ts.name));
    }
  },
  methods: {
    startScoreCreation() {
      this.editedScore = null;
      this.modal = true;
    },
    addScore(score) {
      this.scores.push(score);
    },
    startScoreEdition(score) {
      this.editedScore = score;
      this.modal = true;
    },
    startScoreManagement(score) {
      this.managedScore = score;
      this.modalManagement = true;
    },
    updateScore(score) {
      this.editedScore.populate(score);
    },
    async refresh() {
      this.scores = (await ScoreCollection.fetchAll()).array;
    },
    deleteScoreDialog(score) {
      this.$buefy.dialog.confirm({
        title: this.$t('delete'),
        message: this.$t('delete-score-confirmation-message', {scoreName: score.name}),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => this.deleteScore(score)
      });
    },
    async deleteScore(score) {
      try {
        console.log('deleteScore1');
        await score.delete();
        console.log('deleteScore2');
        this.scores.splice(this.scores.indexOf(score), 1);
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-score-delete', {scoreName: score.name})
        });
      }
      catch(error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-score-delete', {scoreName: score.name})
        });
      }
    },
  },
  async created() {
    try {
      this.scores = (await ScoreCollection.fetchAll()).array;
    }
    catch(error) {
      console.log(error);
    }
    this.loading = false;
  }
};
</script>
