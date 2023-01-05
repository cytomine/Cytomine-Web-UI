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
<div>
  <h2>{{$t('welcome-message')}}</h2>
  <b-field class="radio-buttons-fullwidth">
    <b-radio-button v-model="activeTab" native-value="welcome" type="is-link">
      {{$t('dashboard-welcome-message')}}
    </b-radio-button>

    <b-radio-button v-model="activeTab" native-value="login" type="is-link">
      {{$t('login-welcome-message')}}
    </b-radio-button>
  </b-field>

  <div v-if="activeTab==='welcome'">
    <div class="columns">
      <div class="column is-full" style="padding-left:3.5em;padding-bottom: 3.5em;">
        <cytomine-quill-editor v-model="welcomeConfig.value" />
      </div>
    </div>
  </div>
  <div v-else>
    <div class="columns">
      <div class="column is-full" style="padding-left:3.5em;padding-bottom: 3.5em;">
        <cytomine-quill-editor v-model="loginWelcomeConfig.value" />
      </div>
    </div>
  </div>

<!--  <p class="has-text-right">-->
<!--    <button class="button is-link" @click="save">{{$t('button-save')}}</button>-->
<!--  </p>-->

  <hr/>
  <h2>{{$t('top-menu')}}</h2>
  <div class="columns">
    <div class="column is-one-quarter" style="padding-left:3.5em;">
      <h3>{{$t('top-menu-color')}}</h3>
    </div>
    <div class="column is-one-quarter">
      <div class="columns">
        <div class="column is-four-fifths">
          <b-input
            v-on:updateMenuColor="updateMenuColor($event.target.value)"
            v-model="topMenuColorConfig.value"
            placeholder=""
          />
        </div>
        <button class="button color-picker-button" :style="`background-color:${topMenuColorConfig.value};`" @click="openMenuColorModal()"></button>
      </div>
    </div>
    <div class="column is-one-half">
      <article class="message is-info is-small">
        <section class="message-body">
          <div class="media">
            <div class="media-left">
              <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
            </div>
            <div class="media-content">
              {{$t('top-menu-color-description')}} <br/>
              {{$t('top-menu-color-instruction')}} (<a href="https://www.w3schools.com/colors/colors_names.asp" target="_blank">{{$t('top-menu-color-list')}}</a>)
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>

  <div class="columns">
    <div class="column is-one-quarter" style="padding-left:3.5em;">
      <h3>{{$t('top-font-menu-color')}}</h3>
    </div>
    <div class="column is-one-quarter">
      <div class="columns">
        <div class="column is-four-fifths">
          <b-input
            v-on:updateFontMenuColor="updateFontMenuColor($event.target.value)"
            v-model="topFontMenuColorConfig.value"
            placeholder=""
          />
        </div>
        <button class="button color-picker-button" :style="`background-color:${topFontMenuColorConfig.value};`" @click="openFontMenuColorModal()"></button>
      </div>
    </div>
    <div class="column is-one-half">
      <article class="message is-info is-small">
        <section class="message-body">
          <div class="media">
            <div class="media-left">
              <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
            </div>
            <div class="media-content">
              {{$t('top-font-menu-color-description')}} <br/>
              {{$t('top-menu-color-instruction')}} (<a href="https://www.w3schools.com/colors/colors_names.asp" target="_blank">{{$t('top-menu-color-list')}}</a>)
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>


  <div class="columns" style="height: 6.5em;">
    <div class="column is-one-quarter" style="padding-left:3.5em;">
      <h3>{{$t('logo')}}</h3>
    </div>
    <div class="column is-one-quarter has-text-centered">
      <div class="upload-container">
        <div v-if="!fetching">
          <b-upload v-model="selectedImage" type="is-link" drag-drop :disabled="logoConfig.value != '' ? true : false" >
            <div class="content has-text-centered b-upload">
              <template v-if="!logoConfig.value">
                <p><i class="fas fa-upload fa-3x"></i></p>
                <p>{{$t('choose-file-or-drop')}}</p>
              </template>
              <div v-else>
                <div class="cross" @click="resetLogoConfig">X</div>
                <img :src="logoConfig.value" id="upload_logo" alt="Logo" class="logo"/>
              </div>
            </div>
          </b-upload>
        </div>
        <div v-if="!isValidImage()">
          <b-field
            type="is-danger"
            :message="$t('logo-upload-error-message')">
          </b-field>
        </div>
        <div v-if="!isValidSVG()">
          <b-field
            type="is-danger"
            :message="$t('logo-upload-svg-error-message')">
          </b-field>
        </div>
      </div>
    </div>
    <div class="column is-one-half">
      <article class="message is-info is-small">
        <section class="message-body">
          <div class="media">
            <div class="media-left">
              <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
            </div>
            <div class="media-content">
              {{$t('logo-description')}}
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>


  <hr/>

  <div v-if="ltiEnabled">
    <h2>{{ $t('lti') }}</h2>

    <h3 class="has-text-weight-bold lti-consumer">{{ $t('lti-consumers') }}</h3>
    <button class="button is-small add-prop is-marginless"  @click="ltiConsumers.push({key:'', name:'',secret:'',usernameParameter:''})" key="showForm">
      {{$t('button-add')}}
    </button>
    <div style="margin-top: 1em;" class="columns" v-for="(consumer, index) in ltiConsumers">
      <div class="column is-one-fifth" style="padding-left:3.5em;">

        <span class="has-text-weight-bold">{{$t('lti-consumer') + ' ' + index}} </span>

        <!--      <button class="edit is-small" :title="$t('button-edit')" @click="editedLTI=index">-->
        <!--        <i class="fas fa-pencil-alt"></i>-->
        <!--      </button>-->
        <button class="delete is-small" :title="$t('button-delete')" @click="confirmLTIConsumerDeletion(index)"></button>
        <!--      <button class="button is-link" @click="ltiConsumers.splice(index, 1)">{{$t('button-remove')}}</button>-->

      </div>

      <div class="column is-one-fifth" style="padding-left:3.5em;">
        <div class="column is-one-half" style="padding-left:3.5em;">
          {{$t('lti-key')}}
        </div>
        <div class="column is-one-half">
          <b-input v-model="ltiConsumers[index].key" placeholder=""/>
          <!--        <span v-if="editedLTI!=index" >{{ltiConsumers[index].key}}</span>-->
        </div>
      </div>

      <div class="column is-one-fifth" style="padding-left:3.5em;">
        <div class="column is-one-half" style="padding-left:3.5em;">
          {{$t('lti-name')}}
        </div>
        <div class="column is-one-half">
          <b-input v-model="ltiConsumers[index].name" placeholder=""/>
        </div>
      </div>

      <div class="column is-one-fifth" style="padding-left:3.5em;">
        <div class="column is-one-half" style="padding-left:3.5em;">
          {{$t('lti-secret')}}
        </div>
        <div class="column is-one-half">
          <b-input v-model="ltiConsumers[index].secret" placeholder=""/>
        </div>
      </div>

      <div class="column is-one-fifth" style="padding-left:3.5em;">
        <div class="column is-one-half" style="padding-left:3.5em;">
          {{$t('lti-username-parameter')}}
        </div>
        <div class="column is-one-half">
          <b-input v-model="ltiConsumers[index].usernameParameter" placeholder=""/>
        </div>
      </div>
    </div>
  </div>







  <div v-if="ldapEnabled">
    <h2>{{ $t('ldap') }}</h2>

    <div class="columns">
      <div class="column is-one-quarter" style="padding-left:3.5em;">
        <h3>{{$t('ldap-server')}}</h3>
      </div>
      <div class="column is-one-quarter">
        <b-input
          v-model="ldap.server.value"
          placeholder=""
        />
      </div>
      <div class="column is-one-half">
        <article class="message is-info is-small">
          <section class="message-body">
            <div class="media">
              <div class="media-left">
                <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
              </div>
              <div class="media-content">
                {{$t('ldap-server-explaination')}}
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
    <div class="columns">
      <div class="column is-one-quarter" style="padding-left:3.5em;">
        <h3>{{$t('ldap-principal')}}</h3>
      </div>
      <div class="column is-one-quarter">
        <b-input
          v-model="ldap.principal.value"
          placeholder=""
        />
      </div>
      <div class="column is-one-half">
        <article class="message is-info is-small">
          <section class="message-body">
            <div class="media">
              <div class="media-left">
                <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
              </div>
              <div class="media-content">
                {{$t('ldap-principal-explaination')}}
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
    <div class="columns">
      <div class="column is-one-quarter" style="padding-left:3.5em;">
        <h3>{{$t('ldap-password')}}</h3>
      </div>
      <div class="column is-one-quarter">
        <b-input
          v-model="ldap.password.value"
          placeholder=""
        />
      </div>
      <div class="column is-one-half">
        <article class="message is-info is-small">
          <section class="message-body">
            <div class="media">
              <div class="media-left">
                <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
              </div>
              <div class="media-content">
                {{$t('ldap-password-explaination')}}
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
    <div class="columns">
      <div class="column is-one-quarter" style="padding-left:3.5em;">
        <h3>{{$t('ldap-search')}}</h3>
      </div>
      <div class="column is-one-quarter">
        <b-input
          v-model="ldap.search.value"
          placeholder=""
        />
      </div>
      <div class="column is-one-half">
        <article class="message is-info is-small">
          <section class="message-body">
            <div class="media">
              <div class="media-left">
                <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
              </div>
              <div class="media-content">
                {{$t('ldap-search-explaination')}}
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
    <div class="columns">
      <div class="column is-one-quarter" style="padding-left:3.5em;">
        <h3>{{$t('ldap-attributes')}}</h3>
      </div>
      <div class="column is-one-quarter">
        <b-input
          v-model="ldap.attributes.value"
          placeholder=""
        />
      </div>
      <div class="column is-one-half">
        <article class="message is-info is-small">
          <section class="message-body">
            <div class="media">
              <div class="media-left">
                <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
              </div>
              <div class="media-content">
                {{$t('ldap-attributes-explaination')}}
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
    <div class="columns">
      <div class="column is-one-quarter" style="padding-left:3.5em;">
        <h3>{{$t('ldap-passwordAttributeName')}}</h3>
      </div>
      <div class="column is-one-quarter">
        <b-input
          v-model="ldap.passwordAttributeName.value"
          placeholder=""
        />
      </div>
      <div class="column is-one-half">
        <article class="message is-info is-small">
          <section class="message-body">
            <div class="media">
              <div class="media-left">
                <span class="icon is-small is-info"><i class="fas fa-info-circle"></i></span>
              </div>
              <div class="media-content">
                {{$t('ldap-passwordAttributeName-explaination')}}
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  </div>

  <p class="has-text-right">
    <button class="button is-link" @click="save">{{$t('button-save')}}</button>
  </p>
</div>
</template>

<script>
import CytomineQuillEditor from '@/components/form/CytomineQuillEditor';
import {Cytomine, Configuration} from 'cytomine-client';
import constants from '@/utils/constants.js';
import ColorModal from './ColorModal';

export default {
  name: 'admin-configuration',
  components: {CytomineQuillEditor},
  data() {
    return {
      activeTab: 'login',
      fetching: true,
      ltiConsumers: [],
      ltiEnabled: false,
      ldapEnabled: false,
      editedLTI: null,
      welcomeConfig: new Configuration({key: constants.CONFIG_KEY_WELCOME, value: '', readingRole: 'all'}),
      loginWelcomeConfig: new Configuration({key: constants.CONFIG_KEY_LOGIN_WELCOME, value: '', readingRole: 'all'}),
      topMenuColorConfig: new Configuration({key: constants.CONFIG_KEY_COLOR_TOP_MENU, value: '', readingRole: 'all'}),
      topFontMenuColorConfig: new Configuration({key: constants.CONFIG_KEY_FONT_COLOR_TOP_MENU, value: '', readingRole: 'all'}),
      logoConfig: new Configuration({key: constants.CONFIG_KEY_LOGO_TOP_MENU, value: '', readingRole: 'all'}),
      isLogoConfigPresent: false,
      selectedImage: null,
      selectedImageSize: {width: 0, height: 0},
      ltiConsumersConfig: new Configuration({key: constants.CONFIG_KEY_LTI_CONSUMERS, value: '[]', readingRole: 'all'}),
      ldap: {
        server: new Configuration({key: constants.CONFIG_KEY_LDAP_SERVER, value: '', readingRole: 'admin'}),
        principal: new Configuration({key: constants.CONFIG_KEY_LDAP_PRINCIPAL, value: '', readingRole: 'admin'}),
        password: new Configuration({key: constants.CONFIG_KEY_LDAP_PASSWORD, value: '', readingRole: 'admin'}),
        search: new Configuration({key: constants.CONFIG_KEY_LDAP_SEARCH, value: '', readingRole: 'admin'}),
        attributes: new Configuration({key: constants.CONFIG_KEY_LDAP_ATTRIBUTES, value: '', readingRole: 'admin'}),
        passwordAttributeName: new Configuration({key: constants.CONFIG_KEY_LDAP_PASSWORD_ATTRIBUTE_NAME, value: '', readingRole: 'admin'}),
      }
    };
  },
  watch: {
    selectedImage(file) {
      if (file) {

        let reader = new FileReader();

        // Read file and return the content as base 64 encoded string
        reader.readAsDataURL(file);
        reader.onload = evt => {

          let img = new Image();
          img.onload = () => {
            this.selectedImageSize.width = img.width;
            this.selectedImageSize.height = img.height;
          };

          let encodedFile = evt.target.result;
          this.logoConfig.value = encodedFile;
          img.src = encodedFile;
        };

      }
    }
  },
  methods: {
    isSVG(){
      return this.selectedImage.type == 'image/svg+xml';
    },
    isValidSVG(){
      if(this.selectedImage && this.isSVG()){
        return (this.selectedImage.size <= 7500);
      }
      return true;
    },
    isValidImage(){
      if(this.selectedImage && !this.isSVG()){
        return (this.selectedImageSize.width <= 250 && this.selectedImageSize.height <= 250);
      }
      return true;
    },
    async save() {
      try {
        this.mailModeConfirm = false;
        if(!this.isValidSVG()) {
          this.$notify({type: 'error', text: this.$t('logo-upload-svg-error-message')});
          throw new TypeError(this.$t('logo-upload-svg-error-message'));
        }
        else if(!this.isValidImage()) {
          this.$notify({type: 'error', text: this.$t('logo-upload-error-message')});
          throw new TypeError(this.$t('logo-upload-error-message'));
        }
        if(!this.welcomeConfig.value) {
          try {
            await this.welcomeConfig.delete();
          } catch (error) {
            // may already have been deleted
          }
        }
        else {
          await this.welcomeConfig.save();
        }

        if(!this.loginWelcomeConfig.value) {
          try {
            await this.loginWelcomeConfig.delete();
          } catch (error) {
            // may already have been deleted
          }
        }
        else {
          await this.loginWelcomeConfig.save();
        }
        if(!this.topMenuColorConfig.value && this.topMenuColorConfig.id!=null) {
          await this.topMenuColorConfig.delete();
        }
        else if (this.topMenuColorConfig.value) {
          await this.topMenuColorConfig.save();
        }
        if(!this.topFontMenuColorConfig.value && this.topFontMenuColorConfig.id!=null) {
          await this.topFontMenuColorConfig.delete();
        }
        else if (this.topFontMenuColorConfig.value) {
          await this.topFontMenuColorConfig.save();
        }
        if(!this.logoConfig.value && this.isLogoConfigPresent) {
          this.isLogoConfigPresent = false;
          await this.logoConfig.delete();
        }
        else if (this.logoConfig.value) {
          this.isLogoConfigPresent = true;
          await this.logoConfig.save();
        }
        if((!this.ltiConsumers || this.ltiConsumers.length===0) && this.ltiConsumersConfig.id!=null) {
          await this.ltiConsumersConfig.delete();
        }
        else if(this.ltiConsumers || this.ltiConsumers.length>0){
          this.ltiConsumersConfig.value = JSON.stringify(this.ltiConsumers);
          await this.ltiConsumersConfig.save();
        }

        if(this.ldapEnabled) {
          for (const [key, configuration] of Object.entries(this.ldap)) {
            console.log(`${key}: ${configuration}`);

            if(!configuration.value) {
              try {
                await configuration.delete();
              } catch (error) {
                // may already have been deleted
              }
            }
            else {
              await configuration.save();
            }

          }
        }
        this.$eventBus.$emit('configChanged', '');
        this.$notify({type: 'success', text: this.$t('notif-success-configuration-update')});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-configuration-update')});
      }
    },
    openModal(props, events) {
      this.$buefy.modal.open({
        parent: this,
        component: ColorModal,
        props,
        events,
        hasModalCard: true
      });
    },
    updateMenuColor(color) {
      this.topMenuColorConfig.value = color;
    },
    updateFontMenuColor(fontColor) {
      this.topFontMenuColorConfig.value = fontColor;
    },
    openMenuColorModal() {
      let props = {
        currentColor: this.topMenuColorConfig ? this.topMenuColorConfig.value : null,
      };
      let events= {
        updateColor: this.updateMenuColor,
      };
      this.openModal(props, events);
    },
    openFontMenuColorModal() {
      let props = {
        currentColor: this.topFontMenuColorConfig ? this.topFontMenuColorConfig.value : null,
      };
      let events= {
        updateColor: this.updateFontMenuColor,
      };
      this.openModal(props, events);
    },
    resetLogoConfig(event) {
      event.preventDefault();
      this.logoConfig.value = '';
      this.selectedImage = null;
    },
    confirmLTIConsumerDeletion(index) {
      this.$buefy.dialog.confirm({
        title: this.$t('confirm-deletion'),
        message: this.$t('lti-confirm-deletion'),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => {
          {
            this.ltiConsumers.splice(index, 1);
          }
        }
      });
    },

  },
  async created() {
    try {
      let {ltiEnabled, ldapEnabled} = await Cytomine.instance.ping();
      this.ltiEnabled = ltiEnabled;
      this.ldapEnabled = ldapEnabled;
    }
    catch(error) {
      this.ltiEnabled = false;
      this.ldapEnabled = false;
    }

    try {
      await this.welcomeConfig.fetch();
    }
    catch(error) {
      // no welcome message currently set
    }
    try {
      await this.loginWelcomeConfig.fetch();
    }
    catch(error) {
      // no welcome message currently set
    }
    try {
      await this.topMenuColorConfig.fetch();
      await this.topFontMenuColorConfig.fetch();
    }
    catch(error) {
      // ignored
    }
    try {
      await this.logoConfig.fetch();
      if(this.logoConfig.value){
        this.isLogoConfigPresent = true;
      }
    }
    catch(error) {
      // ignored
    }

    try {
      await this.ltiConsumersConfig.fetch();
      this.ltiConsumers = JSON.parse(this.ltiConsumersConfig.value);
    }
    catch(error) {
      // no consumers definitions
    }


    try {
      await this.ltiConsumersConfig.fetch();
      this.ltiConsumers = JSON.parse(this.ltiConsumersConfig.value);
    }
    catch(error) {
      // no consumers definitions
    }

    if(this.ldapEnabled) {
      for (const [key, configuration] of Object.entries(this.ldap)) {
        console.log(`${key}: ${configuration}`);
        try {
          await configuration.fetch();
        } catch (error) {
          // may not exists
        }
      }
    }

    this.fetching = false;
  }
};
</script>

<style scoped>

.upload-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 90%;
}

>>> .cytomine-quill-editor {
  min-height: 25em !important;
  max-height: 25em !important;
}

.button {
  margin-top: 1em;
}

.color-picker-button {
  margin-top: 0.75em;
  width: 2.25em;
}

.b-upload{
  padding: 0em 0.5em 0em 0.5em;
  width: 20em;
  height: 6em;
  opacity: 1;
}

.upload .upload-draggable.is-disabled {
  opacity: 1;
  cursor: not-allowed;
}

.logo{
  margin-top: 0.5em;
  margin-left: 1.5em;
  max-width : 30%;
}

.cross{
  float: right;
  transform: scale(1.5, 1.2);
  cursor: pointer;
}

button.edit {
  height: 16px;
  width: 16px;
  background-color: rgba(10, 10, 10, 0.2);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  pointer-events: auto;
  display: inline-block;
  font-size: 8px;
  padding: 0;
  outline: none;
  position: relative;
  vertical-align: top;
  color: white;
  margin-left: 0.5em;
  line-height: 17px;
  margin: 0;
  margin-right: 0.25em;
}

.lti-consumer {
  display: inline-block;
  margin-top: 0em;
  padding-right: 2px;
}
</style>
