<template>
<div class="box error" v-if="!currentUser.adminByNow">
    <h2> {{ $t("access-denied") }} </h2>
    <p>{{ $t("insufficient-permission") }}</p>
</div>
<div class="content-wrapper" v-else>
    <div class="box">
        <b-tabs v-model="activeTab">
            <b-tab-item :label="$t('dashboard')">
                <admin-dashboard></admin-dashboard>
            </b-tab-item>

            <b-tab-item :label="$t('users')">
                <admin-users></admin-users>
            </b-tab-item>

            <b-tab-item :label="$t('configuration')">
                <admin-configuration></admin-configuration>
            </b-tab-item>
        </b-tabs>
    </div>
</div>
</template>

<script>
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminConfiguration from "./AdminConfiguration";

export default {
    name: "admin-panel",
    components: {
        AdminDashboard,
        AdminUsers,
        AdminConfiguration
    },
    data() {
        return {
            activeTab: 0,
            tabNames: [
                "dashboard",
                "users",
                "configuration"
            ]
        };
    },
    computed: {
        currentUser() {
            return this.$store.state.currentUser.user;
        }
    },
    watch: {
        activeTab(idx) {
            this.$router.push(`?tab=${this.tabNames[idx]}`);
        }
    },
    async created() {
        let idx = this.tabNames.indexOf(this.$route.query.tab);
        if(idx != -1) {
            this.activeTab = idx;
        }
    }
};
</script>