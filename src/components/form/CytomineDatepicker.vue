<template>
<b-datepicker :value="value" @input="$emit('input', $event)" :placeholder="placeholder || this.$t('select-date')"
            :min-date="minDate" :max-date="maxDate"
            :month-names="moment.months()" :day-names="moment.weekdaysMin()"
            :date-formatter="date => moment(date).format('ll')" size="is-small">
    <div v-if="resetButton" class="has-text-centered">
        <button class="button is-small is-link" :disabled="!value" @click="$emit('input', null)">
            {{$t("button-reset")}}
        </button>
    </div>
</b-datepicker>
</template>

<script>
import moment from "moment";

export default {
    name: "cytomine-date-picker",
    props: {
        value: Date,
        resetButton: {type: Boolean, default: true},
        maxDate: Date,
        minDate: Date,
        placeholder: String
    },
    computed: {
        moment() {
            return moment;
        }
    }
};
</script>
