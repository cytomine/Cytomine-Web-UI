<template>
  <div>
    <b-collapse class="card" animation="slide" aria-id="contentIdForA11y3">
      <template #trigger="props">
        <div
          class="card-header"
          role="button"
          aria-controls="contentIdForA11y3"
          :aria-expanded="props.open"
        >
          <p class="card-header-title subtitle">
            <i class="fas fa-cloud-upload-alt"></i>
            {{ $t("ae-task-executor") }}
          </p>
          <a class="card-header-icon">
            <b-icon :icon="props.open ? 'angle-down' : 'angle-up'"> </b-icon>
          </a>
        </div>
      </template>

      <div class="card-content">
        <div class="content">
          <div id="app-select">
            <AppSelector v-model="selectedApplication" />
          </div>

          <div v-if="selectedApplication" id="app-inputs">
            <input-gen
              :selectedApplication="selectedApplication"
              @input="handleInputValues"
            />
          </div>

          <div id="app-run-btn">
            <run-app-button
              :selectedApplication="selectedApplication"
              :inputValues="userInputs"
              :project="currentProjectId"
              @taskState="handleTaskRunState"
              @executedTaskRun="handleExecutedTaskRun"
            />
          </div>

          <div v-if="taskState === 'Finished'" id="app-outputs">
            <output-gen
              :project="currentProjectId"
              :executedTaskRun="executedTaskRun"
            />
          </div>
        </div>
      </div>
    </b-collapse>
  </div>
</template>

<script>
import AppSelector from "../fields/AppSelector.vue";
import InputGen from "../fields/InputGen.vue";
import OutputGen from "../fields/OutputGen.vue";
import RunAppButton from "../fields/RunAppButton.vue";

import { get, sync } from "@/utils/store-helpers";

export default {
  name: "application-executor",
  components: {
    AppSelector,
    InputGen,
    RunAppButton,
    OutputGen,
  },
  data() {
    return {
      selectedApplication: {},
      userInputs: [], //users filled in inputs
      currentProjectId: "", // projected is needed to run a task/app
      taskState: "",
      executedTaskRun: null,
    };
  },
  computed: {
    project: get("currentProject/project"),
  },
  async created() {
    this.currentProjectId = this.project.id;
  },
  methods: {
    handleInputValues(inputValues) {
      this.userInputs = inputValues; // Assign emitted inputValues to userInputs property
    },
    handleTaskRunState(taskState) {
      this.taskState = taskState;
    },
    handleExecutedTaskRun(executedTaskRun) {
      this.executedTaskRun = executedTaskRun;
    },
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

.div {
  display: flex;
  height: 100%;
  background: $background;
  overflow: hidden;
  transition: width 0.2s linear;
  width: 4rem;
}

// ---- Header ----
.card-header {
  width: 100%;
  height: 3.5rem;
  background: $background;
}

.card-header-title {
  color: $color;
  position: relative;
  display: block;
  font-size: 0.85rem;
  height: 100%;
  //   font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.card-header-title:hover {
  color: $hoverColor;
}

// for icons
.fas,
.far {
  font-size: 1.25rem;
  width: 4rem;
  text-align: center;
  flex-shrink: 0;
}

div.is-active .card-header {
  box-shadow: inset 5px 0 0 $hoverBackground;
  color: $activeColor;
  background: $activeBackground;
}

div .card-header:hover {
  color: $hoverColor;
  background: $hoverBackground !important;
}

div.is-active .card-header {
  box-shadow: inset 5px 0 0 $hoverBackground;
  color: $activeColor;
  background: $activeBackground;
}

.card-header-icon {
  color: $color;
}

// ---- END Header ----

// ---- App Run Button ---
#app-run-btn {
  padding-top: 0.9rem;
}
// ---- END App Run Button ---
</style>
