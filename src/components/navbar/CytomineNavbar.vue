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
<nav class="navbar is-light" role="navigation">
  <div class="navbar-brand">
    <router-link to="/" exact class="navbar-item">
      <img src="@/assets/logo.svg" id="logo" alt="Cytomine">
    </router-link>
    <a role="" class="navbar-burger" :class="{'is-active':openedTopMenu}" @click="openedTopMenu=!openedTopMenu">
      <span></span> <span></span> <span></span>
    </a>
  </div>
  <div id="topMenu" class="navbar-menu" :class="{'is-active':openedTopMenu}">
    <div class="navbar-start">
      <navbar-dropdown icon="fa-folder-open" v-if="this.nbActiveProjects > 0" :title="$t('workspace')">
        <navigation-tree />
      </navbar-dropdown>
      <router-link to="/projects" class="navbar-item">
        <i class="fas fa-list-alt"></i>
        {{ $t('projects') }}
      </router-link>
      <router-link v-if="!currentUser.guestByNow" to="/storage" class="navbar-item">
        <i class="fas fa-download"></i>
        {{ $t('storage') }}
      </router-link>
      <router-link to="/ontology" class="navbar-item">
        <i class="fas fa-hashtag"></i>
        {{ $t('ontologies') }}
      </router-link>
      <router-link to="/software" class="navbar-item">
        <i class="fas fa-code"></i>
        {{ $t('algorithms') }}
      </router-link>
      <router-link v-if="currentUser.adminByNow" to="/admin" class="navbar-item">
        <i class="fas fa-wrench"></i>
        {{ $t('admin-menu') }}
      </router-link>
    </div>

    <div class="navbar-end">
      <cytomine-searcher />

      <navbar-dropdown
        :icon="currentUser.adminByNow ? 'fa-star' : currentUser.isSwitched ? 'fa-user-ninja' : 'fa-user'"
        :title="currentUserFullInfo"
        :linkClasses="{'has-text-dark-primary': currentUser.isSwitched}"
        :tag="currentUser.adminByNow ? {type: 'is-danger', text: $t('admin')} : null"
        :listPathes="['/account', '/activity']"
      >
        <router-link to="/account" class="navbar-item">
          <span class="icon"><i class="fas fa-user fa-xs"></i></span> {{$t('account')}}
        </router-link>
        <router-link to="/activity" class="navbar-item">
          <span class="icon"><i class="fas fa-history fa-xs"></i></span> {{$t('activity-history')}}
        </router-link>
        <template v-if="currentUser.admin">
          <a v-if="!currentUser.adminByNow" class="navbar-item" @click="openAdminSession()">
            <span class="icon"><i class="fas fa-star fa-xs"></i></span> {{$t('open-admin-session')}}
          </a>
          <a v-else class="navbar-item" @click="closeAdminSession()">
            <span class="icon"><i class="far fa-star fa-xs"></i></span> {{$t('close-admin-session')}}
          </a>
        </template>
        <template v-if="currentUser.isSwitched">
          <a class="navbar-item has-text-dark-primary" @click="stopSwitchUser()">
            <span class="icon"><i class="fas fa-exchange-alt fa-xs"></i></span>
            {{$t('switch-back-to-user', {username: currentUser.realUser})}}
          </a>
        </template>
        <a class="navbar-item" @click="logout()">
          <span class="icon"><i class="fas fa-power-off fa-xs"></i></span> {{ $t('logout') }}
        </a>
      </navbar-dropdown>

      <navbar-dropdown icon="fa-question-circle" :title="$t('help')" :classes="['is-right']">
        <a class="navbar-item" @click="openHotkeysModal()">
          <span class="icon"><i class="far fa-keyboard fa-xs"></i></span> {{$t('shortcuts')}}
        </a>
        <a class="navbar-item" @click="openAboutModal()">
          <span class="icon"><i class="fas fa-info-circle fa-xs"></i></span> {{$t('about-cytomine')}}
        </a>
      </navbar-dropdown>
    </div>
  </div>
</nav>
</template>

<script>
import {get} from '@/utils/store-helpers';
import {changeLanguageMixin} from '@/lang.js';

import NavbarDropdown from './NavbarDropdown';
import NavigationTree from './NavigationTree';
import HotkeysModal from './HotkeysModal';
import AboutCytomineModal from './AboutCytomineModal';
import CytomineSearcher from '@/components/search/CytomineSearcher';

import {Cytomine} from 'cytomine-client';
import {fullName} from '@/utils/user-utils.js';

export default {
  name: 'cytomine-navbar',
  components: {
    NavbarDropdown,
    NavigationTree,
    CytomineSearcher
  },
  mixins: [changeLanguageMixin],
  data() {
    return {
      openedTopMenu: false,
      hotkeysModal: false,
      aboutModal: false
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    currentUserFullInfo() {
      return fullName(this.currentUser);
    },
    nbActiveProjects() {
      return Object.keys(this.$store.state.projects).length;
    }
  },
  watch: {
    $route(){
      this.openedTopMenu = false;
    }
  },
  methods: {
    // required to use programmatic modal for correct display in IE11
    openHotkeysModal() {
      this.$buefy.modal.open({
        parent: this,
        component: HotkeysModal,
        hasModalCard: true
      });
    },
    openAboutModal() {
      this.$buefy.modal.open({
        parent: this,
        component: AboutCytomineModal,
        hasModalCard: true
      });
    },
    // ---

    async openAdminSession() {
      try {
        await this.$store.dispatch('currentUser/openAdminSession');
        this.$router.push('/admin');
      }
      catch(error) {
        console.log(error);
      }
    },
    async closeAdminSession() {
      try {
        await this.$store.dispatch('currentUser/closeAdminSession');
        if(this.$router.currentRoute.path === '/') this.$router.push('/projects');
        else this.$router.push('/');
      }
      catch(error) {
        console.log(error);
      }
    },

    async stopSwitchUser() {
      try {
        await Cytomine.instance.stopSwitchUser();
        await this.$store.dispatch('currentUser/fetchUser');
        this.$router.push('/');
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-failed-to-switch-back-as-real-user')});
      }
    },

    async logout() {
      try {
        await Cytomine.instance.logout();
        this.$store.dispatch('logout');
        this.changeLanguage();
        this.$router.push('/');
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-logout')});
      }
    }
  }
};
</script>

<style lang="scss">
#logo {
  height: 2rem;
  font-family: "cytomine";
  font-size: 2em;
  font-weight: lighter;
  line-height: 1em;
}

/* Special styling for IE */
@media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
  #logo {
    height: 40px !important;
    max-height: none !important;
  }
}

.navbar {
  font-weight: 600;
  z-index: 500 !important;

  .fas, .far {
    padding-right: 0.5rem;
  }
}
</style>
