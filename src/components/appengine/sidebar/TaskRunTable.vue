<template>
  <b-table
    :data="taskRuns"
    :detailed="true">

    <template #default="props">
      <b-table-column field="state">
        <task-run-state-icon :state="props.row.state"/>
      </b-table-column>

      <b-table-column>
        {{ props.row.task.name }} ({{ props.row.task.version }})
      </b-table-column>
    </template>

    <template #detail="props">
      <div v-if="props.row.inputs">

      </div>
      <div v-if="props.row.outputs">

      </div>
    </template>

  </b-table>
</template>

<script>
import TaskRunStateIcon from '@/components/appengine/task-run/TaskRunStateIcon';

export default {
  name: 'TaskRunTable',
  components: {
    TaskRunStateIcon
  },
  props: {
    taskRuns: {
      type: Array,
      required: true
    },
  },
  created() {
    console.log(this.taskRuns);
  }
};
</script>