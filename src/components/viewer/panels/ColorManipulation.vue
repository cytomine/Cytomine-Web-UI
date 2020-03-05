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
    <template v-if="canComputeHistogram">
      <b-message v-if="error" type="is-danger" has-icon icon-size="is-small" size="is-small">
        <p> {{ $t('unexpected-error-info-message') }} </p>
      </b-message>
      <div class="histogram-actions" v-else-if="!loading && !hasHistograms">
        <a  class="button is-small is-fullwidth" @click="computeHistograms()">{{$t('button-compute-histogram')}}</a>
      </div>
      <b-tabs type="is-boxed" class="histogram" v-else-if="loading || hasHistograms">
        <b-loading :is-full-page="false" class="small" :active="loading"  />
        <b-tab-item v-for="sampleHisto in sampleHistograms" :key="`${sampleHisto.id}`">
          <template #header>
            <i class="fa fa-circle color-preview" :style="{color: sampleColor(sampleHisto.sample)}" />
            {{$t('sample-histogram-abbr')}} {{sampleHisto.sample}}
          </template>
          <sample-histogram :index="index" :sampleHistogram="sampleHisto" :histogram-scale="histogramScale" :revision="revisionBrightnessContrast" />
        </b-tab-item>
      </b-tabs>
    </template>
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
            <option v-for="filter in filters" :key="filter.id" :value="filter.prefix">
              {{filter.name}}
            </option>
          </b-select>
        </td>
      </tr>
    </table>


  </div>
  <div class="actions">
    <div class="level">
      <template v-if="maxRank > 1 && hasHistograms">
        <button class="level-item button is-small" @click="adjustToImage()">{{$t('button-adjust-image')}}</button>
        <button class="level-item button is-small" @click="adjustToSlice()">{{$t('button-adjust-slice')}}</button>
      </template>
      <button v-else-if="hasHistograms" class="level-item button is-small" @click="adjustToImage()">{{$t('button-adjust')}}</button>

      <button class="level-item button is-small" @click="reset()">{{$t('button-reset')}}</button>
    </div>
    <a class="is-fullwidth button is-small" @click="switchHistogramScale()" v-if="hasHistograms">{{switchHistogramScaleLabel}}</a>
  </div>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import CytomineSlider from '@/components/form/CytomineSlider';
import {ImageFilterProjectCollection, SampleHistogramCollection} from 'cytomine-client';
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
      loading: false,
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
    hasHistograms() {
      return this.sampleHistograms && this.sampleHistograms.length > 0;
    },
    canComputeHistogram() {
      return this.image.bitPerSample && this.image.samplePerPixel;
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
      return this.$t((this.histogramScale === 'log') ? 'button-switch-histogram-scale-to-linear' : 'button-switch-histogram-scale-to-log');
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
        return {sample: sh.sample, min: sh.min, max: sh.max};
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
    sampleColor(sample) {
      if (this.image.samplePerPixel === 3) {
        switch (sample) {
          case 0:
            return 'red';
          case 1:
            return 'green';
          case 2:
            return 'blue';
        }
      }

      return 'grey';
    },
    async fetchSampleHistograms() {
      try {
        this.sampleHistograms = (await SampleHistogramCollection.fetchAll({filterKey: 'sliceinstance', filterValue: this.slice.id})).array;
      }
      catch(error) {
        console.log(error);
        this.error = true;
      }
    },
    async computeHistograms() {
      this.loading = true;
      try {
        await this.image.extractHistogram();
        await this.$store.dispatch(this.imageModule + 'refreshDefaultMinMax', {image: this.image});
        await this.fetchSampleHistograms();
      }
      catch(error) {
        console.log(error);
        this.error = true;
      }
      this.loading = false;
    }
  },
  async created() {
    try {
      let filters = (await ImageFilterProjectCollection.fetchAll({filterKey: 'project', filterValue: this.project.id})).array;
      filters.forEach(filter => {
        filter.prefix = filter.imagingServer + ((filter.baseUrl[0] !== '/') ? '/' : '') + filter.baseUrl;
      });
      let prefixes = filters.map(filter => filter.prefix);
      if(this.selectedFilter && !prefixes.includes(this.selectedFilter)) {
        this.selectedFilter = null; // if selected filter no longer present in collection, unselect it
      }
      this.filters = filters;

      this.fetchSampleHistograms();
    }
    catch(error) {
      console.log(error);
    }
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
