<template>
  <div>
    <pre
      class="language-json"
    ><code>{{ selectedApplicationInputs || 'undefined' }}</code></pre>

    <div v-for="input in validInputs" :key="input.id">
      <b-field
        class="b-num-input-feild"
        :label="input.display_name"
        :type="getInputType(input)"
      >
        <b-numberinput
          v-if="input.type.id === 'integer'"
          :placeholder="input.default"
          :min="getMin(input)"
          :max="getMax(input)"
          :required="!input.optional"
          type="is-dark"
          size="is-small"
          v-model="inputValues[input.display_name]"
          @input="inputsChanged"
        >
        </b-numberinput>
      </b-field>
    </div>
  </div>
</template>

<script>
import Task from "@/utils/appengine/task";

export default {
  name: "input-gen",
  props: {
    selectedApplication: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      selectedApplicationInputs: [],
      selectedAppNamespace: "",
      selectedAppVersion: "",
      inputValues: {}, // store user input values
    };
  },
  created() {},
  watch: {
    selectedApplication: {
      handler: "fetchSelectedApplicationInputs",
      immediate: false, // This ensures no initial call when selectedApplication is set
    },
  },
  methods: {
    async fetchSelectedApplicationInputs() {
      if (this.selectedApplication) {
        try {
          await this.fetchTaskInputs();
          this.$emit("selectedApplication", this.selectedApplication);
          this.$emit("filledInputs", this.selectedApplicationInputs);
        } catch (error) {
          console.error(
            "Error fetching the selected application inputs: " + error
          );
        }
      }
    },
    async fetchTaskInputs() {
      try {
        this.selectedAppNamespace = this.selectedApplication["namespace"];
        this.selectedAppVersion = this.selectedApplication["version"];

        const fetchedInputsObj = await Task.fetchTaskInputs(
          this.selectedAppNamespace,
          this.selectedAppVersion
        );

        const fetchedInputsArray = Object.values(fetchedInputsObj || {});

        if (Array.isArray(fetchedInputsArray)) {
          this.selectedApplicationInputs = fetchedInputsArray;
        } else {
          console.error(
            "Inputs not found or not in array format:",
            fetchedInputsArray
          );
        }
      } catch (error) {
        console.error("Error fetching task inputs => " + error);
      }
    },
    getInputType(input) {
      if (input && input.type) {
        if (input.type.id === "integer") {
          if (input.optional && input.value === "") {
            return ""; // No validation for optional field if it's empty
          }

          let value = input.value;
          console.log(`${input.display_name}: getInputType() value: ${value}`);

          
          // Return any validation error or empty string if no error
        }
      }
      return ""; // No validation error by default
    },
    getMin(input) {
      let { geq, gt } = input.type;
      let min;

      // Check if any variable is undefined
      if (typeof geq === "undefined") {
        min = null;
      }
      if (typeof gt === "undefined") {
        min = null;
      }

      if (geq || geq == 0) return geq;

      // since max is actrually geq we need to do +1
      if (gt) return ++gt;

      return min;
    },
    getMax(input) {
      let { leq, lt } = input.type;
      let max;

      // Check if any variable is undefined
      if (typeof leq === "undefined") {
        max = null;
      }
      if (typeof lt === "undefined") {
        max = null;
      }

      // id leq or it's set to zero return it
      if (leq || leq == 0) return leq;

      // since max is atually leq we will do -1
      if (lt) return --lt;

      return max;
    },
    // Pre: Format the User Inputs for the AE API 0.1.0 then Emit them
    async prepareUserValues(values) {
      const formattedValues = [];

      for (const key in values) {
        if (Object.prototype.hasOwnProperty.call(values, key)) {
          const paramObj = {
            value: values[key],
            param_name: key,
          };
          formattedValues.push(paramObj);
        }
      }

      return formattedValues;
    },
    async inputsChanged() {
      // emit new input once it got changed
      this.$emit("input", await this.prepareUserValues(this.inputValues));
    },
  },
  computed: {
    allowedApplications() {
      return this.applications;
    },
    validInputs() {
      // Assuming selectedApplicationInputs is an array of inputs fetched from an API
      return this.selectedApplicationInputs.filter(
        (input) => input !== null && typeof input === "object"
      );
    },
  },
};
</script>
<style lang="scss" scoped></style>
