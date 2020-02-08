<!-- Copyright (c) 2009-2019. Authors: see NOTICE file.

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
    <p class="panel-tabs">
      <a :class="{'is-active': activeTab === 'welcome'}" @click="activeTab = 'welcome'">
        {{$t('welcome-message')}}
      </a>
      <a :class="{'is-active': activeTab === 'tags'}" @click="activeTab = 'tags'">
        {{$t('tags')}}
      </a>
    </p>
    <div class="panel-block">
      <div
        v-show="activeTab === 'welcome'"
        :key="'welcome'"
      >

        <h2>{{$t('welcome-message')}}</h2>
        <cytomine-quill-editor v-model="welcomeConfig.value" />
        <p class="has-text-right">
          <button class="button is-link" @click="save">{{$t('button-save')}}</button>
        </p>
      </div>


      <div
        v-show="activeTab === 'tags'"
        :key="'tags'"
      >

      <button class="button is-link addButton" @click="creationModal = true">
        {{$t('new-tag')}}
      </button>

        <b-table
          :data="tags"
          :paginated="true"
          :per-page="perPage"
          pagination-size="is-small"
        >
          <template #default="{row: tag}">
            <b-table-column
              :field="'name'"
              :label="$t('name')"
              sortable
            >
              {{tag.name}}
            </b-table-column>

            <b-table-column
              :field="'creatorName'"
              :label="$t('creator')"
              sortable
            >
              {{tag.creatorName}}
            </b-table-column>

            <b-table-column
              :field="'created'"
              :label="$t('created')"
              sortable
            >
              {{ Number(tag.created) | moment('ll') }}
            </b-table-column>

            <b-table-column label=" " centered>
              <div class="buttons">
                <button class="button is-small is-link" @click="updateName(tag)">
                  {{$t('rename')}}
                </button>
                <button class="button is-small is-danger" @click="deleteTagDialog(tag)">
                  {{$t('delete')}}
                </button>
              </div>
            </b-table-column>
          </template>

          <template #empty>
            <div class="content has-text-grey has-text-centered">
              <p>{{$t('no-tag')}}</p>
            </div>
          </template>

          <template #bottom-left>
            <b-select v-model="perPage" size="is-small">
              <option value="10">{{$t('count-per-page', {count: 10})}}</option>
              <option value="25">{{$t('count-per-page', {count: 25})}}</option>
              <option value="50">{{$t('count-per-page', {count: 50})}}</option>
              <option value="100">{{$t('count-per-page', {count: 100})}}</option>
            </b-select>
          </template>
        </b-table>
      </div>
    </div>

    <add-tag-modal :active.sync="creationModal" @addTag="refreshTags"/>
  </div>
</template>

<script>
import CytomineQuillEditor from '@/components/form/CytomineQuillEditor';
import RenameModal from '@/components/utils/RenameModal';
import AddTagModal from '@/components/tag/AddTagModal';
import {Configuration, TagCollection} from 'cytomine-client';
import constants from '@/utils/constants.js';

export default {
  name: 'admin-configuration',
  components: {CytomineQuillEditor, RenameModal, AddTagModal},
  data() {
    return {
      activeTab: 'welcome',
      creationModal : false,
      tags : [],
      currentTag : null,
      perPage: 25,
      welcomeConfig: new Configuration({key: constants.CONFIG_KEY_WELCOME, value: '', readingRole: 'all'})
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
        this.$notify({type: 'success', text: this.$t('notif-success-welcome-message-update')});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-welcome-message-update')});
      }
    },
    updateName(tag) {
      this.currentTag = tag;
      this.$modal.open({
        parent: this,
        component: RenameModal,
        props: {title:this.$t('rename'), currentName: tag.name, active:true},
        hasModalCard: true,
        events: {'rename': this.rename}
      });
    },
    async rename(newName) {
      try {
        this.currentTag.name = newName;
        this.currentTag.save();
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-tag-rename', {tagName: newName})
        });
      }
      catch(error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-tag-rename', {tagName: this.currentTag.name})
        });
      }
    },

    deleteTagDialog(tag) {
      this.$dialog.confirm({
        title: this.$t('delete'),
        message: this.$t('delete-tag-confirmation-message', {tagName: tag.name}),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => this.deleteTag(tag)
      });
    },
    deleteTag(tag) {
      try {
        tag.delete();
        this.tags.splice(this.tags.indexOf(tag), 1);
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-tag-delete', {tagName: tag.name})
        });
      }
      catch(error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-tag-delete', {tagName: this.currentTag.name})
        });
      }
    },
    async refreshTags(){
      this.tags = (await TagCollection.fetchAll()).array;
    }

  },
  async created() {
    try {
      await this.welcomeConfig.fetch();
      this.tags = (await TagCollection.fetchAll()).array;
    }
    catch(error) {
      // no welcome message currently set
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
.addButton {
  float: right;
}
</style>
