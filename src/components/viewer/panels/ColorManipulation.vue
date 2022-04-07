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
<div>
  <h1>{{$t('colors')}}</h1>
  <b-message v-if="error" type="is-danger" has-icon icon-size="is-small" size="is-small">
    <p> {{ $t('unexpected-error-info-message') }} </p>
  </b-message>
  <template v-else>
    <table class="table">
      <thead>
        <tr>
          <th class="checkbox-column"><span class="far fa-eye"></span></th>
          <th class="name-column">
            <b-input v-model="searchString" :placeholder="$t('search-placeholder')" size="is-small" expanded />
          </th>
          <th class="bounds-column"></th>
          <th class="checkbox-column"></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="manipulableChannel in filteredManipulableChannels">
          <tr :key="`channel-${image.id}-${manipulableChannel.index}`">
            <td class="checkbox-column">
              <b-checkbox
                size="is-small"
                :value="manipulableChannel.visible"
                @input="setApparentChannelVisibility(manipulableChannel.index, $event)"
                :disabled="nbVisibleManipulableChannels <= 1 && manipulableChannel.visible"
              />
            </td>
            <td class="name-column">
              <cytomine-channel
                :name="manipulableChannel.name"
                :color="manipulableChannel.color"
                :default-color="manipulableChannel.defaultColor"
                :channel-index="manipulableChannel.channel"
                :sample-index="manipulableChannel.sample"
                :nb-samples-per-channel="image.samplePerPixel"
                :editable-color="true"
                @setColor="setApparentChannelColor(manipulableChannel.index, $event)"
              />
            </td>
            <td class="bounds-column">
              ({{manipulableChannel.bounds.min}} - {{manipulableChannel.bounds.max}})
            </td>
            <td class="checkbox-column">

            </td>
          </tr>
        </template>

      </tbody>
    </table>
    <b-field horizontal :label="$t('filter')">
      <b-select v-model="selectedFilter" size="is-small" expanded>
        <option :value="null">{{$t('original-no-filter')}}</option>
        <option v-for="filter in filters" :key="filter.id" :value="filter.method">
          {{filter.name}}
        </option>
      </b-select>
    </b-field>
  </template>

<!--  </div>-->
<!--  <div class="actions">-->
<!--    <div class="level">-->
<!--      <template v-if="maxRank > 1">-->
<!--        <button class="level-item button is-small" @click="adjustToImage()">{{$t('button-adjust-image')}}</button>-->
<!--        <button class="level-item button is-small" @click="adjustToSlice()">{{$t('button-adjust-slice')}}</button>-->
<!--      </template>-->
<!--      <button v-else class="level-item button is-small" @click="adjustToImage()">{{$t('button-adjust')}}</button>-->

<!--      <button class="level-item button is-small" @click="reset()">{{$t('button-reset')}}</button>-->
<!--    </div>-->
<!--    <a class="is-fullwidth button is-small" @click="switchHistogramScale()">{{switchHistogramScaleLabel}}</a>-->
<!--  </div>-->
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import constants from '@/utils/constants';
import {getWildcardRegexp} from '@/utils/string-utils';

import {ImageFilterProjectCollection} from 'cytomine-client';

import CytomineChannel from '@/components/viewer/panels/colors/CytomineChannel';

export default {
  name: 'color-manipulation',
  components: {
    CytomineChannel
  },
  props: {
    index: String
  },
  data() {
    return {
      filters: null,
      histograms: [],
      loading: false,
      error: false,
      searchString: '',

      revisionBrightnessContrast: 0,
    };
  },
  computed: {
    project: get('currentProject/project'),
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
    sliceChannels() {
      return this.$store.getters[this.imageModule + 'channels'];
    },
    plane() {
      return {
        zStack: this.imageWrapper.activeSlices[0].zStack,
        time: this.imageWrapper.activeSlices[0].time
      };
    },
    maxRank() {
      return this.$store.getters[this.imageModule + 'maxRank'];
    },
    activePanel() {
      return this.imageWrapper.activePanel;
    },
    apparentChannels() {
      return this.imageWrapper.colors.apparentChannels;
    },

    manipulableChannels() {
      return this.apparentChannels.map(ac => {
        return {
          ...ac,
          histogram: this.histograms.find(h => h.apparentChannel === ac.index),
          name: this.sliceChannels[ac.channel].name
        };
      });
    },
    nbVisibleManipulableChannels() {
      return this.manipulableChannels.filter(mc => mc.visible).length;
    },
    regexp() {
      return getWildcardRegexp(this.searchString);
    },
    filteredManipulableChannels() {
      if (!this.searchString) {
        return this.manipulableChannels;
      }
      return this.manipulableChannels.filter(mc => this.regexp.test(mc.name));
    },

    selectedFilter: {
      get() {
        return this.imageWrapper.colors.filter;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setFilter', value);
      }
    },
    histogramLogScale: {
      get() {
        return this.imageWrapper.colors.histogramLogScale;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setHistogramLogScale', value);
      }
    },
  },
  watch: {
    plane() {
      this.fetchHistograms();
    }
  },
  methods: {
    setApparentChannelVisibility(indexApparentChannel, visible) {
      this.$store.dispatch(this.imageModule + 'setApparentChannelVisibility',
        {indexApparentChannel, visible}
      );
    },
    setApparentChannelColor(indexApparentChannel, color) {
      this.$store.commit(this.imageModule + 'setApparentChannelColor',
        {indexApparentChannel, color, isColormap: false}
      );
    },
    async fetchHistograms() {
      try {
        if (this.image.apparentChannels <= constants.MAX_MERGEABLE_CHANNELS) {
          // As for now we only allow multiple slices with varying C and fixed Z,T, this request is OK.
          this.histograms = (await this.slices[0].fetchChannelHistograms({nBins: this.histogramNBins}));
        }
        else {
          this.histograms = (await this.slices[0].fetchHistogram({nBins: this.histogramNBins}));
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

      await this.fetchHistograms();
      this.loading = false;
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
.table {
  margin-bottom: 1em !important;
  font-size: 0.9em;
}

.table tbody {
  display: block;
  overflow: auto;
  max-height: 10em;
}

.table thead tr {
  display: block;
}

th, >>> td {
  padding: 0.25em !important;
  vertical-align: middle !important;
}

>>> td .button {
  width: 1.5em;
  height: 1.5em;
  font-size: 0.9em;
  padding: 0;
}

>>> .checkbox-column {
  min-width: 2.2em;
  text-align: center !important;
}

>>> .name-column {
  width: 60%;
}

>>> .bounds-column {
  width: 40%;
}

>>> .checkbox .control-label {
  padding: 0 !important;
}

>>> .checkbox {
  margin: 0 !important;
  position: relative;
  top: 0.25em;
}
</style>
