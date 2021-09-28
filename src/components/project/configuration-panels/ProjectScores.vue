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
<div class="project-scores-wrapper">
  <b-loading :is-full-page="false" :active="loading" />
  <b-message v-if="error" type="is-danger" has-icon icon-size="is-small">
    <h2> {{ $t('error') }} </h2>
    <p> {{ $t('unexpected-error-info-message') }} </p>
  </b-message>
  <template v-else-if="!loading">
    <b-input class="search-field" v-model="searchString" :placeholder="$t('search-placeholder')" type="search" icon="search" />

    <b-table
      :data="filteredScores"
      default-sort="selected"
      default-sort-direction="desc"
      :paginated="true"
      :per-page="perPage"
      pagination-size="is-small"
    >

      <template #default="{row: score}">
        <b-table-column field="name" :label="$t('name')" sortable>
          {{score.name}}
        </b-table-column>

        <b-table-column
          :field="'values'"
          :label="$t('values')"
        >
          {{score.values.map(x => x.value).join(', ')}}
        </b-table-column>

        <b-table-column field="selected" :label="$t('status')" sortable>
          <button :class="['button', score.selected ? 'is-success' : 'is-danger']" @click="toggleScore(score)">
            {{$t(score.selected ? 'enabled' : 'disabled')}}
          </button>
        </b-table-column>

      </template>

      <template #empty>
        <div class="content has-text-grey has-text-centered">
          <p>{{$t('no-score')}}</p>
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
  </template>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import {ScoreCollection, ScoreProject, ScoreProjectCollection} from 'cytomine-client';
import {getWildcardRegexp} from '@/utils/string-utils';

export default {
  name: 'project-scores',
  data() {
    return {
      loading: true,
      error: false,

      searchString: '',
      perPage: 10,

      scores: []
    };
  },
  computed: {
    project: get('currentProject/project'),

    filteredScores() {
      let regexp = getWildcardRegexp(this.searchString);
      return this.scores.filter(score => regexp.test(score.name));
    }
  },
  methods: {
    async toggleScore(score) {
      try {
        if(score.selected) {
          console.log('score',score);
          await score.scoreProject.delete();
          score.selected = false;
        }
        else {
          let scoreProject = await new ScoreProject({
            score: score.id,
            project: this.project.id
          }).save();
          console.log('add scoreProject',scoreProject);
          score.scoreProject = scoreProject;
          score.selected = true;
        }
        this.$store.dispatch('currentProject/fetchScores');
      }
      catch(error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-change-status-score-project', {filterName: score.name})
        });
      }
    }
  },
  async created() {
    try {
      let promiseScores = ScoreCollection.fetchAll();
      let promiseScoresProjects = ScoreProjectCollection.fetchAll({
        filterKey: 'project',
        filterValue: this.project.id
      });

      let scores = (await promiseScores).array;
      let scoresProject = (await promiseScoresProjects).array;

      scores.forEach(score => {
        score.scoreProject = scoresProject.find(fp => fp.score === score.id);
        score.selected = (score.scoreProject !== undefined);
      });

      this.scores = scores;
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
.project-scores-wrapper {
  min-height: 40vh;
}
</style>

<style>
.project-scores-wrapper .search-field {
  max-width: 25em;
}

.project-scores-wrapper .table {
  margin-top: 1.5em;
}

.project-scores-wrapper .table .button {
  padding: 0 3em;
}
</style>
