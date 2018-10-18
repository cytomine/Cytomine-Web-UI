<template>
<vue-slider 
    :value="value" @input="$emit('input', $event)"
    :max="max" 
    :show="internalShow"
    :tooltip-dir="['left', 'right']"
    :debug="false"
    ref="slider"
>
    <template slot="tooltip" slot-scope="{index, value}">
        <span class="vue-slider-tooltip" @mousedown.stop @click.stop="startEdition(index)">
            <template v-if="!isEdited[index]">{{value}}</template>
            <b-input ref="input" v-else type="text" v-model="internalValue[index]" 
            @blur="stopEdition(index)" @keyup.enter.native="stopEdition(index)"></b-input>
        </span>
    </template>
</vue-slider>
</template>

<script>
import vueSlider from "vue-slider-component";

export default {
    name: "cytomine-slider",
    components: {vueSlider},
    props: {
        value: {type: null},
        max: {type: Number},
        show: {type: Boolean},
        integerOnly: {type: Boolean, default: true}
    },
    data() {
        return {
            isEdited: [false, false],
            internalValue: null,
            internalShow: null
        };
    },
    watch: {
        value() {
            this.internalValue = this.value.slice();
        },
        show() {
            this.internalShow = this.show;
        }
    },
    methods: {
        startEdition(index) {
            if(!this.isEdited[index]) {
                this.isEdited[index] = true;
                this.refresh();
                this.$nextTick(() => this.$refs.input.focus());
            }
        },
        stopEdition(index) {
            if(this.isEdited[index]) {
                this.processInternalValue(index);
                this.$refs.slider.setValue(this.internalValue);
                this.isEdited[index] = false;
                this.refresh();
            }
        },
        processInternalValue(index) {
            // convert str to number if possible, if not, reset to initial value
            if(isNaN(this.internalValue[index]) || this.internalValue[index].length == 0) {
                this.internalValue[index] = this.value[index];
            }
            else {
                this.internalValue[index] = this.integerOnly ? parseInt(this.internalValue[index]) : 
                    Number(this.internalValue[index]);
            }

            // reorder bounds if needed
            if(this.internalValue[0] > this.internalValue[1]) {
                let tmp = this.internalValue[0];
                this.internalValue[0] = this.internalValue[1];
                this.internalValue[1] = tmp;
            }
        },
        refresh() { // force re-render of vue-slider component to render changes in tooltip slot
            if(this.show) {
                this.internalShow = false;
                this.internalShow = true;
            }
        }
    }
};
</script>

<style>
.vue-slider-component {
    flex: 1;
}

.vue-slider {
    margin-left: 50px;
    margin-right: 70px;
}

.value-slider {
    max-width: 60px;

}

.vue-slider-tooltip input {
    width: 50px;
    height: 20px;
    font-size: 11px;
}
</style>
