<template>
<span class="tag" :class="tagClass">
  {{$t(labels[status].label)}}
</span>
</template>

<script>
import {JobStatus} from 'cytomine-client';
import jobStatusMapping from '@/utils/job-utils';

export default {
  name: 'job-status',
  props: {
    status: Number
  },
  computed: {
    labels() {
      return jobStatusMapping;
    },
    result() {
      switch(this.status) {
        case JobStatus.KILLED:
          return 'dark';
        case JobStatus.NOTLAUNCH:
        case JobStatus.INQUEUE:
        case JobStatus.WAIT:
        case JobStatus.INDETERMINATE:
        case JobStatus.PREVIEWED:
          return 'light';
        case JobStatus.RUNNING:
          return 'info';
        case JobStatus.SUCCESS:
          return 'success';
        case JobStatus.FAILED:
          return 'danger';
      }
    },
    tagClass() {
      return 'is-' + this.result;
    }
  }
};
</script>
