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
              <!-- <template slot="selection">
                {{ selectedApplication }}
              </template> -->

              <template slot="singleLabel" slot-scope="props">
                <span class="option__desc">
                  <span class="option__title">{{ props.option.title }}</span>
                </span>
              </template>

              <template slot="option" slot-scope="props">
                <div class="option__desc">
                  <span class="option__title">{{ props.option.title }}</span>
                  <span class="option__small">{{ props.option.desc }}</span>
                </div>
              </template>
            </cytomine-multiselect>

            <pre
              class="language-json"
            ><code>{{ selectedApplication  }}</code></pre>
          </div>

          <div id="app-inputs"></div>

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
  methods: {
    async fetchTasks() {
      this.applications = await Task.fetchAll();
    },
    nameWithVersion({ name, version }) {
      return `${name} — [${version}]`;
    },
  },
  computed: {
    allowedApplications() {
      return this.applications;
    },
    // selectedApplication: sync("application", storeOptions),
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
</style>
