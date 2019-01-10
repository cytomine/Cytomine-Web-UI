<template>
    <div class="scale-line" :class="{'interpolation': interpolation}">
        <template v-if="resolution != null">
            <div class="scale-line-top" :style="{width: scaleLineLength + 'px'}">
                {{scaleLength}}
            </div>
            <div class="scale-line-bottom">
                <span v-show="magnification != 0">
                    {{$t("magnification")}}: {{magnification}}X
                </span>
            </div>
        </template>

        <div v-else-if="interpolation" class="interpolation-warning">{{$t("digital-zoom")}}</div>

        <div class="scale-line-position" v-if="mousePosition != null">
            <div style="float: left;">x: {{Math.round(mousePosition[0])}}</div>
            <div style="float: right;">y: {{Math.round(mousePosition[1])}}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: "scale-line",
    props: [
        "image",
        "zoom",
        "mousePosition"
    ],
    data() {
        return {
            scaleLineLength: 100
        };
    },
    computed: {
        magnification() {
            let magnification = Math.pow(2, this.zoom - this.image.depth) * this.image.magnification;
            return Math.round(magnification * 100) / 100;
        },
        resolution() {
            if(this.image.resolution != null) {
                return Math.pow(2, this.zoom - this.image.depth) * this.image.resolution;
            }
        },
        scaleLength() {
            if (this.resolution != null && this.resolution != 0) {
                let length = this.scaleLineLength * this.resolution;
                let unit = "µm";
                if (length > 1000) {
                    length /= 1000;
                    unit = "mm";
                }
                return `${length.toPrecision(3)} ${unit}`;
            }
        },
        interpolation() {
            return this.zoom > this.image.depth;
        }
    }
};
</script>

<style scoped>
.scale-line {
    background: white;
    position: absolute;
    padding: 5px 10px 5px 10px;
    display: block;
    right: 70px;
    bottom: 15px;
    font-size: 9px;
    font-family: Helvetica;
    min-width: 120px;
}
.scale-line-top {
    margin-top: 5px;
    box-sizing: content-box;
    border: 2px solid black;
    border-top: none;
    text-align: center;
    padding-bottom: 2px;
}
.scale-line-bottom {
    box-sizing: content-box;
    border: 2px solid black;
    border-top: none;
    border-bottom: none;
    text-align: center;
    padding-top: 2px;
    margin-bottom: 10px;
    min-height: 10px;
}
.interpolation {
    color: red;
}

.interpolation .scale-line-top, .interpolation .scale-line-bottom {
    border-color: red;
}

.scale-line-position {
    text-align: center;
    padding: 0px 5px 0 5px;
    color: black !important;
}

.interpolation-warning {
    text-align: center;
    font-size: 11px;
    margin-bottom: 5px;
    letter-spacing: 1px;
}
</style>
