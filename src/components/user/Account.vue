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
  <div class="panel">
    <p class="panel-heading">
      <i class="fas fa-user" aria-hidden="true"></i>
      {{ $t('profile') }}
    </p>
    <div class="panel-block">
      <form @submit.prevent="editDetails()" data-vv-scope="profile">
        <b-field :label="$t('username')" horizontal>
          <b-input :value="currentUser.username" disabled />
        </b-field>

        <b-field :label="$t('role')" horizontal>
          <span class="tag" :class="role.class">{{$t(role.label)}}</span>
        </b-field>

        <b-field
          :label="$t('lastname')"
          horizontal
          :type="{'is-danger': errors.has('profile.lastname')}"
          :message="errors.first('profile.lastname')"
        >
          <b-input v-model="updatedUser.lastname" name="lastname" v-validate="'required'" />
        </b-field>

        <b-field
          :label="$t('firstname')"
          horizontal
          :type="{'is-danger': errors.has('profile.firstname')}"
          :message="errors.first('profile.firstname')"
        >
          <b-input v-model="updatedUser.firstname" name="firstname" v-validate="'required'" />
        </b-field>

        <b-field
          :label="$t('email')"
          horizontal
          :type="{'is-danger': errors.has('profile.email')}"
          :message="errors.first('profile.email')"
        >
          <b-input v-model="updatedUser.email" name="email" v-validate="'required|email'" />
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
            <button class="button is-link" :disabled="errors.any('profile')"> {{$t('button-save')}}</button>
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
      <form @submit.prevent="savePassword()" data-vv-scope="password">
        <input id="password" class="hidden" type="password"> <!-- HACK: fake field to prevent autofill -->

        <b-message v-if="currentUser.passwordExpired" type="is-danger" has-icon icon-size="is-small">
          {{$t('password-expired-info-message')}}
        </b-message>

        <b-field
          v-else
          :label="$t('password-current')"
          horizontal
          :type="typeCurrentPassword"
          :message="messageCurrentPassword"
        >
          <b-input type="password" v-model="currentPassword" :loading="isCheckingPassword" />
        </b-field>

        <b-field
          :label="$t('password-new')"
          horizontal
          :type="{'is-danger': errors.has('password.newPassword')}"
          :message="errors.first('password.newPassword')"
        >
          <b-input
            type="password"
            v-model="newPassword"
            name="newPassword"
            v-validate="'required|min:8'"
            :disabled="newPasswordDisabled"
          />
        </b-field>

        <b-field
          :label="$t('password-confirm')"
          horizontal
          :type="{'is-danger': errors.has('password.confirmPassword')}"
          :message="errors.first('password.confirmPassword')"
        >
          <b-input
            type="password"
            v-model="confirmPassword"
            name="confirmPassword"
            v-validate="{required: true, is: newPassword}"
            :disabled="newPasswordDisabled"
          />
        </b-field>

        <b-field grouped position="is-right">
          <div class="control">
            <button class="button is-link" :disabled="errors.any('password') || newPasswordDisabled">
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
import {get} from '@/utils/store-helpers';
import {changeLanguageMixin} from '@/lang.js';
import _ from 'lodash';
import {User} from 'cytomine-client';
import {rolesMapping} from '@/utils/role-utils';
import copyToClipboard from 'copy-to-clipboard';

export default {
  name: 'Account',
  $_veeValidate: {validator: 'new'},
  mixins: [changeLanguageMixin],
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
        {value: 'FR', name:'Français'},
        {value: 'ES', name:'Español'}
      ],
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    role() {
      let key = this.currentUser.guestByNow ? 'ROLE_GUEST' : this.currentUser.adminByNow ? 'ROLE_ADMIN' : 'ROLE_USER';
      return rolesMapping[key];
    },
    newPasswordDisabled() {
      return !this.correctPassword && !this.currentUser.passwordExpired;
    },
    messageCurrentPassword() {
      if(!this.currentPassword || this.isCheckingPassword) {
        return;
      }
      return this.correctPassword ? '' : this.$t('invalid-password');
    },
    typeCurrentPassword() {
      if(!this.currentPassword || this.isCheckingPassword) {
        return;
      }
      return this.correctPassword ? 'is-success' : 'is-danger';
    }
  },
  watch: {
    currentPassword() {
      this.isCheckingPassword = true;
      this.checkPassword();
    }
  },
  methods: {
    async editDetails() {
      let result = await this.$validator.validateAll('profile');
      if(!result) {
        return;
      }

      try {
        await this.$store.dispatch('currentUser/updateUser', this.updatedUser);
        this.changeLanguage(this.currentUser.language);
        this.$notify({type: 'success', text: this.$t('notif-success-user-details-saved')});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-user-details-not-saved')});
      }
    },

    async savePassword() {
      let result = await this.$validator.validateAll('password');
      if(!result || (!this.correctPassword && !this.currentUser.passwordExpired)) {
        return;
      }

      let userNewPassword = this.currentUser.clone();
      userNewPassword.password = this.newPassword;
      try {
        await this.$store.dispatch('currentUser/updateUser', userNewPassword);
        this.$notify({type: 'success', text: this.$t('notif-success-password-saved')});
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.$validator.reset({scope: 'password'});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-password-not-saved')});
      }
    },

    checkPassword: _.debounce(async function() {
      this.correctPassword = await User.checkCurrentPassword(this.currentPassword);
      if(!this.correctPassword) {
        this.newPassword = '';
        this.confirmPassword = '';
        this.$validator.reset({scope: 'password'});
      }
      this.isCheckingPassword = false;
    }, 500),

    copy(value) {
      copyToClipboard(value);
      this.$notify({type: 'success', text: this.$t('notif-success-key-copied')});
    },

    async regenerateKeys() {
      try {
        await this.$store.dispatch('currentUser/regenerateKeys');
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
