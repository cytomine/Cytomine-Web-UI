import Vue from 'vue';
import Vuex from 'vuex';

import currentUser from './modules/current-user.js';
import currentProject from './modules/current-project.js';
import ontologies from './modules/ontologies.js';

Vue.use(Vuex);
let store = new Vuex.Store({
  modules: {
    currentUser,
    currentProject,
    ontologies,
    projects: {
      namespaced: true
    }
  },
  strict: process.env.NODE_ENV !== 'production'
});

export default store;

export function getModuleNamespace(state) { // to update if https://github.com/vuejs/vuex/issues/1244 is implemented
  let pathes = Object.keys(store._modulesNamespaceMap);
  let moduleNamespace = pathes.find(path => store._modulesNamespaceMap[path].context.state === state);
  if(typeof moduleNamespace === 'string') {
    return moduleNamespace.slice(0, -1).split('/');
  }
}
