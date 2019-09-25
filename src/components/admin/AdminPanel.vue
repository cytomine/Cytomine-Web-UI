<template>
<div class="box error" v-if="!currentUser.adminByNow">
  <h2> {{ $t('access-denied') }} </h2>
  <p>{{ $t('insufficient-permission') }}</p>
</div>
<div class="content-wrapper" v-else>
  <b-field class="radio-buttons-fullwidth">
    <b-radio-button v-model="activeTab" native-value="dashboard" type="is-link">
      {{$t('dashboard')}}
    </b-radio-button>

    <b-radio-button v-model="activeTab" native-value="users" type="is-link">
      {{$t('users')}}
    </b-radio-button>

    <b-radio-button v-model="activeTab" native-value="trusted-sources" type="is-link">
      {{$t('trusted-sources')}}
    </b-radio-button>

    <b-radio-button v-model="activeTab" native-value="configuration" type="is-link">
      {{$t('configuration')}}
    </b-radio-button>
  </b-field>

  <div class="box">
    <keep-alive>
      <component :is="activeComponent" />
    </keep-alive>
  </div>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';

import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminSoftware from './AdminSoftware';
import AdminConfiguration from './AdminConfiguration';

const defaultTab = 'dashboard';

export default {
  name: 'admin-panel',
  data() {
    return {
      activeTab: 0,
      tabNames: [
        'dashboard',
        'users',
        'trusted-sources',
        'configuration'
      ]
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    queriedTab() {
      return this.$route.query.tab;
    },
    activeComponent() {
      switch(this.activeTab) {
        case 'dashboard':
          return AdminDashboard;
        case 'users':
          return AdminUsers;
        case 'configuration':
          return AdminConfiguration;
        case 'trusted-sources':
          return AdminSoftware;
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
      this.activeTab = this.queriedTab || defaultTab;
      if(!this.activeComponent) {
        this.activeTab = defaultTab;
      }
    }
  },
  created() {
    this.changeTab();
  }
};
</script>

<style scoped>
.box {
  position: relative;
  min-height: 20em;
}
</style>
