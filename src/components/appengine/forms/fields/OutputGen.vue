<template>
  <div>
    Outputs:
    <br />
    <div v-if="outputType === 'int'">{{ executedTaskRun }}</div>
  </div>
</template>

<script>
import Task from "@/utils/appengine/task";

export default {
  name: "output-gen",
  props: {
    project: {
      type: Number,
      required: true,
    },
    executedTaskRun: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      response: null,
      outputValues: {}, // store user output values
      outputType: null,
    };
  },
  async created() {
    console.log(JSON.stringify(this.executedTaskRun, null, 4));

    const executedTaskRunId = this.executedTaskRun["id"];
    // Step-1: Get the Outputs
    try {
      const outputValues = Task.fetchTaskRunOutput(
        this.project,
        executedTaskRunId
      );

      // Pass the OAPI Spec: 0.1.0 ArrayList<JsonObj> outputVlaues to show them
      this.showOutputs(outputValues);
    } catch (error) {
      console.log(error);
    }
  },

  methods: {
    // Step-2: show the outputs
    async showOutputs(outputValues) {
      // loop thru the list and get the type
      this.outputType = "int";
    },
  },
};
</script>

<style lang="scss" scoped></style>
