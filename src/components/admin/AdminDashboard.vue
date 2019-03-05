<template>
<div class="admin-dashboard-wrapper">
    <b-loading :is-full-page="false" :active="loading"></b-loading>
    <template v-if="!loading">
        <h2>{{$t("currently")}}</h2>
        <div class="level">
            <div class="level-item has-text-centered">
                <div>
                <p class="heading">{{$t("online-users")}}</p>
                <p class="title">{{currentStats.users}}</p>
                </div>
            </div>
            <div class="level-item has-text-centered">
                <div>
                <p class="heading">{{$t("active-projects")}}</p>
                <p class="title">{{currentStats.projects}}</p>
                </div>
            </div>
            <div class="level-item has-text-centered">
                <div>
                <p class="heading">{{$t("used-storage-space")}}</p>
                <p class="title">{{Math.round(storageStats.usedP * 100)}}%</p>
                </div>
            </div>
        </div>

        <p v-if="currentStats.mostActiveProject">
            <strong>{{$t("most-active-project")}}</strong>:
            <router-link :to="`/project/${currentStats.mostActiveProject.project.id}`">
                {{currentStats.mostActiveProject.project.name}}
            </router-link>
            ({{$tc("count-active-users", currentStats.mostActiveProject.users, {count: currentStats.mostActiveProject.project})}})
        </p>

        <hr>

        <h2>{{$t("total")}}</h2>
        <div class="columns">
            <div class="column">
                <table class="table is-fullwidth">
                    <tbody>
                        <tr>
                            <td>{{totalCounts.users}}</td>
                            <td>{{$t("users")}}</td>
                        </tr>
                        <tr>
                            <td>{{totalCounts.projects}}</td>
                            <td>{{$t("projects")}}</td>
                        </tr>
                        <tr>
                            <td>{{totalCounts.images}}</td>
                            <td>{{$t("images")}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="column">
                <table class="table is-fullwidth">
                    <tbody>
                        <tr>
                            <td>{{totalCounts.ontologies}}</td>
                            <td>{{$t("ontologies")}}</td>
                        </tr>
                        <tr>
                            <td>{{totalCounts.terms}}</td>
                            <td>{{$t("terms")}}</td>
                        </tr>
                        <tr>
                            <td>{{totalCounts.userAnnotations}}</td>
                            <td>{{$t("user-annotations")}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="column">
                <table class="table is-fullwidth">
                    <tbody>
                        <tr>
                            <td>{{totalCounts.softwares}}</td>
                            <td>{{$t("softwares")}}</td>
                        </tr>
                        <tr>
                            <td>{{totalCounts.jobs}}</td>
                            <td>{{$t("algorithms")}}</td>
                        </tr>
                        <tr>
                            <td>{{totalCounts.jobAnnotations}}</td>
                            <td>{{$t("job-annotations")}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- TODO: Connections charts -->
    </template>
</div>
</template>

<script>
import {Cytomine} from "cytomine-client";

export default {
    name: "admin-dashboard",
    data() {
        return {
            loading: true,
            currentStats: {},
            totalCounts: {},
            storageStats: {},
        };
    },
    methods: {
        async fetchCurrentStats() {
            this.currentStats = await Cytomine.instance.fetchCurrentStats();
        },
        async fetchTotalCounts() {
            this.totalCounts = await Cytomine.instance.fetchTotalCounts();
        },
        async fetchStorageStats() {
            this.storageStats = await Cytomine.instance.fetchStorageStats();
        }
    },
    async created() {
        try {
            await Promise.all([
                this.fetchCurrentStats(),
                this.fetchTotalCounts(),
                this.fetchStorageStats()
            ]);
        }
        catch(error) {
            console.log(error);
            this.error = true;
        }
        this.loading = false;
    }
};
</script>

<style scoped>
.admin-dashboard-wrapper {
    position: relative;
    min-height: 10em;
}

td:first-child {
    font-weight: 600;
    text-align: right;
    padding-right: 1em;
}
</style>
