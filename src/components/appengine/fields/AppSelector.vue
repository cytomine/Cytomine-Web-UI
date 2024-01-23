<template>
  <div id="app-select">
    <p>{{ $t("select-application") }}:</p>
    <cytomine-multiselect
      placeholder="Select an application"
      :value="value"
      @input="updateValue"
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
            ><code>{{ newValue  }}</code></pre> -->

    <!-- <div v-if="selectedApplication" id="app-inputs">
      <input-gen :selectedApplication="selectedApplication" />
    </div> -->

  </div>
</template>

<script>
import CytomineMultiselect from "@/components/form/CytomineMultiselect";
import Task from "@/utils/appengine/task";
import InputGen from "./InputGen.vue";

export default {
  name: "application-executor",
  components: {
    CytomineMultiselect,
    InputGen,
  },
  props: {
    value: {
      type: Object,
      default: "",
    },
  },
  data() {
    return {
      applications: [],
      isLoading: false,
    };
  },
  methods: {
    nameWithVersion({ name, version }) {
      return `${name} — [${version}]`;
    },
    updateValue(newValue) {
      this.$emit("input", newValue);
    },
  },
  async created() {
    this.applications = await Task.fetchAll();
  },
};
</script>

<style lang="scss" scoped>
#app-select {
  p {
    font-size: 0.9rem;
  }

  li {
    // color: $color !important;
    // width: 0.2rem;
  }
}
</style>
