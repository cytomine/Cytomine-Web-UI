export default {
  namespaced: true,

  state() {
    return {
      filters: {
        softwares: null,
        launchers: null,
        statuses: null
      },
      executionDate: null,

      currentPage: 1,
      perPage: 10,
      sortField: null,
      sortOrder: 'asc',
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
