import {Bar} from 'vue-chartjs';
import _ from 'lodash';

export default {
  name: 'sample-histogram-chart',
  extends: Bar,
  props: {
    scale: String,
    histogram: Array,

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
    nBins() {
      return (this.theoreticalMax > 256) ? 2048 : 256;
    },
    binSize() {
      return Math.ceil(this.theoreticalMax / this.nBins);
    },
    extendedHistogram() {
      if (this.theoreticalMax > this.histogram.length) {
        let missing = new Array(this.theoreticalMax - this.histogram.length).fill(0);
        return this.histogram.concat(missing);
      }

      return this.histogram;
    },
    binnedHistogram() {
      if (this.extendedHistogram.length === this.nBins) {
        return this.extendedHistogram;
      }

      let bins = [];
      for (let i = 0; i < this.nBins; i++) {
        let start = i * this.binSize;
        let end = start + this.binSize;
        bins.push(this.extendedHistogram.slice(start, end).reduce((cnt, value) => cnt + value));
      }

      return bins;
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

    ratio() {
      return (this.theoreticalMax + 1) / this.nBins;
    },
    labels() {
      return [...this.binnedHistogram.map((_, idx) => Math.round(idx * this.ratio)), this.theoreticalMax];
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
        return { x: label, y: Math.pow((m * label + p), gamma) * this.highestValue };
      });
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
      return Math.floor(value / this.ratio);
    },
    findLabel(value) {
      return Math.floor(this.findBin(value) * this.ratio);
    },
    doRenderChart() {
      try {
        this.renderChart({
          isLogarithmic: this.isLogarithmic,
          ratio: Math.round(this.ratio),
          labels: this.labels,
          datasets: [
            {
              data: this.systemResponse,
              fill: false,
              pointRadius: 0,
              pointHoverRadius: 0,
              borderColor: 'grey',
              borderWidth: 1,
              type: 'line',
              order: 2
            },
            {
              data: this.scaledHistogram,
              backgroundColor: '#2778ad',
              barPercentage: 1.0,
              categoryPercentage: 1.0,
              order: 1
            },

          ]
        }, {
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
          tooltips: {
            filter: function(tooltipItem) {
              return tooltipItem.datasetIndex !== 0;
            },
            callbacks: {
              label: function(tooltipItem, data) {
                return (data.isLogarithmic) ? Math.round(Math.exp(tooltipItem.value)) : tooltipItem.value;
              },
              title: function(tooltipItems, data) {
                if (tooltipItems.length > 0) {
                  let left = Number(tooltipItems[0].label);
                  let right = left + data.ratio;
                  return (left !== right) ? `[${left} - ${right}[` : left;
                }
              }
            }
          },
          scales: {
            xAxes: [{
              display: true,
              barPercentage: 1.0,
              categoryPercentage: 1.0,
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
                max: this.highestValue
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
