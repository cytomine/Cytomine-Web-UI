<template>
<div class="box error" v-if="error">
    <h2> {{ $t("error") }} </h2>
    <p>{{ $t("unexpected-error-info-message") }}</p>
</div>
<div v-else class="advanced-search-results">
    <div class="panel">
        <p class="panel-heading">
            {{$t("advanced-search")}}
        </p>
        <div class="panel-block">
            <b-input class="search-projects" v-model="searchString" :placeholder="$t('search-placeholder')" type="search" icon="search"></b-input>
        </div>
        <p class="panel-tabs">
            <a :class="{'is-active': activeTab == 'projects'}" @click="activeTab = 'projects'">
                {{$t("projects")}} ({{filteredProjects.length}})
            </a>
            <a :class="{'is-active': activeTab == 'images'}" @click="activeTab = 'images'">
                {{$t("images")}} ({{filteredImages.length}})
            </a>
        </p>
        <div class="panel-block">
            <b-loading :is-full-page="false" :active="loading"></b-loading>

            <b-table v-show="activeTab == 'projects'" :data="filteredProjects" :paginated="true" :per-page="perPage"
            pagination-size="is-small" :key="'projects'">

                <template slot-scope="props">
                    <b-table-column :label="$t('name')" width="100">
                        <router-link :to="`/project/${props.row.id}`">
                            {{ props.row.name }}
                        </router-link>
                    </b-table-column>

                    <b-table-column label="" width="150" numeric>
                        <router-link :to="`/project/${props.row.id}`" class="button is-small is-link">
                            {{$t("button-open")}}
                        </router-link>
                    </b-table-column>
                </template>

                <template slot="empty">
                    <div class="content has-text-grey has-text-centered">
                        <p>{{$t("no-project")}}</p>
                    </div>
                </template>
            </b-table>

            <b-table v-show="activeTab == 'images'" :data="filteredImages" :paginated="true" :per-page="perPage"
            pagination-size="is-small" :key="'images'">

                <template slot-scope="props">
                    <b-table-column :label="$t('name')" width="100">
                        <router-link :to="`/project/${props.row.project}/image/${props.row.id}`">
                            {{ props.row.originalFilename }}
                        </router-link>
                    </b-table-column>

                    <b-table-column :label="$t('project')" width="100">
                        <router-link :to="`/project/${props.row.project}`">
                            {{ props.row.projectName }}
                        </router-link>
                    </b-table-column>

                    <b-table-column label="" width="150" numeric>
                        <router-link :to="`/project/${props.row.project}/image/${props.row.id}`" class="button is-small is-link">
                            {{$t("button-open")}}
                        </router-link>
                    </b-table-column>
                </template>

                <template slot="empty">
                    <div class="content has-text-grey has-text-centered">
                        <p>{{$t("no-image")}}</p>
                    </div>
                </template>
            </b-table>
        </div>
    </div>
</div>
</template>

<script>
import { mapState } from "vuex";
import {ImageInstanceCollection, ProjectCollection} from "cytomine-client";

export default {
    name: "advanced-search",
    data() {
        return {
            loading: true,
            error: false,

            searchString: "",
            projects: [],
            images: [],
            activeTab: "projects",
            perPage: 10
        };
    },
    computed: {
        pathSearchString() {
            return this.$route.params.searchString;
        },
        lowCaseSearchString() {
            return this.searchString.toLowerCase();
        },
        filteredProjects() {
            return this.projects.filter(project => {
                return project.name.toLowerCase().indexOf(this.lowCaseSearchString) >= 0;
            });
        },
        filteredImages() {
            return this.images.filter(image => {
                return image.originalFilename.toLowerCase().indexOf(this.lowCaseSearchString) >= 0;
            });
        },
        ...mapState({currentUser: state => state.currentUser.user})
    },
    watch: {
        pathSearchString(val) {
            if(val != null) {
                this.searchString = val;
            }
        }
    },
    methods: {
        async fetchImages() {
            this.images = await ImageInstanceCollection.fetchAllLight();
        },
        async fetchProjects() {
            this.projects = (await new ProjectCollection({
                light: true,
                filterKey: "user",
                filterValue: this.currentUser.id
            }).fetchAll()).array;
        }
    },
    async created() {
        this.searchString = this.pathSearchString || "";
        try {
            await Promise.all([
                this.fetchImages(),
                this.fetchProjects()
            ]);
        }
        catch(error) {
            console.log(error);
            this.error = true;
        }

        this.loading = false;
    }
};
</script>

<style>
.advanced-search-results {
    padding: 30px 50px 50px 50px;
}

.panel-tabs {
    background: white;
}
</style>
