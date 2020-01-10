/*
* Copyright (c) 2009-2019. Authors: see NOTICE file.
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

import {ImageInstance} from 'cytomine-client';

export default {
  state() {
    return {
      idImage: 0,
      
      brightness: 0,
      contrast: 0,
      hue: 0,
      saturation: 0,

      defaultMinMax: [],
      minMax: [],
      maxValue: 0,

      histogramScale: 'linear',

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

    setHue(state, value) {
      state.hue = value;
    },

    setSaturation(state, value) {
      state.saturation = value;
    },

    resetColorManipulation(state) {
      state.brightness = 0;
      state.contrast = 0;
      state.hue = 0;
      state.saturation = 0;
      state.minMax = state.defaultMinMax.map(obj => {
        let o = Object.assign({}, obj);
        o.min = 0;
        o.max = state.maxValue;
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
      clone[sample].min = value;
      state.minMax = clone;
    },

    setMaximum(state, {sample, value}) {
      let clone = state.minMax;
      clone[sample].max = value;
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
      let minmax = await image.fetchHistogramStats();
      commit('setDefaultMinMax', minmax);
      commit('setMinMax', deepCopy(minmax));
    },
    async refreshData({dispatch, state}) {
      await dispatch('refreshDefaultMinMax', {image: new ImageInstance({id: state.idImage})});
    },
    automaticColorManipulation({commit, state}) {
      commit('setMinMax', deepCopy(state.defaultMinMax));
    }
  }
};

function deepCopy(arr) {
  return arr.map(obj => Object.assign({}, obj));
}
