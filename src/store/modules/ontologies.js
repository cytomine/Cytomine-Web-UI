export default {
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

    setOntologySearchString(state, searchString) {
      state.searchString = searchString;
    }
  }
};
