<template>
  <div class="sidebar-wrapper" :class="{ expanded: expanded }" ref="ae_sidebar">
    <nav class="sidebar" @click="clickHandler">
      <h1 class="sidebar-title">{{ `${$t('app-engine')}: ${project.name}` }}</h1>

      <section id="executor">
        <a>
          <i class="fas fa-cloud-upload-alt"></i>
          {{ $t('ae-task-executor') }}
        </a>
      </section>

      <section id="status">
        <a>
          <i class="far fa-bell"></i>
          {{ $t('ae-status') }}
        </a>
      </section>

      <section id="history">
        <a>
          <i class="far fa-file-alt"></i>
          {{ $t('ae-history') }}
        </a>
      </section>

    </nav>

    <div class="arrow-sidebar" @click="expanded = false">
      <i></i>
    </div>

  </div>
</template>

<script>
import { get, sync } from '@/utils/store-helpers';
import constants from '@/utils/constants.js';

export default {
  name: 'appengine-sidebar',
  data() {
    return {
      algoEnabled: constants.ALGORITHMS_ENABLED
    };
  },
  computed: {
    project: get('currentProject/project'),
    expanded: sync('currentUser/expandedSidebar')
  },
  methods: {
    clickHandler(event) {
      let el = event.target;
      // expand if user clicked on any part of the sidebar
      if (!this.expanded) {
        this.expanded = true;
      }
    },
    transitionEndHandler() {
      // led to a change of the size of the content div => need to reload OL map
      // this to make sure that any one listing (CytomineImage.vue) will shrink the entire UI of what we see
      this.$eventBus.$emit('updateMapSize');
    }
  },
  mounted() {
    this.$refs.ae_sidebar.addEventListener('transitionend', this.transitionEndHandler);
  },
  beforeDestroy() {
    this.$refs.ae_sidebar.removeEventListener('transitionend', this.transitionEndHandler);
  }
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

h1 {
  color: $color;
}

.sidebar-wrapper {
  display: flex;
  height: 100%;
  background: $background;
  overflow: hidden;
  transition: width .2s linear;
  width: 4rem;
}

.sidebar-wrapper.expanded {
  width: 16rem;
}

.sidebar {
  width: 16rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar-title {
  padding: 0.8em 0em 0.8em;
  width: 14.5rem !important;
  line-height: 1.8rem;
  text-align: center;
  color: $background;
  font-size: 1rem;
  margin: 0;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-align: center;
  font-weight: 600;
}

.sidebar-wrapper.expanded .sidebar-title {
  color: $activeColor !important;
}

section {
  width: 100%;
  height: 3.5rem;
}

.bottom-menu {
  position: absolute;
  bottom: 0;
  left: 0;
}

a {
  position: relative;
  display: block;
  font-size: 0.85rem;
  height: 100%;
  font-weight: 600;
  color: $color;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.fas,
.far {
  font-size: 1.25rem;
  width: 4rem;
  text-align: center;
  flex-shrink: 0;
}

section a:hover {
  color: $hoverColor;
  background: $hoverBackground !important;
}

section.is-active a {
  box-shadow: inset 5px 0 0 $hoverBackground;
  color: $activeColor;
  background: $activeBackground;
}

.arrow-sidebar {
  width: 1.5rem;
  border-left: 1px solid $border;
  background: $arrowBackground;
  justify-content: center;
  display: flex;
  align-items: center;
}

.arrow-sidebar i {
  border: solid $arrowColor;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 0.25rem;
  transform: rotate(135deg);
  margin-left: 0.25rem;
}
</style>
    