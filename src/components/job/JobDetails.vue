<template>
<div class="job-details-wrapper">
    <b-loading :is-full-page="false" :active.sync="loading" class="small"></b-loading>

    <template v-if="!loading">
        <table class="table">
            <tbody>
                <tr v-if="isRunning">
                    <td>{{$t("progress")}}</td>
                    <td>
                        <progress class="progress is-info" :value="job.progress" max="100">
                            {{job.progress}}%
                        </progress>
                    </td>
                </tr>
                <tr>
                    <td>{{$t("status-comment")}}</td>
                    <td>{{job.statusComment || "-"}}</td>
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
                            <table class="table inline-table">
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
                <tr v-if="hasAnnotationResult">
                    <td>{{$t("data")}}</td>
                    <td v-if="hasAnnotationResult">
                        <router-link :to="`/project/${project.id}/annotations?userJob=${job.userJob}`">
                            {{$tc("count-annotations", allData.annotations, {count: allData.annotations})}}
                        </router-link>
                    </td>
                </tr>
                <tr v-if="hasFileResult">
                    <td>{{$t("files")}}</td>
                    <td>
                        <table v-if="jobData.length > 0" class="table inline-table">
                            <thead>
                                <tr>
                                    <th>{{$t("filename")}}</th>
                                    <th>{{$t("comment")}}</th>
                                    <th>{{$t("size")}}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="data in jobData" :key="data.id">
                                    <td>{{data.filename}}</td>
                                    <td>{{data.key}}</td>
                                    <td>{{filesize(data.size)}}</td>
                                    <td>
                                        <div class="buttons">
                                            <a class="button is-small" :href="data.viewURL">{{$t("button-view")}}</a>
                                            <a class="button is-small" :href="data.downloadURL">{{$t("button-download")}}</a>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <em v-else class="has-text-grey">{{$t("no-result-file")}}</em>
                    </td>
                </tr>
                <tr v-if="!job.dataDeleted">
                    <td>{{$t("actions")}}</td>
                    <td>
                        <button class="button is-small is-danger" @click="deletionModal = true">{{$t("delete-data")}}</button>
                    </td>
                </tr>
                <tr v-else>
                    <td>{{$t("data")}}</td>
                    <td>
                        {{$t("deleted-analysis-data")}}
                    </td>
                </tr>
            </tbody>
        </table>

        <b-modal :active="deletionModal" has-modal-card @close="deletionModal = false">
            <form>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">{{$t("delete-analysis-data")}}</p>
                    </header>
                    <section class="modal-card-body">
                        <p>{{$t("confirm-deletion-analysis-data")}}</p>
                        <ul>
                            <li>{{$tc("count-annotations", allData.annotations, {count: allData.annotations})}}</li>
                            <li>{{$tc("count-reviewed-annotations", allData.reviewed, {count: allData.reviewed})}}</li>
                            <li>{{$tc("count-annotation-terms", allData.annotationsTerm, {count: allData.annotationsTerm})}}</li>
                            <li>{{$tc("count-files", allData.jobDatas, {count: allData.jobDatas})}}</li>
                        </ul>

                        <p class="has-margin-top">{{$t("remark-long-operation")}}</p>

                        <template v-if="deletionTask">
                            <hr>
                            <progress class="progress is-info" :value="deletionTask.progress" max="100">
                                {{deletionTask.progress}}%
                            </progress>
                            <p v-if="lastCommentDeletionTask">{{lastCommentDeletionTask}}</p> <!-- WARNING: not translated -->
                        </template>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button" type="button" @click="deletionModal = false">
                            {{$t("button-cancel")}}
                        </button>
                        <button class="button is-danger" @click="deleteData()">
                            {{$t("button-confirm")}}
                        </button>
                    </footer>
                </div>
            </form>
        </b-modal>
    </template>
</div>
</template>

<script>
import {Job, JobStatus, JobDataCollection, Task} from "cytomine-client";
import filesize from "filesize";

const REFRESH_INTERVAL = 2000;
const REFRESH_INTERVAL_DELETION_TASK = 1000;

export default {
    name: "job-details",
    props: ["job"],
    data() {
        return {
            loading: true,

            showParameters: false,

            allData: null,
            jobData: [],
            timeoutRefresh: null,

            deletionModal: false,
            deletionTask: null,
            timeoutRefreshDeletionTask: null
        };
    },
    computed: {
        project() {
            return this.$store.state.project.project;
        },
        isRunning() {
            return this.job.status == JobStatus.RUNNING;
        },
        isSuccessful() {
            return this.job.status == JobStatus.SUCCESS;
        },
        isFinished() {
            return this.isSuccessful || this.job.status == JobStatus.FAILED;
        },
        hasAnnotationResult() {
            return this.allData.annotations > 0;
        },
        hasFileResult() {
            return this.allData.jobDatas > 0;
        },
        lastCommentDeletionTask() {
            if(this.deletionTask && this.deletionTask.comments && this.deletionTask.comments.length > 0) {
                return this.deletionTask.comments[0];
            }
        }
    },
    methods: {
        async refresh(force=false) {
            if(this.isFinished && !force) {
                return;
            }

            let job = await Job.fetch(this.job.id);
            this.$emit("update", job);
            await this.fetchData();

            clearTimeout(this.timeoutRefresh);
            this.timeoutRefresh = setTimeout(this.refresh, REFRESH_INTERVAL);
        },
        filesize(size) {
            return filesize(size, {base: 10});
        },
        async fetchData() {
            this.allData = await this.job.fetchAllData();
            if(this.hasFileResult) {
                this.jobData = (await JobDataCollection.fetchAll({filterKey: "job", filterValue: this.job.id})).array;
            }
        },
        async deleteData() {
            let job = this.job.clone(); // create new job to avoid mutating the prop
            try {
                this.deletionTask = await new Task({project: this.project.id}).save();
                this.timeoutRefreshDeletionTask = setTimeout(this.refreshDeletionTask, REFRESH_INTERVAL_DELETION_TASK);
                await job.deleteAllData(this.deletionTask.id);
                this.refresh(true);
                this.deletionTask = null;
                this.deletionModal = false;
                this.$notify({type: "success", text: this.$t("notif-success-analysis-data-deletion")});
            }
            catch(error) {
                console.log(error);
                this.deletionTask = null;
                this.$notify({type: "error", text: this.$t("notif-error-analysis-data-deletion")});
            }
        },
        async refreshDeletionTask() {
            if(this.deletionTask == null) {
                return;
            }
            await this.deletionTask.fetch();
            clearTimeout(this.timeoutRefreshDeletionTask);
            this.timeoutRefreshDeletionTask = setTimeout(this.refreshDeletionTask, REFRESH_INTERVAL_DELETION_TASK);
        }
    },
    async created() {
        await this.fetchData();
        this.loading = false;
        this.timeoutRefresh = setTimeout(this.refresh, REFRESH_INTERVAL);
    },
    beforeDestroy() {
        clearTimeout(this.timeoutRefresh);
    }
};
</script>

<style scoped>
.job-details-wrapper {
    position: relative;
    min-height: 50px;
}

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

.inline-table {
    width: unset !important;
}

.inline-table td:first-child {
    font-weight: normal;
}

.inline-table td:not(:first-child) {
    width: unset;
}

ul {
    margin-left: 2em;
    list-style-type: disc;
}

.has-margin-top {
    margin-top: 1.5em;
}
</style>
