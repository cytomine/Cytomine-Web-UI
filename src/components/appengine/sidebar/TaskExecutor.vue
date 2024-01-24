<template>
  <div>
    <div class="card">
      <header class="card-header">
        <p class="card-header-title subtitle">
          <i class="fas fa-cogs"></i>
          {{ $t("app-engine.ae-task-executor") }}
        </p>
      </header>

      <div class="card-content">
        <section class="content">
          <b-field :label="$t('app-engine.form.select-task')">
            <b-select v-model="selectedTask" expanded>
              <option v-for="task in tasks" :key="`${task.namespace}/${task.version}`" :value="task">
                {{ task.name }} ({{ task.version }})
              </option>
            </b-select>
          </b-field>
        </section>

        <section class="content" v-if="selectedTask">
          <b-field :label="$t('app-engine.task.name')">
            <p>{{ selectedTask.name }} ({{ selectedTask.version }})</p>
          </b-field>
          <b-field :label="$t('description')">
            <p v-if="selectedTask.description && selectedTask.description.length > 0">
              {{ selectedTask.description }}
            </p>
            <p class="no-description"><em>{{ $t('app-engine.task.no-description') }}</em></p>
          </b-field>
        </section>

        <section class="content" v-if="selectedTask">
          <task-io-form :task="selectedTask"></task-io-form>
        </section>

          <!--
          <div id="app-run-btn">
            <run-app-button
              :selectedApplication="selectedTask"
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
          -->
      </div>
    </div>
  </div>
</template>

<script>
/*
import OutputGen from '../fields/OutputGen.vue';
import RunAppButton from '../fields/RunAppButton.vue';
*/
import Task from '@/utils/appengine/task';
import TaskIoForm from '@/components/appengine/forms/TaskIoForm';

import { get } from '@/utils/store-helpers';

export default {
  name: 'TaskExecutor',
  components: {
    TaskIoForm
  },
  data() {
    return {
      selectedTask: null,
      userInputs: [], //users filled in inputs
      taskState: '',
      executedTaskRun: null,
      tasks: []
    };
  },
  async created() {
    this.tasks = await Task.fetchAll();
  },
  computed: {
    currentProject: get('currentProject/project'),
    currentProjectId() {
      return this.currentProject.id;
    }
  },
  methods: {
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
$background: #888;
$color: white;
$hoverBackground: #82aad8;
$hoverColor: white;
$border: #383838;

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
  text-decoration: none;
  display: flex;
  align-items: center;
}

.card-header-title:hover {
  color: $hoverColor;
}

.card-header:hover {
  color: $hoverColor;
  background: $hoverBackground !important;
}

// for icons

.card-header-icon {
  color: $color;
}

.fas, .far {
  font-size: 1.25rem;
  width: 4rem;
  text-align: center;
  flex-shrink: 0;
}

</style>
