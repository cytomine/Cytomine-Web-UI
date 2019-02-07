<template>
<div class="box error" v-if="!configUI['project-configuration-tab']">
    <h2> {{ $t("access-denied") }} </h2>
    <p>{{ $t("insufficient-permission") }}</p>
</div>
<div class="box" v-else>
    <b-tabs v-model="activeTab">
        <b-tab-item :label="$t('general')">
            <general-configuration></general-configuration>
        </b-tab-item>

        <b-tab-item :label="$t('members')">
            <project-members></project-members>
        </b-tab-item>

        <b-tab-item :label="$t('custom-ui')">
            <custom-ui-project></custom-ui-project>
        </b-tab-item>

        <b-tab-item :label="$t('softwares')">
            <project-softwares></project-softwares>
        </b-tab-item>

        <b-tab-item :label="$t('image-filters')">
            <project-image-filters></project-image-filters>
        </b-tab-item>
    </b-tabs>
</div>
</template>

<script>
import GeneralConfiguration from "./configuration-panels/GeneralConfiguration";
import ProjectMembers from "./configuration-panels/ProjectMembers";
import CustomUIProject from "./configuration-panels/CustomUIProject";
import ProjectSoftwares from "./configuration-panels/ProjectSoftwares";
import ProjectImageFilters from "./configuration-panels/ProjectImageFilters";

export default {
    name: "project-configuration",
    components: {
        GeneralConfiguration,
        ProjectMembers,
        "custom-ui-project": CustomUIProject,
        ProjectSoftwares,
        ProjectImageFilters
    },
    data() {
        return {
            activeTab: 0,
            tabNames: [
                "general",
                "members",
                "customUI",
                "softwares",
                "imageFilters"
            ]
        };
    },
    computed: {
        configUI() {
            return this.$store.state.project.configUI;
        }
    },
    watch: {
        activeTab(idx) {
            this.$router.push(`?tab=${this.tabNames[idx]}`);
        }
    },
    methods: {
    },
    async created() {
        let idx = this.tabNames.indexOf(this.$route.query.tab);
        if(idx != -1) {
            this.activeTab = idx;
        }
    }
};
</script>

<style scoped>
.box:not(.error) {
    margin: 20px 50px 20px 50px;
    min-height: 80vh;
}
</style>