<template>
  <cytomine-modal-card
    :title="title"
    class="profile-modal"
    :class="{expanded: expanded}"
    @close="$parent.close()"
  >
    <template #controls>
      <button class="button is-small" @click="expanded = !expanded">
        <i :class="['fas', expanded ? 'fa-compress' : 'fa-expand']"></i>
      </button>
    </template>

    <b-loading :is-full-page="false" :active="loading" />
    <b-message v-if="error" type="is-danger" has-icon icon-size="is-small">
      {{$t('failed-fetch-profile')}}
    </b-message>
    <template v-else>

      <div class="media">
        <div class="media-left">
          <p class="image is-64x64">
            <img :src="thumbUrl" />
          </p>
        </div>
        <div class="media-content" v-if="isPoint">
          <p><strong>X: </strong> {{x}}</p>
          <p><strong>Y: </strong> {{y}}</p>
        </div>
        <div class="media-right" v-if="isPoint || isLine">
          <button class="button is-small" @click="resetZoom()">{{$t('button-reset-zoom')}}</button>
        </div>
      </div>

      <template v-if="!loading">
        <div class="profile-box" v-if="isPoint">
          <annotation-profile-chart
              @error="val => error = val"
              :annotation="annotation"
              :bpc="bpc"
              :css-classes="'profile-chart-container'"
              ref="chart"
          />
        </div>
        <annotation-profile-projection-table v-else :annotation="annotation" />
      </template>


    </template>
  </cytomine-modal-card>
</template>

<script>
import CytomineModalCard from '@/components/utils/CytomineModalCard';
import AnnotationProfileChart from '@/components/charts/AnnotationProfileChart';
import AnnotationProfileProjectionTable from '@/components/viewer/AnnotationProfileProjectionTable';

export default {
  name: 'profile-modal',
  components: {
    AnnotationProfileProjectionTable,
    AnnotationProfileChart,
    CytomineModalCard
  },
  props: {
    annotation: Object,
    image: {type: Object, default: null}
  },
  data() {
    return {
      thumbSize: 64,
      expanded: false,
      loading: true,
      error: false,
    };
  },
  computed: {
    x() {
      return Math.round(this.annotation.centroid.x);
    },
    y() {
      return Math.round(this.annotation.centroid.y);
    },
    thumbUrl() {
      return `${this.annotation.url}?maxSize=${this.thumbSize}&square=true&complete=true&thickness=2&increaseArea=1.25&draw=true`;
    },
    bpc() {
      return (this.image && this.image.bitPerSample) ? this.image.bitPerSample: 8;
    },
    isPoint() {
      return this.annotation.location && this.annotation.location.includes('POINT');
    },
    isLine() {
      return this.annotation.location && this.annotation.location.includes('LINESTRING');
    },
    title() {
      return (this.isPoint) ? this.$t('profile') : this.$t('profile-projection');
    }
  },
  methods: {
    resetZoom() {
      this.$refs.chart.resetZoom();
    }
  },
  created() {
    this.loading = false;
  }
};
</script>

<style lang="scss">
.profile-modal {
  &.expanded, &.expanded .modal-card-body {
    width: 90vw;
    height: 90vh;
    max-height: 90vh;
  }

  &:not(.expanded), &:not(.expanded) .modal-card-body {
    width: 50vw;
    height: 60vh;
    max-height: 60vh;
  }

  .profile-chart-container {
    position: relative;
    height: 100%;
  }

  .profile-box {
    display: flex;
    flex-direction: column;
    height: calc(100% - 79px);
    margin-top: 15px;
  }
}
</style>
