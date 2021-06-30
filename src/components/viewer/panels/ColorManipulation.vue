<!-- Copyright (c) 2009-2019. Authors: see NOTICE file.

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
<div>
  <h1>{{$t('colors')}}</h1>
  <div class="color-manipulation-wrapper" :class="{'limited-wrapper': nbImages > 2}">
    <b-tabs type="is-boxed" class="histogram">
      <b-tab-item v-for="(sampleHisto, idx) in sampleHistograms" :key="`${image.id}-histogram-${idx}`">
        <template #header>
          <i class="fa fa-circle color-preview" :style="{color: sampleHisto.color}" />
          {{$t('sample-histogram-abbr')}} {{sampleHisto.index}}
        </template>
        <sample-histogram
            :index="index"
            :sampleHistogram="sampleHisto"
            :histogram-scale="histogramScale"
            :revision="revisionBrightnessContrast"
            :gamma="gamma"
            :inverse="inverse"
        />
      </b-tab-item>
    </b-tabs>
    <table>
      <!--    <tr>
            <td>{{ $t('contrast') }}</td>
            <td>
              <cytomine-slider v-model="contrast" :min="0.25" :max="10" :interval="0.25" :integer-only="false"/>
            </td>
          </tr>-->
      <tr>
        <td>{{ $t('gamma') }}</td>
        <td>
          <cytomine-slider v-model="gamma" :min="0.1" :max="4" :interval="0.1" :integer-only="false"/>
        </td>
      </tr>
      <tr class="has-border-bottom">
        <td>{{$t('inverse')}}</td>
        <td>
          <b-switch v-model="inverse" class="switch">
            <template v-if="inverse">{{$t('yes')}}</template>
            <template v-else>{{$t('no')}}</template>
          </b-switch>
        </td>
      </tr>
      <tr v-if="filters && filters.length > 0" class="has-border-bottom">
        <td>{{ $t('filter') }}</td>
        <td>
          <b-select v-model="selectedFilter" size="is-small">
            <option :value="null">{{$t('original-no-filter')}}</option>
            <option v-for="filter in filters" :key="filter.id" :value="filter.method">
              {{filter.name}}
            </option>
          </b-select>
        </td>
      </tr>
    </table>


  </div>
  <div class="actions">
    <div class="level">
      <template v-if="maxRank > 1">
        <button class="level-item button is-small" @click="adjustToImage()">{{$t('button-adjust-image')}}</button>
        <button class="level-item button is-small" @click="adjustToSlice()">{{$t('button-adjust-slice')}}</button>
      </template>
      <button v-else class="level-item button is-small" @click="adjustToImage()">{{$t('button-adjust')}}</button>

      <button class="level-item button is-small" @click="reset()">{{$t('button-reset')}}</button>
    </div>
    <a class="is-fullwidth button is-small" @click="switchHistogramScale()">{{switchHistogramScaleLabel}}</a>
  </div>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import CytomineSlider from '@/components/form/CytomineSlider';
import {ImageFilterProjectCollection} from 'cytomine-client';
import SampleHistogram from '@/components/viewer/panels/SampleHistogram';

export default {
  name: 'color-manipulation',
  components: {SampleHistogram, CytomineSlider},
  props: {
    index: String
  },
  data() {
    return {
      filters: null,
      sampleHistograms: null,
      loadingHistograms: false,
      error: false,
      revisionBrightnessContrast: 0,
    };
  },
  computed: {
    project: get('currentProject/project'),
    viewerWrapper() {
      return this.$store.getters['currentProject/currentViewer'];
    },
    nbImages() {
      return Object.keys(this.viewerWrapper.images).length;
    },
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    imageWrapper() {
      return this.$store.getters['currentProject/currentViewer'].images[this.index];
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
    slice() {
      return this.imageWrapper.activeSlice;
    },
    maxRank() {
      return this.$store.getters[this.imageModule + 'maxRank'];
    },
    activePanel() {
      return this.imageWrapper.activePanel;
    },
    maxValue() {
      return Math.pow(2, this.image.bitPerSample);
    },

    selectedFilter: {
      get() {
        return this.imageWrapper.colors.filter;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setFilter', value);
      }
    },

    contrast: {
      get() {
        return this.imageWrapper.colors.contrast;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setContrast', value);
      }
    },
    gamma: {
      get() {
        return this.imageWrapper.colors.gamma;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setGamma', value);
      }
    },
    inverse: {
      get() {
        return this.imageWrapper.colors.inverse;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setInverse', value);
      }
    },

    histogramScale: {
      get() {
        return this.imageWrapper.colors.histogramScale;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setHistogramScale', value);
      }
    },
    switchHistogramScaleLabel() {
      if (this.histogramScale === 'log') {
        return this.$t('button-switch-histogram-scale-to-linear');
      }
      else {
        return this.$t('button-switch-histogram-scale-to-log');
      }
    },
    histogramNBins() {
      return (this.image.bitPerSample > 8) ? 2048 : 256;
    }

  },
  watch: {
    slice() {
      this.fetchSampleHistograms();
    }
  },
  methods: {
    reset() {
      this.$store.dispatch(this.imageModule + 'resetColorManipulation');
      this.revisionBrightnessContrast++;
    },
    adjustToImage() {
      this.$store.dispatch(this.imageModule + 'adjustToImage');
      this.revisionBrightnessContrast++;
    },
    adjustToSlice() {
      let minmax = this.sampleHistograms.map(sh => {
        return {channel: sh.channel, minimum: sh.minimum, maximum: sh.maximum};
      });
      this.$store.dispatch(this.imageModule + 'adjustToSlice', minmax);
      this.revisionBrightnessContrast++;
    },
    switchHistogramScale() {
      if (this.histogramScale === 'linear') {
        this.histogramScale = 'log';
      }
      else {
        this.histogramScale = 'linear';
      }
    },


    async fetchSampleHistograms() {
      try {
        console.log(this.histogramNBins);
        this.sampleHistograms = (await this.slice.fetchChannelHistograms({nBins: this.histogramNBins}));
      }
      catch(error) {
        console.log(error);
        this.error = true;
      }
    },
  },
  async created() {
    try {
      let filters = (await ImageFilterProjectCollection.fetchAll({
        filterKey: 'project',
        filterValue: this.project.id
      })).array.filter(filter => filter.available);
      let methods = filters.map(filter => filter.method);
      if(this.selectedFilter && !methods.includes(this.selectedFilter)) {
        this.selectedFilter = null; // if selected filter no longer present in collection, unselect it
      }
      this.filters = filters;

      await this.fetchSampleHistograms();
      this.loadingHistograms = false;
    }
    catch(error) {
      console.log(error);
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  }
};
</script>

<style scoped>
.color-manipulation-wrapper {

  overflow: auto;
  margin-bottom: 0.4em !important;
}

.limited-wrapper {
  max-height: 13em;
}

td, tr {
  vertical-align: middle !important;
}

td:first-child {
  font-weight: 600;
  text-align: right;
  padding: 0.35em 0.5em;
}

td:last-child {
  width: 100%;
}

.actions .button, .histogram-actions .button {
  margin: 3px;
  box-sizing: border-box;
}

.actions .level {
  margin-bottom: 0;
}

a.is-fullwidth {
  width: auto;
}

>>> .vue-slider {
  margin-left: 0.4em;
  margin-right: 4em;
}

.has-border-bottom td, .histogram-actions {
  padding-bottom: 1em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.histogram-actions {
  margin-bottom: 1em;
}

.has-border-bottom + tr td {
  padding-top: 1em;
}

.color-preview {
  margin-right: 0.25em;
}

>>> .tab-content {
  background-color: white;
  border: 1px solid #DBDBDB;
  border-top: none;
  border-radius: 0 0 4px 4px;
  min-height: 5em;
}

>>> .b-tabs:not(:last-child) {
  margin-bottom: 1em;
}

.histogram {
  min-height: 3em;
}
</style>
