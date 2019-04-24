function getDefaultState() {
  return {
    searchString: '',

    filtersOpened: false,
    filters: {
      selectedOntologies: null,
      selectedRoles: null,
      boundsMembers: null,
      boundsImages: null,
      boundsUserAnnotations: null,
      boundsJobAnnotations: null,
      boundsReviewedAnnotations: null
    },

    currentPage: 1,
    perPage: 10,
    sort: {
      field: 'lastActivity',
      order: 'desc'
    },
    openedDetails: []
  };
}

export default {
  namespaced: true,

  state: getDefaultState(),

  mutations: {
    resetState(state) {
      Object.assign(state, getDefaultState());
    },

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
