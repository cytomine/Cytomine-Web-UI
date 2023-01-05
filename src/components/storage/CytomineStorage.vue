<!-- Copyright (c) 2009-2022. Authors: see NOTICE file.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.-->

<template>
  <div class="box error" v-if="permissionError || notFoundError">
    <h2> {{ $t(permissionError ? 'access-denied' : 'not-found') }} </h2>
    <p> {{ $t(permissionError ? 'insufficient-permission' : 'not-found-error') }} </p>
  </div>
  <div v-else class="storage-container">
    <storage-sidebar v-if="!loading" :key="idStorage" />

    <div class="app-content">
      <b-loading :is-full-page="false" :active="loading" />
      <router-view v-if="!loading" />
    </div>
  </div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import StorageSidebar from './StorageSidebar.vue';
import storageModuleModel from '@/store/modules/storage';

export default {
  name: 'cytomine-storage',
  components: {StorageSidebar},
  data() {
    return {
      loading: true,
      permissionError: false,
      notFoundError: false
    };
  },
  computed: {
    idStorage() {
      return this.$route.params.idStorage;
    },
    storage: get('currentStorage/storage'),
    storageModule() {
      return this.$store.state.storages[this.idStorage];
    }
  },
  watch: {
    async idStorage() {
      this.loading = true;
      this.notFoundError = false;
      this.permissionError = false;
      await this.loadStorage();
    },
    storageModule() {
      if(!this.storageModule) {
        console.log('Storage closed from external source');
        this.$store.commit('currentStorage/resetState');
        this.$router.push('/storages');
      }
    }
  },
  methods: {
    async loadStorage() {
      console.log('this.idStorage', this.idStorage);
      try {
        if(!this.$store.state.storages[this.idStorage]) { // module does not exist yet
          console.log('registerModule');
          this.$store.registerModule(['storages', this.idStorage], storageModuleModel);
        }
        console.log('loadStorage');
        await this.$store.dispatch('currentStorage/loadStorage', this.idStorage);
        this.loading = false;
      }
      catch(error) {
        console.log(error);
        if(error.response && error.response.status === 403) {
          this.permissionError = true;
        }
        else {
          this.notFoundError = true;
        }
      }
    },
  },
  async created() {
    await this.loadStorage();
  }
};
</script>

<style>
.storage-container {
  display: flex;
  height: 100%;
  flex: 1;
  background: #d4d4d4;
  overflow-y: auto;
  position: relative;
}

.app-content {
  flex: 1;
  position: relative;
  overflow-y: auto;
}
</style>
