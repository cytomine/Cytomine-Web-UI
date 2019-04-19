<template>
<div class="navigation-tree-wrapper">
  <div v-for="(project, id, index) in projects" :key="project.id">

    <router-link
      class="navbar-item project-item"
      :to="`/project/${project.id}`"
    >
      {{project.name}}
      <a class="delete is-small" @click.stop.prevent="closeProject(project)"></a>
    </router-link>

    <template v-for="viewer in project.viewers">
      <router-link
        v-if="viewer.maps.length"
        class="navbar-item viewer-item"
        :to="viewerPath(project.id, viewer.id)"
        :key="viewer.id"
        exact
      >
        <div class="viewer-name">
          <span>
            <i class="fas fa-caret-right"></i>
            <template v-if="viewer.maps.length === 1">
              <image-name :image="viewer.maps[0].imageInstance" />
            </template>
            <template v-else>
              {{$t('viewer-group', {nbImages: viewer.maps.length})}}
            </template>
            {{viewer.name}}
          </span>
          <ul class="viewer-details" v-if="viewer.maps.length > 1">
            <li v-for="(map, idx) in viewer.maps" :key="idx">
              <image-name :image="map.imageInstance" />
            </li>
          </ul>
        </div>
        <a class="delete is-small" @click.stop.prevent="closeViewer(project.id, viewer.id)"></a>
      </router-link>
    </template>
    <hr v-if="index < projects.length - 1" class="navbar-divider">
  </div>
</div>
</template>

<script>
import ImageName from '@/components/image/ImageName';

export default {
  name: 'navigation-tree',
  components: {ImageName},
  computed: {
    projects() {
      return this.$store.state.projects;
    }
  },
  methods: {
    viewerPath(idProject, idViewer) {
      return this.$store.getters[`projects/${idProject}/viewers/${idViewer}/pathViewer`]();
    },
    closeProject(project) {
      let nbViewers = Object.keys(project.viewers).length;
      if(nbViewers) {
        this.$dialog.confirm({
          title: this.$t('confirm-close-project'),
          message: this.$t(
            'confirm-close-project-message',
            {viewers: this.$tc('count-viewers', nbViewers, {count: nbViewers})}
          ),
          type: 'is-danger',
          confirmText: this.$t('button-confirm'),
          cancelText: this.$t('button-cancel'),
          onConfirm: () => this.doCloseProject(project)
        });
        return;
      }
      this.doCloseProject(project);
    },
    doCloseProject(project) {
      this.$store.unregisterModule(['projects', project.id]);
    },
    closeViewer(idProject, idViewer) {
      this.$store.unregisterModule(['projects', idProject, 'viewers', idViewer]);
    }
  }
};
</script>

<style lang="scss" scoped>
@import '~bulma/sass/utilities/mixins.sass';

.project-item {
  color: #333;
}

.viewer-item {
  padding-left: 1.5rem !important;
  padding-right: 1.5rem !important;
  position: relative;
}

.viewer-item ul {
  color: #888;
  font-weight: normal;
  margin-left: 1rem;
  font-size: 0.85em;
}

.viewer-name {
  padding-right: 2rem;
}

.delete {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.navigation-tree-wrapper {
  @include desktop {
    max-height: 70vh;
    overflow: auto;
  }
}
</style>
