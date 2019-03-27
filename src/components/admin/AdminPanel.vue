<template>
<div class="box error" v-if="!currentUser.adminByNow">
    <h2> {{ $t("access-denied") }} </h2>
    <p>{{ $t("insufficient-permission") }}</p>
</div>
<div class="content-wrapper" v-else>
    <b-field class="radio-buttons-fullwidth">
        <b-radio-button v-model="activeTab" native-value="dashboard" type="is-link">
            {{$t("dashboard")}}
        </b-radio-button>

        <b-radio-button v-model="activeTab" native-value="users" type="is-link">
            {{$t("users")}}
        </b-radio-button>

        <b-radio-button v-model="activeTab" native-value="configuration" type="is-link">
            {{$t("configuration")}}
        </b-radio-button>
    </b-field>

    <div class="box">
        <keep-alive>
            <component :is="activeComponent" />
        </keep-alive>
    </div>
</div>
</template>

<script>
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminConfiguration from "./AdminConfiguration";

const defaultTab = "dashboard";

export default {
    name: "admin-panel",
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
        },
        queriedTab() {
            return this.$route.query.tab;
        },
        activeComponent() {
            switch(this.activeTab) {
                case "dashboard":
                    return AdminDashboard;
                case "users":
                    return AdminUsers;
                case "configuration":
                    return AdminConfiguration;
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
            this.activeTab = this.queriedTab || defaultTab;
            if(this.activeComponent == null) {
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
.box {
    position: relative;
    min-height: 20em;
}
</style>
