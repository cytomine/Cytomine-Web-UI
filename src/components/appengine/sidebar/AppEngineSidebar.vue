<template>
  <div class="whole-sidebar">
    <div class="card executor">
      <header class="card-header">
        <p class="card-header-title subtitle">
          <i class="fas fa-cogs"></i>
          {{ $t("app-engine.execute-a-task") }}
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
          <task-io-form
            v-on:appengine:task:started="catchTaskRunLaunch"
            :task="selectedTask"
            :project-id="currentProjectId"
          />
        </section>
      </div>
    </div>
    <div class="card runs">
      <header class="card-header">
        <p class="card-header-title subtitle">
          <i class="fas fa-clock"></i>
          {{ $t("app-engine.previous-task-runs") }}
        </p>
      </header>

      <div class="card-content">
        <section class="content">
          <h5 class="subtitle">{{ $t('app-engine.runs.title') }}</h5>
          <task-run-table :task-runs="trackedTaskRuns"/>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import Task from '@/utils/appengine/task';
import TaskRun from '@/utils/appengine/task-run';
import TaskIoForm from '@/components/appengine/forms/TaskIoForm';
import TaskRunTable from '@/components/appengine/task-run/TaskRunTable';

import {get} from '@/utils/store-helpers';

export default {
  name: 'AppEngineSideBar',
  components: {
    TaskIoForm,
    TaskRunTable,
  },
  data() {
    return {
      selectedTask: null,
      userInputs: [], //users filled in inputs
      taskState: '',
      executedTaskRun: null,
      tasks: [],
      trackedTaskRuns: []
    };
  },
  async created() {
    await this.fetchTasks();

    setInterval(async () => {
      for (let taskRun of this.trackedTaskRuns) {
        let task = this.getTask(taskRun);

        // update task run in place
        if (taskRun.state !== 'CREATED' && !taskRun.inputs) {
          taskRun.inputs = await taskRun.fetchInputs();

          let binaryInputs = this.filterBinaryType(task, 'input');
          if (binaryInputs.length > 0) {
            for (let input of binaryInputs) {
              let index = taskRun.inputs.findIndex(i => i.param_name === input.name);
              this.$set(taskRun.inputs[index], 'value', await taskRun.fetchSingleIO(input.name, 'input'));
            }
          }
        }

        if (taskRun.state !== 'FINISHED' && taskRun.state !== 'FAILED') {
          await taskRun.fetch();

          if (taskRun.state === 'FINISHED' || taskRun.state === 'FAILED') {
            taskRun.outputs = await taskRun.fetchOutputs();

            let binaryOutputs = this.filterBinaryType(task, 'output');
            if (binaryOutputs.length > 0) {
              for (let output of binaryOutputs) {
                let index = taskRun.outputs.findIndex(o => o.param_name === output.name);
                this.$set(taskRun.outputs[index], 'value', await taskRun.fetchSingleIO(output.name, 'output'));
              }
            }
          }
        }
      }
    }, 2000);
  },
  computed: {
    currentProject: get('currentProject/project'),
    currentProjectId() {
      return this.currentProject.id;
    },
  },
  methods: {
    async catchTaskRunLaunch(event) {
      let taskRun = new TaskRun(event.resource);
      taskRun.project = this.currentProjectId;
      this.trackedTaskRuns = [taskRun, ...this.trackedTaskRuns];
    },
    async fetchTasks() {
      this.tasks = await Task.fetchAll();
      await Promise.all(
        this.tasks.map(async task => {
          task.inputs = await Task.fetchTaskInputs(task.namespace, task.version);
          task.outputs = await Task.fetchTaskOutputs(task.namespace, task.version);
        })
      );
    },
    getTask(taskRun) {
      return this.tasks.find(task => task.id === taskRun.task.id);
    },
    filterBinaryType(task, type) {
      let binaryType = ['file', 'image', 'wsi'];

      if (type === 'input') {
        return task.inputs.filter(input => binaryType.includes(input.type.id));
      }

      if (type === 'output') {
        return task.outputs.filter(output => binaryType.includes(output.type.id));
      }

      return [];
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

.whole-sidebar {
  background-color: white;
  height: 100%;
}

//
.runs {
  height: 50%;
}

.executor {
  height: 50%;
}
</style>
