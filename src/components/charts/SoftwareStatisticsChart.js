import {HorizontalBar} from 'vue-chartjs';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import jobStatusMapping from '@/utils/job-utils';

import {asArray as hexToRgb} from 'ol/color';

const defaultColor = '#eee';

export default {
  name: 'software-statistics-chart',
  extends: HorizontalBar,
  props: {
    software: Object,
    startDate: Number,
    endDate: Number
  },
  data() {
    return {
      chartData: null
    };
  },
  computed: {
    queryParams() {
      return {
        startDate: this.startDate,
        endDate: this.endDate
      };
    }
  },
  watch: {
    async queryParams() {
      this.doRenderChart();
    }
  },
  methods: {
    async doRenderChart() {
      let status = Object.values(jobStatusMapping);
      let data = status.map(status => this.software[status.statLabel]);
      let borderColors = status.map(status => {
        let [r, g, b] = hexToRgb(status.color || defaultColor);
        const factor = 0.8;
        return `rgba(${r*factor}, ${g*factor}, ${b*factor}, 1)`;
      });

      this.$emit('nbElems', data.length);

      this.renderChart({
        labels: status.map(status => this.$t(status.label)),
        datasets: [
          {
            data,
            backgroundColor: status.map(status => status.color || defaultColor),
            borderColor: borderColors,
            borderWidth: 1,
            hoverBorderColor: borderColors,
          }
        ]
      }, {
        maintainAspectRatio: false,
        legend: {display: false},
        scales: {
          xAxes: [{
            ticks: {
              min: 0,
              suggestedMax: Math.round(Math.max(...data)*1.2)+1
            }
          }],
          yAxes: [{
            gridLines: {
              display: false
            },
            categoryPercentage: 0.6
          }]
        }
      });
    }
  },
  async mounted () {
    this.addPlugin(ChartDataLabels);
    this.doRenderChart();
  }
};
