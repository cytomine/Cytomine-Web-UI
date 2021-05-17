/*
* Copyright (c) 2009-2021. Authors: see NOTICE file.
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

export default {
  state() {
    return {
      brightness: 0,
      contrast: 0,
      hue: 0,
      saturation: 0,

      filter: null
    };
  },

  mutations: {
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
    },

    setFilter(state, filter) {
      state.filter = filter;
    }
  }
};
