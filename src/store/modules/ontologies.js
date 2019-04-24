export default {
  namespaced: true,

  state() {
    return {
      selectedOntology: null,
      searchString: ''
    };
  },

  mutations: {
    setSelectedOntology(state, idOntology) {
      state.selectedOntology = idOntology;
    },

    setSearchString(state, searchString) {
      state.searchString = searchString;
    }
  }
};
