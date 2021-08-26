/*
* Copyright (c) 2009-2021. Authors: see NOTICE file.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import {Storage, StorageUserCollection} from 'cytomine-client';

function getDefaultState() {
  return {
    storage: null,
    currentUserRole: null,
    users: [],
  };
}

export default {
  namespaced: true,

  state: getDefaultState(),

  mutations: {
    resetState(state) {
      Object.assign(state, getDefaultState());
    },

    setCurrentUserRole(state, role) {
      state.currentUserRole = role;
    },

    setStorage(state, storage) {
      state.storage = storage;
    },

    setUsers(state, users) {
      state.users = users;
    },
  },

  actions: {
    async loadStorage({commit, dispatch}, idStorage) {
      let storage = await Storage.fetch(idStorage);
      commit('setStorage', storage);
      commit(`storages/${storage.id}/setStorage`, storage, {root: true});

      let promises = [
        dispatch('fetchStorageUsers')
      ];

      await Promise.all(promises);
    },
    async reloadStorage({state, commit}) {
      let storage = await Storage.fetch(state.storage.id);
      commit('setStorage', storage);
    },

    async fetchStorageUsers({state, commit, rootState}) {
      let usersAlreadyInStorage = (await StorageUserCollection.fetchAll({filterKey: 'storage', filterValue: state.storage.id})).array;
      console.log('rootState.currentUser.user', rootState.currentUser.user);

      if(rootState.currentUser.user.adminByNow) {
        commit('setCurrentUserRole', 'ADMINISTRATION');
      }
      else {
        usersAlreadyInStorage.forEach(user => {
          console.log('user', user.id);
          if(rootState.currentUser.user.id === user.id) {
            commit('setCurrentUserRole', user.role);
          }
        });
      }
      commit('setUsers', usersAlreadyInStorage);
    },

  },

  getters: {
    currentStorageModule: (state) => {
      if(!state.storage) {
        return null;
      }
      return `storages/${state.storage.id}/`;
    },
  }
};
