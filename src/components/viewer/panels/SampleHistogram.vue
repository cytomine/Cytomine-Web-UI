<template>
  <div>
    <div class="chart-container sample-histogram">
      <sample-histogram-chart :histogram="sampleHistogram.histogram256" :x-min="xMin" :x-max="xMax" :scale="histogramScale" css-classes="chart"/>
    </div>

    <table>
      <tr>
        <td>{{ $t('minimum') }}</td>
        <td>
          <cytomine-slider :value="minimum" @input="setMinimum" :min="0" :max="defaultMax" />
        </td>
      </tr>
      <tr>
        <td>{{ $t('maximum') }}</td>
        <td>
          <cytomine-slider :value="maximum" @input="setMaximum" :min="0" :max="defaultMax" />
        </td>
      </tr>
      <tr>
        <td>{{ $t('brightness') }}</td>
        <td>
          <cytomine-slider :value="brightness" @input="setBrightness" :min="0" :max="defaultMax" :tooltip="false"/>
        </td>
      </tr>
      <tr>
        <td>{{ $t('contrast') }}</td>
        <td>
          <cytomine-slider :value="contrast" @input="setContrast" :min="0" :max="defaultMax" :tooltip="false"/>
        </td>
      </tr>

    </table>
  </div>

</template>

<script>
import {get} from '@/utils/store-helpers';
import CytomineSlider from '@/components/form/CytomineSlider';
import SampleHistogramChart from '@/components/charts/SampleHistogramChart';


export default {
  name: 'SampleHistogram',
  components: {SampleHistogramChart, CytomineSlider},
  props: {
    index: String,
    sampleHistogram: Object,
    histogramScale: String,
    revision: Number
  },
  data() {
    return {
      cacheCenter: 0,
      cacheRange: 0,

      brightness: 0,
      contrast: 0,
    };
  },
  computed: {
    project: get('currentProject/project'),
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    imageWrapper() {
      return this.$store.getters['currentProject/currentViewer'].images[this.index];
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
    slice() {
      return this.imageWrapper.activeSlice;
    },
    activePanel() {
      return this.imageWrapper.activePanel;
    },
    sample() {
      return this.sampleHistogram.sample;
    },

    defaultMax() {
      return Math.pow(2, this.image.bitPerSample) - 1;
    },
    defaultMin() {
      return 0;
    },
    defaultRange() {
      return this.defaultMax - this.defaultMin;
    },
    defaultCenter() {
      return this.defaultRange / 2.0;
    },

    minimum: {
      get() {
        return this.imageWrapper.colors.minMax[this.sample].min;
      },
      set(value) {
        value = Math.max(this.defaultMin, Math.min(value, this.defaultMax));
        this.$store.commit(this.imageModule + 'setMinimum', {sample: this.sample, value});
        if (value > this.maximum) {
          this.maximum = value;
        }
      }
    },
    maximum: {
      get() {
        return this.imageWrapper.colors.minMax[this.sample].max;
      },
      set(value) {
        value = Math.min(this.defaultMax, Math.max(value, this.defaultMin));
        this.$store.commit(this.imageModule + 'setMaximum', {sample: this.sample, value});
        if (value < this.minimum) {
          this.minimum = value;
        }
      }
    },
    range() {
      return this.maximum - this.minimum;
    },
    center() {
      return this.minimum + this.range / 2;
    },

    nBins() {
      return 256;
    },
    xMin() {
      return Math.round((this.nBins - 1) * this.minimum / this.defaultMax);
    },
    xMax() {
      return Math.round((this.nBins - 1) * this.maximum / this.defaultMax);
    }
  },
  watch: {
    revision() {
      this.computeBrightness();
      this.computeContrast();
    }
  },
  methods: {
    setMinimum(value) {
      this.minimum = value;
      this.computeBrightness();
      this.computeContrast();
    },
    setMaximum(value) {
      this.maximum = value;
      this.computeBrightness();
      this.computeContrast();
    },
    setBrightness(value) {
      // https://imagej.nih.gov/ij/developer/source/ij/plugin/frame/ContrastAdjuster.java.html
      let b = this.defaultMin + this.defaultRange * ((this.defaultRange - value) / this.defaultRange);
      let range = this.range;
      this.minimum = Math.round(b - range / 2.0);
      this.maximum = Math.round(b + range / 2.0);

      this.brightness = value;
    },
    setContrast(value) {
      // https://imagej.nih.gov/ij/developer/source/ij/plugin/frame/ContrastAdjuster.java.html
      let slope = (value <= this.defaultCenter) ? value / this.defaultCenter : this.defaultCenter / (this.defaultRange - value);
      if (slope > 0) {
        let center = this.center;
        this.minimum = Math.round(center - (this.defaultRange / 2) / slope);
        this.maximum = Math.round(center + (this.defaultRange / 2) / slope);

        this.contrast =  value;
      }
    },
    computeBrightness() {
      // https://imagej.nih.gov/ij/developer/source/ij/plugin/frame/ContrastAdjuster.java.html
      this.brightness = Math.round(this.defaultRange * (1.0 - (this.center - this.defaultMin) / this.defaultRange));
    },
    computeContrast() {
      // https://imagej.nih.gov/ij/developer/source/ij/plugin/frame/ContrastAdjuster.java.html
      let c = this.defaultRange / this.range;
      this.contrast =  Math.round((c > 0) ? this.defaultRange - (this.defaultCenter / c) : this.defaultCenter * c);
    }
  },
  created() {
    this.computeBrightness();
    this.computeContrast();
  }
};
</script>

<style scoped>
  td, tr {
    vertical-align: middle !important;
  }

  td:first-child {
    font-weight: 600;
    text-align: right;
    padding: 0.35em 0.5em;
  }

  td:last-child {
    width: 100%;
  }

  .actions {
    margin-top: 1em;
    text-align: right;
  }

  >>> .vue-slider {
    margin-left: 0.4em;
    margin-right: 4em;
  }

  .chart-container {
    margin-top: 0.5em;
    height: 10em;
    position: relative;
  }


</style>

<style>
  .sample-histogram .chart {
    position: absolute;
    width: 100%;
    height: 100%;
  }
</style>