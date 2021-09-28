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
  <cytomine-modal :active="active" :title="title" @close="$emit('update:active', false)">
    <div class="columns">
      <div class="column is-one-half">

        <table class="table table-striped">
          <thead class="thead-dark">
          <tr>
            <th scope="col">Value</th>
            <th scope="col">Action</th>
          </tr>
          </thead>
          <draggable v-model="scoreValues" tag="tbody"  @end="checkMove">
            <tr v-for="scoreValue in scoreValues" :key="scoreValue.id" style="cursor: grab;">
              <td>{{ scoreValue.value }}</td>
              <td>
                <button class="button is-small is-link" @click="startScoreValueEdition(scoreValue)">
                  {{$t('rename')}}
                </button>
                <button class="button is-small is-danger" @click="deleteScoreValueDialog(scoreValue)">
                  {{$t('button-delete')}}
                </button>
              </td>
            </tr>
          </draggable>
        </table>


<!--        <draggable-->
<!--          :list="scoreValues.array"-->
<!--          class="list-group"-->
<!--          ghost-class="ghost"-->
<!--          :move="checkMove"-->
<!--          @start="dragging = true"-->
<!--          @end="dragging = false"-->
<!--        >-->
<!--          <div-->
<!--            class="list-group-item"-->
<!--            v-for="scoreValue in scoreValues"-->
<!--            :key="scoreValue.id"-->
<!--          >-->
<!--            <span>{{ scoreValue.value }}</span>-->
<!--          </div>-->
<!--        </draggable>-->


<!--        <div class="column" v-for="scoreValue in scoreValues" :key="scoreValue.id">-->
<!--          {{scoreValue.value}}-->
<!--        </div>-->
      </div>
      <div class="column is-one-half">
<!--        <form @submit.prevent="add()">-->

          <b-field :label="$t('value')" :type="{'is-danger': errors.has('value')}" :message="errors.first('value')">
            <b-input v-model="internalScoreValue['value']" name="value" v-validate="'required'" />
          </b-field>
          <button class="button is-link" @click="add()">
            {{$t('button-add')}}
          </button>
<!--          <template #footer>-->
<!--            <button class="button" type="button" @click="$emit('update:active', false)">-->
<!--              {{$t('button-cancel')}}-->
<!--            </button>-->
<!--            <button class="button is-link" :disabled="errors.any()">-->
<!--              {{$t('button-save')}}-->
<!--            </button>-->
<!--          </template>-->

<!--        </form>-->

      </div>
    </div>
    <score-value-edition-modal :active.sync="modalEdition" :scoreValue="editedScoreValue" @updateScoreValue="scoreValueEdited" />
  </cytomine-modal>
</template>

<script>
import {ScoreValue, ScoreValueCollection} from 'cytomine-client';
import CytomineModal from '@/components/utils/CytomineModal';
import ScoreValueEditionModal from '@/components/score/ScoreValueEditionModal';

import draggable from 'vuedraggable';
export default {
  name: 'score-value-modal',
  props: {
    active: Boolean,
    score: Object,
  },
  components: {
    CytomineModal,
    ScoreValueEditionModal,
    draggable
  },
  $_veeValidate: {validator: 'new'},
  data() {
    return {
      internalScoreValue: {},
      editedScoreValue: null,
      displayErrors: false,
      scoreValues: [],
      modalEdition: false
    };
  },
  computed: {
    editionMode() {
      return Boolean(this.score);
    },
    title() {
      return this.$t(this.editionMode ? 'update-score' : 'create-score');
    },
  },
  watch: {
    active(val) {
      if(val) {
        // this.internalScoreValue = new ScoreValue();
        // this.internalScoreValue.score = this.score.id;
        this.displayErrors = false;
        this.refresh();
      }
    }
  },
  methods: {
    startScoreValueEdition: function(scoreValue) {
      this.editedScoreValue = scoreValue;
      this.modalEdition = true;
    },
    deleteScoreValueDialog: function(scoreValue) {
      this.$buefy.dialog.confirm({
        title: this.$t('delete'),
        message: this.$t('delete-score-value-confirmation-message', {scoreValue: scoreValue.value}),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => this.deleteValueScore(scoreValue)
      });
    },
    async deleteValueScore(scoreValue) {
      try {
        await new ScoreValue({score: scoreValue.score, id: scoreValue.id}).delete();
        this.refresh();
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-score-value-delete', {scoreValue: scoreValue.value})
        });
      }
      catch(error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-score-value-delete', {scoreValue: scoreValue.value})
        });
      }
    },
    retrieveMaxIndex() {
      return this.scoreValues.length > 0 ? Math.max.apply(Math, this.scoreValues.map(x => x.index)) : 0;
    },
    async checkMove() {
      await this.score.reorder(this.scoreValues.map(x => x.id));
      this.$emit(this.editionMode ? 'updateScore' : 'addScore', this.internalScoreValue);
      await this.refresh();
    },
    async scoreValueEdited() {
      this.$emit(this.editionMode ? 'updateScore' : 'addScore', this.internalScoreValue);
      await this.refresh();
    },
    async refresh() {
      this.internalScoreValue = new ScoreValue();
      this.internalScoreValue.score = this.score.id;
      this.scoreValues = [];
      let collection = await ScoreValueCollection.fetchAll({filterKey: 'score', filterValue: this.score.id});
      this.scoreValues.push(...collection._data);
    },
    async add() {
      let result = await this.$validator.validateAll();
      if(!result) {
        return;
      }
      try {
        this.internalScoreValue['index'] = this.retrieveMaxIndex() + 1;
        await this.internalScoreValue.save();
        this.$notify({type: 'success', text: this.$t('notif-success-score-creation')});
        this.$emit(this.editionMode ? 'updateScore' : 'addScore', this.internalScoreValue);
        await this.refresh();
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-score-creation')});
      }
    }
  }
};
</script>
