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
<div class="scores-panel">
  <h1>{{$t('scores')}}</h1>
  <b-field horizontal :label="score.name" v-for="score in scores" :key="score.id">
    <b-select size="is-small" v-model="selectedScoreValue[score.id]" @input="event => changeValue(event, score)">
      <option :value="null">
        {{$t('no-key-selected')}}
      </option>
      <option v-for="scoreValue in score.values" :value="scoreValue.id" :key="scoreValue.id">
        {{ scoreValue.value }}
      </option>
    </b-select>
  </b-field>
  <div>
    <td colspan="2" class="buttons-wrapper">
      <div class="buttons navigation has-addons">
        <button class="button is-small" @click="previousImage()" :disabled="isFirstImage">
          <i class="fas fa-angle-left fa-lg"></i> {{$t('button-previous-image')}}
        </button>
        <button class="button is-small" @click="nextImage()" :disabled="isLastImage">
          {{$t('button-next-image')}} <i class="fas fa-angle-right fa-lg"></i>
        </button>
      </div>
    </td>
  </div>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import {ImageScoreCollection, ImageScore} from 'cytomine-client';

export default {
  name: 'scores-panel',
  props: {
    index: String
  },
  data() {
    return {
      selectedScoreValue: {},
      isFirstImage: false,
      isLastImage: false
    };
  },
  computed: {
    scores: get('currentProject/scores'),
    viewerModule() {
      return this.$store.getters['currentProject/currentViewerModule'];
    },
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    image() {
      return this.viewerWrapper.images[this.index].imageInstance;
    },
    viewerWrapper() {
      return this.$store.getters['currentProject/currentViewer'];
    },
  },
  methods: {
    async changeValue(event, score) {
      if (event!=null) {
        await new ImageScore({imageInstance: this.image.id, score: score.id, scoreValue: event}).save();
      }
      else {
        await new ImageScore({imageInstance: this.image.id, score: score.id, id: 0}).delete(); // hack: cannot delete if id is null
      }
      await this.loadImageScore();
    },
    async loadImageScore() {
      let imageScores = await new ImageScoreCollection({imageInstance: this.image.id}).fetchAll();
      console.log('imageScores', imageScores);
      this.selectedScoreValue = {};
      imageScores.forEach(imageScore => {
        this.selectedScoreValue[imageScore.score] = imageScore.scoreValue;
      });
    },
    async previousImage() {
      try {
        let prev = await this.image.fetchPrevious();
        if(!prev.id) {
          this.$notify({type: 'error', text: this.$t('notif-error-first-image')});
          this.isFirstImage = true;
        }
        else {
          let slice = await prev.fetchReferenceSlice();
          await this.$store.dispatch(this.imageModule + 'setImageInstance', {image: prev, slice});
        }
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-fetch-previous-image')});
      }
    },
    async nextImage() {
      try {
        let next = await this.image.fetchNext();
        if(!next.id) {
          this.$notify({type: 'error', text: this.$t('notif-error-last-image')});
          this.isLastImage = true;
        }
        else {
          let slice = await next.fetchReferenceSlice();
          await this.$store.dispatch(this.imageModule + 'setImageInstance', {image: next, slice});
        }
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-fetch-next-image')});
      }
    }
  },
  async created() {
    await this.loadImageScore();
  }
};
</script>

<style>
.scores-panel select {
  width: 15em;
}


.buttons-wrapper {
  padding-left: 0;
  padding-right: 0;
}

.buttons {
  justify-content: center;
}

.buttons.navigation {
  margin-top: 0.7em;
  margin-bottom: 0;
  border-width: 0;
}

.fa-angle-left {
  margin-right: 0.4em;
}

.fa-angle-right {
  margin-left: 0.4em;
}
</style>
