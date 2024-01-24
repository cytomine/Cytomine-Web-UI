<template>
  <div>
    <nav class="sidebar">
      <h1 class="sidebar-title">
        {{ `${$t("app-engine")}: ${project.name}` }}
      </h1>

      <div id="executor">
        <application-executor />
      </div>

      <div id="status">
        <application-current-status />
      </div>

      <div id="history">
        <application-history />
      </div>
    </nav>
  </div>
</template>

<script>
import { get, sync } from "@/utils/store-helpers";
import ApplicationCurrentStatus from "./ApplicationCurrentStatus.vue";
import ApplicationHistory from "./ApplicationsHistory.vue";
import ApplicationExecutor from "./ApplicationExecutor.vue";

export default {
  name: "appengine-sidebar",
  components: {
    ApplicationExecutor,
    ApplicationCurrentStatus,
    ApplicationHistory,
  },
  computed: {
    project: get("currentProject/project"),
    expanded: sync("currentUser/expandedSidebar"),
  },
};
</script>

<style lang="scss" scoped>
$background: #444;
$activeBackground: #4f4f4f;
$hoverBackground: #82aad8;
$color: #ccc;
$activeColor: #eee;
$hoverColor: white;
$arrowBackground: #484848;
$border: #383838;
$arrowColor: #888;

h1 {
  color: $color;
}

.sidebar {
  // width: 15rem;
  height: 100%;
  width: 16rem;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar-title {
  color: $activeColor;
  padding: 0.8em 0em 0.8em;
  width: 14.5rem !important;
  line-height: 1.8rem;
  text-align: center;
  font-size: 1rem;
  margin: 0;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-align: center;
  font-weight: 600;
}

section {
  width: 100%;
  height: 3.5rem;
}
</style>