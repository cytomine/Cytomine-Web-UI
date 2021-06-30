import {Line} from 'vue-chartjs';
import _ from 'lodash';

export default {
  name: 'sample-histogram-chart',
  extends: Line,
  props: {
    scale: String,
    histogram: Array,
    nBins: Number,
    firstBin: Number,
    lastBin: Number,
    color: String,

    theoreticalMax: Number,
    defaultMin: Number,
    defaultMax: Number,
    min: Number,
    max: Number,
    gamma: Number,
    inverse: Boolean,
  },
  data() {
    return {
      chartData: null,
    };
  },
  computed: {
    extendedHistogram() {
      let missingLeft = new Array(this.firstBin).fill(0);
      let missingRight = new Array(this.nBins - this.lastBin - 1).fill(0);
      return missingLeft.concat(this.histogram).concat(missingRight);
    },
    binnedHistogram() {
      return this.extendedHistogram;
    },

    logHistogram() {
      return this.binnedHistogram.map(v => Math.log(v));
    },
    scaledHistogram() {
      return this.isLogarithmic ? this.logHistogram : this.binnedHistogram;
    },
    isLogarithmic() {
      return (this.scale === 'log');
    },

    binSize() {
      return (this.theoreticalMax + 1) / this.nBins;
    },
    integerBinSize() {
      return Math.round(this.binSize);
    },
    labels() {
      return this.binnedHistogram.map((_, idx) => Math.round(idx * this.binSize));
    },
    defaultMinLabel() {
      return this.findLabel(this.defaultMin);
    },
    defaultMaxLabel() {
      return this.findLabel(this.defaultMax);
    },
    currentMinLabel() {
      return this.findLabel(this.min);
    },
    currentMaxLabel() {
      return Math.min(this.theoreticalMax, this.findLabel(this.max));
    },
    minLabel() {
      return Math.min(this.defaultMinLabel, this.currentMinLabel);
    },
    maxLabel() {
      return Math.max(this.defaultMaxLabel, this.currentMaxLabel);
    },
    currentLabels() {
      return this.labels.filter(label => label >= this.currentMinLabel && label <= this.currentMaxLabel);
    },

    highestValue() {
      let minIdx = this.labels.indexOf(this.minLabel);
      let maxIdx = this.labels.indexOf(this.maxLabel) + 1;
      if (maxIdx === 0) maxIdx = this.labels.length;
      return Math.max(...this.scaledHistogram.slice(minIdx, maxIdx));
    },
    systemResponse() {
      if (this.currentLabels.length === 1) {
        return [
          {x: this.currentLabels[0], y: 0},
          {x: this.currentLabels[0], y: this.highestValue}
        ];
      }

      let nbPoints = 100;
      let step = (this.currentLabels.length - 1) / nbPoints;
      let range = _.range(0, this.currentLabels.length - 1 + step, step);

      let ymin = (this.inverse) ? 1 : 0;
      let ymax = (this.inverse) ? 0 : 1;
      let m = (ymin - ymax) / (this.currentMinLabel - this.currentMaxLabel);
      let p = ymin - m * this.currentMinLabel;
      let gamma = (this.inverse) ? 1/this.gamma : this.gamma;
      return range.map(idx => {
        let label = this.currentLabels[Math.round(idx)];
        return {
          x: label,
          y: Math.pow((m * label + p), gamma) * this.highestValue
        };
      });
    },

    histogramColor() {
      return (this.color) ? this.color : '#C0C0C0';
    },

    datasets() {
      return [
        {
          data: this.systemResponse,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderColor: '#333',
          borderWidth: 1,
          type: 'line',
          order: 2
        },
        {
          data: this.scaledHistogram,
          backgroundColor: this.histogramColor,
          pointRadius: 1,
          order: 1,
        },
      ];
    }
  },
  watch: {
    currentMinLabel() {
      this.doRenderChart();
    },
    currentMaxLabel() {
      this.doRenderChart();
    },
    scale() {
      this.doRenderChart();
    },
    highestValue() {
      this.doRenderChart();
    },
    gamma() {
      this.doRenderChart();
    },
    inverse() {
      this.doRenderChart();
    }
  },
  methods: {
    findBin(value) {
      return Math.floor(value / this.binSize);
    },
    findLabel(value) {
      return Math.floor(this.findBin(value) * this.binSize);
    },
    doRenderChart() {
      try {
        this.renderChart({
          labels: this.labels,
          datasets: this.datasets,

          // Additional data for tooltips
          isLogarithmic: this.isLogarithmic,
          binSize: this.integerBinSize,
        }, {
          tooltips: {
            filter: function(tooltipItem) {
              return tooltipItem.datasetIndex !== 0;
            },
            callbacks: {
              label: function(tooltipItem, data) {
                if (data.isLogarithmic) {
                  return Math.round(Math.exp(tooltipItem.value));
                }
                return tooltipItem.value;
              },
              title: function(tooltipItems, data) {
                if (tooltipItems.length > 0) {
                  let left = Number(tooltipItems[0].label);
                  if (data.binSize === 1) {
                    return left;
                  }
                  let right = left + data.binSize;
                  return `[${left} - ${right}[`;
                }
              }
            }
          },
          maintainAspectRatio: false,
          responsive: true,
          title: {
            display: false
          },
          legend: {
            display: false
          },
          animation: {
            duration: 0,
          },
          scales: {
            xAxes: [{
              display: true,
              scaleLabel: {
                display: false
              },
              ticks: {
                min: this.minLabel,
                max: this.maxLabel,
                fontSize: 10,
              }
            }],
            yAxes: [{
              display: false,
              ticks: {
                suggestedMax: this.highestValue
              }
            }]
          },
        });
      }
      catch (error) {
        console.log(error);
        this.$emit('error', true);
      }
    }
  },
  async mounted () {
    this.doRenderChart();
  }
};
