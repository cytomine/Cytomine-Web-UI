<template>
<!-- <div class="box error" v-if="!configUI['project-activity-tab']">
    <h2> {{ $t("access-denied") }} </h2>
    <p>{{ $t("insufficient-permission") }}</p>
</div> TODO once core handles activity-tab field -->
<div class="project-activity-wrapper">
    <div class="settings-container">
    <b-dropdown position="is-bottom-left">
        <button class="button is-hovered" slot="trigger"><i class="fas fa-cog"></i></button>

        <b-dropdown-item custom>
            <table class="table is-fullwidth">
                <tbody>
                    <tr>
                        <td>{{$t("display")}}</td>
                        <td>
                            <b-field class="toggle-component">
                                <b-radio-button v-model="activeComponent" native-value="project-activity-charts" size="is-small" type="is-link">
                                    {{$t("activity-charts")}}
                                </b-radio-button>

                                <b-radio-button v-model="activeComponent" native-value="project-activity-logs"  size="is-small" type="is-link">
                                    {{$t("activity-logs")}}
                                </b-radio-button>
                            </b-field>
                        </td>
                    </tr>
                    <tr>
                        <td>{{$t("time-period")}}</td>
                        <td class="date-selection">
                            <b-field>
                                <b-datepicker v-model="startDate" :placeholder="$t('from')" :max-date="endDate || new Date()"
                                            :month-names="moment.months()" :day-names="moment.weekdaysMin()"
                                            :date-formatter="date => moment(date).format('ll')" size="is-small">
                                    <div class="has-text-centered">
                                        <button class="button is-small is-link" :disabled="startDate == null" @click="startDate = null">
                                            {{$t("button-clear")}}
                                        </button>
                                    </div>
                                </b-datepicker>
                            </b-field>
                            <b-field>
                                <b-datepicker v-model="endDate" :placeholder="$t('to')" :min-date="startDate" :max-date="new Date()"
                                            :month-names="moment.months()" :day-names="moment.weekdaysMin()"
                                            :date-formatter="date => moment(date).format('ll')" size="is-small">
                                    <div class="has-text-centered">
                                        <button class="button is-small is-link" :disabled="endDate == null" @click="endDate = null">
                                            {{$t("button-clear")}}
                                        </button>
                                    </div>
                                </b-datepicker>
                            </b-field>
                        </td>
                    </tr>
                </tbody>
            </table>
        </b-dropdown-item>
    </b-dropdown>
    </div>

    <div class="content-wrapper">
        <keep-alive>
            <component :is="activeComponent"
                       :startDate="startDate ? startDate.getTime() : null"
                       :endDate="endDate ? endDate.setHours(23, 59, 59, 999) : null" />
        </keep-alive>
    </div>
</div>
</template>

<script>
import moment from "moment";

import ProjectActivityCharts from "./activity/ProjectActivityCharts";
import ProjectActivityLogs from "./activity/ProjectActivityLogs";

export default {
    name: "project-activity",
    components: {
        ProjectActivityCharts,
        ProjectActivityLogs
    },
    data() {
        return {
            activeComponent: "project-activity-charts",
            startDate: null,
            endDate: null
        };
    },
    computed: {
        configUI() {
            return this.$store.state.project.configUI;
        },
        moment() {
            return moment;
        },
    }
};
</script>

<style scoped>
.project-activity-wrapper {
    padding: 60px 50px 20px 50px;
    height: 100%;
}

.settings-container {
    position: absolute;
    right: 50px;
    top: 10px;
}

.content-wrapper {
    height: 100%;
}

td:first-child {
    font-weight: 600;
    padding-right: 20px;
    text-align: right;
}
</style>

<style>
.project-activity-wrapper h2 {
    font-size: 16px;
}

.project-activity-wrapper .settings-container > .dropdown > .dropdown-menu {
    min-width: 500px;
}

.project-activity-wrapper .date-selection .pagination .fas {
    color: #276CDA !important;
}

.project-activity-wrapper .date-selection .datepicker-cell.is-selected {
    background-color: #276CDA !important;
}

.project-activity-wrapper .date-selection .datepicker-cell.is-today {
    border-color: rgba(39, 108, 218, 0.5) !important;
}
</style>