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
  <cytomine-quill-editor v-model="welcomeConfig.value" />
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
              {{$t('top-menu-color-instruction')}} (<a href="https://www.w3schools.com/colors/colors_names.asp" target="_blank">Color list</a>)
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
              {{$t('top-menu-color-instruction')}} (<a href="https://www.w3schools.com/colors/colors_names.asp" target="_blank">Color list</a>)
            </div>
          </div>
        </section>
      </article>
    </div>
  </div>

  <hr/>
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
  <p class="has-text-right">
    <button class="button is-link" @click="save">{{$t('button-save')}}</button>
  </p>
</div>
</template>

<script>
import CytomineQuillEditor from '@/components/form/CytomineQuillEditor';
import {Configuration} from 'cytomine-client';
import constants from '@/utils/constants.js';
import ColorModal from './ColorModal';

export default {
  name: 'admin-configuration',
  components: {CytomineQuillEditor},
  data() {
    return {
      ltiConsumers: [],
      editedLTI: null,
      welcomeConfig: new Configuration({key: constants.CONFIG_KEY_WELCOME, value: '', readingRole: 'all'}),
      topMenuColorConfig: new Configuration({key: constants.CONFIG_KEY_COLOR_TOP_MENU, value: '', readingRole: 'all'}),
      topFontMenuColorConfig: new Configuration({key: constants.CONFIG_KEY_FONT_COLOR_TOP_MENU, value: '', readingRole: 'all'}),
      ltiConsumersConfig: new Configuration({key: constants.CONFIG_KEY_LTI_CONSUMERS, value: '[]', readingRole: 'all'}),
    };
  },
  methods: {
    async save() {
      try {
        if(!this.welcomeConfig.value) {
          await this.welcomeConfig.delete();
        }
        else {
          await this.welcomeConfig.save();
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
        if((!this.ltiConsumers || this.ltiConsumers.length===0) && this.ltiConsumersConfig.id!=null) {
          await this.ltiConsumersConfig.delete();
        }
        else if(this.ltiConsumers || this.ltiConsumers.length>0){
          this.ltiConsumersConfig.value = JSON.stringify(this.ltiConsumers);
          await this.ltiConsumersConfig.save();
        }

        this.$eventBus.$emit('configChanged', '');
        this.$notify({type: 'success', text: this.$t('notif-success-configuration-update')});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-welcome-message-update')});
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
      await this.welcomeConfig.fetch();
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
      await this.ltiConsumersConfig.fetch();
      this.ltiConsumers = JSON.parse(this.ltiConsumersConfig.value);
    }
    catch(error) {
      // no consumers definitions
    }
  }
};
</script>

<style scoped>
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
