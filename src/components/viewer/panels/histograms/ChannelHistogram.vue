<template>
  <div>
    <div class="chart-container channel-histogram">
      <channel-histogram-chart
        :histogram="histogram.histogram"
        :n-bins="histogram.nBins"
        :first-bin="histogram.firstBin"
        :last-bin="histogram.lastBin"
        :color="color"
        :min="minimum"
        :max="maximum"
        :log-scale="logScale"
        :theoretical-max="theoreticalMax"
        :default-max="defaultMax"
        :default-min="defaultMin"
        :gamma="gamma"
        :inverse="inverse"
        css-classes="chart"
      />
    </div>

    <table>
      <tr>
        <td>{{ $t('minimum') }}</td>
        <td>
          <cytomine-slider :value="minimum" @input="setMinimum" :min="0" :max="theoreticalMax"/>
        </td>
      </tr>
      <tr>
        <td>{{ $t('maximum') }}</td>
        <td>
          <cytomine-slider :value="maximum" @input="setMaximum" :min="0" :max="theoreticalMax"/>
        </td>
      </tr>
      <tr>
        <td>{{ $t('brightness') }}</td>
        <td>
          <cytomine-slider :value="brightness" @input="setBrightness" :min="0" :max="theoreticalMax" :tooltip="false"/>
        </td>
      </tr>
      <tr>
        <td>{{ $t('contrast') }}</td>
        <td>
          <cytomine-slider :value="contrast" @input="setContrast" :min="0" :max="theoreticalMax" :tooltip="false"/>
        </td>
      </tr>

    </table>
  </div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import CytomineSlider from '@/components/form/CytomineSlider';
import ChannelHistogramChart from '@/components/charts/ChannelHistogramChart';

export default {
  name: 'ChannelHistogram',
  components: {ChannelHistogramChart, CytomineSlider},
  props: {
    index: String,
    histogram: Object,
    logScale: Boolean,
    revision: Number,
    gamma: Number,
    inverse: Boolean,
  },
  data() {
    return {
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
    activePanel() {
      return this.imageWrapper.activePanel;
    },
    channelIndex() {
      return this.histogram.channel;
    },

    color() {
      return (this.histogram.color) ? this.histogram.color : '#C0C0C0';
    },

    theoreticalMax() {
      return Math.pow(2, this.image.bits) - 1;
    },
    theoreticalMin() {
      return 0;
    },
    theoreticalRange() {
      return this.theoreticalMax - this.theoreticalMin;
    },
    theoreticalCenter() {
      return this.theoreticalRange / 2.0;
    },

    defaultMin() {
      return this.imageWrapper.colors.defaultMinMax[this.channelIndex].minimum;
    },
    defaultMax() {
      return this.imageWrapper.colors.defaultMinMax[this.channelIndex].maximum;
    },

    minimum: {
      get() {
        return this.imageWrapper.colors.minMax[this.channelIndex].minimum;
      },
      set(value) {
        value = Math.max(this.theoreticalMin, Math.min(value, this.theoreticalMax));
        this.$store.commit(this.imageModule + 'setMinimum', {sample: this.channelIndex, value});
        if (value > this.maximum) {
          this.maximum = value;
        }
      }
    },
    maximum: {
      get() {
        return this.imageWrapper.colors.minMax[this.channelIndex].maximum;
      },
      set(value) {
        value = Math.min(this.theoreticalMax, Math.max(value, this.theoreticalMin));
        this.$store.commit(this.imageModule + 'setMaximum', {sample: this.channelIndex, value});
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
      let b = this.theoreticalMin + this.theoreticalRange *
        ((this.theoreticalRange - value) / this.theoreticalRange);
      let range = this.range;
      this.minimum = Math.round(b - range / 2.0);
      this.maximum = Math.round(b + range / 2.0);

      this.brightness = value;
    },
    setContrast(value) {
      // https://imagej.nih.gov/ij/developer/source/ij/plugin/frame/ContrastAdjuster.java.html
      let slope;
      if (value <= this.theoreticalCenter) {
        slope = value / this.theoreticalCenter;
      }
      else {
        slope = this.theoreticalCenter / (this.theoreticalRange - value);
      }
      if (slope > 0) {
        let center = this.center;
        this.minimum = Math.round(center - (this.theoreticalRange / 2) / slope);
        this.maximum = Math.round(center + (this.theoreticalRange / 2) / slope);

        this.contrast = value;
      }
    },
    computeBrightness() {
      // https://imagej.nih.gov/ij/developer/source/ij/plugin/frame/ContrastAdjuster.java.html
      this.brightness = Math.round(
        this.theoreticalRange *
        (1.0 - (this.center - this.theoreticalMin) / this.theoreticalRange)
      );
    },
    computeContrast() {
      // https://imagej.nih.gov/ij/developer/source/ij/plugin/frame/ContrastAdjuster.java.html
      let c = this.theoreticalRange / this.range;
      this.contrast = Math.round(
        (c > 0) ? this.theoreticalRange - (this.theoreticalCenter / c) : this.theoreticalCenter * c
      );
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

>>> .vue-slider {
  margin-left: 0.4em;
  margin-right: 1em;
}

.chart-container {
  margin-top: 0.5em;
  height: 10em;
}
</style>

<style>
.channel-histogram .chart {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
