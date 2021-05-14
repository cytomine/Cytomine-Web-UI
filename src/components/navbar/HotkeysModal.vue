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
<cytomine-modal-card :title="$t('shortcuts')" @close="$parent.close()">
  <div v-for="category in categories" :key="category">
    <h2>{{$t(`shortcut-${category}`)}}</h2>
    <b-table :data="filteredShortcuts(category)" class="shortcut-list">
      <template #default="{row: shortcut}">
        <b-table-column field="name" :label="$t('description')">
          {{$t(`shortcut-${shortcut.name}`)}}
        </b-table-column>

        <b-table-column field="val" :label="$t('shortcut')">
          <span v-for="(k, index) in shortcut.key" :key="`${category}${shortcut.name}${k}`">
            <span class="key">
              <i v-if="k === 'click'" class="fas fa-mouse-pointer"></i>
              <i v-else-if="k === 'drag'" class="fas fa-hand-pointer"></i>
              <i v-else-if="k === '+'" class="fas fa-plus"></i>
              <i v-else-if="k === '-'" class="fas fa-minus"></i>
              <i v-else-if="k === 'arrowleft'" class="fas fa-arrow-left"></i>
              <i v-else-if="k === 'arrowright'" class="fas fa-arrow-right"></i>
              <i v-else-if="k === 'arrowup'" class="fas fa-arrow-up"></i>
              <i v-else-if="k === 'arrowdown'" class="fas fa-arrow-down"></i>
              <span v-else-if="k === 'meta'">&#8984; Cmd</span>
              <span v-else-if="k === 'shift'">&#8679; Shift</span>
              <span v-else-if="k === 'alt'">&#8997; Alt</span>
              <span v-else-if="k === 'pageup'">Page Up</span>
              <span v-else-if="k === 'pagedown'">Page Down</span>
              <span v-else-if="k === 'del'">Delete</span>
              <span v-else>{{k}}</span>
            </span>
            <template v-if="index < shortcut.key.length - 1">+</template>
          </span>
        </b-table-column>
      </template>
    </b-table>
  </div>
</cytomine-modal-card>
</template>

<script>
import CytomineModalCard from '@/components/utils/CytomineModalCard';
import shortcuts from '@/utils/shortcuts.js';

export default {
  name: 'hotkeys-modal',
  components: {CytomineModalCard},
  data() {
    return {
      categories: ['general', 'viewer-nav', 'viewer-tool', 'viewer-toggle', 'text-editor']
    };
  },
  computed: {
    shortcuts() {
      return Object.entries(shortcuts).map(([name, key]) => {
        return {name, key};
      });
    }
  },
  methods: {
    filteredShortcuts(category) {
      return this.shortcuts.filter(shortcut => {
        return shortcut.name.startsWith(`${category}-`);
      });
    }
  }
};
</script>

<style scoped>
.modal-card, .modal-card-body {
  width: 50vw;
  min-width: 600px;
  font-weight: normal;
}

.key {
  min-width: 3rem;
  height: 2.25rem;
  border: 1px solid #ddd;
  padding: 0.5em 1em !important;
  margin: 0 0.3em 0 0.3em;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
  color: #888;
  background: #f8f8f8;
  font-weight: 600;
  text-transform: capitalize;
}

.shortcut-list {
  margin-bottom: 2em;
}

>>> td, >>> th {
  vertical-align: middle !important;
  width: 50%;
}
</style>

