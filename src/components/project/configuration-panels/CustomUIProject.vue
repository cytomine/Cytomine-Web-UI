<!-- QUESTION: when disabling an option (e.g. images page of project), only hide link, or prevent user from viewing page? -->
<!-- QUESTION for Renaud: for new projects in which config was never changed, custom-ui/project/${id}.json does not return all properties, bug? or treat as true? -->
<template>
<table class="table custom-ui" v-if="!loading">
    <tbody v-for="category in customUITree" :key="category.label">
        <tr>
            <th colspan="3">{{$t(category.label)}}</th>
        </tr>
        <tr v-for="prop in category.props" v-if="customUI[prop.key]" :key="prop.key"> <!-- TODO remove v-if when question regarding partial results is answered -->
            <td>
                <i v-if="prop.superscript" class="superscript" :class="prop.superscript"></i>
                <i v-if="prop.icon" :class="prop.icon"></i>
                {{$t(prop.label)}}
            </td>
            <td>
                <button :class="['button', customUI[prop.key].ADMIN_PROJECT ? 'is-success' : 'is-danger']"
                        @click="toggleProp(prop.key, 'ADMIN_PROJECT')"
                        :disabled="prop.key == 'project-configuration-tab'">
                    {{$t("manager")}}
                </button>
            </td>
            <td>
                <button :class="['button', customUI[prop.key].CONTRIBUTOR_PROJECT ? 'is-success' : 'is-danger']"
                        @click="toggleProp(prop.key, 'CONTRIBUTOR_PROJECT')"
                        :disabled="prop.key == 'project-configuration-tab'">
                    {{$t("contributor")}}
                </button>
            </td>
        </tr>
    </tbody>
</table>
</template>

<script>
export default {
    name: "custom-ui-project",
    data() {
        return {
            loading: true,

            customUI: {},
            customUITree: [
                {
                    label: "project-side-bar",
                    props: [
                        {key: "project-images-tab", label: "images", icon: "far fa-images"},
                        {key: "project-annotations-tab", label: "annotations", icon: "far fa-edit"},
                        {key: "project-jobs-tab", label: "jobs", icon: "fas fa-tasks"},
                        {key: "project-activity-tab", label: "activity", icon: "fas fa-tachometer-alt"}, // TODO in core
                        {key: "project-info-tab", label: "information", icon: "fas fa-info-circle"}, // TODO in core
                        {key: "project-configuration-tab", label: "configuration", icon: "fas fa-cogs"}
                    ]
                },
                {
                    label: "viewer-panels",
                    props: [
                        {key: "project-explore-hide-tools", label: "all-panels"}, // hide all panels
                        {key: "project-explore-overview", label: "overview", icon: "fas fa-image"},
                        {key: "project-explore-info", label: "information", icon: "fas fa-info"},
                        {key: "project-explore-digital-zoom", label: "digital-zoom", icon: "fas fa-search"}, // TODO in core
                        {key: "project-explore-link", label: "link-images", icon: "fas fa-link"}, // TODO in core
                        {key: "project-explore-color-manipulation", label: "colors", icon: "fas fa-adjust"}, // TODO in core
                        {key: "project-explore-image-layers", label: "annotation-layers", icon: "fas fa-copy"},
                        {key: "project-explore-ontology", label: "ontology", icon: "fas fa-hashtag"},
                        {key: "project-explore-property", label: "properties", icon: "fas fa-tag"},
                        {key: "project-explore-follow", label: "broadcast", icon: "fas fa-street-view"}, // TODO in core
                        {key: "project-explore-guided-tour", label: "guided-tour", icon: "fas fa-map-signs"}, // TODO in core
                        {key: "project-explore-job", label: "jobs", icon: "fas fa-tasks"},
                        // list of annotations
                        {key: "project-explore-annotation-panel", label: "annotations-table", icon: "fas fa-table"},
                        
                    ]
                },
                {
                    label: "annotation-details",
                    props: [
                        // display annotation details in viewer
                        {key: "project-explore-annotation-main", label: "annotation-details-box"},
                        {key: "project-explore-annotation-geometry-info", label: "geometry-info",
                            icon: "fas fa-ruler-combined"}, // TODO in core
                        {key: "project-explore-annotation-description", label: "description", icon: "far fa-file-alt"},
                        {key: "project-explore-annotation-terms", label: "terms", icon: "fas fa-hashtag"}, // TODO in core
                        {key: "project-explore-annotation-properties", label: "properties", icon: "fas fa-tag"},
                        {key: "project-explore-annotation-attached-files", label: "attached-files", icon: "fas fa-paperclip"}, // TODO in core
                        {key: "project-explore-annotation-creation-info", label: "creation-info", icon: "fas fa-info"}, // TODO in core
                        {key: "project-explore-annotation-comments", label: "comments", icon: "fas fa-comment"}
                        
                    ]
                },
                {
                    label: "draw-tools",
                    props: [
                        {key: "project-tools-main", label: "all-draw-tools"},

                        {key: "project-tools-select", label: "select", icon: "fas fa-mouse-pointer"},

                        {key: "project-tools-point", label: "point", icon: "fas fa-map-marker-alt"},
                        {key: "project-tools-line", label: "line", icon: "fas fa-minus"}, // TODO in core
                        {key: "project-tools-rectangle", label: "rectangle", icon: "far fa-square"},
                        {key: "project-tools-circle", label: "circle", icon: "far fa-circle"},
                        {key: "project-tools-polygon", label: "polygon", icon: "fas fa-draw-polygon"},
                        {key: "project-tools-freehand", label: "freehand", icon: "fas fa-pencil-alt"},
                        {key: "project-tools-union", label: "freehand-correct-add", icon: "fas fa-pencil-alt",
                            superscript: "fas fa-plus"},
                        {key: "project-tools-diff", label: "freehand-correct-remove", icon: "fas fa-pencil-alt",
                            superscript: "fas fa-minus"},

                        {key: "project-tools-fill", label: "fill", icon: "fas fa-fill",},
                        {key: "project-tools-edit", label: "edit", icon: "fas fa-edit"},
                        {key: "project-tools-move", label: "move", icon: "fas fa-arrows-alt"},
                        {key: "project-tools-rotate", label: "rotate", icon: "fas fa-sync-alt"},
                        {key: "project-tools-delete", label: "delete", icon: "fas fa-trash-alt"},

                        {key: "project-tools-undo-redo", label: "undo-redo", icon: "fas fa-undo"}, // TODO in core
                    ]
                }
            ]
        };
    },
    computed: {
        project() {
            return this.$store.state.project.project;
        }
    },
    methods: {
        async toggleProp(prop, userType) {
            try {
                this.customUI[prop][userType] = !this.customUI[prop][userType];
                this.customUI = await this.project.saveUIConfig(this.customUI);
                this.$store.dispatch("fetchUIConfig");
            }
            catch(error) {
                console.log(error);
                this.customUI[prop][userType] = !this.customUI[prop][userType]; // revert change
                this.$notify({type: "error", text: this.$t("notif-error-custom-ui-change")});
            }           
        }
    },
    async created() {
        this.customUI = await this.project.fetchUIConfig();
        this.loading = false;
    }
};
</script>


<style scoped>
.custom-ui .button {
    padding: 0px 40px;
}

td, th {
    vertical-align: middle !important;
}

.fas, .far {
    width: 20px;
    text-align: center;
    margin-right: 10px;
}

.superscript {
    position: relative;
    font-size: 8px;
    width: 0px;
    bottom: 10px;
    right: 4px;
    margin-right: 0px;
}
</style>
