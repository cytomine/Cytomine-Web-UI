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
<nav class="navbar is-light" role="navigation" :style="{backgroundColor: activeColor}">
  <div class="navbar-brand">
    <router-link to="/" exact class="navbar-item" :style="{backgroundColor: activeColor}">
      <img :src="logo" id="logo" alt="Cytomine">
    </router-link>
    <a role="" class="navbar-burger" :class="{'is-active':openedTopMenu}" @click="openedTopMenu=!openedTopMenu">
      <span></span> <span></span> <span></span>
    </a>
  </div>
  <div id="topMenu" class="navbar-menu" :class="{'is-active':openedTopMenu}">
    <div class="navbar-start">
      <navbar-dropdown icon="fa-folder-open" v-if="this.nbActiveProjects > 0 && !this.isFetching"
        :title="$t('workspace')"
        :listPathes="['/project/']"
        :fontColor="{'color': activeFontColor}"
        :backgroundColor="{'color': activeColor}"
        :hoverBackgroundColor="{'color': darkerActiveColor}"
      >
        <navigation-tree />
      </navbar-dropdown>
      <router-link to="/projects" class="navbar-item" @mouseover.native="mouseOver('projects')" @mouseleave.native="mouseLeave('projects')" :style="itemStyles.projects">
        <i class="fas fa-list-alt"></i>
        {{ $t('projects') }}
      </router-link>
      <router-link v-if="!currentUser.guestByNow" to="/storage" class="navbar-item" @mouseover.native="mouseOver('storage')" @mouseleave.native="mouseLeave('storage')" :style="itemStyles.storage">
        <i class="fas fa-download"></i>
        {{ $t('storage') }}
      </router-link>
      <router-link to="/ontology" class="navbar-item" @mouseover.native="mouseOver('ontology')" @mouseleave.native="mouseLeave('ontology')" :style="itemStyles.ontology">
        <i class="fas fa-hashtag"></i>
        {{ $t('ontologies') }}
      </router-link>
      <router-link v-show="algoEnabled" to="/software" class="navbar-item" @mouseover.native="mouseOver('software')" @mouseleave.native="mouseLeave('software')" :style="itemStyles.software">
        <i class="fas fa-code"></i>
        {{ $t('algorithms') }}
      </router-link>
      <router-link v-if="currentUser.adminByNow" to="/admin" class="navbar-item" @mouseover.native="mouseOver('admin')" @mouseleave.native="mouseLeave('admin')" :style="itemStyles.admin">
        <i class="fas fa-wrench"></i>
        {{ $t('admin-menu') }}
      </router-link>
    </div>

    <div class="navbar-end">
      <cytomine-searcher />

      <navbar-dropdown
        v-if="!this.isFetching"
        :icon="currentUser.adminByNow ? 'fa-star' : currentUser.isSwitched ? 'fa-user-ninja' : 'fa-user'"
        :title="currentUserFullInfo"
        :linkClasses="{'has-text-dark-primary': currentUser.isSwitched}"
        :tag="currentUser.adminByNow ? {type: 'is-danger', text: $t('admin')} : null"
        :listPathes="['/account', '/activity']"
        :fontColor="{'color': activeFontColor}"
        :backgroundColor="{'color': activeColor}"
        :hoverBackgroundColor="{'color': darkerActiveColor}"
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

      <navbar-dropdown
        v-if="!this.isFetching"
        icon="fa-question-circle"
        :title="$t('help')"
        :classes="['is-right']"
        :fontColor="{'color': activeFontColor}"
        :backgroundColor="{'color': activeColor}"
        :hoverBackgroundColor="{'color': darkerActiveColor}"
      >
        <a class="navbar-item" @click="openHotkeysModal()">
          <span class="icon"><i class="far fa-keyboard fa-xs"></i></span> {{$t('shortcuts')}}
        </a>
        <a class="navbar-item" @click="openAboutModal()">
          <span class="icon"><i class="fas fa-info-circle fa-xs"></i></span> {{$t('about-cytomine')}}
        </a>
      </navbar-dropdown>
    </div>
  </div>
  <div class="hidden" v-shortkey.once="openHotkeysModalShortcut" @shortkey="openHotkeysModal"></div>
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
import constants from '@/utils/constants.js';
import {fullName} from '@/utils/user-utils.js';
import {getDarkerColor} from '@/utils/color-manipulation.js';
import shortcuts from '@/utils/shortcuts.js';

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
      hotkeysModal: null,
      algoEnabled: constants.ALGORITHMS_ENABLED,
      postLogoutURL: constants.LOGOUT_REDIRECTION,
      SSOEnabled: constants.SSO_ENABLED,
      aboutModal: null,
      activeColor: '#f5f5f5',
      darkerActiveColor: '#ffffff',
      activeFontColor: '#363636',
      itemStyles: {workspace: {}, projects: {}, storages: {}, storage: {}, ontology: {}, software: {}, admin: {}},
      isFetching: true,
      logo: require('@/assets/logo.svg') //'https://www.belgium.be/themes/custom/belgium_theme/images/logos/logo-be.svg'
      //constants.LOGO_TOP_MENU //require('@/assets/logo.svg')
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    currentUserFullInfo() {
      return fullName(this.currentUser);
    },
    nbActiveProjects() {
      return Object.keys(this.$store.state.projects).length;
    },
    openHotkeysModalShortcut() {
      return shortcuts['general-shortcuts-modal'];
    }
  },
  watch: {
    $route(){
      this.openedTopMenu = false;
      this.activeSelectedItem();
    }
  },
  methods: {
    // required to use programmatic modal for correct display in IE11
    openHotkeysModal() {
      if (!this.hotkeysModal) {
        this.hotkeysModal = this.$buefy.modal.open({
          parent: this,
          component: HotkeysModal,
          hasModalCard: true,
          onCancel: () => this.hotkeysModal = null,
        });
      }
    },
    openAboutModal() {
      this.$buefy.modal.open({
        parent: this,
        component: AboutCytomineModal,
        hasModalCard: true
      });
    },
    // ---

    mouseOver: function(item){
      this.setItemColor(item, this.darkerActiveColor);
    },
    mouseLeave: function(item){
      this.setItemColor(item, this.activeColor);
      this.activeSelectedItem();
    },
    activeSelectedItem(){
      this.initItemsStyles();
      let item = this.$route.path.split('/')[1];
      // If it's not root path or workspace ('/project/') path.
      if (item && !this.$route.path.match('/project/')){
        this.setItemColor(item, this.darkerActiveColor);
      }
    },
    initItemsStyles(){
      for(let item in this.itemStyles){
        this.itemStyles[item] = {backgroundColor: this.activeColor, color: this.activeFontColor};
      }
    },
    setItemColor(item, color){
      this.itemStyles[item].backgroundColor = color;
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
        if(this.SSOEnabled) window.location = this.postLogoutURL;
        else this.$router.push(this.postLogoutURL);
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-logout')});
      }
    },
    async fetchConfig() {
      this.isFetching = true;
      try {
        let value = (await Configuration.fetch(constants.CONFIG_KEY_COLOR_TOP_MENU)).value;
        if (value && value!=='') {
          this.activeColor = value;
          this.darkerActiveColor = getDarkerColor(value);
        }
      }
      catch(error) {
        // no config defined
      }
      try {
        let value = (await Configuration.fetch(constants.CONFIG_KEY_FONT_COLOR_TOP_MENU)).value;
        if (value && value!=='') {
          this.activeFontColor = value;
        }
      }
      catch(error) {
        // no config defined
      }
      try {
        let value = (await Configuration.fetch(constants.CONFIG_KEY_LOGO_TOP_MENU)).value;
        if (value && value!=='') {
          this.logo = value;
        }
      }
      catch(error) {
        // no config defined
      }
      this.initItemsStyles();
      this.activeSelectedItem();
      this.isFetching = false;
    },
  },
  async created() {
    await this.fetchConfig();
  },
  mounted() {
    this.$eventBus.$on('configChanged', this.fetchConfig);
  },
  beforeDestroy() {
    this.$eventBus.$off('configChanged', this.fetchConfig);
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
