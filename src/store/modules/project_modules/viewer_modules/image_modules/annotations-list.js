export default {
  state() {
    return {
      open: false,
      currentPage: 1,
    };
  },

  mutations: {
    setShowAnnotationsList(state, value) {
      state.open = value;
    },
    setCurrentPage(state, value) {
      state.currentPage = value;
    }
  }
};
