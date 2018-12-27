<template>
<div class="box">
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

        </b-tab-item>

        <b-tab-item :label="$t('image-filters')">
            
        </b-tab-item>
    </b-tabs>
</div>
</template>

<script>
import GeneralConfiguration from "./configuration-panels/GeneralConfiguration";
import ProjectMembers from "./configuration-panels/ProjectMembers";
import CustomUIProject from "./configuration-panels/CustomUIProject";

export default {
    name: "project-configuration",
    components: {
        GeneralConfiguration,
        ProjectMembers,
        "custom-ui-project": CustomUIProject
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
.box {
    margin: 20px 50px 20px 50px;
    min-height: 80vh;
}
</style>