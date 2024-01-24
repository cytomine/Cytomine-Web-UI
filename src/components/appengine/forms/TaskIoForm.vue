<template>
  <div>
    <h3 class="subtitle">{{ $t('app-engine.ae-run-task') }}</h3>
    <section v-if="task">
      <!-- INPUTS -->
      <app-engine-field :parameter="input" v-model="inputs[input.name]" v-for="input in taskInputs" :key="input.id"></app-engine-field>
      <!-- TODO outputs when relevant -->
    </section>
    <section></section>
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
  }
};
</script>
