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

import router from '@/routes';
import {getModuleNamespace} from '@/store/store';
import imageModule from './viewer_modules/image';

export default {
  namespaced: true,

  state() {
    return {
      links: [],
      imageSelector: false,
      activeImage: 0,
      indexNextImage: 0
    };
  },

  mutations: {
    setImageSelector(state, value) {
      state.imageSelector = value;
    },

    addImage(state) {
      state.imageSelector = false;
      state.activeImage = state.indexNextImage;
      state.indexNextImage++;
    },

    setActiveImage(state, index) {
      state.activeImage = index;
    },

    // ----- View links

    createLinkGroup(state, indexes) {
      state.links.push(indexes);
    },

    linkImageToGroup(state, {indexGroup, indexImage}) {
      state.links[indexGroup].push(indexImage);
    },


    mergeLinkGroups(state, indexes) {
      state.links[indexes[0]].push(...state.links[indexes[1]]);
      state.links.splice(indexes[1], 1);
    },

    unlinkImage(state, {indexGroup, indexImage}) {
      let links = state.links;
      if(!indexGroup) { // if group not specified, find the group of the provided image
        indexGroup = links.findIndex(group => group.includes(indexImage));
        if(indexGroup === -1) {
          return;
        }
      }

      let group = links[indexGroup];
      let indexWithinGroup = group.findIndex(idx => idx === indexImage);
      group.splice(indexWithinGroup, 1);
      if(group.length === 1) { // if group no longer contains several images, delete it
        links.splice(indexGroup, 1);
      }
    }
  },

  actions: {
    changePath({getters}) {
      let idAnnotation = router.currentRoute.params.idAnnotation;
      let action = router.currentRoute.query.action;
      router.replace(getters.pathViewer({idAnnotation, action}));
    },

    async addImage({state, commit, getters, dispatch}, image) {
      let index = state.indexNextImage;
      commit('addImage');
      this.registerModule(getters.pathImageModule(index), imageModule);
      await dispatch(`images/${index}/initialize`, image);
      dispatch('changePath');
    },

    setImageResolution({state, commit}, {idImage, resolution}) {
      for(let index in state.images) {
        let image = state.images[index].imageInstance;
        if(image && image.id === idImage) {
          commit(`images/${index}/setResolution`, resolution);
        }
      }
    },

    addTerm({state, commit}, term) { // add term to all image wrappers (as all images belong to same project)
      for(let index in state.images) {
        commit(`images/${index}/addTerm`, term);
      }
    },

    setCenter({state, getters, commit}, {index, center}) {
      let refImage = state.images[index];
      let increments = refImage.view.center.map((val, i) => center[i] - val);
      let refZoom = refImage.imageInstance.depth - refImage.view.zoom;

      let indexesToUpdate = getters.getLinkedIndexes(index);
      indexesToUpdate.forEach(idx => {
        let image = state.images[idx];
        let diffZoom = image.imageInstance.depth - image.view.zoom - refZoom;
        let zoomFactor = Math.pow(2, diffZoom);
        commit(`images/${idx}/setCenter`, image.view.center.map((val, i) => val + increments[i]*zoomFactor));
      });
    },

    setZoom({state, getters, commit}, {index, zoom}) {
      let zoomIncrement = zoom - state.images[index].view.zoom;
      let indexesToUpdate = getters.getLinkedIndexes(index);
      indexesToUpdate.forEach(idx => {
        commit(`images/${idx}/setZoom`, (state.images[idx].view.zoom + zoomIncrement));
      });
    },

    setRotation({state, getters, commit}, {index, rotation}) {
      let rotationInc = rotation - state.images[index].view.rotation + 2*Math.PI;
      let indexesToUpdate = getters.getLinkedIndexes(index);
      indexesToUpdate.forEach(idx => {
        commit(`images/${idx}/setRotation`, (state.images[idx].view.rotation + rotationInc) % (2*Math.PI));
      });
    },

    async refreshData({state, dispatch}) {
      await Promise.all(Object.keys(state.images).map(async index => {
        await dispatch(`images/${index}/refreshData`);
      }));
      dispatch('changePath');
    },

    removeImage({commit, getters, dispatch}, index) {
      commit('unlinkImage', {indexImage: index});
      this.unregisterModule(getters.pathImageModule(index), imageModule);
      dispatch('changePath');
    },
  },

  getters: {
    pathModule: state => {
      return getModuleNamespace(state);
    },

    pathImageModule: (_, getters) => index => {
      return [...getters.pathModule, 'images', index];
    },

    pathViewer: (state, getters) => ({idAnnotation, action}={}) => {
      // module path = ['projects', idProject, 'viewers', idViewer]
      let idProject = getters.pathModule[1];
      let idViewer = getters.pathModule[3];
      // ---
      let imagesIds = Object.values(state.images).map(img => img.imageInstance ? img.imageInstance.id : 0);
      let annot = idAnnotation ? `/annotation/${idAnnotation}` : '';
      let actionStr = action ? '&action=' + action : '';
      return `/project/${idProject}/image/${imagesIds.join('-')}${annot}?viewer=${idViewer}${actionStr}`;
    },

    getLinkedIndexes: state => index => { // find all indexes linked to provided index (if image is not linked, return only its index)
      return state.links.find(group => group.includes(index)) || [index];
    }
  },

  modules: {
    images: {
      namespaced: true
    }
  }
};
