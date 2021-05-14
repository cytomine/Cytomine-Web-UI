<!-- Copyright (c) 2009-2021. Authors: see NOTICE file.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.-->


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
