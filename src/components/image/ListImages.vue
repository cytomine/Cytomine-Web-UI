<template>
<div class="box error" v-if="!configUI['project-images-tab']">
    <h2> {{ $t("access-denied") }} </h2>
    <p>{{ $t("insufficient-permission") }}</p>
</div>
<div class="box error" v-else-if="error">
    <h2> {{ $t("error") }} </h2>
    <p>{{ $t("unexpected-error-info-message") }}</p>
</div>
<div v-else class="list-images-wrapper content-wrapper">
    <b-loading :is-full-page="false" :active="loading"></b-loading>
    <div v-if="!loading" class="panel">
        <p class="panel-heading">
            {{$t("images")}}
            <button v-if="!currentUser.guestByNow" class="button is-link" @click="addImageModal = true">
                {{$t('button-add-image')}}
            </button>
        </p>
        <div class="panel-block">
            <div class="search-block">
                <b-input class="search-images" v-model="searchString" :placeholder="$t('search-placeholder')"
                    type="search" icon="search"></b-input>
                <button class="button" @click="toggleFilterDisplay()">
                    <span class="icon">
                        <i class="fas fa-filter"></i>
                    </span>
                    <span>{{filtersOpened ? $t("button-hide-filters") : $t("button-show-filters")}}</span>
                </button>
            </div>

            <b-collapse :open="filtersOpened">
                <div class="filters">
                    <div class="columns">
                        <div class="column filter is-one-quarter">
                            <div class="filter-label">
                                {{$t("format")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-multiselect v-model="selectedFormats" :options="availableFormats" :multiple="true">
                                </cytomine-multiselect>
                            </div>
                        </div>

                        <div class="column filter is-one-quarter">
                            <div class="filter-label">
                                {{$t("vendor")}}
                            </div>
                            <div class="filter-body">
                                <cytomine-multiselect v-model="selectedVendors" :options="availableVendors" :multiple="true">
                                </cytomine-multiselect>
                            </div>
                        </div>
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
                                {{$t("analysis-annotations")}}
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

            <b-table :data="filteredImages" class="table-images" :paginated="true" :per-page="perPage"
            pagination-size="is-small" detailed detail-key="id">

                <template v-slot:default="{row: image}">
                    <b-table-column :label="$t('overview')" width="100">
                        <router-link :to="`/project/${image.project}/image/${image.id}`">
                            <img :src="image.thumb" :alt="image.instanceFilename" class="image-overview">
                        </router-link>
                    </b-table-column>

                    <b-table-column field="instanceFilename" :label="$t('name')" sortable width="400">
                        <router-link :to="`/project/${image.project}/image/${image.id}`">
                            {{ image.instanceFilename }}
                        </router-link>
                    </b-table-column>

                    <b-table-column field="magnification" :label="$t('magnification')" centered sortable width="100">
                        {{ image.magnification || $t("unknown") }}
                    </b-table-column>

                    <b-table-column field="numberOfAnnotations" :label="$t('user-annotations')" centered sortable width="100">
                        <router-link :to="`/project/${image.project}/annotations?image=${image.id}`">
                            {{ image.numberOfAnnotations }}
                        </router-link>
                    </b-table-column>

                    <b-table-column field="numberOfJobAnnotations" :label="$t('analysis-annotations')" centered sortable width="100">
                        <router-link :to="`/project/${image.project}/annotations?image=${image.id}&type=algo`">
                            {{ image.numberOfJobAnnotations }}
                        </router-link>
                    </b-table-column>

                    <b-table-column field="numberOfReviewedAnnotations" :label="$t('reviewed-annotations')" centered sortable width="100">
                        <a>{{ image.numberOfReviewedAnnotations }}</a> <!-- TODO router link -->
                    </b-table-column>

                    <b-table-column label=" " centered width="150">
                        <router-link :to="`/project/${image.project}/image/${image.id}`" class="button is-small is-link">
                            {{$t("button-open")}}
                        </router-link>
                    </b-table-column>
                </template>

                <template v-slot:detail="{row: image}">
                    <image-details :image="image" :excludedProperties="excludedProperties"
                                   @delete="deleteImage(image.id)"
                                   @setResolution="(event) => setResolution(image, event)"
                                   @setMagnification="(event) => setMagnification(image, event)">
                    </image-details>
                </template>

                <template v-slot:empty>
                    <div class="content has-text-grey has-text-centered">
                        <p>{{$t("no-image")}}</p>
                    </div>
                </template>

                <template v-slot:bottom-left>
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

    <add-image-modal :active.sync="addImageModal" @addImage="addImage"></add-image-modal>
</div>
</template>

<script>
import CytomineMultiselect from "@/components/form/CytomineMultiselect";
import CytomineSlider from "@/components/form/CytomineSlider";
import ImageDetails from "./ImageDetails";
import AddImageModal from "./AddImageModal";

import isBetweenBounds from "@/utils/is-between-bounds.js";
import vendorFromMime from "@/utils/vendor";

import {ImageInstanceCollection} from "cytomine-client";

export default {
    name: "list-images",
    components: {
        ImageDetails,
        CytomineMultiselect,
        CytomineSlider,
        AddImageModal
    },
    data() {
        return {
            loading: true,
            error: false,

            images: [],
            searchString: "",
            perPage: 10,

            // filters
            filtersOpened: false,
            initSliders: false,

            selectedFormats: [],
            selectedVendors: [],
            selectedMagnifications: [],
            selectedResolutions: [],

            boundsResolution: [0, 0],
            boundsWidth: [0, 0],
            boundsHeight: [0, 0],
            boundsUserAnnotations: [0, 0],
            boundsJobAnnotations: [0, 0],
            boundsReviewedAnnotations: [0, 0],

            addImageModal: false,

            excludedProperties: [
                "overview",
                "instanceFilename",
                "magnification",
                "numberOfAnnotations",
                "numberOfJobAnnotations",
                "numberOfReviewedAnnotations"
            ]
        };
    },
    computed: {
        currentUser() {
            return this.$store.state.currentUser.user;
        },
        project() {
            return this.$store.state.project.project;
        },
        configUI() {
            return this.$store.state.project.configUI;
        },
        filteredImages() {
            let filtered = this.images;

            if(this.searchString != "") {
                let str = this.searchString.toLowerCase();
                filtered = filtered.filter(image => {
                    return image.instanceFilename.toLowerCase().indexOf(str) >= 0;
                });
            }

            filtered = filtered.filter(image => this.selectedFormats.includes(image.extension));
            filtered = filtered.filter(image => this.selectedVendors.includes(image.vendorFormatted));

            filtered = filtered.filter(image => this.selectedMagnifications.includes(image.magnificationFormatted));
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
                let vendor = image.vendorFormatted;
                if(!vendors.includes(vendor)) {
                    vendors.push(vendor);
                }
            });
            return vendors;
        },
        availableMagnifications() {
            let magnifications = [];
            this.images.forEach(image => {
                let magn = image.magnificationFormatted;
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

        async deleteImage(idDeleted) {
            this.images = this.images.filter(image => image.id != idDeleted);
        },

        addImage(image) {
            this.formatImage(image);

            // check if it is needed to update filters so that new images are displayed
            let addFormat = !this.availableFormats.includes(image.extension);
            let addVendor = !this.availableVendors.includes(image.vendorFormatted);
            let addMagnification = !this.availableMagnifications.includes(image.magnificationFormatted);
            let addResolution = !this.availableResolutions.includes(image.resolutionFormatted);
            let updateMaxWidth = this.boundsWidth[1] == this.maxWidth && image.width > this.maxWidth;
            let updateMaxHeight = this.boundsHeight[1] == this.maxHeight && image.height > this.maxHeight;
            // ---

            this.images.unshift(image);

            if(addFormat) {
                this.selectedFormats.push(image.extension);
            }
            if(addVendor) {
                this.selectedVendors.push(image.vendorFormatted);
            }
            if(addMagnification) {
                this.selectedMagnifications.push(image.magnificationFormatted);
            }
            if(addResolution) {
                this.selectedResolutions.push(image.resolutionFormatted);
            }
            if(updateMaxWidth) {
                this.boundsWidth[1] = image.width;
            }
            if(updateMaxHeight) {
                this.boundsHeight[1] = image.height;
            }
        },

        setResolution(image, resolution) {
            image.resolution = resolution;
            // check if it is needed to update filters so that new images are displayed
            let addResolution = !this.availableResolutions.includes(this.formatResolution(resolution));

            this.formatImage(image);

            if(addResolution) {
                this.selectedResolutions.push(image.resolutionFormatted);
            }
        },

        setMagnification(image, magnification) {
            image.magnification = magnification;
            // check if it is needed to update filters so that new images are displayed
            let addMagnification = !this.availableMagnifications.includes(this.formatMagnification(magnification));

            this.formatImage(image);

            if(addMagnification) {
                this.selectedMagnifications.push(image.magnificationFormatted);
            }
        },

        formatImage(image) {
            // use $set to make the new props reactive
            this.$set(image, "resolutionFormatted", this.formatResolution(image.resolution));
            this.$set(image, "vendor", vendorFromMime(image.mime));
            this.$set(image, "vendorFormatted", this.formatVendor(image.vendor));
            this.$set(image, "magnificationFormatted", this.formatMagnification(image.magnification));
            return image;
        },

        formatResolution(resolution) {
            return (resolution != null) ? `${resolution.toFixed(3)} ${this.$t("um-per-pixel")}` : this.$t("unknown");
        },

        formatVendor(vendor) {
            return vendor ? vendor.name : this.$t("unknown");
        },

        formatMagnification(magnification) {
            return magnification || this.$t("unknown");
        }
    },
    async created() {
        try {
            this.images = (await ImageInstanceCollection.fetchAll({filterKey: "project", filterValue: this.project.id})).array;
            this.images.forEach(image => this.formatImage(image));

            this.selectedVendors = this.availableVendors;
            this.selectedFormats = this.availableFormats;
            this.selectedMagnifications = this.availableMagnifications;
            this.selectedResolutions = this.availableResolutions;

            this.boundsWidth = [0, this.maxWidth];
            this.boundsHeight = [0, this.maxHeight];
            this.boundsUserAnnotations = [0, this.maxNbUserAnnotations];
            this.boundsJobAnnotations = [0, this.maxNbJobAnnotations];
            this.boundsReviewedAnnotations = [0, this.maxNbReviewedAnnotations];

            this.loading = false;
        }
        catch(error) {
            console.log(error);
            this.error = true;
        }
    }
};
</script>

<style scoped>
.panel-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
