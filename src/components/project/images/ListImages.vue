<template>
<div class="list-images-wrapper">
    <div class="panel">
        <b-loading :is-full-page="false" :active="loading"></b-loading>
        <p class="panel-heading">
            {{$t("images")}}
            <a class="button is-link">{{$t('button-add-image')}}</a>
        </p>
        <div class="panel-block">
            <div class="search-block">
                <b-input class="search-images" v-model="searchString" :placeholder="$t('search-placeholder')"
                    type="search" icon="search"></b-input>
                <button class="button" @click="toggleFilterDisplay()">
                    <b-icon icon="filter" size="is-small"></b-icon>
                    <span>{{filtersOpened ? $t("button-hide-filters") : $t("button-show-filters")}}</span>
                </button>
            </div>

            <b-collapse :open="filtersOpened">
                <div class="filters">
                    <div class="columns">
                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("tags")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-multiselect v-model="selectedTags" :options="availableTags"
                                    label="name" track-by="id" :multiple="true">
                                </cytomine-multiselect>
                            </div>
                        </div>

                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("format")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-multiselect v-model="selectedFormats" :options="availableFormats" :multiple="true">
                                </cytomine-multiselect>
                            </div>
                        </div>

                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("vendor")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-multiselect v-model="selectedVendors" :options="availableVendors" :multiple="true">
                                </cytomine-multiselect>
                            </div>
                        </div>

                        <div class="column"></div>
                    </div>

                    <div class="columns">
                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("magnification")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-multiselect :multiple="true" :searchable="false"
                                    v-model="selectedMagnifications" :options="availableMagnifications">
                                </cytomine-multiselect>
                            </div>
                        </div>

                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("resolution")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-multiselect :multiple="true" :searchable="false"
                                    v-model="selectedResolutions" :options="availableResolutions">
                                </cytomine-multiselect>
                            </div>
                        </div>

                        <div class="column">
                            <div class="filter-label">
                                {{$t("width")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-slider v-model="boundsWidth" :max="maxWidth"
                                :show="initSliders"></cytomine-slider>
                            </div>
                        </div>

                        <div class="column">
                            <div class="filter-label">
                                {{$t("height")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-slider v-model="boundsHeight" :max="maxHeight"
                                :show="initSliders"></cytomine-slider>
                            </div>
                        </div>
                    </div>

                    <div class="columns">
                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("user-annotations")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-slider v-model="boundsUserAnnotations" :max="maxNbUserAnnotations"
                                :show="initSliders"></cytomine-slider>
                            </div>
                        </div>

                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("job-annotations")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-slider v-model="boundsJobAnnotations" :max="maxNbJobAnnotations"
                                :show="initSliders"></cytomine-slider>
                            </div>
                        </div>

                        <div class="column filter">
                            <div class="filter-label">
                                {{$t("reviewed-annotations")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-slider v-model="boundsReviewedAnnotations" :max="maxNbReviewedAnnotations"
                                :show="initSliders"></cytomine-slider>
                            </div>
                        </div>

                        <div class="column filter"></div>
                    </div>
                </div>
            </b-collapse>

            <b-table v-if="!loading" :data="filteredImages" class="table-images" :paginated="true" :per-page="perPage"
            pagination-size="is-small" detailed detail-key="id">

                <template slot-scope="props">
                    <b-table-column :label="$t('overview')" width="100">
                        <router-link :to="`/project/${props.row.project}/image/${props.row.id}`">
                            <img :src="props.row.thumb" :alt="props.row.instanceFilename" class="image-overview">
                        </router-link>
                    </b-table-column>

                    <b-table-column field="instanceFilename" :label="$t('name')" sortable width="400">
                        <router-link :to="`/project/${props.row.project}/image/${props.row.id}`">
                            {{ props.row.instanceFilename }}
                        </router-link>
                    </b-table-column>

                    <b-table-column field="magnification" :label="$t('magnification')" centered sortable width="100">
                        {{ props.row.magnification || $t("unknown") }}
                    </b-table-column>

                    <b-table-column field="numberOfAnnotations" :label="$t('user-annotations')" centered sortable width="100">
                        <a>{{ props.row.numberOfAnnotations }}</a>
                    </b-table-column>

                    <b-table-column field="numberOfJobAnnotations" :label="$t('job-annotations')" centered sortable width="100">
                        <a>{{ props.row.numberOfJobAnnotations }}</a>
                    </b-table-column>

                    <b-table-column field="numberOfReviewedAnnotations" :label="$t('reviewed-annotations')" centered sortable width="100">
                        <a>{{ props.row.numberOfReviewedAnnotations }}</a>
                    </b-table-column>

                    <b-table-column label=" " centered width="150">
                        <router-link :to="`/project/${props.row.project}/image/${props.row.id}`" class="button is-small is-link">
                            {{$t("button-open")}}
                        </router-link>
                    </b-table-column>
                </template>

                <template slot="detail" slot-scope="props">
                    <image-details :image="props.row"></image-details>
                </template>

                <template slot="empty">
                    <div class="content has-text-grey has-text-centered">
                        <p>{{$t("no-image")}}</p>
                    </div>
                </template>

                <template slot="bottom-left">
                    <b-select v-model="perPage" size="is-small">
                        <option value="10">10 {{$t("per-page")}}</option>
                        <option value="25">25 {{$t("per-page")}}</option>
                        <option value="50">50 {{$t("per-page")}}</option>
                        <option value="100">100 {{$t("per-page")}}</option>
                    </b-select>
                </template>
            </b-table>
        </div>
    </div>
</div>
</template>

<script>
import CytomineMultiselect from "@/components/utils/CytomineMultiselect";
import CytomineSlider from "@/components/utils/CytomineSlider";
import ImageDetails from "./ImageDetails";

import isBetweenBounds from "@/utils/is-between-bounds.js";
import vendorFromMime from "@/utils/vendor";

import {ImageInstanceCollection} from "cytomine-client";

export default {
    name: "list-images",
    components: {ImageDetails, CytomineMultiselect, CytomineSlider},
    props: ["project"],
    data() {
        return {
            images: [],
            searchString: "",
            perPage: 10,
            loading: true,
            // filters
            filtersOpened: false,
            initSliders: false,

            selectedTags: [],
            selectedFormats: [],
            selectedVendors: [],
            selectedMagnifications: [],
            selectedResolutions: [],

            boundsResolution: [0, 0],
            boundsWidth: [0, 0],
            boundsHeight: [0, 0],
            boundsUserAnnotations: [0, 0],
            boundsJobAnnotations: [0, 0],
            boundsReviewedAnnotations: [0, 0]
        };
    },
    computed: {
        filteredImages() {
            let filtered = this.images;

            if(this.searchString != "") {
                let str = this.searchString.toLowerCase();
                return filtered.filter(image => {
                    return image.instanceFilename.toLowerCase().indexOf(str) >= 0;
                });
            }

            // TODO: tags

            filtered = filtered.filter(image => this.selectedFormats.includes(image.extension));
            filtered = filtered.filter(image => ((image.vendor && this.selectedVendors.includes(image.vendor.name))
                || (image.vendor == null && this.selectedVendors.includes(this.$t("unknown")))));

            filtered = filtered.filter(image => (this.selectedMagnifications.includes(image.magnification)
                || (image.magnification == null && this.selectedMagnifications.includes(this.$t("unknown")))));
            filtered = filtered.filter(image => this.selectedResolutions.includes(image.resolutionFormatted));

            filtered = filtered.filter(image => isBetweenBounds(image.width, this.boundsWidth));
            filtered = filtered.filter(image => isBetweenBounds(image.height, this.boundsHeight));

            filtered = filtered.filter(image =>
                isBetweenBounds(image.numberOfAnnotations, this.boundsUserAnnotations));
            filtered = filtered.filter(image =>
                isBetweenBounds(image.numberOfJobAnnotations, this.boundsJobAnnotations));
            filtered = filtered.filter(image =>
                isBetweenBounds(image.numberOfReviewedAnnotations, this.boundsReviewedAnnotations));

            return filtered;
        },
        availableTags() {
            return [{id: 1, name:"Tag1"}, {id:2, name:"CHU"}, {id:3, name:"Demo"}]; // TODO
        },
        availableFormats() {
            let formats = [];
            this.images.forEach(image => {
                if(!formats.includes(image.extension)) {
                    formats.push(image.extension);
                }
            });
            return formats;
        },
        availableVendors() {
            let vendors = [];
            this.images.forEach(image => {
                let vendor = image.vendor ? image.vendor.name : this.$t("unknown");
                if(!vendors.includes(vendor)) {
                    vendors.push(vendor);
                }
            });
            return vendors;
        },
        availableMagnifications() {
            let magnifications = [];
            this.images.forEach(image => {
                let magn = image.magnification || this.$t("unknown");
                if(!magnifications.includes(magn)) {
                    magnifications.push(magn);
                }
            });
            return magnifications;
        },
        availableResolutions() {
            let resolutions = [];
            this.images.forEach(image => {
                let res = image.resolutionFormatted;
                if(!resolutions.includes(res)) {
                    resolutions.push(res);
                }
            });
            return resolutions;
        },
        maxWidth() {
            return Math.max(100, ...this.images.map(image => image.width));
        },
        maxHeight() {
            return Math.max(100, ...this.images.map(image => image.height));
        },
        maxNbUserAnnotations() {
            return Math.max(100, ...this.images.map(image => image.numberOfAnnotations));
        },
        maxNbJobAnnotations() {
            return Math.max(100, ...this.images.map(image => image.numberOfJobAnnotations));
        },
        maxNbReviewedAnnotations() {
            return Math.max(100, ...this.images.map(image => image.numberOfReviewedAnnotations));
        }
    },
    methods: {
        toggleFilterDisplay() {
            this.filtersOpened = !this.filtersOpened;
            this.initSliders = true; // for correct rendering of the sliders, need to show them only when container is displayed
        },
    },
    async created() {
        this.images = (await ImageInstanceCollection.fetchWithFilter("project", this.project.id)).array;
        this.loading = false;

        this.images.forEach(image => {
            image.vendor = vendorFromMime(image.mime);
            image.resolutionFormatted = (image.resolution != null) ?
                `${image.resolution.toFixed(3)} ${this.$t("um-per-pixel")}` : this.$t("unknown");
        });

        this.selectedVendors = this.availableVendors;
        this.selectedFormats = this.availableFormats;
        this.selectedMagnifications = this.availableMagnifications;
        this.selectedResolutions = this.availableResolutions;

        this.boundsWidth = [0, this.maxWidth];
        this.boundsHeight = [0, this.maxHeight];
        this.boundsUserAnnotations = [0, this.maxNbUserAnnotations];
        this.boundsJobAnnotations = [0, this.maxNbJobAnnotations];
        this.boundsReviewedAnnotations = [0, this.maxNbReviewedAnnotations];
    }
};
</script>

<style scoped>
.list-images-wrapper {
    padding: 30px 50px 30px 50px;
}

.panel-heading {
    display: flex;
    justify-content: space-between;
}

.image-overview {
    max-height: 45px;
    max-width: 128px;
}

.search-block {
    display: flex;
}
</style>

<style>
.search-images {
    max-width: 300px;
    margin-right: 10px;
}

.list-images-wrapper td, .list-images-wrapper th {
    vertical-align: middle !important;
}
</style>
