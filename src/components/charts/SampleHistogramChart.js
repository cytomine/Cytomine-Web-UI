import {Line, Bar} from 'vue-chartjs';
import ChartZoom from 'chartjs-plugin-zoom';

export default {
  name: 'sample-histogram-chart',
  extends: Bar,
  props: {
    histogram: Array,
    scale: String,
    xMin: Number,
    xMax: Number
  },
  data() {
    return {
      chartData: null
    };
  },
  computed: {
    logHistogram() {
      return this.histogram.map(v => Math.log(v));
    },
    scaledHistogram() {
      return (this.scale === 'log') ? this.logHistogram : this.histogram;
    },
    highestValue() {
      return Math.max(...this.scaledHistogram);
    }
    // queryParams() {
    //   return {
    //     bpc: this.bpc
    //   };
    // },
    // label() {
    //   return `(${Math.round(this.annotation.centroid.x)}, ${Math.round(this.annotation.centroid.y)})`;
    // }
  },
  watch: {
    xMin() {
      this.doRenderChart();
    },
    xMax() {
      this.doRenderChart();
    },
    scale() {
      this.doRenderChart();
    }
  },
  methods: {
    // resetZoom() {
    //   this.$data._chart.resetZoom();
    // },
    async doRenderChart() {
      try {
        this.renderChart({
          labels: this.histogram.map((_, idx) => idx),
          datasets: [
            {
              data: this.scaledHistogram,
              borderColor: '#2778ad',
              backgroundColor: '#2778ad',
            },
            // {
            //   data: [{x: this.xMin, y:0}, {x: this.xMax, y: this.highestValue + 10}],
            //   fill: false,
            //   pointRadius: 0
            // }
          ]
        }, {
          maintainAspectRatio: false,
          responsive: true,
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              display: true,
              barPercentage: 1.0,
              categoryPercentage: 1.0,
              scaleLabel: {
                display: false
              }
            }],
            yAxes: [{
              display: false,

              // ticks: {
              //   beginAtZero: true,
              //   max: this.highestValue + 10
              // }
            }]
          },
          // plugins: {
          //   zoom: {
          //     pan: {
          //       enabled: true,
          //       mode: 'xy',
          //     },
          //
          //     zoom: {
          //       enabled: true,
          //       drag: false,
          //       mode: 'xy',
          //     }
          //   }
          // }
        });
      }
      catch (error) {
        console.log(error);
        this.$emit('error', true);
      }
    }
  },
  async mounted () {
    // this.addPlugin(ChartZoom);
    this.doRenderChart();
  }
};
