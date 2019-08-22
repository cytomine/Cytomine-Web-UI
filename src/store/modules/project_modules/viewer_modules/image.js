import {ImageInstance, AnnotationType, SliceInstanceCollection} from 'cytomine-client';

import constants from '@/utils/constants';

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
      sliceInstances: {},
      referenceSlice: null,
      activeSlice: null,
      activePanel: null
    };
  },

  mutations: {
    setImageInstance(state, image) {
      state.imageInstance = image;
    },

    setResolution(state, resolution) {
      state.imageInstance.physicalSizeX = resolution;
      state.imageInstance.physicalSizeY = resolution;
    },

    togglePanel(state, panel) {
      state.activePanel = state.activePanel === panel ? null : panel;
    },

    setSliceInstances(state, slices) {
      Object.keys(state.sliceInstances).forEach(rank => {
        Vue.delete(state.sliceInstances, rank);
      });

      slices.forEach(slice => {
        Vue.set(state.sliceInstances, slice.rank, slice);
      });
    },

    setReferenceSlice(state, slice) {
      state.referenceSlice = slice;
    },

    setActiveSlice(state, slice) {
      state.activeSlice = slice;
    },
  },

  actions: {
    async initialize({commit, dispatch}, image) {
      let clone = image.clone();
      commit('setImageInstance', clone);

      let promises = [
        dispatch('fetchReferenceSlice', true),
        dispatch('fetchSliceInstances'),
      ];
      await Promise.all(promises);
    },

    async setImageInstance({dispatch, rootState}, image) {
      await dispatch('initialize', image);
      let idProject = rootState.currentProject.project.id;
      let idViewer = rootState.currentProject.currentViewer;
      dispatch(`projects/${idProject}/viewers/${idViewer}/changePath`, null, {root: true});
    },

    async refreshData({state, commit, dispatch}) {
      let image = await ImageInstance.fetch(state.imageInstance.id);
      commit('setImageInstance', image);

      let promises = [
        dispatch('fetchSliceInstances'),
        dispatch('fetchReferenceSlice')
      ];

      await Promise.all(promises);
    },

    async fetchSliceInstances({state, commit}) {
      let slices = (await new SliceInstanceCollection({filterKey: 'imageinstance', filterValue: state.imageInstance.id}).fetchAll()).array;
      commit('setSliceInstances', slices);
    },

    async fetchReferenceSlice({state, commit}, setAsActive = false) {
      let activeSlice = (await state.imageInstance.fetchReferenceSlice());
      commit('setReferenceSlice', activeSlice);
      if(setAsActive) {
        commit('setActiveSlice', state.referenceSlice);
      }
    },

    setActiveSliceByRank({state, commit}, dimensions) {
      commit('setActiveSlice', state.sliceInstances[dimensions.channel + state.imageInstance.channels * (dimensions.zStack + state.imageInstance.depth * dimensions.time)]);
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

      let nbTracks = annot.track.length;
      let tracks = state.style.wrappedTracks;

      if (tracks && nbTracks === 1) {
        let wrappedTrack = getters.tracksMapping[annot.track[0]];
        if(wrappedTrack) {
          if(feature.getGeometry().getType() === 'LineString') {
            styles.push(wrappedTrack.olLineStyle);
          }
          else {
            styles.push(wrappedTrack.olStyle);
          }
        }
      }
      else if (tracks && nbTracks > 1) {
        styles.push(state.style.multipleTracksStyle);
      }

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
  }
};

