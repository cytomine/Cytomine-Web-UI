<template>
<div class="content-wrapper">
  <div class="panel">
    <p class="panel-heading">
      <i class="fas fa-user" aria-hidden="true"></i>
      {{ $t('profile') }}
    </p>
    <div class="panel-block">
      <form @submit.prevent="editDetails()">
        <b-field :label="$t('username')" horizontal>
          <b-input :value="currentUser.username" disabled />
        </b-field>

        <b-field :label="$t('role')" horizontal>
          <span class="tag" :class="role.class">{{$t(role.label)}}</span>
        </b-field>

        <b-field :label="$t('lastname')" horizontal>
          <b-input v-model="updatedUser.lastname" />
        </b-field>

        <b-field :label="$t('firstname')" horizontal>
          <b-input v-model="updatedUser.firstname" />
        </b-field>

        <b-field :label="$t('email')" horizontal>
          <b-input v-model="updatedUser.email" />
        </b-field>

        <b-field :label="$t('language')" horizontal>
          <b-select v-model="updatedUser.language">
            <option v-for="{value, name} in languages" :key="value" :value="value">
              {{name}}
            </option>
          </b-select>
        </b-field>

        <b-field grouped position="is-right">
          <div class="control">
            <button class="button is-link"> {{$t('button-save')}}</button>
          </div>
        </b-field>
      </form>
    </div>
  </div>

  <div class="panel">
    <p class="panel-heading">
      <i class="fas fa-briefcase" aria-hidden="true"></i>
      {{ $t('password') }}
    </p>
    <div class="panel-block">
      <form @submit.prevent="savePassword()">
        <input id="password" class="hidden" type="password"> <!-- HACK: fake field to prevent autofill -->

        <b-message v-if="currentUser.passwordExpired" type="is-danger" has-icon icon-size="is-small">
          {{$t('password-expired-info-message')}}
        </b-message>

        <b-field v-else :label="$t('password-current')" :type="typeCurrentPassword" horizontal>
          <b-input type="password" v-model="currentPassword" :loading="isCheckingPassword" />
        </b-field>

        <b-field :label="$t('password-new')" horizontal>
          <b-input type="password" v-model="newPassword" :disabled="!correctPassword && !currentUser.passwordExpired" />
        </b-field>

        <b-field :label="$t('password-confirm')" horizontal>
          <b-input type="password" v-model="confirmPassword" :disabled="!newPassword" />
        </b-field>

        <b-field grouped position="is-right">
          <div class="control">
            <button class="button is-link" :disabled="savePasswordDisabled">
              {{$t('button-save')}}
            </button>
          </div>
        </b-field>
      </form>
    </div>
  </div>

  <div class="panel"> <!-- QUESTION: remove ? or only show for technical users ? -->
    <p class="panel-heading">
      <i class="fas fa-exchange-alt" aria-hidden="true"></i>
      {{ $t('api-keys') }}
    </p>
    <div class="panel-block">
      <b-field :label="$t('public-key')" horizontal>
        <b-field>
          <b-input :value="currentUser.publicKey" readonly expanded />
          <p class="control">
            <button class="button" @click="copy(currentUser.publicKey)">
              <span class="icon"><i class="far fa-clipboard"></i></span>
              <span>{{$t('button-copy')}}</span>
            </button>
          </p>
        </b-field>
      </b-field>

      <b-field :label="$t('private-key')" horizontal>
        <b-field>
          <b-input :value="currentUser.privateKey" readonly expanded />
          <p class="control">
            <button class="button" @click="copy(currentUser.privateKey)">
              <span class="icon"><i class="far fa-clipboard"></i></span>
              <span>{{$t('button-copy')}}</span>
            </button>
          </p>
        </b-field>
      </b-field>

      <b-field grouped position="is-right">
        <div class="control">
          <button class="button is-link" @click="regenerateKeys()">{{$t('regenerate-api-keys')}}</button>
        </div>
      </b-field>
    </div>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';
import _ from 'lodash';
import {User} from 'cytomine-client';
import {rolesMapping} from '@/utils/role-utils';
import copyToClipboard from 'copy-to-clipboard';

export default {
  name: 'Account',
  data() {
    return {
      updatedUser: this.$store.state.currentUser.user.clone(),
      currentPassword: '',
      isCheckingPassword: false,
      correctPassword: false,
      newPassword: '',
      confirmPassword: '',
      languages: [
        {value: 'EN', name:'English'},
        {value: 'FR', name:'Français'}
      ],
    };
  },
  computed: {
    role() {
      let key = this.currentUser.guestByNow ? 'ROLE_GUEST' : this.currentUser.adminByNow ? 'ROLE_ADMIN' : 'ROLE_USER';
      return rolesMapping[key];
    },
    savePasswordDisabled() {
      return !this.newPassword || this.newPassword !== this.confirmPassword;
    },
    typeCurrentPassword() {
      if(!this.currentPassword) {
        return;
      }
      return this.correctPassword ? 'is-success' : 'is-danger';
    },
    ...mapState({currentUser: state => state.currentUser.user})
  },
  watch: {
    currentPassword() {
      this.isCheckingPassword = true;
      this.checkPassword();
    }
  },
  methods: {
    async editDetails() {
      try {
        await this.$store.dispatch('updateUser', this.updatedUser);
        this.$notify({type: 'success', text: this.$t('notif-success-user-details-saved')});
      }
      catch(err) {
        this.$notify({type: 'error', text: this.$t('notif-error-user-details-not-saved')});
      }
    },

    async savePassword() {
      if(this.newPassword !== this.confirmPassword) {
        this.$notify({type: 'error', text: 'The provided passwords are not identical'});
        return;
      }

      let userNewPassword = this.currentUser.clone();
      userNewPassword.password = this.newPassword;
      try {
        await this.$store.dispatch('updateUser', userNewPassword);
        this.$notify({type: 'success', text: this.$t('notif-success-password-saved')});
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      }
      catch(err) {
        this.$notify({type: 'error', text: this.$t('notif-error-password-not-saved')});
      }
    },

    checkPassword: _.debounce(async function() {
      this.correctPassword = await User.checkCurrentPassword(this.currentPassword);
      if(!this.correctPassword) {
        this.newPassword = '';
        this.confirmPassword = '';
      }
      this.isCheckingPassword = false;
    }, 500),

    copy(value) {
      copyToClipboard(value);
      this.$notify({type: 'success', text: this.$t('notif-success-key-copied')});
    },

    async regenerateKeys() {
      try {
        await this.$store.dispatch('regenerateKeys');
        this.$notify({type: 'success', text: this.$t('notif-success-keys-regenerated')});
      }
      catch(err) {
        this.$notify({type: 'error', text: this.$t('notif-error-keys-not-regenerated')});
      }
    }
  }
};
</script>

<style scoped>
.panel {
  max-width: 80em;
  margin-left: auto;
  margin-right: auto;
}

.fas {
  margin-right: 0.3em;
}

input.hidden {
  display: none;
}
</style>
