<template>
<div id="app" class="wrapper">
  <notifications position="top center" width="30%" :max="5">
    <template #body="props">
      <div class="notification vue-notification" :class="props.item.type">
        <button class="delete" @click="props.close"></button>
        <strong class="notification-title">
          {{props.item.title}}
        </strong>
        <div class="notification-content" v-html="props.item.text"></div>
      </div>
    </template>
  </notifications>

  <template v-if="!loading">
    <div class="box error" v-if="communicationError">
      <h2>
        {{$t('communication-error')}}
      </h2>
      {{$t('core-cannot-be-reached')}}
    </div>

    <login v-else-if="!currentUser" />

    <template v-else>
      <cytomine-navbar />
      <div class="bottom">
        <keep-alive include="cytomine-storage">
          <router-view v-if="currentUser" />
        </keep-alive>
      </div>
    </template>
  </template>
</div>
</template>

<script>
import CytomineNavbar from './components/layout/CytomineNavbar.vue';
import Login from './components/user/Login.vue';

import {Cytomine} from 'cytomine-client';

import constants from '@/utils/constants.js';
import ifvisible from 'ifvisible';
ifvisible.setIdleDuration(constants.IDLE_DURATION);

export default {
  name: 'app',
  components: {CytomineNavbar, Login},
  data() {
    return {
      communicationError: false,
      loading: true,
      timeout: null
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser.user;
    },
    language() {
      return this.currentUser && this.currentUser.language ? this.currentUser.language : this.$i18n.fallbackLocale;
    },
    project() {
      return this.$store.state.currentProject.project;
    }
  },
  watch: {
    language() {
      let locale = this.language.toLowerCase();
      this.$i18n.locale = locale;
      this.$moment.locale(locale);
    }
  },
  methods: {
    async loginWithToken() {
      try {
        await Cytomine.instance.loginWithToken(this.$route.query.username, this.$route.query.token);
        await this.$store.dispatch('currentUser/fetchUser');
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('invalid-token')});
      }
    },
    async ping() {
      if(!ifvisible.now()){
        return; // window not visible or inactive user => stop pinging
      }
      try {
        let {authenticated} = await Cytomine.instance.ping(this.project ? this.project.id : null);
        if(this.currentUser && !authenticated) {
          await this.$store.dispatch('logout');
        }
      }
      catch(error) {
        console.log(error);
        this.communicationError = true;
      }

      clearTimeout(this.timeout);
      this.timeout = setTimeout(this.ping, constants.PING_INTERVAL);
    }
  },
  async created() {
    if(this.$route.query.token && this.$route.query.username) {
      await this.loginWithToken();
    }
    else {
      try {
        await this.$store.dispatch('currentUser/fetchUser');
      }
      catch(error) {
        console.log(error);
        this.communicationError = true;
      }
    }
    this.loading = false;
    this.ping();
    ifvisible.on('wakeup', this.ping);
  }
};
</script>

<style lang="scss">
@import '@/assets/styles/main.scss';

@font-face {
  font-family: 'cytomine';
  src: url('assets/cytomine-font.woff') format('woff');
}

html, body {
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

body {
  font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif, sans-serif;
  color: #333;
  background: #d4d4d4;
}

.wrapper {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  background: #d4d4d4;
}

.box.error {
  max-width: 600px;
  margin: auto;
  margin-top: 3rem;
}

.notifications {
  margin-top: 1em;
}

.notification.info {
  background: #77b1ea;
}

.bottom {
  flex: 1;
  overflow-y: auto;
  /* position: relative; */
}

h1 {
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  font-size: 1.25rem;
  text-align: center;
  padding: 0.9rem;
}

h2 {
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08rem;
  margin-bottom: 1rem;
}

.in-project {
  color: grey;
  font-size: 0.8em;
}

.input[readonly] {
  background-color: whitesmoke;
}

strong, .label {
  font-weight: 600 !important;
}

.content-wrapper {
  padding: 1.5% 2.5%;
  position: relative;
  min-height: 100%;
}

/* Filters */

.filters {
  background: #f8f8f8;
  margin-top: 1.2rem;
  border-radius: 10px;
  padding: 1rem;
}

.filter-label {
  text-transform: uppercase;
  font-size: 0.8em;
  margin-bottom: 0.5em;
  margin-left: 1em;
}

.filter-label .no-uppercase {
  text-transform: none;
}

.nb-active-filters {
  display: inline-block;
  background: $primary;
  color: $primary-invert;
  min-width: 1.25rem;
  height: 1.25rem;
  font-weight: 600;
  border-radius: 0.625rem;
  margin-left: 0.5em;
  font-size: 0.9em;
  line-height: 1.25em;
  padding: 0 0.25em;
  position: absolute;
  top: -0.3em;
  right: -0.6em;
}

/* For correct display of svg images on IE > 10 */
@media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
  img[src$=".svg"] {
    width: 100%;
  }
}
</style>
