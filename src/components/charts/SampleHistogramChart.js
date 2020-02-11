import {Bar} from 'vue-chartjs';

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
      return Math.round(this.findBin(this.defaultMin) * this.ratio);
    },
    defaultMaxLabel() {
      return Math.round(this.findBin(this.defaultMax) * this.ratio);
    },
    currentMinLabel() {
      return Math.round(this.findBin(this.min) * this.ratio);
    },
    currentMaxLabel() {
      return Math.min(this.theoreticalMax, Math.round(this.findBin(this.max) * this.ratio));
    },
    minLabel() {
      return Math.min(this.defaultMinLabel, this.currentMinLabel);
    },
    maxLabel() {
      return Math.max(this.defaultMaxLabel, this.currentMaxLabel);
    },

    highestValue() {
      let minIdx = this.labels.indexOf(this.minLabel);
      let maxIdx = this.labels.indexOf(this.maxLabel) + 1;
      if (maxIdx === 0) maxIdx = this.labels.length;
      return Math.max(...this.scaledHistogram.slice(minIdx, maxIdx));
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
    }
  },
  methods: {
    findBin(value) {
      return Math.floor(value / this.ratio);
    },
    doRenderChart() {
      try {
        this.renderChart({
          isLogarithmic: this.isLogarithmic,
          ratio: Math.round(this.ratio),
          labels: this.labels,
          datasets: [
            {
              data: [
                {x: this.currentMinLabel, y: 0},
                {x: this.currentMaxLabel, y: this.highestValue}
              ],
              fill: false,
              pointRadius: 0,
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
