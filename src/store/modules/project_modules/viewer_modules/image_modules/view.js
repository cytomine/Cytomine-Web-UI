export default {
  state() {
    return {
      zoom: null, // will be initialized to appropriate value (depending on container size) in CytomineImage
      center: [0, 0],
      rotation: 0,
      digitalZoom: true,
      overviewCollapsed: false
    };
  },

  mutations: {
    setCenter(state, center) {
      state.center = center;
    },

    setZoom(state, zoom) {
      state.zoom = zoom;
    },

    setRotation(state, rotation) {
      state.rotation = rotation;
    },

    setDigitalZoom(state, digitalZoom) {
      state.digitalZoom = digitalZoom;
    },

    setOverviewCollapsed(state, value) {
      state.overviewCollapsed = value;
    }
  },

  actions: {
    async initialize({commit}, {image}) {
      commit('setCenter', [image.width/2, image.height/2]);
    },
  }
};
