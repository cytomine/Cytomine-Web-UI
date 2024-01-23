<template>
  <div>
    <button id="app-run-btn" class="button is-link" @click="createTaskRun()">
      {{ $t("ae-run-app") }}
    </button>
  </div>
</template>

<script>
import Task from "@/utils/appengine/task";

export default {
  name: "run-app-button",
  props: {
    project: {
      type: Number,
      required: true,
    },
    selectedApplication: {
      type: Object,
      required: true,
    },
    inputValues: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      response: null,
      namespace: "",
      version: "",
      taskState: null,
    };
  },
  computed: {
    isFormValid() {
      // Perform your validation logic here based on inputValues or other fields
      // For instance, check if required fields are set, follow min/max value ranges, etc.
      // Return true if the form is valid and the button should be enabled
      // Otherwise, return false to disable the button
      // Example:
      // if (/* validation passes */) {
      //   return true;
      // } else {
      //   return false;
      // }
    },
  },
  methods: {
    // Step-1 Create Task Runner
    async createTaskRun() {
      // console.dir(this.inputValues);
      // console.log(JSON.stringify(this.inputValues, null, 4));

      try {
        this.namespace = this.selectedApplication["namespace"];
        this.version = this.selectedApplication["version"];

        const taskRun = await Task.createTaskRun(
          this.project,
          this.namespace,
          this.version
        );

        // Update task status [CREATED]
        this.taskState = taskRun.data.state;

        const taskRunId = taskRun.data.id;

        console.log("id: ", taskRunId);

        this.provisionTask(taskRunId, this.inputValues);
      } catch (e) {
        console.warn(e);
      }
    },
    // Step-2 Provision a Task Runner
    async provisionTask(taskRunId, userInputs) {
      try {
        console.log(JSON.stringify(userInputs, null, 4));

        const taskProvision = await Task.batchProvisionTask(
          this.project,
          taskRunId,
          userInputs
        );

        console.log("Provisioned input", taskProvision);

        // Single Provision (Loop Multi-request used before batchProvision used to work)
        // userInputs.forEach(async (input) => {
        //   const { param_name: paramName, value: paramValue } = input;

        //   const taskProvision = await Task.singleProvisionTask(
        //     this.project,
        //     taskRunId,
        //     paramName,
        //     input
        //   );

        //   console.log(`Provisioned input ${paramName}:`, taskProvision);
        // });

        // // Update task status [provisioned]
        // // To-Do: add state to the response from AE
        // // this.taskState = taskProvision.data.state;
        this.taskState = "Provisioned";

        this.runTask(taskRunId);
      } catch (error) {
        console.warn(error);
      }
    },
    // Step-3 Excute the Provisioned Task Runner
    async runTask(taskRunId) {
      try {
        const desired = {
          desired: "RUNNING",
        };
        // Simulating a res. until AE actually impl. these endpoints
        const executedTaskRun = { "output-param": 1, "id": taskRunId };
        // const executedTaskRun = await Task.runTask(this.project, taskRunId, desired);

        // Update taskState & emit it
        this.taskState = "Finished";
        this.$emit("taskState", this.taskState);

        // Emitting the ExecutedTaskRun
        this.$emit("executedTaskRun", executedTaskRun);
      } catch (e) {
        console.warn(e);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
