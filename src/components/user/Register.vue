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
<div>
  <p class="panel-heading">
    <i class="fas fa-user-plus" aria-hidden="true"></i>
    {{$t('register')}}
  </p>
  <div class="panel-block">
    <template v-if="success">
      <b-message type="is-success" has-icon icon-size="is-small">
        {{$t('successful-registration')}}
      </b-message>
      <p class="has-text-centered">
        <a @click="$emit('close')">{{$t('back-to-login')}}</a>
      </p>
    </template>

    <form v-else @submit.prevent="register()">
      <b-field :label="$t('firstname')" :type="{'is-danger': errors.has('firstname')}" :message="errors.first('firstname')">
        <b-input v-model="firstname" name="firstname" v-validate="'required'" />
      </b-field>

      <b-field :label="$t('lastname')" :type="{'is-danger': errors.has('lastname')}" :message="errors.first('lastname')">
        <b-input v-model="lastname" name="lastname" v-validate="'required'"  />
      </b-field>

      <b-field :label="$t('username')" :type="{'is-danger': errors.has('username')}" :message="errors.first('username')">
        <b-input v-model="username" name="username" v-validate="'required'" />
      </b-field>

      <b-field :label="$t('email')" :type="{'is-danger': errors.has('email')}" :message="errors.first('email')">
        <b-input v-model="email" name="email" v-validate="'required|email'"  />
      </b-field>

      <div class="buttons is-right">
        <button class="button" type="button" :disabled="loading" @click="$emit('close')">
          {{$t('button-cancel')}}
        </button>
        <button class="button is-link" :class="{'is-loading': loading}" :disabled="errors.any() || loading">
          {{$t('button-register')}}
        </button>
      </div>
    </form>
  </div>
</div>
</template>

<script>
import {Cytomine} from 'cytomine-client';

export default {
  name: 'register',
  $_veeValidate: {validator: 'new'},
  data() {
    return  {
      username: '',
      email: '',
      firstname: '',
      lastname: '',
      success: false,
      loading: false
    };
  },
  methods: {
    async register() {
      console.log('register');
      let result = await this.$validator.validateAll();
      if(!result) {
        return;
      }

      try {
        this.loading = true;
        let params = new URLSearchParams();
        params.append('firstname', this.firstname);
        params.append('lastname', this.lastname);
        params.append('username', this.username);
        params.append('email', this.email);
        await Cytomine.instance.api.post(`${Cytomine.instance.host}/login/createAccount`, params);
        this.success = true;
      }
      catch(error) {
        console.log(error);
        if(error.response && error.response.status === 409) {
          this.$notify({type: 'error', text: this.$t('notif-error-register-username-exists')});
        }
        else {
          this.$notify({type: 'error', text: this.$t('notif-error-register')});
        }
      }
      this.loading = false;
    }
  }
};
</script>
