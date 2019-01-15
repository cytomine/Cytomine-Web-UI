<!-- TODO: fetch data from backend? need core to accept sort options ; then compare perf -->
<template>
<div class="annotations-table-wrapper">
    <div v-show="opened" class="annotations-table-opened">
        <button class="delete" @click="opened = false"></button>

        <div class="annotations-table-container" ref="tableContainer">
            <b-table :loading="loading"
                     :data="filteredAnnotations"
                     paginated
                     :current-page.sync="currentPage"
                     :per-page="perPage"
                     pagination-size="is-small"
                     backend-sorting
                     @sort="sort"
                     hoverable
                     :selected.sync="selectedAnnot">

                <template slot-scope="{row: annot, index}">
                    <b-table-column label="#" centered>
                        {{(currentPage - 1)*perPage + index + 1}}
                    </b-table-column>
                    <b-table-column :label="$t('creator')" field="creator" sortable>
                        {{annot.creator}}
                    </b-table-column>
                    <b-table-column :label="$t('geometry')" field="geomType" sortable>
                        {{annot.geomType}}
                    </b-table-column>
                    <b-table-column :label="$t('terms')" field="termsForFilter" sortable>
                        <template v-if="annot.term.length > 0">
                            <cytomine-term v-for="idTerm in annot.term" :key="idTerm"
                                            class="term"
                                            :term="terms.find(term => term.id == idTerm)" />
                        </template>
                        <em class="has-text-grey" v-else>{{$t("no-term")}}</em>
                    </b-table-column>
                    <b-table-column :label="$t('area')" field="area" sortable>
                        {{annot.area ? `${annot.area.toFixed(3)} ${annot.areaUnit}` : "-"}}
                    </b-table-column>
                    <b-table-column :label="$t('perimeter')" field="perimeter" sortable>
                        {{annot.perimeter ? `${annot.perimeter.toFixed(3)} ${annot.perimeterUnit}` : "-"}}
                    </b-table-column>
                    <b-table-column :label="$t('angles')">
                        -<!-- TODO -->
                    </b-table-column>
                    <b-table-column :label="$t('mean-grey-intensity')" field="greyIntensity" sortable>
                        -<!-- TODO -->
                    </b-table-column>
                    <b-table-column :label="$t('mean-color-intensity')" field="colorIntensity" sortable>
                        -<!-- TODO -->
                    </b-table-column>
                    <b-table-column label="" width="40">&zwnj;</b-table-column>
                </template>

                <template slot="bottom-left">
                    <b-select v-model="perPage" size="is-small">
                        <option value="10">10 {{$t("per-page")}}</option>
                        <option value="25">25 {{$t("per-page")}}</option>
                        <option value="50">50 {{$t("per-page")}}</option>
                        <option value="100">100 {{$t("per-page")}}</option>
                    </b-select>
                </template>

                <div slot="empty" class="has-text-centered">
                    {{$t("no-annotation")}}
                </div>
            </b-table>
        </div>
        <div class="table-footer buttons">
            <button class="button is-small" @click="activeModal = true">
                {{$t("filters")}}
            </button>
            <button class="button is-small"
                    :class="{'is-link': highlightFilteredAnnotations}"
                    @click="highlightFilteredAnnotations = !highlightFilteredAnnotations">
                {{$t('highlight-filtered')}}
            </button>
            <button class="button is-small">
                {{$t("export")}}
            </button> <!-- TODO -->
        </div>
    </div>

    <div v-show="!opened" class="opener" @click="opened = true">{{$t("annotations-table")}} <i class="fas fa-caret-up"></i></div>

    <b-modal :active.sync="activeModal" has-modal-card>
        <div class="modal-card annotations-table-filters-modal">
            <header class="modal-card-head">
                <p class="modal-card-title">{{$t("filters")}}</p>
            </header>
            <section class="modal-card-body">
                <div class="columns">
                    <div class="column filter">
                        <div class="filter-label">
                            {{$t("annotation-type")}}
                        </div>
                        <div class="filter-body">
                            <cytomine-multiselect v-model="selectedObjectTypes" :options="annotationTypes"
                                label="label" track-by="type" :multiple="true">
                            </cytomine-multiselect>
                        </div>
                    </div>

                    <div class="column filter">
                        <div class="filter-label">
                            {{$t("creator")}}
                        </div>
                        <div class="filter-body">
                            <cytomine-multiselect v-model="selectedUsers" :options="layers"
                                label="fullName" track-by="id" :multiple="true">
                            </cytomine-multiselect>
                        </div>
                    </div>
                </div>
                <div class="columns">
                    <div class="column filter">
                        <div class="filter-label">
                            {{$t("geometry")}}
                        </div>
                        <div class="filter-body">
                            <cytomine-multiselect v-model="selectedGeometries" :options="geometries" :multiple="true">
                            </cytomine-multiselect>
                        </div>
                    </div>

                    <div class="column filter">
                        <div class="filter-label">
                            {{$t("terms")}}
                        </div>
                        <div class="filter-body">
                            <cytomine-multiselect v-model="selectedTerms" :options="availableTerms"
                                label="name" track-by="id" :multiple="true">
                            </cytomine-multiselect>
                        </div>
                    </div>
                </div>
                <div class="columns">
                    <div class="column filter">
                        <div class="filter-label no-uppercase">
                            {{$t("area")}} <span v-if="areaUnit" class="no-uppercase">({{areaUnit}})</span>
                        </div>
                        <div class="filter-body">
                            <cytomine-slider v-model="areaBounds" :max="maxArea" :integerOnly="false" />
                        </div>
                    </div>

                    <div class="column filter">
                        <div class="filter-label">
                            {{$t("perimeter")}} <span v-if="perimeterUnit" class="no-uppercase">({{perimeterUnit}})</span>
                        </div>
                        <div class="filter-body">
                            <cytomine-slider v-model="perimeterBounds" :max="maxPerimeter" :integerOnly="false" />
                        </div>
                    </div>
                </div>
            </section>
            <footer class="modal-card-foot">
                <button class="button" @click="activeModal = false">{{$t("button-close")}}</button>
            </footer>
        </div>
    </b-modal>
</div>
</template>

<script>
import {AnnotationType, AnnotationCollection} from "cytomine-client";

import CytomineTerm from "@/components/term/CytomineTerm";
import CytomineMultiselect from "@/components/form/CytomineMultiselect";
import CytomineSlider from "@/components/form/CytomineSlider";

import {fullName} from "@/utils/user-utils.js";
import isBetweenBounds from "@/utils/is-between-bounds.js";

import {containsExtent} from "ol/extent";
import WKT from "ol/format/WKT";

export default {
    name: "annotations-table",
    components: {
        CytomineTerm,
        CytomineMultiselect,
        CytomineSlider
    },
    props: [
        "idViewer",
        "index",
        "view"
    ],
    data() {
        return {
            opened: false,
            loading: true,
            pendingReload: true,

            activeModal: false,

            perPage: 10,
            currentPage: 1,

            sortField: "id",
            sortAsc: true,

            annotations: [],
            selectedAnnot: null,
            highlightFilteredAnnotations: false,

            format: new WKT(),

            annotationTypes: [],
            selectedObjectTypes: [],
            selectedUsers: [],
            geometries: [],
            selectedGeometries: [],
            noTermOption: null,
            availableTerms: [],
            selectedTerms: [],
            areaBounds: [0, 1000],
            perimeterBounds: [0, 1]
        };
    },
    computed: {
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        image() {
            return this.imageWrapper.imageInstance;
        },
        terms() {
            return this.imageWrapper.terms;
        },
        selectedAnnotsIds() {
            return this.imageWrapper.selectedFeatures.map(ftr => ftr.id);
        },
        layers() {
            let layers = this.imageWrapper.selectedLayers || [];
            layers = layers.slice(); // create new array so that the modifications can be tracked with the watcher (see https://github.com/vuejs/vue/issues/2164)
            layers.forEach(layer => layer.fullName = fullName(layer));
            return layers;
        },
        maxArea() {
            return Math.max(1000, ...this.annotations.map(annot => annot.area));
        },
        maxPerimeter() {
            return Math.max(1, ...this.annotations.map(annot => annot.perimeter));
        },
        filteredAnnotations() {
            let selectedTypes = this.selectedObjectTypes.map(obj => obj.type);
            let selectedUsersIds = this.selectedUsers.map(user => user.id);
            let selectedTermsIds = this.selectedTerms.map(term => term.id);
            let includeNoTerm = this.selectedTerms.includes(this.noTermOption);

            let filtered = this.annotations.filter(annot => {
                let termFilter = annot.term.some(idTerm => selectedTermsIds.includes(idTerm)) ||
                    (annot.term.length == 0 && includeNoTerm);
                return selectedTypes.includes(annot.type) &&
                    this.selectedGeometries.includes(annot.geomType) &&
                    selectedUsersIds.includes(annot.user) &&
                    isBetweenBounds(annot.area, this.areaBounds) &&
                    isBetweenBounds(annot.perimeter, this.perimeterBounds) &&
                    termFilter;
            });

            filtered.sort((a, b) => {
                let aVal = a[this.sortField];
                let bVal = b[this.sortField];
                return (aVal === bVal) ? 0 : (aVal < bVal && this.sortAsc || aVal > bVal && !this.sortAsc) ? -1 : +1;
            });
            return filtered;
        },
        areaUnit() {
            return this.annotations.length == 0 ? null : this.annotations[0].areaUnit;
        },
        perimeterUnit() {
            return this.annotations.length == 0 ? null : this.annotations[0].perimeterUnit;
        }
    },
    watch: {
        async opened() {
            if(this.pendingReload) {
                await this.loadAnnotations();
            }
            this.scrollToSelectedAnnot();
        },
        selectedAnnotsIds(ids) {
            if(ids.length == 0) {
                this.selectedAnnot = null;
            }
            this.scrollToSelectedAnnot();
        },
        async selectedAnnot(annot) {
            if(annot == null || this.selectedAnnotsIds.includes(annot.id)) {
                return;
            }

            let layer = this.layers.find(layer => layer.id == annot.user);
            if(layer == null) {
                this.selectedAnnot = null;
                return;
            }

            await annot.fetch(); // refetch annotation to obtain location data
            let geom = this.format.readGeometry(annot.location);
            if(!containsExtent(this.view.$view.calculateExtent(), geom.getExtent())) {
                this.view.fit(geom, {duration: 500, padding: [10, 10, 10, 10], maxZoom: this.imageWrapper.zoom});
            }

            this.$eventBus.$emit("selectAnnotation", {annot, idViewer: this.idViewer, index: this.index});
        },
        layers(newLayers, oldLayers) {
            // update filters to include newly added layers
            let oldIds = oldLayers.map(layer => layer.id);
            newLayers.forEach(layer => {
                if(!oldIds.includes(layer.id)) {
                    this.selectedUsers.push(layer);
                }
            });
            // remove layers no longer available from filters
            let newLayersIds = newLayers.map(layer => layer.id);
            this.selectedUsers = this.selectedUsers.filter(user => newLayersIds.includes(user.id));

            this.loadAnnotations();
        },
        maxArea(newVal, oldVal) {
            // if new annotations lead to a change of the max, and that the upper bound was set to the previous max, update it
            if(this.areaBounds[1] == oldVal) {
                this.areaBounds[1] = newVal;
            }
        },
        maxPerimeter(newVal, oldVal) {
            // if new annotations lead to a change of the max, and that the upper bound was set to the previous max, update it
            if(this.perimeterBounds[1] == oldVal) {
                this.perimeterBounds[1] = newVal;
            }
        },
        filteredAnnotations() {
            this.setHighlighted();
        },
        highlightFilteredAnnotations() {
            this.setHighlighted();
        }
    },
    methods: {
        addAnnotationHandler(annotation) {
            if(annotation.image == this.image.id) {
                this.annotations.splice(0, 0, this.formatAnnotation(annotation));
            }
        },
        reloadAnnotationsHandler(idImage) {
            if(idImage == null || idImage == this.image.id) {
                this.loadAnnotations();
            }
        },
        editAnnotationHandler(updatedAnnot) {
            if(updatedAnnot.image == this.image.id) {
                let idx = this.annotations.findIndex(annot => annot.id == updatedAnnot.id);
                if(idx == -1) {
                    return;
                }
                this.$set(this.annotations, idx, this.formatAnnotation(updatedAnnot)); // annotations[idx] not reactive
                if(this.selectedAnnot != null && this.selectedAnnot.id == updatedAnnot.id) {
                    this.selectedAnnot = updatedAnnot;
                }
            }
        },
        deleteAnnotationHandler(deletedAnnot) {
            if(deletedAnnot.image == this.image.id) {
                this.annotations = this.annotations.filter(annot => annot.id != deletedAnnot.id);
            }
        },

        async loadAnnotations() {
            if(!this.opened) { // prevent unnecessary reload if table not visible but schedule a reload at next opening
                this.pendingReload = true;
                return;
            }

            this.pendingReload = false;

            if(this.layers.length == 0) {
                this.annotations = [];
                return;
            }

            // TODO in core: job annotations not returned when users field contains users and userjobs ;
            // if setting includeAlgo to true, user annotations not returned
            let annots = (await new AnnotationCollection({
                images: [this.image.id],
                showGIS: true,
                users: this.layers.map(layer => layer.id),
                // includeAlgo: true
            }).fetchAll()).array;

            annots.forEach(annot => this.formatAnnotation(annot));
            this.annotations = annots;

            this.loading = false;

            if(this.selectedAnnotsIds.length == 1) { // reselect annotation
                let idAnnot = this.selectedAnnotsIds[0];
                this.selectedAnnot = this.annotations.find(annot => annot.id == idAnnot);
            }
        },
        formatAnnotation(annot) {
            annot.termsForFilter = annot.term.length == 0 ? this.$t("no-term") :
                annot.term.map(idTerm => this.terms.find(t => t.id == idTerm).name).join();

            annot.geomType = this.$t(annot.perimeter == 0 ? "point" : annot.area == 0 ? "line" : "polygon");

            let creator = this.layers.find(user => user.id == annot.user);
            annot.creator = creator != null ? fullName(creator) : "-";

            return annot;
        },

        // need to perform the sort manually so that annotations array itself is sorted and we can retrieve correct
        // index for scrollToSelectedAnnot() method (actual sort performed in filteredAnnotations computed prop)
        sort(field, order) {
            this.sortField = field;
            this.sortAsc = (order == "asc");
        },

        async scrollToSelectedAnnot() {
            await this.$nextTick(); // wait for tableContainer to be rendered (if method called due to opening of table)
            if(this.opened && this.$refs.tableContainer && this.selectedAnnotsIds.length == 1) {
                let idAnnot = this.selectedAnnotsIds[0];
                let indexAnnot = this.filteredAnnotations.findIndex(annot => annot.id == idAnnot);
                if(indexAnnot == -1 || (this.selectedAnnot != null && idAnnot == this.selectedAnnot.id)) {
                    return;
                }

                this.selectedAnnot = this.filteredAnnotations[indexAnnot];

                // scroll so that selected annot is visible in table (approximately center)
                this.currentPage = Math.floor(indexAnnot / this.perPage) + 1;
                await this.$nextTick(); // wait for refresh of height of table according to data of current page

                let indexWithinPage = indexAnnot - (this.currentPage - 1)*this.perPage;
                let heightFooter = 35;
                let nbRows = Math.min(this.perPage, this.filteredAnnotations.length - (this.currentPage-1)*this.perPage);
                let rowHeight = (this.$refs.tableContainer.scrollHeight - heightFooter) / (nbRows + 1); // +1 for th
                let nbVisibleRows = (this.$refs.tableContainer.clientHeight - rowHeight - heightFooter) / rowHeight;
                this.$refs.tableContainer.scrollTop = rowHeight * (indexWithinPage - (nbVisibleRows - 1) / 2);
            }
        },

        setHighlighted() {
            let highlightedIds = this.highlightFilteredAnnotations ? this.filteredAnnotations.map(a => a.id) : [];
            this.$store.commit("setHighlightedFeaturesIds", {
                idViewer: this.idViewer,
                index: this.index,
                ids: highlightedIds
            });
        }
    },
    async created() {
        this.areaBounds[1] = this.maxArea;
        this.perimeterBounds[1] = this.maxPerimeter;

        this.annotationTypes = [
            {type: AnnotationType.ALGO, label: this.$t("job-annotations")},
            {type: AnnotationType.USER, label: this.$t("user-annotations")}
        ];
        this.selectedObjectTypes = this.annotationTypes;

        this.noTermOption = {id: 0, name: this.$t("no-term")};
        this.availableTerms = [...this.terms, this.noTermOption];
        this.selectedTerms = this.availableTerms;

        this.geometries = [this.$t("point"), this.$t("line"), this.$t("polygon")];
        this.selectedGeometries = this.geometries;

        this.selectedUsers = this.layers;
    },
    mounted() {
        this.$eventBus.$on("addAnnotation", this.addAnnotationHandler);
        this.$eventBus.$on("reloadAnnotations", this.reloadAnnotationsHandler);
        this.$eventBus.$on("editAnnotation", this.editAnnotationHandler);
        this.$eventBus.$on("deleteAnnotation", this.deleteAnnotationHandler);
    },
    beforeDestroy() {
        // unsubscribe from all events
        this.$eventBus.$off("addAnnotation", this.addAnnotationHandler);
        this.$eventBus.$off("reloadAnnotations", this.reloadAnnotationsHandler);
        this.$eventBus.$off("editAnnotation", this.editAnnotationHandler);
        this.$eventBus.$off("deleteAnnotation", this.deleteAnnotationHandler);
    }
};
</script>

<style scoped>
.annotations-table-opened {
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    background: #f5f5f5;
    height: 25vh;
}

.delete {
    position: absolute;
    right: 20px;
    top: 7px;
    z-index: 10;
}

.table-footer {
    position: absolute;
    bottom: 10px;
    justify-content: center;
    width: 100%;
}

.table-footer button {
    z-index: 10;
}

.annotations-table-container {
    overflow: auto;
    position: relative;
    border-bottom: 1px solid #ccc;
    height: 100%;
}

.opener {
    background: #f5f5f5;
    width: 200px;
    padding: 5px;
    border-radius: 5px 5px 0px 0px;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    margin: auto;
    text-align: center;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
    cursor: pointer;
}

.opener .fas {
    margin-left: 5px;
    font-size: 15px;
    line-height: 10px;
}
</style>

<style>
.annotations-table-container .term {
    margin-right: 10px;
}

.annotations-table-container .b-table {
    min-height: 100%;
    display: flex;
    flex-direction: column;
}

.annotations-table-container .b-table .table-wrapper {
   flex: 1;
}

.annotations-table-container .table {
    background-color: unset;
}

.annotations-table-container th {
    position: sticky;
    top: 0px;
    background: white;
    z-index: 1;
}

.annotations-table-container .b-table .table-wrapper {
    margin-bottom: 0px;
}

.annotations-table-container .b-table .level {
    position: sticky;
    bottom: 0px;
    background: white;
    z-index: 1;
    border-top: 2px solid #dbdbdb;
    padding: 5px 15px;
}

.annotations-table-container .pagination {
    margin: unset;
}

.annotations-table-container tr.is-selected {
    background: #cfe2f7 !important;
    color: unset !important;
}

.annotations-table-filters-modal, .annotations-table-filters-modal .modal-card-body {
    overflow: visible !important;
    width: 60vw !important;
}

</style>
