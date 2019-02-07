import {Cytomine, User} from "cytomine-client";

export default {
    state: {
        authenticated: false,
        user: null
    },

    mutations: {
        setAuthenticated(state, authenticated) {
            state.authenticated = authenticated;
        },

        setUser(state, user) {
            state.user = user.clone();
        },
        setAdminByNow(state, value) {
            state.user.adminByNow = value;
        },

        logout(state) {
            state.authenticated = false;
            state.user = null;
        }
    },

    actions: {
        async fetchUser({commit}) {
            let {authenticated} = await Cytomine.instance.ping();
            commit("setAuthenticated", authenticated);
            if(authenticated) {
                let user = await User.fetchCurrent();
                commit("setUser", user);
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
};
