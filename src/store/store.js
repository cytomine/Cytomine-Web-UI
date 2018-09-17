import Vue from "vue";
import Vuex from "vuex";

import currentUserModule from "./modules/current-user.js";

Vue.use(Vuex);
export default new Vuex.Store({
    modules: {
        currentUser: currentUserModule
    }
});
