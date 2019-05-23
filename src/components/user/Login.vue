<template>
<div class="panel">
  <template v-if="forgotUsername">
    <p class="panel-heading">
      <i class="fas fa-user" aria-hidden="true"></i>
      {{$t('forgot-username')}}
    </p>
    <div class="panel-block">
      <form @submit.prevent="sendUsername">
        <b-field :label="$t('email')">
          <b-input v-model="email" />
        </b-field>

        <div class="buttons is-right">
          <button class="button" type="button" @click="forgotUsername = false"> {{$t('button-cancel')}}</button>
          <button class="button is-link"> {{$t('button-get-username')}}</button>
        </div>
      </form>
    </div>
  </template>

  <template v-else-if="forgotPassword">
    <p class="panel-heading">
      <i class="fas fa-user" aria-hidden="true"></i>
      {{$t('forgot-password')}}
    </p>
    <div class="panel-block">
      <form @submit.prevent="resetPassword()">
        <b-field :label="$t('username')">
          <b-input v-model="username" />
        </b-field>

        <div class="buttons is-right">
          <button class="button" type="button" @click="forgotPassword = false"> {{$t('button-cancel')}}</button>
          <button class="button is-link"> {{$t('button-reset-password')}}</button>
        </div>
      </form>
    </div>
  </template>

  <register v-else-if="registering" @close="registering=false" />

  <template v-else>
    <p class="panel-heading">
      <i class="fas fa-user" aria-hidden="true"></i>
      {{$t('login')}}
    </p>
    <div class="panel-block">
      <form @submit.prevent="login()">
        <b-field :label="$t('username')">
          <b-input v-model="username" />
        </b-field>

        <b-field :label="$t('password')">
          <b-input type="password" v-model="password" />
        </b-field>

        <div class="columns">
          <div class="column">
            <b-field>
              <b-checkbox v-model="rememberMe" type="is-info">{{$t('remember-me')}}</b-checkbox>
            </b-field>
          </div>

          <div class="column has-text-right">
            <button class="button is-link"> {{$t('button-login')}}</button>
          </div>
        </div>
      </form>
    </div>
    <i18n path="forgot-credentials" tag="p" class="is-size-7 has-text-centered forgot-credentials">
      <a place="username" @click="forgotUsername = true">{{ $t('username') }}</a>
      <a place="password" @click="forgotPassword = true">{{ $t('password') }}</a>
    </i18n>
    <i18n v-if="allowedRegistration" path="no-account-yet" tag="p" class="is-size-7 has-text-centered">
      <a place="registerLink" @click="registering = true">{{$t('register')}}</a>
    </i18n>
  </template>
</div>
</template>

<script>
import {Cytomine} from 'cytomine-client';
import Register from './Register';

export default {
  name: 'login',
  components: {Register},
  data() {
    return {
      username: '',
      password: '',
      email: '',
      rememberMe: true,

      allowedRegistration: false, // TODO: retrieve info from core

      forgotUsername: false,
      forgotPassword: false,
      registering: false
    };
  },
  methods: {
    async login() {
      try {
        let successMessage = this.$t('notif-success-login');
        await this.$store.dispatch('currentUser/login', {
          username: this.username,
          password: this.password,
          rememberMe: this.rememberMe
        });
        if(this.$store.state.currentUser.user) {
          this.$notify({type: 'success', text: successMessage});
        }
        else {
          this.$notify({type: 'error', text: this.$t('notif-unexpected-error')});
        }
      }
      catch(error) {
        this.$notify({type: 'error', text: error.response.data.message});
      }
    },
    async sendUsername() {
      try {
        await Cytomine.instance.forgotUsername(this.email);
        this.$notify({type: 'success', text: this.$t('notif-success-forgot-username')});
        this.forgotUsername = false;
      }
      catch(error) {
        this.$notify({type: 'error', text: this.$t('notif-error-forgot-username')});
      }
    },
    async resetPassword() {
      try {
        await Cytomine.instance.forgotPassword(this.username);
        this.$notify({type: 'success', text: this.$t('notif-success-forgot-username')});
        this.forgotPassword = false;
      }
      catch(error) {
        this.$notify({type: 'error', text: this.$t('notif-error-forgot-username')});
      }
    }
  }
};
</script>

<style scoped>
.panel {
  width: 100%;
  max-width: 40em;
  margin: auto;
  margin-top: 3em;
}

.columns, .buttons {
  margin-top: 0.5em;
}

.panel-block {
  margin-bottom: 1em;
}

.forgot-credentials a {
  text-transform: lowercase;
}
</style>
