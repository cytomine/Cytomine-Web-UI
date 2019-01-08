<template>
<div class="rotation-selector-wrapper" :class="{expanded}">
    <div class="ol-rotate ol-unselectable ol-control custom">
        <button type="button" @click="expanded = true">
            <span class="ol-compass" :style="{transform: `rotate(${rotation}rad)`}">⇧</span>
        </button>
    </div>
    <div v-show="expanded">
        <div class="top">
            <div class="rotation-controls">
                <b-field>
                    <p class="control">
                        <button class="button is-small" @click="degreesRotation = 0">{{$t("button-reset")}}</button>
                    </p>
                    <p class="control">
                        <button class="button is-small" @click="increment(90)">+90°</button>
                    </p>
                    <p class="control">
                        <button class="button is-small" @click="increment(-90)">-90°</button>
                    </p>
                </b-field>
            </div>
            <button class="delete is-small" @click="expanded=false"></button>
        </div>
        <cytomine-slider v-model="degreesRotation" :max="360" :show="expanded" :revision="revisionSlider"></cytomine-slider>
    </div>
</div>
</template>

<script>
import CytomineSlider from "@/components/form/CytomineSlider";

export default {
    name: "rotation-selector",
    components: {CytomineSlider},
    props: [
        "idViewer",
        "index"
    ],
    data() {
        return {
            expanded: false,
            revisionSlider: 0
        };
    },
    computed: {
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        rotation() {
            return this.imageWrapper.rotation;
        },
        degreesRotation: {
            get() {
                return Math.round(this.rotation * 180 / Math.PI);
            },
            set(value) {
                this.$store.commit("setRotation", {
                    idViewer: this.idViewer,
                    index: this.index,
                    rotation: Number(value) / 180 * Math.PI
                });
            }
        }
    },
    methods: {
        increment(inc) {
            this.degreesRotation = (this.degreesRotation + inc + 360) % 360;
        },
        updateMapSize() {
            this.revisionSlider++;
        }
    },
    mounted() {
        this.$eventBus.$on("updateMapSize", this.updateMapSize);
    },
    beforeDestroy() {
        this.$eventBus.$off("updateMapSize", this.updateMapSize);
    }
};
</script>

<style scoped>

.rotation-selector-wrapper {
    border-radius: 2px;
    box-shadow: 0px 0px 1px #777;
    background: white;
    margin-left: 2px;
}

.rotation-selector-wrapper.expanded {
    min-width: 200px;
    padding-top: 5px;
    min-height: 75px;    
}

.rotation-selector-wrapper.expanded .ol-control button {
    cursor: unset;
}

.rotation-selector-wrapper .ol-control {
    padding: 0px;
}

.rotation-selector-wrapper.expanded .ol-control button {
    box-shadow: unset;
}

.ol-rotate.ol-control {
    left: 0px !important;
    top: 0px !important;
}

.top {
    margin-left: 20px;
    margin-right: 5px;
    margin-bottom: 8px;
    display: flex;
}

.top .rotation-controls {
    flex: 1;
    display: flex;
    justify-content: center;
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 7px;
}
</style>

<style>
.rotation-selector-wrapper .vue-slider {
    margin-left: 10px;
    margin-right: 50px;
}
</style>