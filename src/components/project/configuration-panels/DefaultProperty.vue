<template>
<b-message v-if="error" type="is-danger" has-icon icon-size="is-small">
  <h2> {{ $t('error') }} </h2>
  <p> {{ $t('unexpected-error-info-message') }} </p>
</b-message>
<b-field grouped v-else>
  <b-autocomplete
    v-model="searchString"
    :data="filteredKeys"
    :placeholder="$t('no-default-property')"
    :loading="loading"
    :disabled="loading"
    size="is-small"
  >
    <template #empty>{{$t('no-property-matching-search-string', {searchString})}}</template>
  </b-autocomplete>

  <button
    class="button is-small"
    @click="confirm()"
    :disabled="defaultPropertyProp && searchString === defaultPropertyProp.value"
  >
    {{$t('button-save')}}
  </button>
</b-field>
</template>

<script>
import {Property, PropertyCollection} from 'cytomine-client';
import constants from '@/utils/constants.js';

export default {
  data() {
    return {
      loading: true,
      error: false,

      searchString: '',

      defaultPropertyProp: null, // project property storing the property to display by default when opening an image
      keysAnnotationProps: []
    };
  },
  computed: {
    project() {
      return this.$store.state.currentProject.project;
    },
    filteredKeys() {
      if(!this.searchString.length) {
        return this.keysAnnotationProps;
      }

      let str = this.searchString.toLowerCase();
      return this.keysAnnotationProps.filter(key => key.toLowerCase().indexOf(str) >= 0);
    }
  },
  methods: {
    async fetchKeysAnnotationProperties() {
      this.keysAnnotationProps = await PropertyCollection.fetchKeysAnnotationProperties(this.project.id);
    },

    async fetchDefaultPropertyProp() {
      try {
        let projectProps = (await PropertyCollection.fetchAll({object: this.project})).array;
        this.defaultPropertyProp = projectProps.find(prop => prop.key === constants.DEFAULT_PROPERTY_KEY);
      }
      catch(error) {
        console.log(error);
      }

      if(!this.defaultPropertyProp) {
        this.defaultPropertyProp = new Property({key: constants.DEFAULT_PROPERTY_KEY, value: ''}, this.project);
      }

      this.searchString = this.defaultPropertyProp.value;
    },

    confirm() {
      if(this.keysAnnotationProps.includes(this.searchString) || !this.searchString.length) {
        this.save();
        return;
      }

      // if user entered value that is not yet used as key for an annotation property, ask confirmation
      this.$dialog.confirm({
        title: this.$t('confirm-default-property'),
        message: this.$t('confirm-default-property-not-used-in-project', {key: this.searchString}),
        type: 'is-info',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => this.save(),
        onCancel: () => this.searchString = this.defaultPropertyProp.value
      });
    },

    async save() {
      this.defaultPropertyProp.value = this.searchString;
      try {
        if(!this.defaultPropertyProp.value.length) { // empty property
          if(!this.defaultPropertyProp.isNew()) { // property exists
            await this.defaultPropertyProp.delete();
            this.defaultPropertyProp = new Property({key: constants.DEFAULT_PROPERTY_KEY, value: ''}, this.project);
          }
        }
        else {
          await this.defaultPropertyProp.save();
        }
        this.$notify({type: 'success', text: this.$t('notif-success-default-property-update')});
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-default-property-update')});
      }
    }
  },
  async created() {
    try {
      await Promise.all([
        this.fetchKeysAnnotationProperties(),
        this.fetchDefaultPropertyProp()
      ]);
    }
    catch(error) {
      console.log(error);
      this.error = true;
    }

    this.loading = false;
  }
};
</script>
