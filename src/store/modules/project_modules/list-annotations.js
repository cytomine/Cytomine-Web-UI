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

import Vue from 'vue';

export default {
  namespaced: true,

  state() {
    return {
      previewSize: null,
      perPage: 25,
      outlineColor: null,

      annotationType: null,
      filters: {
        members: null,
        reviewers: null,
        userJobs: null,
        images: null,
        termsIds: null,
        tags: null
      },
      fromDate: null,
      toDate: null,

      currentPages: {} // mapping of type {idTerm: currentPage}
    };
  },

  mutations: {
    setPreviewSize(state, size) {
      state.previewSize = size;
    },

    setPerPage(state, perPage) {
      state.perPage = perPage;
    },

    setOutlineColor(state, color) {
      state.outlineColor = color;
    },

    setAnnotationType(state, type) {
      state.annotationType = type;
    },

    setFilter(state, {filterName, propValue}) {
      state.filters[filterName] = propValue;
    },

    setFromDate(state, date) {
      state.fromDate = date;
    },

    setToDate(state, date) {
      state.toDate = date;
    },

    resetPagesAndFilters(state) {
      for(let key in state.filters) {
        state.filters[key] = null;
      }
      state.fromDate = null;
      state.toDate = null;
      state.currentPages = {};
    },

    setCurrentPage(state, {term, page}) {
      Vue.set(state.currentPages, term, page);
    }
  }
};
