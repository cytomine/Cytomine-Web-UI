import {Cytomine, User} from "cytomine-client";

export default {
    state: {
        user: null,
        expandedSidebar: true
    },

    mutations: {
        setUser(state, user) {
            state.user = user ? user.clone() : null;
        },
        setAdminByNow(state, value) {
            state.user.adminByNow = value;
        },

        logout(state) {
            state.user = null;
            state.expandedSidebar = true;
        },
        setExpandedSidebar(state, val) {
            state.expandedSidebar = val;
        }
    },

    actions: {
        async fetchUser({commit}) {
            // need to perform a ping first because if user is not authenticated, fetchCurrent() returns 302 instead of error
            let {authenticated} = await Cytomine.instance.ping();
            if(authenticated) {
                let user = await User.fetchCurrent();
                commit("setUser", user);
            }
            else {
                commit("setUser", null);
            }
        },

        async updateUser({commit}, user) {
            await user.update();
            commit("setUser", user);
        },

        async regenerateKeys({state, commit}) {
            let user = state.user.clone();
            await user.regenerateKeys();
            commit("setUser", user);
        },

        async openAdminSession({commit}) {
            await Cytomine.instance.openAdminSession();
            commit("setAdminByNow", true);
        },
        async closeAdminSession({commit}) {
            await Cytomine.instance.closeAdminSession();
            commit("setAdminByNow", false);
        },

        async login({dispatch}, payload) {
            await Cytomine.instance.login(payload.username, payload.password, payload.rememberMe);
            await dispatch("fetchUser");
        },

        async logout({commit}) {
            await Cytomine.instance.logout();
            commit("logout");
        }
    }
};
