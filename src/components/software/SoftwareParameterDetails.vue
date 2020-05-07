<template>
  <b-message v-if="error" type="is-danger" has-icon icon-size="is-small" size="is-small">
    <h2> {{ $t('error') }} </h2>
    <p> {{ $t('unexpected-error-info-message') }} </p>
  </b-message>
  <table v-else class="table">
    <b-loading :is-full-page="false" :active="loading" class="small" />
    <tbody v-if="!loading">

    <tr v-if="isPropDisplayed('description')">
      <td class="prop-label">{{$t('description')}}</td>
      <td class="prop-content">
        <cytomine-description :object="parameter" :canEdit="canManageParameter" />
      </td>
    </tr>
    <tr v-if="isPropDisplayed('name')">
      <td class="prop-label">{{$t('name')}}</td>
      <td class="prop-content">
        <code>{{parameter.name}}</code>
      </td>
    </tr>
    <tr v-if="isPropDisplayed('valueKey')">
      <td class="prop-label">{{$t('value-key')}}</td>
      <td class="prop-content">
        <code>{{parameter.valueKey}}</code>
      </td>
    </tr>
    <tr v-if="isPropDisplayed('commandLineFlag')">
      <td class="prop-label">{{$t('command-line-flag')}}</td>
      <td class="prop-content">
        <code>{{parameter.commandLineFlag}}</code>
      </td>
    </tr>
    <!--  <tr v-if="canManageParameter">-->
    <!--    <td class="prop-label">{{$t('actions')}}</td>-->
    <!--    <td class="prop-content">-->
    <!--      <parameter-actions :parameter="parameter" @update="$emit('update', $event)" @delete="$emit('delete')" />-->
    <!--    </td>-->
    <!--  </tr>-->
    </tbody>
  </table>
</template>

<script>
import {get} from '@/utils/store-helpers';
import RenameModal from '@/components/utils/RenameModal';
import CytomineDescription from '@/components/description/CytomineDescription';
import CytomineProperties from '@/components/property/CytomineProperties';
import AttachedFiles from '@/components/attached-file/AttachedFiles';

export default {
  name: 'software-parameter-details',
  props: {
    parameter: Object,
    excludedProperties: {type: Array, default: () => []}
  },
  components: {
    CytomineDescription,
    CytomineProperties,
    AttachedFiles,
    RenameModal
  },
  data() {
    return {
      loading: true,
      error: false,
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    canManageParameter() {
      return this.currentUser.adminByNow;
    },
  },
  methods: {
    isPropDisplayed(prop) {
      return !this.excludedProperties.includes(prop);
    },
    async fetchProjects() {
      this.loading = true;
      this.error = false;

      this.loading = false;
    },
  },
  created() {
    this.fetchProjects();
  }
};
</script>

<style scoped>
.table {
  background: none;
  position: relative;
  height: 3em;
}

td.prop-label {
  white-space: nowrap;
  font-weight: 600;
}

td.prop-content {
  width: 100%;
}
</style>
