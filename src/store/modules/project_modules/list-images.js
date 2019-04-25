export default {
  namespaced: true,

  state() {
    return {
      searchString: '',

      filtersOpened: false,
      filters: {
        formats: null,
        vendors: null,
        magnifications: null,
        resolutions: null,
        boundsWidth: null,
        boundsHeight: null,
        boundsUserAnnotations: null,
        boundsJobAnnotations: null,
        boundsReviewedAnnotations: null
      },

      currentPage: 1,
      perPage: 10,
      sort: {
        field: null,
        order: 'asc'
      },
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

    setSort(state, sort) {
      state.sort = sort;
    },

    setOpenedDetails(state, value) {
      state.openedDetails = value;
    }
  }
};
