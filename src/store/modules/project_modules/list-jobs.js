export default {
  namespaced: true,

  state() {
    return {
      filters: {
        softwares: null,
        launchers: null,
        statuses: null,
        favorites: null,
      },
      executionDate: null,

      currentPage: 1,
      perPage: 10,
      sort: {
        field: 'created',
        order: 'desc'
      },
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

    setSort(state, sort) {
      state.sort = sort;
    },

    setOpenedDetails(state, value) {
      state.openedDetails = value;
    }
  }
};
