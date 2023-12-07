<template>
    <div class="container">
        <section class="media">
            <figure class="media-left">
                <p class="image logo">
                    <img :src="task.imageUrl || 'https://bulma.io/images/placeholders/1280x960.png'">
                </p>
            </figure>
            <div class="media-content app-content">
                <div class="content">
                    <p>
                        <strong class="app-title">{{ task.name }}</strong>
                        <br>
                        <span v-if="task.authors && task.authors.length > 0">
                            <small v-for="(author, index) in task.authors" :key="index">
                                {{ `- ${author.first_name} ${author.last_name}` || $t('no-authors') }}
                            </small>
                        </span>
                    </p>
                </div>
            </div>

            <div class="media-right update-btn">
                <!-- TODO In the future: Implement proper update of Task -->
                <!-- <UploadAppButton btnFunc="Update" /> -->
            </div>
        </section>

        <section class="metadata level">
            <div class="level-item has-text-centered">
                <div>
                    <p class="heading">Date</p>
                    <p class="title">{{ task.date || $t('unknown') }}</p>
                </div>
            </div>

            <div class="level-item has-text-centered">
                <div>
                    <p class="heading">Version</p>
                    <p class="title">{{ task.version }}</p>
                </div>
            </div>

            <!-- TODO: Find a way to handle organization (each author belongs to their own Org.) -->
            <!-- <div class="level-item has-text-centered">
                <div>
                    <p class="heading">Organization</p>
                    <p class="title">{{ task.authors[0]['organization'] || $t('unknown') }}</p>
                </div>
            </div> -->
        </section>



        <section class="info card">
            <header class="card-header">
                <p class="card-header-title">{{ $t("description") }}</p>
                <a class="button card-header-icon" @click="isCollapsed = !isCollapsed">
                    <span class="fas fa-chevron-up" v-if="!isCollapsed"></span>
                    <span class="fas fa-chevron-down" v-if="isCollapsed"></span>
                </a>
            </header>
            <div class="card-content" :class="{ 'is-hidden': isCollapsed }">
                <slot v-if="!isCollapsed"></slot>
                {{ task.description || $t('no-description') }}
            </div>
        </section>
    </div>
</template>
    
<script>
import UploadAppButton from './UploadAppButton.vue';
import Task from '@/utils/appengine/task';


export default {
    name: 'AppInfo',
    components: {
        UploadAppButton
    },
    mount() {
        if (this.id) {
            const state = this.getCollapseState();
            if (state) {
                this.isCollapsed = state[this.id];
            }
        }
    },
    data() {
        return {
            task: null,
            isCollapsed: true,
        };
    },
    async created() {
        // to make Bulma card collapsible:
        let cardToggles = document.getElementsByClassName('is-collapsible');
        for (let i = 0; i < cardToggles.length; i++) {
            cardToggles[i].addEventListener('click', e => {
                e.currentTarget.parentElement.parentElement.childNodes[3].classList.toggle('is-hidden');
            });
        }

        // Fetch app data based on the ID from the route
        // const appId = this.$route.params.id;

        // Fetch task data based on Namespace & Version
        const taskNamespace = this.$route.params.namespace;
        const taskVersion = this.$route.params.version;

        this.task = await Task.fetchNamespaceVersion(taskNamespace, taskVersion);
    },
    methods: {
        getCollapseState() {
            return localStorage.getObject("collapsibles") || {};
        },
        saveCollapsedState(value) {
            const state = this.getCollapseState();
            state[this.id] = value;
            localStorage.setObject("collapsibles", state);
        }
    },
    watch: {
        isCollapsed(newValue) {
            if (this.id) {
                this.saveCollapsedState(newValue);
            }
            this.$emit("collapseChanged", newValue);
        }
    }

};
</script>

<style scoped lang="scss">
.container {
    margin: 5%;
}

/* ----- Upper Section (Logo + Update) ----- */
.logo {
    width: 17rem;
    height: 13rem;
    position: relative;
    overflow: hidden;
    /* images that overflow (ex. portrait) will need this one */
    border-radius: 15%;

}

img {
    position: absolute;
    width: 100%;
    top: 50%;
    -ms-transform: translateY(-50%);
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    /* for none overflowing imgs */
    border-radius: 15%;
}

.app-content {
    margin: 1%;
    padding-top: 2%;
}

.app-title {
    font-size: 1.9rem;
}

.update-btn {
    margin: 3%;
    size: 2rem;
}


/*  ----- Metadata Section (Date + Ver...) ----- */
.metadata {
    margin-top: 5%;
}

/* ----- Information Section (About, Rating ...) ----- */
.info {
    margin-top: 5%;
}

.card-header-icon {
    border: none;
    margin-top: 0.5%;
    margin-right: 0.2%;

    span {
        font-size: 1.2rem;
    }
}

.card-header-title {
    font-size: 1.36rem;
}
</style>
