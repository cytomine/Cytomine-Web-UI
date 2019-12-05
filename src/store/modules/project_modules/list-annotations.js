import Vue from 'vue';

export default {
  namespaced: true,

  state() {
    return {
      previewSize: null,
      categorization: null,
      perPage: 25,
      outlineColor: null,

      annotationType: null,
      filters: {
        members: null,
        reviewers: null,
        userJobs: null,
        images: null,
        termsIds: null
      },
      fromDate: null,
      toDate: null,

      currentPages: {} // mapping of type {idTerm: currentPage}
    };
  },

  mutations: {
    setPreviewSize(state, size) {
      state.previewSize = size;
    },

    setCategorization(state, categorization) {
      state.categorization = categorization;
    },

    setPerPage(state, perPage) {
      state.perPage = perPage;
    },

    setOutlineColor(state, color) {
      state.outlineColor = color;
    },

    setAnnotationType(state, type) {
      state.annotationType = type;
    },

    setFilter(state, {filterName, propValue}) {
      state.filters[filterName] = propValue;
    },

    setFromDate(state, date) {
      state.fromDate = date;
    },

    setToDate(state, date) {
      state.toDate = date;
    },

    resetPagesAndFilters(state) {
      for(let key in state.filters) {
        state.filters[key] = null;
      }
      state.fromDate = null;
      state.toDate = null;
      state.currentPages = {};
    },

    setCurrentPage(state, {term, page}) {
      Vue.set(state.currentPages, term, page);
    }
  }
};
