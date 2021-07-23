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
  namespaced: true,

  state() {
    return {
      filters: {
        softwares: [],
        launchers: [],
        statuses: []
      },
      executionDate: null,

      currentPage: 1,
      perPage: 10,
      sortField: 'created',
      sortOrder: 'desc',
      openedDetails: []
    };
  },

  mutations: {
    setFilter(state, {filterName, propValue}) {
      state.filters[filterName] = propValue;
    },

    setExecutionDate(state, date) {
      state.executionDate = date;
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
  }
};
