<template>
  <div class="image-format">
    <h2>{{ format }}</h2>
    <div class="columns is-multiline">
      <div class="column is-narrow" v-for="(value, key) in filters" :key="key">
        <div class="box">
          <div class="filter">{{ key }}: {{ value }}</div>
          <button class="delete" @click="removeFilter(key)"/>
        </div>
      </div>
    </div>

    <div class="search-block" v-if="filteredKeys">
      <b-dropdown v-model="currentKey" :placeholder="$t('search-placeholder')" scrollable>
        <template #trigger>
          <b-button :label="currentKey" type="is-primary"/>
        </template>

        <b-dropdown-item custom>
          <b-input
            v-model="searchKey"
            :placeholder="$t('search-placeholder')"
            icon="search"
            type="search"
          />
        </b-dropdown-item>

        <b-dropdown-item v-for="key in filteredKeys" :key="key" :value="key">
          {{ key }}
        </b-dropdown-item>
      </b-dropdown>

      <div class="metadata" v-if="type[currentKey] === Number">
        <div class="metadata-slider">
          <cytomine-slider v-model="sliderValue" :max="max[currentKey]+1"/>
        </div>
      </div>

      <b-autocomplete
        class="search-images"
        v-else
        v-model="searchValue"
        :data="searchChoices"
        :disabled="currentKey === 'Select metadata'"
        :placeholder="$t('search-placeholder')"
        icon="search"
        type="search"
        clearable
      />

      <b-button
        @click="searchImage"
        :disabled="(searchValue === '') && (type[currentKey] === String)"
      >
        {{ $t('button-add') }}
      </b-button>
    </div>
  </div>
</template>

<script>
import {Cytomine} from 'cytomine-client';

import CytomineSlider from '@/components/form/CytomineSlider.vue';

export default {
  name: 'image-format',
  components: {
    CytomineSlider,
  },
  props: {
    format: String,
    imageIds: Array,
    keys: Array,
    max: Object,
    type: Object,
  },
  data() {
    return {
      currentKey: 'Select metadata',
      currentValue: '',
      searchChoices: [],
      searchKey: '',
      searchValue: '',
      sliderValues: {},
    };
  },
  computed: {
    searchModule() {
      return this.$store.getters['currentProject/currentMetadataSearch'];
    },
    filters: {
      get() {
        if (this.format in this.searchModule) {
          return this.searchModule[this.format];
        }

        return {};
      },
      set(value) {
        this.currentValue = value;
        this.$store.commit(
          'currentProject/setCurrentMetadataSearch',
          {format: this.format, key: this.currentKey, searchValue: value},
        );
      }
    },
    sliderValue: {
      get() {
        return this.sliderValues[this.currentKey];
      },
      set(value) {
        this.$set(this.sliderValues, this.currentKey, value);
        this.searchValue = this.sliderValues[this.currentKey];
      }
    },
    filteredKeys() {
      return this.keys.filter((item) => item.toLowerCase().indexOf(this.searchKey.toLowerCase()) >= 0);
    },
  },
  methods: {
    async fetchAutoCompletion() {
      return (await Cytomine.instance.api.get(
        'search/autocomplete.json',
        {params: {key: this.currentKey, searchTerm: this.searchValue}}
      )).data['collection'];
    },
    async removeFilter(key) {
      this.$store.commit(
        'currentProject/removeMetadataFilter',
        {format: this.format, key},
      );

      await this.searchImage();
      this.$forceUpdate();
    },
    async searchImage() {
      if (this.searchValue) {
        this.filters = this.searchValue;
        this.searchValue = '';
      }

      let filteredImageIds = this.imageIds;
      if (Object.keys(this.filters).length) {
        let data = {
          'filters': this.filters,
          'imageIds': this.imageIds,
        };

        filteredImageIds = (await Cytomine.instance.api.post('search.json', data)).data['collection'];
      }

      this.$eventBus.$emit('includeImageIDs', this.format, filteredImageIds);
    }
  },
  watch: {
    currentKey() {
      if (this.type[this.currentKey] === Number) {
        this.searchValue = this.sliderValues[this.currentKey];
      }
      else {
        this.searchValue = '';
      }
    },
    async searchValue() {
      if (this.type[this.currentKey] === String) {
        this.searchChoices = await this.fetchAutoCompletion();
      }
    }
  },
  created() {
    this.$store.commit('currentProject/setImageFormat', this.format);

    this.keys.forEach(key => this.sliderValues[key] = [0, this.max[key]]);
  }
};
</script>

<style scoped>
.box {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.delete {
  float: right;
}

.filter {
  display: flex;
  margin-right: 10px;
}

.image-format {
  margin: 10px;
}

.metadata {
  width: 300px;
}

.metadata-slider {
  flex-grow: 3;
}

.search-block {
  display: flex;
}

>>> .search-images {
  display: flex;
  max-width: 30rem;
  margin-left: 1rem;
  margin-right: 1rem;
}
</style>
