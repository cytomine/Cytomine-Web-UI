<template>
<div class="box">
    <b-tabs v-model="activeTab">
        <b-tab-item :label="$t('general')">
            
        </b-tab-item>

        <b-tab-item :label="$t('members')">
            
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
import CustomUIProject from "./configuration-panels/CustomUIProject";

export default {
    name: "project-configuration",
    components: {"custom-ui-project": CustomUIProject},
    data() {
        return {
            activeTab: 0
        };
    },
    methods: {
    },
    async created() {
    }
};
</script>

<style scoped>
.box {
    margin: 20px 50px 20px 50px;
    min-height: 80vh;
}
</style>