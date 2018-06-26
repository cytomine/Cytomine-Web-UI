import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

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
			state.currentUser = user;
		},
		logout(state) {
			state.authenticated = false;
			state.currentUser = null;
			// TODO: clean other variables
		}
	},
	actions: {

		async fetchUser({commit}) {
			let {data} = await axios.get("/server/ping.json");
			commit('setAuthenticated', data.authenticated);
			if(data.authenticated) {
				({data} = await axios.get("/api/user/current.json"));
				commit('setUser', data);
			}
		},

		async updateUser({commit, state}, user) {
			let {data} = await axios.put(`/api/user/${state.currentUser.id}.json`, user);
			commit('setUser', data.user);
		},

		async login({state, dispatch}, payload) {
			var params = new URLSearchParams();
			params.append('j_username', payload.username);
			params.append('j_password', payload.password);
			params.append('j_email', '');
			params.append('remember_me', payload.remember_me ? "on" : "off");
			await axios.post("j_spring_security_check", params, {headers: {'X-Requested-With': 'XMLHttpRequest'}})
				.catch(() => {}); // TODO: remove catch (temporary patch for CORS)
			await dispatch("fetchUser");
			if(!state.authenticated) {
				throw Error("Invalid credentials"); // TODO: custom error
			}
		},

		async logout({commit}) {
			await axios.put(`j_spring_security_logout`);
			commit('logout');
		}
	}
});

export default store;
