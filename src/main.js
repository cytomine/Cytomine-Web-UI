import Vue from "vue";

import VueRouter from "vue-router";
import router from "./routes.js";

import Notifications from "vue-notification";

import i18n from "./lang.js";

import store from "./store/store.js";

import {Cytomine} from "cytomine-client";

import Buefy from "buefy";
import "buefy/lib/buefy.css";

import VueMoment from "vue-moment";

import VueShortKey from "vue-shortkey";

import App from "./App.vue";

Vue.use(VueRouter);
Vue.use(Notifications);
Vue.use(Buefy);
Vue.use(VueMoment);
Vue.use(VueShortKey, { prevent: ["input", "textarea"] });
Vue.config.productionTip = false;

new Cytomine("localhost-core");

new Vue({
    render: h => h(App),
    router,
    store,
    i18n
}).$mount("#app");
