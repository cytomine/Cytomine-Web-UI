import {Line} from 'vue-chartjs';
import ChartZoom from 'chartjs-plugin-zoom';

export default {
  name: 'annotation-profile-projection-chart',
  extends: Line,
  props: {
    annotation: Object,
  },
  data() {
    return {
      chartData: null
    };
  },
  computed: {
    queryParams() {
      return {};
    },
  },
  watch: {
    async queryParams() {
      this.doRenderChart();
    }
  },
  methods: {
    resetZoom() {
      this.$data._chart.resetZoom();
    },
    async doRenderChart() {
      try {
        let data = (await this.annotation.fetchProfileProjections())['collection'].sort((a, b) => {
          if (a.point[0] === b.point[0]) return a.point[1] - b.point[1];
          return a.point[0] - b.point[0];
        });

        this.renderChart({
          labels: data.map(item => `(${item.point[0]}, ${item.point[1]})`),
          datasets: [
            {
              data: data.map(item => item.average),
              fill: false,
              label: this.$t('average'),
              borderColor: '#2778ad',
              backgroundColor: '#61b2e8'
            },
          ]
        }, {
          maintainAspectRatio: false,
          responsive: true,
          legend: {
            display: true
          },
          scales: {
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: this.$t('pixel-intensity')
              },
              ticks: {
                beginAtZero: true,
              }
            }]
          },
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'xy',
              },

              zoom: {
                enabled: true,
                drag: false,
                mode: 'xy',
              }
            }
          }
        });
      }
      catch (error) {
        console.log(error);
        this.$emit('error', true);
      }
    }
  },
  async mounted () {
    this.addPlugin(ChartZoom);
    this.doRenderChart();
  }
};
