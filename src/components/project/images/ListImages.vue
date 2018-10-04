<template>
<div class="list-images-wrapper">
    <div class="panel">
        <b-loading :is-full-page="false" :active="loading"></b-loading>
        <p class="panel-heading">
            {{$t("images")}}
            <a class="button is-link">{{$t('button-add-image')}}</a>
        </p>
        <div class="panel-block">
            <b-input class="search-images" v-model="searchString" :placeholder="$t('search-placeholder')" type="search" icon="search"></b-input>

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

                    <!-- TODO scanner -->

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
import { mapState } from "vuex";

import ImageDetails from "./ImageDetails";

import {ImageInstanceCollection} from "cytomine-client";

export default {
    name: "list-images",
    components: {ImageDetails},
    props: ["project"],
    data() {
        return {
            images: [],
            searchString: "",
            perPage: 10,
            loading: true
        };
    },
    computed: {
        filteredImages() {
            let str = this.searchString.toLowerCase();
            return this.images.filter(image => {
                return image.instanceFilename.toLowerCase().indexOf(str) >= 0;
            });
        },
        ...mapState({currentUser: state => state.currentUser.user})
    },
    async created() {
        this.images = (await ImageInstanceCollection.fetchWithFilter("project", this.project.id)).array;
        this.loading = false;
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
</style>

<style>
.search-images {
    max-width: 300px;
}

.list-images-wrapper td, .list-images-wrapper th {
    vertical-align: middle !important;
}
</style>
