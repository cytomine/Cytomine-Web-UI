<!-- Copyright (c) 2009-2021. Authors: see NOTICE file.

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
<div class="content-wrapper">
<!--  <b-field class="radio-buttons-fullwidth">-->
<!--    <b-radio-button v-model="activeTab" native-value="users" type="is-link">-->
<!--      {{$t('users')}}-->
<!--    </b-radio-button>-->
<!--  </b-field>-->

  <nav class="breadcrumb" aria-label="breadcrumbs">
    <ul>
      <li><router-link :to="`/storages`">{{$t('storages')}}</router-link></li>
      <li class="is-active"><a href="#" aria-current="page">{{storage.name}}</a></li>
    </ul>
  </nav>
  <div class="tab-content">
    <keep-alive>
      <component :is="activeComponent" />
    </keep-alive>
  </div>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import StorageUsers from './configuration-panels/StorageUsers';

const defaultTab = 'users';

export default {
  name: 'storage-configuration',
  data() {
    return {
      activeTab: defaultTab
    };
  },
  computed: {
    storage: get('currentStorage/storage'),
    queriedTab() {
      return this.$route.query.tab;
    },
    activeComponent() {
      switch(this.activeTab) {
        case 'users':
          return StorageUsers;
      }
    }
  },
  watch: {
    queriedTab() {
      this.changeTab();
    },
    activeTab() {
      if(this.activeTab !== defaultTab || this.queriedTab) {
        this.$router.push(`?tab=${this.activeTab}`);
      }
    }
  },
  methods: {
    changeTab() {
      this.activeTab = this.$route.query.tab || defaultTab;
      if(!this.activeComponent) {
        this.activeTab = defaultTab;
      }
    }
  },
  async created() {
    this.changeTab();
  }
};
</script>

<style scoped>
.tab-content {
  position: relative;
  min-height: 20em;
}
</style>
