<template>
<b-message v-if="error" type="is-danger" has-icon icon-size="is-small">
  <slot name="error">
    <h2> {{ $t('error') }} </h2>
    <p> {{ $t('unexpected-error-info-message') }} </p>
  </slot>
</b-message>
<div v-else class="cytomine-table-wrapper">
  <b-loading :is-full-page="false" :active="!data" />
  <b-table
    v-if="data"
    :data="data"
    :loading="loading"
    paginated
    backend-pagination
    :total="total"
    :per-page="internalPerPage"
    :current-page.sync="internalCurrentPage"
    pagination-size="is-small"
    :detailed="detailed"
    :detail-key="detailKey"
    :opened-detailed="openedDetailed.slice()" @update:openedDetailed="$emit('update:openedDetailed', $event)"
    backend-sorting
    :default-sort="sort"
    :default-sort-direction="order"
    @sort="updateSort"
  >
    <template #default="{row, index}">
      <slot :row="row" :index="index"></slot>
    </template>

    <template #detail="{row, index}">
      <slot name="detail" :row="row" :index="index"></slot>
    </template>

    <template #empty>
      <div class="content has-text-grey has-text-centered">
        <slot name="empty" :row="row" :index="index">
          {{$t('no-result')}}
        </slot>
      </div>
    </template>

    <template #bottom-left>
      <b-select v-model="internalPerPage" size="is-small">
        <option v-for="option in perPageOptions" :key="option" :value="option">
          {{$t('count-per-page', {count: option})}}
        </option>
      </b-select>
    </template>
  </b-table>
</div>
</template>

<script>
export default {
  name: 'cytomine-table',
  props: {
    collection: Object,
    perPageOptions: {type: Array, default: () => [10, 25, 50, 100]},
    perPage: {type: Number, default: 25},
    currentPage: {type: Number, default: 1},
    detailed: {type: Boolean, default: true},
    detailKey: {type: String, default: 'id'},
    openedDetailed: {type: Array, default: () => []},
    sort: {type: String},
    order: {type: String, default: 'asc'},
    revision: Number, // updating this value will result in update of table data
    refreshInterval: {type: Number, default: 0} // if > 0, table data will be refreshed according to refreshInterval (expressed in ms)
  },
  data() {
    return {
      data: null,
      error: false,
      loading: true,
      total: 0,
      internalCurrentPage: null,
      internalPerPage: null,
      internalSort: null,
      internalOrder: null,
      timeout: null
    };
  },
  computed: {
    internalCollection() {
      let collection = this.collection.clone();
      collection.max = this.internalPerPage;
      collection.sort = this.internalSort;
      collection.order = this.internalOrder;
      return collection;
    }
  },
  watch: {
    internalCollection() {
      this.fetchPage(true);
    },
    internalCurrentPage(page, previousValue) {
      if(previousValue) { // do not trigger change for value initialization
        this.$emit('update:currentPage', page);
        this.fetchPage(true);
      }
    },
    internalPerPage(perPage) {
      this.$emit('update:perPage', perPage);
    },
    revision() {
      this.fetchPage();
    },
    refreshInterval(value) {
      if(value === 0) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      else if(!this.timeout) { // user provided a valid refresh interval, and no fetch page planned => relaunch fetch page
        this.fetchPage();
      }
    }
  },
  methods: {
    updateSort(sort, order) {
      this.internalSort = sort;
      this.internalOrder = order;
      this.$emit('update:sort', sort);
      this.$emit('update:order', order);
    },
    async fetchPage(showLoading=false) {
      if(showLoading) {
        this.loading = true;
      }

      try {
        let data = await this.internalCollection.fetchPage(this.internalCurrentPage - 1);
        this.data = data.array;
        this.total = data.totalNbItems;
      }
      catch(error) {
        if(this.internalCurrentPage > 1) { // error may be due to the page number (not enough elements) => retry on first page
          this.internalCurrentPage = 1;
          return;
        }

        console.log(error);
        this.error = true;
        return;
      }

      this.loading = false;

      clearTimeout(this.timeout);
      if(this.refreshInterval) {
        this.timeout = setTimeout(this.fetchPage, this.refreshInterval);
      }
    },
  },
  created() {
    this.internalCurrentPage = this.currentPage;
    this.internalPerPage = this.perPage;
    this.internalSort = this.sort;
    this.internalOrder = this.order;
  }
};
</script>

<style scoped>
.cytomine-table-wrapper {
  min-height: 10em;
  position: relative;
}
</style>
