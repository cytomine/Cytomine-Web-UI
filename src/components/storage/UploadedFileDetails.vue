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
  <h2>
    {{$t('file-tree')}}
  </h2>
  <b-message v-if="error" type="is-danger" has-icon icon-size="is-small" size="is-small">
    <h2> {{ $t('error') }} </h2>
    <p> {{ $t('unexpected-error-info-message') }} </p>
  </b-message>
  <sl-vue-tree v-else v-model="nodes" :allowMultiselect="false">
    <template #toggle="{node}">
      <template v-if="!node.isLeaf">
        <i :class="['tree-toggle', 'fas', node.isExpanded ? 'fa-angle-down' : 'fa-angle-right']"></i>
      </template>
    </template>

    <template #title="{node}">
      <p :class="{'target-element': node.data.id === file.id}">{{node.title}}</p>
    </template>

    <template #sidebar="{node}">
      <div class="filesize">
        {{filesize(node.data.size)}}
      </div>
      <div class="status">
        <uploaded-file-status :file="node.data" :iconOnly="true" />
      </div>
      <div class="buttons">
        <a class="button is-small is-link" :href="node.data.downloadURL">
          {{$t('button-download')}}
        </a>
        <button class="button is-small is-danger" @click="confirmDeletion(node.data)">
          {{$t('button-delete')}}
        </button>
      </div>
      <p class="preview">
        <a v-if="node.data.thumbURL" @click="samplePreview = node.data">
          {{$t('sample-preview')}}
        </a>
        <span v-if="node.data.thumbURL && node.data.macroURL">/</span>
        <a v-if="node.data.macroURL" @click="slidePreview = node.data">
          {{$t('slide-preview')}}
        </a>
      </p>
    </template>
  </sl-vue-tree>

  <template v-if="samplePreview">
    <h2>
      {{$t('sample-preview-of', {filename: samplePreview.originalFilename})}}
      <button class="button is-small" @click="samplePreview = null">{{$t('button-hide')}}</button>
    </h2>
    <img :src="samplePreview.thumbURL">
  </template>
  <template v-else-if="slidePreview">
    <h2>
      {{$t('slide-preview-of', {filename: slidePreview.originalFilename})}}
      <button class="button is-small" @click="slidePreview = null">{{$t('button-hide')}}</button>
    </h2>
    <img :src="slidePreview.macroURL">
  </template>
</div>
</template>

<script>
import SlVueTree from 'sl-vue-tree';
import {UploadedFile, UploadedFileCollection} from 'cytomine-client';
import UploadedFileStatus from './UploadedFileStatus';
import filesize from 'filesize';

export default {
  name: 'uploaded-file-details',
  components: {
    SlVueTree,
    UploadedFileStatus
  },
  props: {
    file: Object // WARNING: the root of the tree must be the file or its direct parent
  },
  data() {
    return {
      rootId: null,
      uploadedFiles: [],
      nodes: [],
      slidePreview: null,
      samplePreview: null,
      error: false
    };
  },
  watch: {
    file() {
      this.findRoot();
      this.makeTree();
    },
    slidePreview(val) {
      if(val) {
        this.samplePreview = null; // if slide preview enabled, disable sample preview
      }
    },
    samplePreview(val) {
      if(val) {
        this.slidePreview = null; // if sample preview enabled, disable slide preview
      }
    },
  },
  methods: {
    findRoot() {
      this.rootId = this.file.parentId || this.file.id;
    },
    async makeTree() {
      try {
        this.uploadedFiles = (await UploadedFileCollection.fetchAll({root: this.rootId})).array;
        this.nodes = this.createNodes(null);
      }
      catch(error) {
        console.log(error);
        this.error = true;
      }
    },
    createNodes(idParent) {
      let directChildren = this.uploadedFiles.filter(file => file.parentId === idParent);
      return directChildren.map(file => {
        let children = this.createNodes(file.id);
        return {
          title: file.originalFilename,
          isLeaf: children.length === 0,
          isDraggable: false,
          isExpanded: true,
          data: {downloadURL: file.downloadURL, ...file}, // data converted to object by sl-vue-tree => need to define downloadURL as property
          children
        };
      });
    },
    filesize(size) {
      return filesize(size, {base: 10});
    },
    confirmDeletion(file) {
      this.$buefy.dialog.confirm({
        title: this.$t('confirm-deletion'),
        message: this.$t('confirm-deletion-file'),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => this.deleteFile(file)
      });
    },
    async deleteFile(file) {
      try {
        await UploadedFile.delete(file.id);
        this.$emit('update');
      }
      catch(error) {
        console.log(error);
        let errorValues = error.response.data.errorValues;
        let text;
        if(errorValues && errorValues.projectNames && errorValues.imageNames) {
          text = this.$t('notif-error-delete-used-uploaded-file', {
            projects: errorValues.projectNames.join(', '),
            names: errorValues.imageNames.join(', ')
          });
        }
        else {
          text = this.$t('notif-error-delete-uploaded-file');
        }
        this.$notify({type: 'error', text});
      }
    }
  },
  created() {
    this.findRoot();
    this.makeTree();
  }
};
</script>

<style scoped>
.target-element {
  font-weight: 600;
  min-width: 0; /* to allow correct handling of overflow-wrap */
}

.filesize {
  width: 8em;
  margin-left: 1em;
}

.status {
  width: 5em;
}

.preview {
  width: 20em;
}

.buttons {
  margin-right: 2em;
  margin-bottom: 0 !important;
}

.buttons .button {
  margin-bottom: 0.5em !important;
  margin-top: 0.2em !important;
}

h2:not(:first-child) {
  margin-top: 1em;
  border-bottom: 2px solid #ddd;
}

h2 .button {
  position: relative;
  bottom: 3px;
  margin-left: 0.8em;
  text-transform: none;
}

>>> .sl-vue-tree-sidebar {
  display: flex;
  align-items: top;
  justify-content: flex-end;
}

>>> .sl-vue-tree-gap {
  border: 0 dotted #bbb;
  border-left-width: 1px;
  position: relative;
  right: 0.95em;
  bottom: 1.25em;
}

>>> .sl-vue-tree-toggle {
  background: #fafafa;
  z-index: 1;
}

>>> .sl-vue-tree-gap:nth-last-child(3) {
  border-width: 0 0 1px 1px !important;
}
</style>
