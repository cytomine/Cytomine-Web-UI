<template>
<li :key="action.id">
  <strong>{{Number(action.created) | moment('l LTS')}}:</strong>
  <span class="content" @mouseenter="enter" @mouseleave="leave">
    <router-link v-if="route" :to="route">
      {{action.message}}
    </router-link>
    <template v-else>{{action.message}}</template>
  </span>
  <div v-if="previewUrl" class="preview" :class="{visible: showPreview}">
    <div class="box">
      <img :src="previewUrl" />
    </div>
  </div>
</li>
</template>

<script>
const ANNOT = 1;
const IMAGE = 2;
const PROJECT = 3;

export default {
  name: 'activity-logs-item',
  props: {
    action: Object
  },
  data() {
    return {
      showPreview: false,
      previewUrl: null,
      route: null
    };
  },
  computed: {
    actionData() {
      return JSON.parse(this.action.data);
    },
    type() {
      switch(this.action.serviceName) {
        case 'userAnnotationService':
        case 'reviewedAnnotationService':
        case 'algoAnnotationService':
          return ANNOT;
        case 'imageInstanceService':
          return IMAGE;
        case 'projectService':
          return PROJECT;
      }
    }
  },
  methods: {
    enter() {
      this.showPreview = true;
    },
    leave() {
      this.showPreview = false;
    },
    annotationHandler(annot) {
      this.previewUrl = `${annot.url}?maxSize=125&complete=true&thickness=2&increaseArea=1.25&draw=true`;
      this.route = `/project/${annot.project}/image/${annot.image}/annot/${annot.id}`;
    },
    imageHandler(img) {
      if(img.deleted) {
        return;
      }
      this.previewUrl = img.thumb;
      this.route = `/project/${img.project}/image/${img.id}`;
    },
    projectHandler(project) {
      this.route = `/project/${project.id}`;
    },
    addCommandHandler() {
      switch(this.type) {
        case ANNOT:
          this.annotationHandler(this.actionData);
          break;
        case IMAGE:
          this.imageHandler(this.actionData);
          break;
        case PROJECT:
          this.projectHandler(this.actionData);
          break;
      }
    },
    editCommandHandler() {
      switch(this.type) {
        case ANNOT:
          // erratic core behaviour -> need to keep the defined new?Annotation property
          this.annotationHandler(
            this.actionData.newUserAnnotation ||
            this.actionData.newReviewedAnnotation ||
            this.actionData.newAlgoAnnotation ||
            this.actionData.newAnnotation
          );
          break;
        case IMAGE:
          this.imageHandler(this.actionData.newImageInstance);
          break;
      }
    }
  },
  created() {
    switch(this.action.className) {
      case 'be.cytomine.command.AddCommand':
        this.addCommandHandler();
        break;
      case 'be.cytomine.command.EditCommand':
        this.editCommandHandler();
        break;
      case 'be.cytomine.command.DeleteCommand':
        // object no longer available => cannot display preview or provide link
        break;
      default:
        console.log('Unknown command type ' + this.action.className);
    }
  }
};
</script>

<style scoped>
li {
  padding: 0.25em 2em;
  position: relative;
}

li:hover {
  background: rgba(0, 0, 0, 0.025);
}

.content {
  margin-left: 0.35em;
}

.preview {
  display: none;
  position: absolute;
  top: 1.75em;
  left: 15em;
  z-index: 100;
}

.preview.visible {
  display: block;
}

.preview img {
  max-height: 300px;
  max-width: 300px;
}

.box {
  padding: 0.7em;
}
</style>
