<template>
  <div>
    <h3 class="subtitle">{{ $t('app-engine.ae-run-task') }}</h3>
    <section v-if="task">
      <!-- INPUTS -->
      <app-engine-field :parameter="input" v-model="inputs[input.name]" v-for="input in taskInputs" :key="input.id"></app-engine-field>
      <!-- TODO outputs when relevant -->
    </section>
    <section>
      <b-field class="buttons">
        <b-button type="is-primary" @click="runTask">{{ $t('app-engine.ae-run-task') }}</b-button>
      </b-field>
    </section>
  </div>
</template>

<script>
import Task from '@/utils/appengine/task';
import AppEngineField from '@/components/appengine/forms/AppEngineField';

export default {
  name: 'task-io-form',
  components: {
    AppEngineField
  },
  props: {
    task: {
      type: Task
    },
    projectId: {
      type: Number
    }
  },
  data () {
    return {
      taskInputs: [],
      inputs: {}
    };
  },
  async created() {
    let inputs = await Task.fetchTaskInputs(this.task.namespace, this.task.version);
    // sort inputs lexicographically
    this.taskInputs = inputs.sort((a, b) => {
      return a.name < b.name ? -1 : (a.name == b.name ? 0 : 1);
    });
  },
  methods: {
    async runTask() {
      // create task run and provision
      await Task.createTaskRun(this.projectId, this.task.namespace, this.task.version).then(async (taskRun) => {
        return await Task.batchProvisionTask(this.projectId, taskRun.id, this.getInputProvisions()).then(async (taskRunProvisions) => {
          // TODO reset form and send event
          return await Task.runTask(this.projectId, taskRun.id).then(async (taskRun) => {
            this.$buefy.toast.open({message: this.$t('app-engine.run.started'), type: 'is-success'});
            this.inputs = {}; // reset inputs
          });
        });
      }).catch(e => {
        this.$buefy.toast.open({message: e.message, type: 'is-danger'});
      });
    },
    getInputProvisions() {
      let provisions = [];
      for (let [paramName, value] of Object.entries(this.inputs)) {
        provisions.push({
          'value': value,
          'param_name': paramName
        });
      }
      return provisions;
    }
  }
};
</script>
