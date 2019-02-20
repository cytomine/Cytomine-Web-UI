<template>
<div class="navigation-tree-wrapper">
    <div v-for="(project, idProject, index) in navigationObject" :key="idProject">
        <div class="navbar-item project-item">{{project.name}}</div>
        <template v-for="viewer in project.viewers">
            <router-link class="navbar-item viewer-item" :to="viewer.path" :key="viewer.id">
                <div class="viewer-name">
                    <span>
                        <i class="fas fa-caret-right"></i>
                        {{viewer.name}}
                    </span>
                    <ul class="viewer-details" v-if="viewer.maps.length > 1">
                        <li v-for="map in viewer.maps" :key="map.imageInstance.id">
                            {{map.imageInstance.instanceFilename}}
                        </li>
                    </ul>
                </div>
                <a class="delete is-small" @click.stop.prevent="close(viewer.id)">
                </a>
            </router-link>
            <template></template>
        </template>
        <hr v-if="index < nbNavigationProjects - 1" class="navbar-divider">
    </div>
</div>
</template>

<script>
export default {
    name: "navigation-tree",
    computed: {
        navigationObject() {
            let data = {};
            let viewers = this.$store.state.images.viewers;
            for(let id in viewers) {
                let viewer = viewers[id];
                let nbMaps = viewer.maps.length;
                if(nbMaps == 0) {
                    return;
                }

                if(!(viewer.idProject in data)) {
                    data[viewer.idProject] = {name: viewer.nameProject, viewers: []};
                }

                data[viewer.idProject].viewers.push({
                    id,
                    name: nbMaps == 1 ? viewer.maps[0].imageInstance.instanceFilename : this.$t("viewer-group", {nbImages: nbMaps}),
                    path: this.$store.getters.pathViewer({idViewer: id}),
                    maps: viewer.maps
                });
            }
            return data;
        },
        nbNavigationProjects() {
            return Object.keys(this.navigationObject).length;
        }
    },
    methods: {
        close(id) {
            this.$store.commit("removeViewer", id);
        }
    }
};
</script>

<style lang="scss" scoped>
@import "~bulma/sass/utilities/mixins.sass";

.project-item {
    font-size: 0.9em;
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

.viewer-item .delete {
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
