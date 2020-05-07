/*
* Copyright (c) 2009-2020. Authors: see NOTICE file.
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

import {createGeoJsonFmt} from 'vuelayers/lib/ol-ext/format';
import {annotBelongsToLayer} from '@/utils/annotation-utils';

export default {
  state() {
    return {
      selectionTargetedFeatures: [], // when we select a feature by clicking on a location, we can have multiple feature at this location.
      selectedFeatures: [],
      annotsToSelect: [],
      showComments: null, // set to the identifier of an annotation to automatically open comments modal if this annotation if the first to be selected
      displayAnnotDetails: true,
      positionAnnotDetails: {x: 0, y: 0},
    };
  },

  mutations: {
    setSelectionTargetedFeatures(state, targetedFeatures) {
      state.selectionTargetedFeatures = targetedFeatures;
    },

    setSelectedFeatures(state, selectedFeatures) {
      state.selectedFeatures = selectedFeatures;
    },

    clearSelectedFeatures(state) {
      state.selectedFeatures = [];
      state.annotsToSelect = [];
    },

    selectFeature(state, feature) {
      state.selectedFeatures.push(createGeoJsonFmt().writeFeatureObject(feature));
    },

    changeAnnotSelectedFeature(state, {indexFeature, annot}) {
      state.selectedFeatures[indexFeature].properties.annot = annot;
    },

    removeLayerFromSelectedFeatures(state, {layer, cache=false}) {
      let selectedFeatures = state.selectedFeatures;
      for(let index = selectedFeatures.length - 1; index >= 0; index--) {
        let feature = selectedFeatures[index];
        let annot = feature.properties.annot;
        if(annotBelongsToLayer(annot, layer)) {
          selectedFeatures.splice(index, 1);
          if(cache) {
            state.annotsToSelect.push(annot);
          }
        }
      }

      if(!cache) {
        state.annotsToSelect = state.annotsToSelect.filter(annot => !annotBelongsToLayer(annot, layer));
      }
    },

    removeTermFromSelectedFeatures(state, {idTerm, terms}) { // idTerm: id of the term no longer displayed
      state.selectedFeatures = state.selectedFeatures.filter(feature => {
        let annot = feature.properties.annot;
        if(!annot.term.includes(idTerm)) {
          return true; // feature not affected since it does not have the hidden term
        }
        // if feature associated with hidden term, check if it is associated to other terms still displayed
        return terms.some(term => term.visible && annot.term.includes(term.id));
      });
    },

    removeNoTermFromSelectedFeatures(state) {
      state.selectedFeatures = state.selectedFeatures.filter(feature => {
        let annot = feature.properties.annot;
        return annot.term.length; // keep feature only iff it is associated to at least one term
      });
    },

    setAnnotToSelect(state, annot) {
      state.annotsToSelect = [annot];
    },

    setShowComments(state, annot) {
      state.showComments = annot ? annot.id : null;
    },

    setDisplayAnnotDetails(state, value) {
      state.displayAnnotDetails = value;
    },

    setPositionAnnotDetails(state, value) {
      state.positionAnnotDetails = value;
    },
  },

  actions: {
    selectFeature({commit}, feature) {
      commit('clearSelectedFeatures');
      commit('selectFeature', feature);
    },

    setImageInstance({commit}) {
      commit('clearSelectedFeatures');
    }
  },

  getters: {
    selectedFeature: state => {
      if(state.selectedFeatures.length === 1) {
        return state.selectedFeatures[0];
      }
    }
  }
};
