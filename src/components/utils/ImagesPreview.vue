<template>
<div class="columns">
    <div class="column" v-for="image in images" :key="image.id">
        <div class="card">
            <div class="card-image recent-image" :style="'background-image: url(' + image.thumb + ')'">
            </div>
            <div class="card-content">
                <div class="content">
                    <router-link :to="{ name: 'image', params: {id: image.id} }">
                        {{ image.instanceFilename }}
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: "images-preview",
    props: ["images"],
};
</script>

<style scoped>
.column {
    max-width: 200px;
}

.recent-image {
    width: 100%;
    height: 15vh;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    position: relative;
    border-bottom: 1px solid #ddd;
}

.card-content {
    padding: 20px;
    word-break: break-all;
}

.card-content a {
    font-weight: bold;
}
</style>
