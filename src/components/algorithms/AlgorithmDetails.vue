<template>
<table class="table">
    <tbody>
        <tr>
            <td>{{$t("status-comment")}}</td>
            <td>{{job.statusComment}}</td>
        </tr>
        <tr v-if="isSuccessful">
            <td>{{$t("execution-duration")}}</td>
            <td>{{Number(job.updated) - Number(job.created) | duration("humanize")}}</td>
        </tr>
        <tr>
            <td>{{$t("parameters")}}</td>
            <td>
                <button class="button is-small" @click="showParameters = !showParameters">
                    <span>{{showParameters ? $t("button-hide") : $t("button-show")}}</span>
                </button>
                <b-collapse :open="showParameters">
                    <table class="table parameters-table">
                        <thead>
                            <tr>
                                <th>{{$t("name")}}</th>
                                <th>{{$t("value")}}</th>
                                <th>{{$t("type")}}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="param in job.jobParameters.array" :key="param.id">
                                <td>{{param.name}}</td>
                                <td>{{param.value}}</td>
                                <td>{{param.type}}</td>
                            </tr>
                        </tbody>
                    </table>
                </b-collapse>
            </td>
        </tr>
        <!-- TODO: job results, job data -->
    </tbody>
</table>
</template>

<script>
import {JobStatus} from "cytomine-client";

export default {
    name: "algorithm-details",
    props: ["job"],
    data() {
        return {
            showParameters: false
        };
    },
    computed: {
        isSuccessful() {
            return this.job.status == JobStatus.SUCCESS;
        }
    }
};
</script>

<style scoped>
.table {
    background: none;
    position: relative;
    margin-bottom: 0px !important;
}

td:first-child {
    white-space: nowrap;
    font-weight: 600;
}

td:not(:first-child) {
    width: 100%;
}

.parameters-table {
    width: unset !important;
}

.parameters-table td:not(:first-child) {
    width: unset;
}
</style>
