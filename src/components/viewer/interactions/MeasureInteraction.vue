<template>
<div>
    <vl-layer-vector>
        <vl-source-vector :ident="sourceName" :features.sync="measureFeatures" ref="olSourceVector" 
                          @addfeature="addOverlay">
            <vl-style-box>
                <vl-style-stroke color="#ffcc33" :width="2"></vl-style-stroke>
                <vl-style-fill color="rgba(255, 255, 255, 0.2)"></vl-style-fill>
            </vl-style-box>
        </vl-source-vector>
    </vl-layer-vector>

    <vl-interaction-draw v-if="measureToolActive" :source="sourceName" :type="drawType" ref="olDrawInteraction"
                         :maxPoints="nbPoints" :minPoints="nbPoints" @drawend="drawEndHandler">
        <vl-style-box>
            <vl-style-stroke color="rgba(0, 0, 0, 0.5)" :width="2" :line-dash="[10, 10]"></vl-style-stroke>
            <vl-style-fill color="rgba(255, 255, 255, 0.2)"></vl-style-fill>
        </vl-style-box>
    </vl-interaction-draw>

    <vl-overlay v-for="(overlay, index) in overlays"
                :key="overlay.id"
                :id="`overlay-${idViewer}-${index}-${overlay.id}`"
                :position="overlay.coords"
                :auto-pan="true">
        <div class="tooltip-measure">
            {{overlay.measure}}
            <template v-if="overlay.measureMicrometers">({{overlay.measureMicrometers}})</template>
            <button class="delete is-small" @click="removeFeature(overlay.feature, index)"></button>
        </div>
    </vl-overlay>
</div>
</template>

<script>
export default {
    name: "measure-interaction",
    props: [
        "idViewer",
        "index"
    ],
    data() {
        return {
            currentDraw: null,
            overlays: []
        };
    },
    computed: {
        imageWrapper() {
            return this.$store.state.images.viewers[this.idViewer].maps[this.index];
        },
        image() {
            return this.imageWrapper.imageInstance;
        },
        measureFeatures: {
            get() {
                return this.imageWrapper.measureFeatures;
            },
            set(value) {
                this.$store.commit("setMeasureFeatures", {
                    idViewer: this.idViewer,
                    index: this.index,
                    measureFeatures: value
                });
            }
        },
        activeTool() {
            return this.imageWrapper.activeTool;
        },
        measureToolActive() {
            return ["ruler", "angle", "area"].includes(this.activeTool);
        },
        drawType() {
            return (this.activeTool == "area") ? "Polygon" : "LineString";
        },
        sourceName() {
            return `draw-measure-target-${this.idViewer}-${this.index}`;
        },
        nbPoints() {
            return this.activeTool == "angle" ? 3 : null;
        },
    },
    watch: {
        nbPoints() {
            if(this.$refs.olDrawInteraction) {
                this.$refs.olDrawInteraction.scheduleRecreate();
            }
        }
    },
    methods: {
        drawEndHandler({feature}) {
            feature.set("measureType", this.activeTool);
        },
        addOverlay({feature}) {
            let coords, numericMeasure, measure;
            let geometry = feature.getGeometry();
            let measureType = feature.get("measureType");

            if(measureType == "area") {
                coords = geometry.getInteriorPoint().getCoordinates().slice(0, 2);
                numericMeasure = geometry.getArea();
                measure = `${this.limitNbDecimals(numericMeasure)} ${this.$t("pixels")}²`;
            }
            else if(measureType == "angle") {
                let [p1, o, p2] = geometry.getCoordinates();
                coords = o;
                let radAngle = this.calcAngle(o, p1) - this.calcAngle(o, p2);
                let angle = Math.abs(radAngle*180/Math.PI);
                angle = angle > 180 ? 360 - angle : angle;
                measure = `${this.limitNbDecimals(angle)}°`;
            }
            else {
                coords = geometry.getLastCoordinate();
                numericMeasure = geometry.getLength();
                measure = `${this.limitNbDecimals(numericMeasure)} ${this.$t("pixels")}`;
            }

            this.overlays.push({
                id: feature.getId(),
                feature,
                coords,
                measure,
                measureMicrometers: this.measureInMicrometers(numericMeasure, measureType)
            });
        },
        calcAngle(a, b) {
            return Math.atan2(b[1] - a[1], b[0] - a[0]);
        },
        measureInMicrometers(measure, measureType) {
            if(!this.image.resolution || measureType == "angle") {
                return null;
            }

            if(measureType == "area") {
                let measureMicrometer = measure * this.image.resolution * this.image.resolution;
                if(measureMicrometer > 1000*1000) {
                    return `${this.limitNbDecimals(measureMicrometer / (1000*1000))} ${this.$t("mm")}²`;
                }
                else {
                    return `${this.limitNbDecimals(measureMicrometer)} ${this.$t("um")}²`;
                }
            }
            else {
                let measureMicrometer = measure * this.image.resolution;
                if(measureMicrometer > 1000) {
                    return `${this.limitNbDecimals(measureMicrometer / 1000)} ${this.$t("mm")}`;
                }
                else {
                    return `${this.limitNbDecimals(measureMicrometer)} ${this.$t("um")}`;
                }
                
            }
        },
        limitNbDecimals(val, nbDecimals=3) {
            let factor = Math.pow(10, nbDecimals);
            return Math.round(val * factor) / factor;
        },
        removeFeature(feature, indexOverlay) {
            this.overlays.splice(indexOverlay, 1);
            this.$refs.olSourceVector.removeFeature(feature);
        }
    }
};
</script>

<style scoped>
.tooltip-measure {
    position: relative;
    background-color: #ffcc33;
    color: black;
    border: 1px solid white;
    border-radius: 4px;
    padding: 4px 8px;
    opacity: 0.7;
    white-space: nowrap;
}

.tooltip-measure button.delete {
    margin-left: 7px;
    margin-top: 2px;
}
</style>