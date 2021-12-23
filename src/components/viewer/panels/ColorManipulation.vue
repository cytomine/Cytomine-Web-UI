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
    <channel-histograms
      v-if="sampleHistograms"
      :index="index"
      :histograms="sampleHistograms"
      :log-scale="isHistogramScaleLog"
      :revision="revisionBrightnessContrast"
      :gamma="gamma"
      :inverse="inverse"
    />
    <table>
      <!--
      <tr>
        <td>{{ $t('contrast') }}</td>
        <td>
          <cytomine-slider v-model="contrast" :min="0.25" :max="10" :interval="0.25" :integer-only="false"/>
        </td>
      </tr>
      -->
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

import {ImageFilterProjectCollection} from 'cytomine-client';

import CytomineSlider from '@/components/form/CytomineSlider';
import ChannelHistograms from '@/components/viewer/panels/histograms/ChannelHistograms';
import constants from '@/utils/constants';

export default {
  name: 'color-manipulation',
  components: {ChannelHistograms, CytomineSlider},
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
    slices() {
      return this.imageWrapper.activeSlices;
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
    isHistogramScaleLog() {
      return (this.histogramScale === 'log');
    },

    histogramNBins() {
      return (this.image.bitPerSample > 8) ? 2048 : 256;
    }

  },
  watch: {
    slices() {
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
      if (this.image.extrinsicChannels <= constants.MAX_MERGEABLE_CHANNELS) {
        let minmax = this.sampleHistograms.map(sh => {
          return {channel: sh.channel, minimum: sh.minimum, maximum: sh.maximum};
        });
        this.$store.dispatch(this.imageModule + 'adjustToSlice', minmax);
      }
      else {
        let histogram = this.sampleHistograms[0];
        this.$store.dispatch(this.imageModule + 'setAllMinimumAndMaximum', {
          minimum: histogram.minimum,
          maximum: histogram.maximum
        });
      }

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
        if (this.image.extrinsicChannels <= constants.MAX_MERGEABLE_CHANNELS) {
          // As for now we only allow multiple slices with varying C and fixed Z,T, this request is OK.
          this.sampleHistograms = (await this.slices[0].fetchChannelHistograms({nBins: this.histogramNBins}));
        }
        else {
          this.sampleHistograms = (await this.slices[0].fetchHistogram({nBins: this.histogramNBins}));
        }
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
  margin-bottom: 0.4em !important;
}

.limited-wrapper {
  overflow: auto;
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
  margin-right: 1em;
}

.has-border-bottom td {
  padding-bottom: 1em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.has-border-bottom + tr td {
  padding-top: 1em;
}
</style>
