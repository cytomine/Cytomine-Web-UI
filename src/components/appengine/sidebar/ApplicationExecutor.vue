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
            <p>{{ $t("select-application") }}:</p>
            <cytomine-multiselect
              placeholder="Select an application"
              v-model="selectedApplication"
              :options="applications"
              label="name"
              track-by="namespace"
              :allow-empty="false"
              open-direction="bottom"
              :loading="isLoading"
              :multiple="false"
              custom-lable="nameWithVersion"
            >
              <template slot="singleLabel" slot-scope="props">
                <span class="option__desc">
                  <span class="option__title">{{ props.option.title }}</span>
                </span>
              </template>
            </cytomine-multiselect>

            <!-- <pre
              class="language-json"
            ><code>{{ selectedApplication  }}</code></pre> -->

            <pre
              class="language-json"
            ><code>{{ selectedApplicationInputs || 'undefined' }}</code></pre>
          </div>

          <div v-if="selectedApplication" id="app-inputs">
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
                >
                </b-numberinput>
              </b-field>
            </div>
          </div>

          <div id="app-run">

          </div>

          <div id="app-outputs"></div>
        </div>
      </div>
    </b-collapse>
  </div>
</template>

<script>
import { get, sync } from "@/utils/store-helpers";
import CytomineMultiselect from "@/components/form/CytomineMultiselect";
import Task from "@/utils/appengine/task";

// store options to use with store helpers to target projects/currentProject/listImages module
const storeOptions = { rootModuleProp: "storeModule" };

export default {
  name: "application-executor",
  components: {
    CytomineMultiselect,
  },
  data() {
    return {
      applications: [],
      selectedApplication: "",
      isLoading: false,
      selectedApplicationInputs: [],
    };
  },
  async created() {
    this.applications = await Task.fetchAll();

    // try {
    //   this.isLoading = true;
    //   await Promise.all([this.fetchTasks]);
    //   this.loading = false;
    // } catch (error) {
    //   console.log(error);
    //   this.error = true;
    //   return;
    // }
  },
  watch: {
    selectedApplication: {
      handler: "fetchSelectedApplicationInputs",
      immediate: true, // This ensures the initial call when selectedApplication is set
    },
  },
  methods: {
    async fetchTasks() {
      this.applications = await Task.fetchAll();
    },
    async fetchSelectedApplicationInputs() {
      if (this.selectedApplication) {
        try {
          await this.fetchTaskInputs();
        } catch (error) {
          console.error(
            "Error fetching the selected application inputs: " + error
          );
        }
      }
    },
    async fetchTaskInputs() {
      try {
        let selectedAppNamespace = this.selectedApplication["namespace"];
        let selectedAppVersion = this.selectedApplication["version"];

        const fetchedInputsObj = await Task.fetchTaskInputs(
          selectedAppNamespace,
          selectedAppVersion
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
        console.error("Error fetching task inputs: " + error);
      }
    },
    nameWithVersion({ name, version }) {
      return `${name} — [${version}]`;
    },
    getIntValidationMessage(input) {
      if (input.type.id === "integer") {
        let value = (input.value || "").trim(); // Ensure input.value exists and trim whitespace

        console.log(
          `${input.display_name}: getIntValidationMessage() value: ${value}`
        );
        console.log("type is: " + typeof value);

        if (value === "") {
          if (!input.optional) {
            return "This field is mandatory"; // Error message for mandatory field if it's empty
          }
          return ""; // No validation message for optional field if it's empty
        }

        // convert to number and check if it's not possible
        const parsedValue = parseInt(value);
        if (!parsedValue) {
          if (parsedValue == 0) return ""; // !0 will yield true
          return "Please enter a valid number"; // Handle non-numeric input
        }

        const { geq, leq, gt, lt } = input.type;

        if (
          geq !== undefined &&
          value < geq &&
          leq !== undefined &&
          value > leq
        ) {
          return `Value must be between ${geq} and ${leq}`;
        }

        if (geq !== undefined && value < geq) {
          return `Value must be greater than or equal ${geq}`;
        }

        if (leq !== undefined && value > leq) {
          return `Value must be less than or equal ${leq}`;
        }

        if (
          gt !== undefined &&
          value <= gt &&
          lt !== undefined &&
          value >= lt
        ) {
          return `Value must be greater than ${gt} and less than ${lt}`;
        }

        if (geq !== undefined && value < geq) {
          return `Value must be greater than ${geq}`;
        }

        if (leq !== undefined && value > leq) {
          return `Value must be less than ${leq}`;
        }
      }
      return ""; // No validation message by default
    },
    getInputType(input) {
      if (input && input.type) {
        if (input.type.id === "integer") {
          if (input.optional && input.value === "") {
            return ""; // No validation for optional field if it's empty
          }

          let value = input.value;
          console.log(`${input.display_name}: getInputType() value: ${value}`);

          // Add additional checks or logic as needed

          // Example: if (!Number.isInteger(value)) { return "is-danger"; }

          // Return any validation error or empty string if no error
        }
      }
      return ""; // No validation error by default
    },
    getMin(input) {
      const { geq, gt } = input.type;
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
      const { leq, lt } = input.type;
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
  },
  computed: {
    allowedApplications() {
      return this.applications;
    },
    // selectedApplication: sync("application", storeOptions),
    validInputs() {
      // Assuming selectedApplicationInputs is an array of inputs fetched from an API
      return this.selectedApplicationInputs.filter(
        (input) => input !== null && typeof input === "object"
      );
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

// Application Selector
#app-select {
  p {
    font-size: 0.9rem;
  }

  li {
    // color: $color !important;
    // width: 0.2rem;
  }
}

// Input feild
.b-num-input-feild {
  padding-bottom: 0.5rem;
}
</style>
