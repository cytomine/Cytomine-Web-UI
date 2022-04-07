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
  <div></div>
  <!--  <div class="color-manipulation-wrapper" :class="{'limited-wrapper': nbImages > 2}">-->
  <!--    <channel-histograms-->
  <!--      v-if="sampleHistograms"-->
  <!--      :index="index"-->
  <!--      :histograms="sampleHistograms"-->
  <!--      :log-scale="isHistogramScaleLog"-->
  <!--      :revision="revisionBrightnessContrast"-->
  <!--      :gamma="gamma"-->
  <!--      :inverse="inverse"-->
  <!--    />-->
  <!--    <table>-->
  <!--      &lt;!&ndash;-->
  <!--      <tr>-->
  <!--        <td>{{ $t('contrast') }}</td>-->
  <!--        <td>-->
  <!--          <cytomine-slider v-model="contrast" :min="0.25" :max="10" :interval="0.25" :integer-only="false"/>-->
  <!--        </td>-->
  <!--      </tr>-->
  <!--      &ndash;&gt;-->
  <!--      <tr>-->
  <!--        <td>{{ $t('gamma') }}</td>-->
  <!--        <td>-->
  <!--          <cytomine-slider v-model="gamma" :min="0.1" :max="4" :interval="0.1" :integer-only="false"/>-->
  <!--        </td>-->
  <!--      </tr>-->
  <!--      <tr class="has-border-bottom">-->
  <!--        <td>{{$t('inverse')}}</td>-->
  <!--        <td>-->
  <!--          <b-switch v-model="inverse" class="switch">-->
  <!--            <template v-if="inverse">{{$t('yes')}}</template>-->
  <!--            <template v-else>{{$t('no')}}</template>-->
  <!--          </b-switch>-->
  <!--        </td>-->
  <!--      </tr>-->
</template>

<script>

export default {
  name: 'AdjustableLookUpTable',
  components: {},
  props: {
    index: String,

  },
  computed: {
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    imageWrapper() {
      return this.$store.getters['currentProject/currentViewer'].images[this.index];
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
    // histogramNBins() {
    //   return (this.image.bitPerSample > 8) ? 2048 : 256;
    // }

  },
  methods: {
    // reset() {
    //   this.$store.dispatch(this.imageModule + 'resetColorManipulation');
    //   this.revisionBrightnessContrast++;
    // },
    // adjustToImage() {
    //   this.$store.dispatch(this.imageModule + 'adjustToImage');
    //   this.revisionBrightnessContrast++;
    // },
    // adjustToSlice() {
    //   if (this.image.apparentChannels <= constants.MAX_MERGEABLE_CHANNELS) {
    //     let minmax = this.histograms.map(sh => {
    //       return {channel: sh.channel, minimum: sh.minimum, maximum: sh.maximum};
    //     });
    //     this.$store.dispatch(this.imageModule + 'adjustToSlice', minmax);
    //   }
    //   else {
    //     let histogram = this.histograms[0];
    //     this.$store.dispatch(this.imageModule + 'setAllMinimumAndMaximum', {
    //       minimum: histogram.minimum,
    //       maximum: histogram.maximum
    //     });
    //   }
    //
    //   this.revisionBrightnessContrast++;
    // },
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

/*td, tr {
  vertical-align: middle !important;
}

td:first-child {
  font-weight: 600;
  text-align: right;
  padding: 0.35em 0.5em;
}

td:last-child {
  width: 100%;
}*/

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
