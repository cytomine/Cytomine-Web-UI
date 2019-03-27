<template>
<div class="card" :class="{'full-height-card': fullHeightCard}">
    <router-link class="card-image recent-image" :to="`/project/${image.project}/image/${idImage}`">
        <figure class="image is-5by3" :style="figureStyle">
        </figure>
    </router-link>
    <div class="card-content">
        <div class="content">
            <p>
                <router-link :to="`/project/${image.project}/image/${idImage}`">
                    {{ image.instanceFilename || image.imageName }}
                    <span v-if="showProject" class="in-project">({{$t("in-project", {projectName: image.projectName})}})</span>
                </router-link>
            </p>
            <slot></slot>
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: "image-preview",
    props: {
        image: {type: Object},
        fullHeightCard: {type: Boolean, default: true},
        showProject: {type: Boolean, default: false} 
    },
    computed: {
        idImage() {
            return this.image.image || this.image.id; // if provided object is image consultation, image.image
        },
        figureStyle() {
            return {backgroundImage: `url("${(this.image.thumb || this.image.imageThumb)}")`};
        }
    }
};
</script>

<style scoped>
.image {
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    position: relative;
    border-bottom: 1px solid #ddd;
}

.card.full-height-card {
    height: 100%;
}

.card-content {
    padding: 20px;
    overflow-wrap: break-word;
}

.card-content a {
    font-weight: 600;
}
</style>
