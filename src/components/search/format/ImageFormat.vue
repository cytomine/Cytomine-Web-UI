<template>
  <div>
    <h2>{{ format }}</h2>
    <div v-for="(value, key) in filters" :key="key">
      {{ key }} : {{ value }}
    </div>

    <div class="search-block" v-if="keys">
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

      <b-input
        class="search-images"
        v-model="searchValue"
        :disabled="currentKey === 'Select metadata'"
        :placeholder="$t('search-placeholder')"
        icon="search"
        type="search"
      />

      <b-button @click="filters = searchValue">{{ $t('button-add') }}</b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'image-format',
  props: {
    format: String,
    keys: Array,
  },
  data() {
    return {
      currentKey: 'Select metadata',
      currentValue: '',
      searchKey: '',
      searchValue: '',
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
    filteredKeys() {
      return this.keys.filter((item) => item.toLowerCase().indexOf(this.searchKey.toLowerCase()) >= 0);
    },
  }
};
</script>

<style scoped>
.search-block {
  display: flex;
}

>>> .search-images {
  display: flex;
  max-width: 30rem;
  margin-right: 1rem;
}
</style>
