import Vue from "vue";
import Vuex from "vuex";
import {Cytomine, User} from "cytomine-client";

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        authenticated: false,
        currentUser: null
    },
    mutations: {
        setAuthenticated(state, authenticated) {
            state.authenticated = authenticated;
        },
        setUser(state, user) {
            state.currentUser = user.clone();
        },
        logout(state) {
            state.authenticated = false;
            state.currentUser = null;
            // TODO: clean other variables
        }
    },
    actions: {

        async fetchUser({commit}) {
            let {authenticated} = await Cytomine.instance.ping();
            commit("setAuthenticated", authenticated);
            if(authenticated) {
                let currentUser = await User.fetchCurrent();
                commit("setUser", currentUser);
            }
        },

        async updateUser({commit}, user) {
            await user.update();
            commit("setUser", user);
        },

        async regenerateKeys({state, commit}) {
            let user = state.currentUser.clone();
            await user.regenerateKeys();
            commit("setUser", user);
        },

        async login({state, dispatch}, payload) {
            await Cytomine.instance.login(payload.username, payload.password, payload.rememberMe);
            await dispatch("fetchUser");
            if(!state.authenticated) {
                throw new Error("Invalid credentials");
            }
        },

        async logout({commit}) {
            await Cytomine.instance.logout();
            commit("logout");
        }
    }
});

export default store;
