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

		fetchUser({commit}) {
			return new Promise(async (resolve, reject) => {
				try {
					let {data} = await axios.get("/server/ping.json");
					commit('setAuthenticated', data.authenticated);
					if(data.authenticated) {
						({data} = await axios.get("/api/user/current.json"));
						commit('setUser', data);
					}
					resolve();
				}
				catch(error) {
					reject(error);
				}
			});
		},

		updateUser({commit, state}, user) {
			return new Promise((resolve, reject) => {
				axios.put(`/api/user/${state.currentUser.id}.json`, user)
					.then(response => {
						commit('setUser', response.data.user);
						resolve();
					})
					.catch(error => {
						reject(error);
					});
				}
			);
		},

		login({state, dispatch}, payload) {
			return new Promise(async (resolve, reject) => {
				var params = new URLSearchParams();
				params.append('j_username', payload.username);
				params.append('j_password', payload.password);
				params.append('j_email', '');
				params.append('remember_me', payload.remember_me ? "on" : "off");
				try {
					await axios.post("j_spring_security_check", params, {headers: {'X-Requested-With': 'XMLHttpRequest'}})
						.catch(() => {}); // TODO: remove catch (temporary patch for CORS)
					await dispatch("fetchUser");
					if(state.authenticated) {
						resolve();
					}
					else {
						reject();
					}
				}
				catch(error) {
					reject(error);
				}
			});
		},

		logout({commit}) {
			return new Promise(async (resolve, reject) => {
				axios.put(`j_spring_security_logout`)
					.then(response => {
						commit('logout');
						resolve();
					})
					.catch(error => {
						reject(error);
					});
				}
			);
		}
	}
});

export default store;
