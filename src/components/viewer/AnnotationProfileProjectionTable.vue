<template>
  <div>
    <b-loading :is-full-page="false" :active="loading" />
    <template v-if="!loading">
      <p class="has-text-centered">
        <a class="button is-link" :href="downloadURL" target="_self">
          {{$t('button-export-as-csv')}}
        </a>
      </p>
      <b-table
          :data="projections"
          :paginated="true"
          :per-page="perPage"
          pagination-size="is-small"
      >
        <template #default="{row: pixel}">
          <b-table-column field="x" :label="'X'" sortable>
            {{pixel.x}}
          </b-table-column>
          <b-table-column field="y" :label="'Y'" sortable>
            {{pixel.y}}
          </b-table-column>
          <b-table-column field="average" :label="$t('average')" sortable>
            {{pixel.average}}
          </b-table-column>
          <b-table-column field="min" :label="$t('minimum')" sortable>
            {{pixel.min}}
          </b-table-column>
          <b-table-column field="max" :label="$t('maximum')" sortable>
            {{pixel.max}}
          </b-table-column>
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
    </template>
  </div>

</template>

<script>
import constants from '@/utils/constants';

export default {
  name: 'AnnotationProfileProjectionTable',
  props: {
    annotation: Object
  },
  data() {
    return {
      projections: [],
      loading: true,
      error: false,
      perPage: 25,
    };
  },
  computed: {
    downloadURL() {
      return `${constants.CYTOMINE_CORE_HOST}/api/annotation/${this.annotation.id}/profile/projections.csv`;
    }
  },
  methods: {
    async fetchProfileProjection() {
      this.loading = true;
      this.projections = (await this.annotation.fetchProfileProjections())['collection'].map(item => {
        return {
          x: item.point[0],
          y: item.point[1],
          min: item.min,
          max: item.max,
          average: item.average
        };
      });
      this.loading = false;
    }
  },
  async mounted() {
    this.fetchProfileProjection();
  }
};
</script>

<style scoped>

</style>