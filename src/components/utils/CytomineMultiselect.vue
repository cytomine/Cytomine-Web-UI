<template>
<multiselect 
    :value="value" @input="$emit('input', $event)"
    :label="label" 
    :track-by="trackBy"
    :options="options" 
    :optionHeight="30"
    :showLabels="false"
    :multiple="multiple"
    :close-on-select="false"
    :searchable="searchable"
    :clear-on-select="false"
    :showPointer="false"
    :placeholder="$t('select-options')"
>

    <template slot="beforeList" v-if="multiple && options.length > 0 && selectAllAvailable">
        <li class="multiselect__element multiselect__select-all" @click="selectAll()">
            <span :class="['multiselect__option', allSelected ? 'multiselect__option--selected' : '']">
                {{$t("select-all")}}
            </span>
        </li>
    </template>

    <template slot="selection" slot-scope="{isOpen}" v-if="multiple && options.length > 0">
        <div class="multiselect__tags-wrap" v-if="!isOpen">
            <strong v-if="allSelected"> {{$t("all")}} </strong>
            <template v-else>
                <span v-for="(option, index) in displayedOptions" :key="option[trackBy]">
                    {{label ? option[label] : option}}<template v-if="index < displayedOptions.length - 1">,</template>
                </span>
                <strong v-if="countNotDisplayed > 0"> 
                    {{ $tc("and-count-others", countNotDisplayed, {count: countNotDisplayed}) }}
                </strong>
            </template>
        </div>
    </template>

</multiselect>
</template>

<script>
import Multiselect from "vue-multiselect";

export default {
    name: "cytomine-multiselect",
    components: {Multiselect},
    props: {
        value: {type: null},
        options: {type: null},
        label: {type: String},
        trackBy: {type: String},
        multiple: {type: Boolean, default: false},
        selectAllAvailable: {type: Boolean, default: true},
        searchable: {type: Boolean, default: true}
    },
    data() {
        return {
            maxNbDisplayed: 3
        };
    },
    computed: {
        allSelected() {
            if(!this.multiple) {
                return false;
            }

            return this.options.every(opt => this.value.includes(opt));
        },
        displayedOptions() {
            return this.value.slice(0, this.maxNbDisplayed);
        },
        countNotDisplayed() {
            return this.value.length - this.maxNbDisplayed;
        }
    },
    methods: {
        selectAll() {
            let newValue = this.allSelected ? [] : this.options;
            this.$emit("input", newValue);
        }
    }
};
</script>

<style>
@import "~vue-multiselect/dist/vue-multiselect.min.css";

.multiselect--active, .multiselect__content-wrapper {
    z-index: 50 !important;
}

.multiselect__option--selected::before {
    content: "\f00c";
    font-family: FontAwesome;
    font-size: 10px;
    position: absolute;
    left: 10px;
}

.multiselect__option {
    padding: 6px 5px 5px 30px !important;
    font-size: 14px !important;
    min-height: 30px !important;
}

.multiselect__option:hover {
    background: #61b2e8 !important;
    color: white;
}

.multiselect__select-all {
    border-bottom: 1px solid #eee;
    display: inline-block;
    width: 100%;
    height:100%;
}

.multiselect__tags-wrap {
    margin-bottom: 8px;
    line-height: 20px;
    vertical-align: top;
}

.multiselect__input {
    font-size: 14px !important;
}
</style>
