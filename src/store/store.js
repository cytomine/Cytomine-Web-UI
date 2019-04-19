import Vue from 'vue';
import Vuex from 'vuex';

import currentUser from './modules/current-user.js';
import currentProject from './modules/current-project.js';

Vue.use(Vuex);
export default new Vuex.Store({
  modules: {
    currentUser,
    currentProject,
    projects: {
      namespaced: true
    }
  },
  strict: process.env.NODE_ENV !== 'production'
});
