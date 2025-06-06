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

export default {
  namespaced: true,

  state() {
    return {
      searchString: '',

      filtersOpened: false,
      filters: {
        formats: null,
        vendors: null,
        selectedTags: null,
        magnifications: null,
        resolutions: null,
        boundsWidth: null,
        boundsHeight: null,
        boundsUserAnnotations: null,
        boundsReviewedAnnotations: null
      },

      currentPage: 1,
      perPage: 10,
      sortField: null,
      sortOrder: 'asc',
      openedDetails: []
    };
  },

  mutations: {
    setSearchString(state, searchString) {
      state.searchString = searchString;
    },

    setFiltersOpened(state, value) {
      state.filtersOpened = value;
    },

    setFilter(state, {filterName, propValue}) {
      state.filters[filterName] = propValue;
    },

    setCurrentPage(state, page) {
      state.currentPage = page;
    },

    setPerPage(state, perPage) {
      state.perPage = perPage;
    },

    setSortField(state, field) {
      state.sortField = field;
    },

    setSortOrder(state, order) {
      state.sortOrder = order;
    },

    setOpenedDetails(state, value) {
      state.openedDetails = value;
    }
  },

  getters: {
    nbActiveFilters: state => {
      return Object.values(state.filters).filter(val => val).length; // count the number of not null values
    },

    nbEmptyFilters: state => {
      return Object.values(state.filters).filter(val => val && val.length === 0).length;
    }
  }
};
