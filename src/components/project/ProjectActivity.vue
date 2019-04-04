<template>
<div class="box error" v-if="!configUI['project-activities-tab']">
    <h2> {{ $t("access-denied") }} </h2>
    <p>{{ $t("insufficient-permission") }}</p>
</div>
<div v-else class="project-activity-wrapper content-wrapper">
    <div class="columns">
        <div class="column">
            <b-field class="radio-buttons-fullwidth is-hovered">
                <b-radio-button v-model="activeTab" native-value="charts" type="is-link">
                    {{$t("activity-charts")}}
                </b-radio-button>

                <b-radio-button v-model="activeTab" native-value="members" type="is-link">
                    {{$t("members-activity")}}
                </b-radio-button>

                <b-radio-button v-model="activeTab" native-value="logs" type="is-link">
                    {{$t("activity-logs")}}
                </b-radio-button>
            </b-field>
        </div>
        <div class="column is-narrow">
            <b-dropdown position="is-bottom-left" class="date-picker-dropdown" :disabled="activeTab === 'members'">
                <template #trigger>
                    <button class="button is-hovered"><i class="far fa-calendar"></i></button>
                </template>

                <b-dropdown-item custom>
                    <b-field :label="$t('from')" horizontal>
                        <cytomine-datepicker v-model="startDate" :maxDate="endDate || new Date()" />
                    </b-field>
                    <b-field :label="$t('to')" horizontal>
                        <cytomine-datepicker v-model="endDate" :minDate="startDate" :maxDate="new Date()" />
                    </b-field>
                </b-dropdown-item>
            </b-dropdown>
        </div>
    </div>

    <div class="component-wrapper">
        <keep-alive>
            <component
                :is="activeComponent"
                :startDate="startDate ? startDate.getTime() : null"
                :endDate="endDate ? endDate.setHours(23, 59, 59, 999) : null"
            />
        </keep-alive>
    </div>
</div>
</template>

<script>
import moment from "moment";

import ProjectActivityCharts from "./activity/ProjectActivityCharts";
import MembersActivity from "./activity/MembersActivity";
import ProjectActivityLogs from "./activity/ProjectActivityLogs";

import CytomineDatepicker from "@/components/form/CytomineDatepicker";

const defaultTab = "charts";

export default {
    name: "project-activity",
    components: {CytomineDatepicker},
    data() {
        return {
            activeTab: defaultTab,
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
        queriedTab() {
            return this.$route.query.tab;
        },
        activeComponent() {
            switch(this.activeTab) {
                case "charts":
                    return ProjectActivityCharts;
                case "members":
                    return MembersActivity;
                case "logs":
                    return ProjectActivityLogs;
            }
        }
    },
    watch: {
        queriedTab() {
            this.changeTab();
        },
        activeTab() {
            if(this.activeTab !== defaultTab || this.queriedTab) {
                this.$router.push(`?tab=${this.activeTab}`);
            }
        }
    },
    methods: {
        changeTab() {
            this.activeTab = this.queriedTab || defaultTab;
            if(!this.activeComponent) {
                this.activeTab = defaultTab;
            }
        }
    },
    created() {
        this.changeTab();
    }
};
</script>

<style scoped>
.project-activity-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.component-wrapper {
    flex: 1;
    min-height: 20em;
}

td:first-child {
    font-weight: 600;
    padding-right: 20px;
    text-align: right;
}
</style>

<style>
.project-activity-wrapper .date-picker-dropdown.dropdown > .dropdown-menu {
    min-width: 20em;
}
</style>
