<template>
<div class="scale-line" :class="{'interpolation': interpolation}">
  <template v-if="resolution">
    <div class="scale-line-top" :style="{width: scaleLineLength + 'px'}">
      {{scaleLength}}
    </div>
    <div class="scale-line-bottom">
      <span v-show="magnification">
        {{$t('magnification')}}: {{magnification}}X
      </span>
    </div>
  </template>

  <div v-else-if="interpolation" class="interpolation-warning">{{$t('digital-zoom')}}</div>

  <div class="scale-line-position" v-if="mousePosition">
    <div style="float: left;">x: {{Math.round(mousePosition[0])}}</div>
    <div style="float: right;">y: {{Math.round(mousePosition[1])}}</div>
  </div>
</div>
</template>

<script>
export default {
  name: 'scale-line',
  props: {
    image: Object,
    zoom: Number,
    mousePosition: Array
  },
  data() {
    return {
      scaleLineLength: 100
    };
  },
  computed: {
    magnification() {
      let magnification = Math.pow(2, this.zoom - this.image.depth) * this.image.magnification;
      return Math.round(magnification * 100) / 100;
    },
    resolution() {
      if(this.image.physicalSizeX) {
        return Math.pow(2, this.image.depth - this.zoom) * this.image.physicalSizeX;
      }
    },
    scaleLength() {
      if (this.resolution) {
        let length = this.scaleLineLength * this.resolution;
        let unit = this.$t('um');
        if (length > 1000) {
          length /= 1000;
          unit = this.$t('mm');
        }
        return `${length.toPrecision(3)} ${unit}`;
      }
    },
    interpolation() {
      return this.zoom > this.image.depth;
    }
  }
};
</script>

<style scoped>
.scale-line {
  background: white;
  position: absolute;
  padding: 0.4em 0.8em;
  display: block;
  right: 4rem;
  bottom: 1rem;
  font-size: 9px;
  font-family: Helvetica;
  min-width: 100px;
}

.scale-line-top {
  margin-top: 0.5em;
  box-sizing: content-box;
  border: 2px solid black;
  border-top: none;
  text-align: center;
  padding-bottom: 0.2em;
}

.scale-line-bottom {
  box-sizing: content-box;
  border: 2px solid black;
  border-top: none;
  border-bottom: none;
  text-align: center;
  padding-top: 0.2em;
  margin-bottom: 1em;
  min-height: 1em;
}

.interpolation {
  color: red;
}

.interpolation .scale-line-top, .interpolation .scale-line-bottom {
  border-color: red;
}

.scale-line-position {
  text-align: center;
  padding: 0 0.5em;
  color: black !important;
}

.interpolation-warning {
  text-align: center;
  font-size: 11px;
  margin-bottom: 0.5em;
}
</style>
