
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
    }
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

    setFilter(state, {propName, propValue}) {
      state.filters[propName] = propValue;
    },
  }
};
