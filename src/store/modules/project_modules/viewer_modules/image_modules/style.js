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

import {createColorStyle, createLineStyle, changeOpacity} from '@/utils/style-utils.js';

let initialTermsOpacity = 1;
let initialLayersOpacity = 0.5;

export default {
  state() {
    return {
      terms: null,

      displayNoTerm: true,
      noTermOpacity: initialTermsOpacity,
      noTermStyle: createColorStyle('#fff', initialLayersOpacity*initialTermsOpacity),

      defaultStyle: createColorStyle('#fff', initialLayersOpacity),
      multipleTermsStyle: createColorStyle('#fff', initialLayersOpacity),

      layersOpacity: initialLayersOpacity
    };
  },

  mutations: {
    addTerm(state, term) {
      state.terms.push(formatTerm(term, state.layersOpacity));
    },

    setTerms(state, terms) {
      state.terms = terms;
    },

    toggleTermVisibility(state, indexTerm) {
      let term = state.terms[indexTerm];
      term.visible = !term.visible;
    },

    setDisplayNoTerm(state, value) {
      state.displayNoTerm = value;
    },

    setTermOpacity(state, {indexTerm, opacity}) {
      let term = state.terms[indexTerm];
      term.opacity = opacity;
      changeOpacity(term.olStyle, state.layersOpacity*opacity);
      changeOpacity(term.olLineStyle, state.layersOpacity*opacity);
    },

    setNoTermOpacity(state, opacity) {
      state.noTermOpacity = opacity;
      changeOpacity(state.noTermStyle, state.layersOpacity*opacity);
    },

    resetTermOpacities(state) {
      state.terms.forEach(term => {
        term.opacity = initialTermsOpacity;
        changeOpacity(term.olStyle, state.layersOpacity*initialTermsOpacity);
        changeOpacity(term.olLineStyle, state.layersOpacity*initialTermsOpacity);
      });
      state.noTermOpacity = initialTermsOpacity;
      changeOpacity(state.noTermStyle, state.layersOpacity*state.noTermOpacity);
    },

    setLayersOpacity(state, opacity) {
      state.layersOpacity = opacity;
      if(state.terms) {
        state.terms.forEach(term => {
          changeOpacity(term.olStyle, opacity*term.opacity);
          changeOpacity(term.olLineStyle, opacity*term.opacity);
        });
      }
      changeOpacity(state.noTermStyle, opacity*state.noTermOpacity);
      changeOpacity(state.multipleTermsStyle, opacity);
      changeOpacity(state.defaultStyle, opacity);
    },
  },

  actions: {
    initialize({commit, rootGetters}) {
      let terms = formatTerms(rootGetters['currentProject/terms'], initialLayersOpacity);
      commit('setTerms', terms);
    },

    toggleTermVisibility({state, commit}, indexTerm) {
      commit('toggleTermVisibility', indexTerm);
      let toggledTerm = state.terms[indexTerm];
      if(!toggledTerm.visible) {
        commit('removeTermFromSelectedFeatures', {idTerm: toggledTerm.id, terms: state.terms});
      }
    },

    setDisplayNoTerm({commit}, value) {
      commit('setDisplayNoTerm', value);
      if(!value) {
        commit('removeNoTermFromSelectedFeatures');
      }
    },

    async refreshData({state, commit, rootGetters}) {
      let terms = formatTerms(rootGetters['currentProject/terms'], state.layersOpacity, state.terms);
      commit('setTerms', terms);
    }
  },

  getters: {
    termsMapping: state => {
      return state.terms.reduce((mapping, term) => {
        mapping[term.id] = term;
        return mapping;
      }, {});
    }
  }
};


function formatTerms(terms, layersOpacity, previousTerms=[]) {
  if(!terms) {
    return;
  }

  let result = [];
  let nbTerms = terms.length;
  for(let i = 0; i < nbTerms; i++) {
    let term = terms[i];
    let prevTerm = previousTerms.find(prevTerm => prevTerm.id === term.id);
    result.push(prevTerm ? prevTerm : formatTerm(term, layersOpacity));
  }
  return result;
}

function formatTerm(term, layersOpacity) {
  let result = {id: term.id};
  result.opacity = initialTermsOpacity;
  result.olStyle = createColorStyle(term.color, initialTermsOpacity*layersOpacity);
  result.olLineStyle = createLineStyle(term.color, initialTermsOpacity*layersOpacity);
  result.visible = true;
  return result;
}
