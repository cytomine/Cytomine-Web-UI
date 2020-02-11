
import Vue from 'vue';

export default {
  state() {
    return {
      open: false,
      currentPages: {} // mapping of type {idProp: currentPage}
    };
  },

  mutations: {
    setShowAnnotationsList(state, value) {
      state.open = value;
    },
    setCurrentPage(state, {prop, page}) {
      Vue.set(state.currentPages, prop, page);
    }
  }
};
