import Vue from "vue";
import Vuex from "vuex";

import currentUser from "./modules/current-user.js";
import images from "./modules/images.js";

Vue.use(Vuex);
export default new Vuex.Store({
    modules: {
        currentUser,
        images,
    }
});
