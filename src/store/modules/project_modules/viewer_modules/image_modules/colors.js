/*
* Copyright (c) 2009-2022. Authors: see NOTICE file.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


import constants from '@/utils/constants';

export default {
  state() {
    return {
      idImage: 0,

      contrast: 1,
      gamma: 1,
      inverse: false,

      brightness: 0,
      hue: 0,
      saturation: 0,

      defaultMinMax: [],
      minMax: [],
      maxValue: 0,

      histogramScale: 'log',

      filter: null
    };
  },

  mutations: {
    setIdImage(state, id) {
      state.idImage = id;
    },

    setBrightness(state, value) {
      state.brightness = value;
    },

    setContrast(state, value) {
      state.contrast = value;
    },

    setGamma(state, value) {
      state.gamma = value;
    },

    setInverse(state, value) {
      state.inverse = value;
    },

    setHue(state, value) {
      state.hue = value;
    },

    setSaturation(state, value) {
      state.saturation = value;
    },

    resetImageColorManipulation(state) {
      state.brightness = 0;
      state.contrast = 1;
      state.gamma = 1;
      state.inverse = false;
      state.hue = 0;
      state.saturation = 0;
    },

    resetSampleColorManipulation(state) {
      state.minMax = state.defaultMinMax.map(obj => {
        let o = Object.assign({}, obj);
        o.minimum = 0;
        o.maximum = state.maxValue;
        return o;
      });
    },

    setFilter(state, filter) {
      state.filter = filter;
    },

    setDefaultMinMax(state, minMax) {
      state.defaultMinMax = minMax;
    },

    setMinMax(state, minMax) {
      state.minMax = minMax;
    },

    setMinimum(state, {sample, value}) {
      let clone = state.minMax;
      clone[sample].minimum = value;
      state.minMax = clone;
    },

    setMaximum(state, {sample, value}) {
      let clone = state.minMax;
      clone[sample].maximum = value;
      state.minMax = clone;
    },

    setHistogramScale(state, scale) {
      state.histogramScale = scale;
    },

    setMaxValueFromBps(state, bitPerSample) {
      state.maxValue = Math.pow(2, bitPerSample) - 1;
    }
  },

  actions: {
    async initialize({commit, dispatch}, {image}) {
      commit('setIdImage', image.id);
      commit('setMaxValueFromBps', image.bitPerSample);
      await dispatch('refreshDefaultMinMax', {image});
    },
    async setImageInstance({commit, dispatch}, {image}) {
      commit('setIdImage', image.id);
      commit('setMaxValueFromBps', image.bitPerSample);
      await dispatch('refreshDefaultMinMax', {image});
    },
    async refreshDefaultMinMax({commit}, {image}) {
      let minmax = await image.fetchChannelHistogramBounds();

      // --- Hack ---
      if (image.extrinsicChannels > constants.MAX_MERGEABLE_CHANNELS) {
        let imageMinmax = await image.fetchHistogramBounds();
        minmax = minmax.map(histogram => {
          return {...histogram, minimum: imageMinmax.minimum, maximum: imageMinmax.maximum};
        });
      }
      // ---

      commit('setDefaultMinMax', minmax);
      if (image.bitPerSample > 8) {
        commit('setMinMax', deepCopy(minmax));
      }
      else {
        commit('resetSampleColorManipulation');
      }
    },

    resetColorManipulation({commit}) {
      commit('resetImageColorManipulation');
      commit('resetSampleColorManipulation');
    },

    adjustToImage({commit, state}) {
      commit('resetImageColorManipulation');
      commit('setMinMax', deepCopy(state.defaultMinMax));
    },
    adjustToSlice({commit}, minMax) {
      commit('resetImageColorManipulation');
      commit('setMinMax', deepCopy(minMax));
    },

    setAllMinimumAndMaximum({commit, state}, {minimum, maximum}) {
      let minmax = state.minMax.map(mm => {
        return {...mm, minimum, maximum};
      });
      commit('setMinMax', deepCopy(minmax));
    }

  }
};

function deepCopy(arr) {
  return arr.map(obj => Object.assign({}, obj));
}
