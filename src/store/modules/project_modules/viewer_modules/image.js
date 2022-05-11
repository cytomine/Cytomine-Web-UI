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

import {ImageInstance, AnnotationType, SliceInstanceCollection, SliceInstance, CompanionFileCollection} from 'cytomine-client';

import constants from '@/utils/constants';
import {slicePositionToRank} from '@/utils/slice-utils';

import colors from './image_modules/colors';
import draw from './image_modules/draw';
import layers from './image_modules/layers';
import properties from './image_modules/properties';
import selectedFeatures from './image_modules/selected-features';
import style from './image_modules/style';
import tracking from './image_modules/tracking';
import undoRedo from './image_modules/undo-redo';
import view from './image_modules/view';
import review from './image_modules/review';
import tracks from './image_modules/tracks';
import annotationsList from './image_modules/annotations-list';

import Vue from 'vue';

import {
  isCluster,
  createTextStyle,
  selectStyles,
  verticesStyle,
  reviewedStyles,
  reviewedSelectStyles,
  rejectedStyles,
  rejectedSelectStyles,
  trackedSelectStyles
} from '@/utils/style-utils.js';

export default {
  namespaced: true,

  state() {
    return {
      imageInstance: null,
      profile: null,
      sliceInstances: {},
      loadedSlicePages: [],
      activeSlice: null,
      activePanel: null
    };
  },

  mutations: {
    setImageInstance(state, image) {
      state.imageInstance = image;
    },

    setResolution(state, resolution) {
      state.imageInstance.physicalSizeX = resolution.x;
      state.imageInstance.physicalSizeY = resolution.y;
      state.imageInstance.physicalSizeZ = resolution.z;
      state.imageInstance.fps = resolution.t;
    },

    togglePanel(state, panel) {
      state.activePanel = state.activePanel === panel ? null : panel;
    },

    clearSliceInstances(state) {
      state.sliceInstances = {};
      state.loadedSlicePages = [];
    },

    setSliceInstance(state, slice) {
      Vue.set(state.sliceInstances, slice.rank, slice);
    },

    setLoadedSlicePage(state, page) {
      state.loadedSlicePages.push(page);
    },

    setActiveSlice(state, slice) {
      state.activeSlice = slice;
    },

    setProfile(state, profile) {
      state.profile = profile;
    }
  },

  actions: {
    async initialize({commit, dispatch}, {image, slice}) {
      let clone = image.clone();
      commit('setImageInstance', clone);

      clone = slice.clone();
      commit('setActiveSlice', clone);

      let profile = (await CompanionFileCollection.fetchAll({filterKey: 'abstractimage', filterValue: image.baseImage})).array.find(cf => cf.type === 'HDF5');
      commit('setProfile', profile);

      await dispatch('fetchSliceInstancesAround', {rank: clone.rank});
    },
    async setImageInstance({dispatch, rootState}, {image, slice}) {
      await dispatch('initialize', {image, slice});
      let idProject = rootState.currentProject.project.id;
      let idViewer = rootState.currentProject.currentViewer;
      dispatch(`projects/${idProject}/viewers/${idViewer}/changePath`, null, {root: true});
    },

    async setActiveSlice({commit, dispatch, rootState}, slice) {
      let idProject = rootState.currentProject.project.id;
      let idViewer = rootState.currentProject.currentViewer;
      commit('setActiveSlice', slice);
      dispatch(`projects/${idProject}/viewers/${idViewer}/changePath`, null, {root: true});
      await dispatch('fetchSliceInstancesAround', {rank: slice.rank});
    },
    async setActiveSliceByPosition({state, dispatch}, {channel, zStack, time}) {
      let rank = slicePositionToRank({channel, zStack, time}, state.imageInstance);
      await dispatch('setActiveSliceByRank', rank);
    },
    async setActiveSliceByRank({state, commit, dispatch, rootState}, rank) {
      let slice = state.sliceInstances[rank];
      if (!slice) {
        await dispatch('fetchSliceInstancesAround', {rank, setActive: true});
      }
      else {
        commit('setActiveSlice', slice);
      }

      let idProject = rootState.currentProject.project.id;
      let idViewer = rootState.currentProject.currentViewer;
      dispatch(`projects/${idProject}/viewers/${idViewer}/changePath`, null, {root: true});
    },

    async refreshData({state, commit, dispatch}) {
      let image = await ImageInstance.fetch(state.imageInstance.id);
      commit('setImageInstance', image);

      let slice = await SliceInstance.fetch(state.activeSlice.id);
      commit('setActiveSlice', slice);

      let profile = (await CompanionFileCollection.fetchAll({filterKey: 'abstractimage', filterValue: image.baseImage})).array.find(cf => cf.type === 'HDF5');
      commit('setProfile', profile);

      commit('clearSliceInstances');
      await dispatch('fetchSliceInstancesAround', {rank: slice.rank});
    },

    async fetchSliceInstancesAround({state, commit}, {rank, setActive = false}) {
      let promises = [];
      let props = {filterKey: 'imageinstance', filterValue: state.imageInstance.id, max: constants.PRELOADED_SLICES};

      let page = findRankPage(rank);
      if (!state.loadedSlicePages.includes(page)) {
        promises.push(new SliceInstanceCollection(props).fetchPage(page).then(data => {
          data.array.forEach(slice => {
            commit('setSliceInstance', slice);
            if (setActive && slice.rank === rank) {
              commit('setActiveSlice', slice);
            }
          });
        }).then(() => commit('setLoadedSlicePage', page)));
      }

      let previous = page - 1;
      if (previous >= 0 && !state.loadedSlicePages.includes(previous)) {
        promises.push(new SliceInstanceCollection(props).fetchPage(previous).then(data => {
          data.array.forEach(slice => commit('setSliceInstance', slice));
        }).then(() => commit('setLoadedSlicePage', previous)));
      }

      let next = page + 1;
      if (next < findSliceInstanceNbPage(state.imageInstance) && !state.loadedSlicePages.includes(previous)) {
        promises.push(new SliceInstanceCollection(props).fetchPage(next).then(data => {
          data.array.forEach(slice => commit('setSliceInstance', slice));
        }).then(() => commit('setLoadedSlicePage', next)));
      }

      await Promise.all(promises);
    }
  },

  getters: {
    genStyleFunction: (state, getters) => (feature) => {
      let annot = feature.get('annot');
      if(!annot) {
        return;
      }

      // QUESTION: what to do with clusters (returned count does not take into account the selected terms) ?
      // Possible solutions:
      // 1. in backend, for clusters, send array with composition of cluster (x for term 1, y for term 2, z for term1-2)
      // 2. force source refresh every time the list of terms to display is updated
      // 3. add parameter allowing to provide the terms to take into account in kmeans (but only for kmeans)
      if(isCluster(feature)) {
        return [state.style.defaultStyle, createTextStyle(annot.count.toString())];
      }

      let styles = [];

      let nbTerms = annot.term.length;
      let terms = state.style.terms;

      if(terms && nbTerms === 1) {
        let wrappedTerm = getters.termsMapping[annot.term[0]];
        if(wrappedTerm) {
          if(!wrappedTerm.visible) {
            return; // do not display annot
          }
          if(feature.getGeometry().getType() === 'LineString') {
            styles.push(wrappedTerm.olLineStyle);
          }
          else {
            styles.push(wrappedTerm.olStyle);
          }
        }
        else {
          styles.push(state.style.noTermStyle); // could not find term => display no term style
        }
      }
      else if(terms && nbTerms > 1) {
        let hasTermsToDisplay = terms.some(term => term.visible && annot.term.includes(term.id));
        if(!hasTermsToDisplay) {
          return; // do not display
        }
        styles.push(state.style.multipleTermsStyle);
      }
      else {
        if(!state.style.displayNoTerm) {
          return; // do not display annot
        }
        styles.push(state.style.noTermStyle);
      }

      let nbTracks = annot.track!=undefined ? annot.track.length : 0;
      let isReviewed = annot.type === AnnotationType.REVIEWED;
      let isRejected = state.review.reviewMode && !isReviewed;

      // Styles for selected elements
      if(state.selectedFeatures.selectedFeatures.map(ftr => ftr.id).includes(feature.getId())) {
        styles.push(...(isReviewed ? reviewedSelectStyles : isRejected ? rejectedSelectStyles : (nbTracks > 0) ? trackedSelectStyles : selectStyles));

        // if in modify mode, display vertices
        if(state.draw.activeEditTool === 'modify') {
          styles.push(verticesStyle);
        }
      }
      else if(isReviewed) {
        styles.push(...reviewedStyles);
      }
      else if(isRejected) {
        styles.push(...rejectedStyles);
      }

      let tracks = state.style.wrappedTracks;

      if (tracks && nbTracks === 1) {
        let wrappedTrack = getters.tracksMapping[annot.track[0]];
        if(wrappedTrack) {
          if(feature.getGeometry().getType() === 'LineString') {
            styles.unshift(wrappedTrack.olLineStyle);
          }
          else {
            styles.push(wrappedTrack.olStyle);
          }
        }
      }
      else if (tracks && nbTracks > 1) {
        styles.push(state.style.multipleTracksStyle);
      }

      // Properties
      let propValue = state.properties.selectedPropertyValues[annot.id];
      if (propValue) {
        let color = state.properties.selectedPropertyColor;
        let fontSize = '34px';
        if(state.view.zoom <= 3) {
          fontSize = '12px';
        }
        else if(state.view.zoom <= 6) {
          fontSize = '19px';
        }
        else if(state.view.zoom <= 8) {
          fontSize = '26px';
        }
        styles.push(createTextStyle(propValue, fontSize, color.fill, null));
      }

      return styles;
    },

    maxZoom: state => {
      if(!state.imageInstance) {
        return 0;
      }
      let increment = state.view.digitalZoom ? constants.DIGITAL_ZOOM_INCREMENT : 0;
      return state.imageInstance.zoom + increment;
    },

    maxRank: state => {
      if(!state.imageInstance) {
        return 0;
      }

      return state.imageInstance.depth * state.imageInstance.duration * state.imageInstance.channels;
    }
  },

  modules: {
    colors,
    draw,
    layers,
    properties,
    selectedFeatures,
    style,
    tracking,
    undoRedo,
    view,
    review,
    tracks,
    annotationsList,
  }
};

function findRankPage(rank) {
  return Math.ceil((rank + 1) / constants.PRELOADED_SLICES) - 1;
}

function findSliceInstanceNbPage(image) {
  return Math.ceil(image.depth * image.duration * image.channels / constants.PRELOADED_SLICES);
}

