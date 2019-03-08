<template>
<div class="box error" v-if="!configUI['project-configuration-tab']">
    <h2> {{ $t("access-denied") }} </h2>
    <p>{{ $t("insufficient-permission") }}</p>
</div>
<div class="content-wrapper" v-else>
    <b-field class="radio-buttons-fullwidth">
        <b-radio-button v-model="activeTab" native-value="general" type="is-link">
            {{$t("general")}}
        </b-radio-button>

        <b-radio-button v-model="activeTab" native-value="members" type="is-link">
            {{$t("members")}}
        </b-radio-button>

        <b-radio-button v-model="activeTab" native-value="customUI" type="is-link">
            {{$t("custom-ui")}}
        </b-radio-button>

        <b-radio-button v-model="activeTab" native-value="algorithms" type="is-link">
            {{$t("algorithms")}}
        </b-radio-button>

        <b-radio-button v-model="activeTab" native-value="imageFilters" type="is-link">
            {{$t("image-filters")}}
        </b-radio-button>
    </b-field>

    <div class="box tab-content">
        <keep-alive>
            <component :is="activeComponent"></component>
        </keep-alive>
    </div>
</div>
</template>

<script>
import GeneralConfiguration from "./configuration-panels/GeneralConfiguration";
import ProjectMembers from "./configuration-panels/ProjectMembers";
import CustomUIProject from "./configuration-panels/CustomUIProject";
import ProjectSoftwares from "./configuration-panels/ProjectSoftwares";
import ProjectImageFilters from "./configuration-panels/ProjectImageFilters";

const defaultTab = "general";

export default {
    name: "project-configuration",
    data() {
        return {
            activeTab: defaultTab
        };
    },
    computed: {
        configUI() {
            return this.$store.state.project.configUI;
        },
        queriedTab() {
            return this.$route.query.tab;
        },
        activeComponent() {
            switch(this.activeTab) {
                case "general":
                    return GeneralConfiguration;
                case "members":
                    return ProjectMembers;
                case "customUI":
                    return CustomUIProject;
                case "algorithms":
                    return ProjectSoftwares;
                case "imageFilters":
                    return ProjectImageFilters;
            }
        }
    },
    watch: {
        queriedTab() {
            this.changeTab();
        },
        activeTab() {
            if(this.activeTab != defaultTab || this.queriedTab != null) {
                this.$router.push(`?tab=${this.activeTab}`);
            }
        }
    },
    methods: {
        changeTab() {
            this.activeTab = this.$route.query.tab || defaultTab;
            if(this.activeComponent == null) {
                this.activeTab = defaultTab;
            }
        }
    },
    async created() {
        this.changeTab();
    }
};
</script>

<style scoped>
.tab-content {
    position: relative;
    min-height: 20em;
}
</style>
