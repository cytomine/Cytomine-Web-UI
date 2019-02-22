import Vue from "vue";

import VueRouter from "vue-router";
import router from "./routes.js";

import Notifications from "vue-notification";

import i18n from "./lang.js";

import store from "./store/store.js";

import {Cytomine} from "cytomine-client";
import constants from "./utils/constants.js";

import Buefy from "buefy";

import VTooltip from "v-tooltip";

import VueMoment from "vue-moment";
const moment = require("moment");

import VueShortKey from "vue-shortkey";

import * as vClickOutside from "v-click-outside-x";

import VueLayers from "vuelayers";
import ZoomifySource from "./vuelayers-suppl/zoomify-source";
import RasterSource from "./vuelayers-suppl/raster-source";
import TranslateInteraction from "./vuelayers-suppl/translate-interaction";
import RotateInteraction from "./vuelayers-suppl/rotate-interaction";

import App from "./App.vue";

Vue.use(VueRouter);
Vue.use(Notifications);
Vue.use(Buefy, {defaultIconPack: "fas"});
Vue.use(VueMoment, {moment});
Vue.use(VueShortKey, { prevent: ["input", "textarea", ".ql-editor"] });
Vue.use(vClickOutside);
Vue.use(VTooltip);

Vue.use(VueLayers);
Vue.use(ZoomifySource);
Vue.use(RasterSource);
Vue.use(TranslateInteraction);
Vue.use(RotateInteraction);

Vue.config.productionTip = false;

new Cytomine(constants.CYTOMINE_CORE_HOST);

Vue.prototype.$eventBus = new Vue();

new Vue({
    render: h => h(App),
    router,
    store,
    i18n
}).$mount("#app");
