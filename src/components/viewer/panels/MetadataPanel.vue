<!-- Copyright (c) 2009-2023. Authors: see NOTICE file.

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
    <div class="metadata-viewer">
      <h1>{{ $t('image-metadata') }}</h1>
      <a @click="closeMetadata()">
        <span class="fas fa-times-circle"></span>
      </a>
    </div>

    <b-input
      v-model="searchString"
      :placeholder="$t('search-placeholder')"
      type="search"
      icon="search"
      size="is-small"
    />

    <table class="table">
      <thead>
      <tr>
        <th>Metadata</th>
        <th>Value</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="property in filteredProps" :key="property.id">
        <td><strong>{{ property.key }}</strong></td>
        <td>{{ property.value }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import {getWildcardRegexp} from '@/utils/string-utils';
import {PropertyCollection} from 'cytomine-client';

export default {
  name: 'metadata-panel',
  props: {
    index: String,
  },
  data() {
    return {
      properties: [],
      searchString: '',
    };
  },
  computed: {
    viewerWrapper() {
      return this.$store.getters['currentProject/currentViewer'];
    },
    image() {
      return this.viewerWrapper.images[this.index].imageInstance;
    },
    filteredProps() {
      if (!this.searchString) {
        return this.properties;
      }
      let regexp = getWildcardRegexp(this.searchString);
      return this.properties.filter(prop => regexp.test(prop.key) || regexp.test(prop.value));
    },
  },
  methods: {
    closeMetadata() {
      this.$eventBus.$emit('closeMetadata');
    }
  },
  async created() {
    try {
      this.properties = (await PropertyCollection.fetchAll({object: this.image})).array;
      this.properties.sort((a, b) => a.key.localeCompare(b.key));
    }
    catch (error) {
      console.log(error);
      this.error = true;
    }
  }
};
</script>

<style lang="scss" scoped>
$backgroundPanel: #f2f2f2;

.metadata-viewer {
  display: flex;
}

h1 {
  margin: 0;
  text-align: center;
}

a {
  margin-left: auto;
}

.table {
  background-color: $backgroundPanel;
  margin-bottom: 1em !important;
  font-size: 0.9em;
}

.table thead tr {
  display: block;
}

.table tbody {
  display: block;
  overflow-x: scroll;
  overflow-y: scroll;
  min-width: 30em;
  max-width: 60em;
  min-height: 30em;
  max-height: 30em;
}

.table th {
  width: 1%;
}
</style>
