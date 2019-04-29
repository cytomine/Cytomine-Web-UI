import {isBetweenBounds} from '@/utils/bounds';

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
  },

  getters: {
    filteredImages: (state, getters) => images => {
      let str = state.searchString.toLowerCase();
      return images.filter(image => {
        return (!str || (image.instanceFilename && image.instanceFilename.toLowerCase().indexOf(str) >= 0) ||
          (image.blindedName && image.blindedName.toLowerCase().indexOf(str) >= 0)) &&
          getters.checkMultiselectFilter('formats', image.extension) &&
          getters.checkMultiselectFilter('vendors', image.vendorFormatted) &&
          getters.checkMultiselectFilter('magnifications', image.magnificationFormatted) &&
          getters.checkMultiselectFilter('resolutions', image.resolutionFormatted) &&
          getters.checkBoundsFilter('boundsWidth', image.width) &&
          getters.checkBoundsFilter('boundsHeight', image.height) &&
          getters.checkBoundsFilter('boundsUserAnnotations', image.numberOfAnnotations) &&
          getters.checkBoundsFilter('boundsJobAnnotations', image.numberOfJobAnnotations) &&
          getters.checkBoundsFilter('boundsReviewedAnnotations', image.numberOfReviewedAnnotations);
      });
    },

    checkMultiselectFilter: state => (filterName, value) => {
      let selected = state.filters[filterName];
      return !selected || selected.includes(value);
    },

    checkBoundsFilter: state => (filterName, value) => {
      let bounds = state.filters[filterName];
      return !bounds || isBetweenBounds(value, bounds);
    },

    nbActiveFilters: state => {
      return Object.values(state.filters).filter(val => val).length; // count the number of not null values
    }
  }
};
