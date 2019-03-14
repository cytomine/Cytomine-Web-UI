<template>
<div :class="['navbar-item', 'search', displayResults ? 'is-active' : '']" v-click-outside="deactivate">
    <b-field class="no-margin" :type="error ? 'is-danger' : null">
        <b-input class="global-search" v-model="searchString" :placeholder="$t('search-placeholder')" type="search"
            icon="search" @click.native="activate()" :loading="loading" :disabled="error">
        </b-input>
        <p class="control">
            <router-link class="button" to="/advanced-search" active-class="router-link-active" @click.native="deactivate">+</router-link>
        </p>
    </b-field>

    <div class="navbar-dropdown search-results" v-show="true">
        <h2>Projects ({{filteredProjects.length}})</h2>
        <template v-if="filteredProjects.length > 0">
            <router-link v-for="project in subsetProjects" :key="project.id" :to="`/project/${project.id}`"
            class="navbar-item" v-html="highlightedName(project.name)" @click.native="deactivate"></router-link>
            <a v-if="moreProjects" class="navbar-item">...</a>
        </template>
        <span v-else class="navbar-item no-result">{{$t("no-project")}}</span>

        <h2>Images ({{filteredImages.length}})</h2>
        <template v-if="filteredImages.length > 0">
            <router-link v-for="img in subsetImages" :key="img.id" :to="`/project/${img.project}/image/${img.id}`"
            class="navbar-item" @click.native="deactivate"
            v-html="`${highlightedName(img.originalFilename)} <span class='in-project'>(${$t('in-project', {projectName: img.projectName})})</span>`">
            </router-link>
            <a v-if="moreImages" class="navbar-item">...</a>
        </template>
        <span v-else class="navbar-item no-result">{{$t("no-image")}}</span>

        <div v-if="moreImages || moreProjects" class="search-view-all">
            <router-link class="button is-small" :to="`/advanced-search/${searchString}`" @click.native="deactivate">
                View all ({{totalNbResults}})
            </router-link>
        </div>
    </div>
</div>
</template>

<script>
import { mapState } from "vuex";
import {ImageInstanceCollection, ProjectCollection} from "cytomine-client";

export default {
    name: "cytomine-searcher",
    data() {
        return {
            isActive: false,
            loading: false,
            error: false,
            searchString: "",
            projects: [],
            images: [],
            maxNbDisplayed: 5
        };
    },
    computed: {
        displayResults() {
            return this.isActive && !this.error && this.searchString.length > 0;
        },
        lowCaseSearchString() {
            return this.searchString.toLowerCase();
        },
        filteredProjects() {
            return this.projects.filter(project => {
                return project.name.toLowerCase().indexOf(this.lowCaseSearchString) >= 0;
            });
        },
        subsetProjects() {
            return this.filteredProjects.slice(0, this.maxNbDisplayed);
        },
        moreProjects() {
            return this.filteredProjects > this.subsetProjects;
        },
        filteredImages() {
            return this.images.filter(image => {
                return image.originalFilename.toLowerCase().indexOf(this.lowCaseSearchString) >= 0;
            });
        },
        subsetImages() {
            return this.filteredImages.slice(0, this.maxNbDisplayed);
        },
        moreImages() {
            return this.filteredImages > this.subsetImages;
        },
        totalNbResults() {
            return this.filteredImages.length + this.filteredProjects.length;
        },
        ...mapState({currentUser: state => state.currentUser.user})
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
        },
        async activate() {
            if(!this.isActive) {
                try {
                    this.loading = true;
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
                this.isActive = true;
            }
        },
        deactivate() {
            this.isActive = false;
        },
        highlightedName(value) {
            let regex = new RegExp(`(${this.lowCaseSearchString})`, "gi");
            return value.replace(regex, "<strong>$1</strong>");
        },
    }
};
</script>

<style scoped>
.navbar-item.search {
    height: 100%;
}

.navbar-dropdown.search-results h2 {
    background: #f1f1f1;
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 600;
    padding: 2px 0px 3px 30px;
    border-top: 1px solid #e3e3e3;
    margin-bottom: 0px;
    /* border-bottom: 1px solid #e3e3e3; */
}

.navbar-dropdown.search-results .navbar-item {
    font-weight: normal;
    padding: 3px 10px 3px 20px;
}

.search-view-all {
    border-top: 1px solid #e3e3e3;
    padding-top: 5px;
    text-align: center;
}

.no-result {
    color: grey;
}
</style>

<style>
.global-search {
    max-width: 200px;
}

.no-margin {
    margin: 0px !important;
}
</style>
