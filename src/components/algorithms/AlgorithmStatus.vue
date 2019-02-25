<template>
<span class="tag" :class="tagClass">
    {{$t(labels[status])}}
</span>
</template>

<script>
import {JobStatus} from "cytomine-client";
import jobStatusLabelMapping from "@/utils/job-utils";

export default {
    name: "algorithm-status",
    props: ["status"],
    computed: {
        labels() {
            return jobStatusLabelMapping;
        },
        result() {
            switch(this.status) {
                case JobStatus.NOTLAUNCH:
                case JobStatus.INQUEUE:
                case JobStatus.WAIT:
                case JobStatus.INDETERMINATE:
                case JobStatus.PREVIEWED:
                    return "light";
                case JobStatus.RUNNING:
                    return "info";
                case JobStatus.SUCCESS:
                    return "success";
                case JobStatus.FAILED:
                    return "danger";
            }
        },
        tagClass() {
            return "is-" + this.result;
        }
    }
};
</script>
