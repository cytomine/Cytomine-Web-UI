export default {
  state() {
    return {
      brightness: 0,
      contrast: 0,
      hue: 0,
      saturation: 0,

      filter: null
    };
  },

  mutations: {
    setBrightness(state, value) {
      state.brightness = value;
    },

    setContrast(state, value) {
      state.contrast = value;
    },

    setHue(state, value) {
      state.hue = value;
    },

    setSaturation(state, value) {
      state.saturation = value;
    },

    resetColorManipulation(state) {
      state.brightness = 0;
      state.contrast = 0;
      state.hue = 0;
      state.saturation = 0;
    },

    setFilter(state, filter) {
      state.filter = filter;
    }
  }
};
