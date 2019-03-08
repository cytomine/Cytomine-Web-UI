<template>
<tr>
    <td>{{param.name}}</td>
    <td>
         <b-field :type="displayErrors && errorMessage ? 'is-danger': ''" :message="displayErrors ? errorMessage : ''">
            <b-input v-if="loading" loading disabled></b-input>
            <cytomine-multiselect v-else-if="options" v-model="internalValue" :options="options"
                track-by="id" :label="param.uriPrintAttribut" :class="{'is-danger': displayErrors && errorMessage}"
                :multiple="param.type == 'ListDomain'">
                <!-- TODO: add preview for image and annotation -->
            </cytomine-multiselect>
            <input type="checkbox" v-model="internalValue" v-else-if="param.type == 'Boolean'">
            <b-input v-else v-model="internalValue"></b-input>
        </b-field>
    </td>
</tr>
</template>

<script>
import {Cytomine} from "cytomine-client";
import CytomineMultiselect from "@/components/form/CytomineMultiselect";

export default {
    name: "job-parameter-row",
    components: {CytomineMultiselect},
    props: [
        "param",
        "displayErrors"
    ],
    data() {
        return {
            internalValue: null,
            options: null,
            loading: true
        };
    },
    computed: {
        project() {
            return this.$store.state.project.project;
        },
        ontology() {
            return this.$store.state.project.ontology;
        },
        processedUri() {
            if(this.param.uri_) {
                let result = this.param.uri_.replace(new RegExp("^" + Cytomine.instance.basePath), "");
                result = result.replace("$currentProjectCreationDate$", this.project.created);
                result = result.replace("$currentProject$", this.project.id);
                result = result.replace("$cytomineHost$", Cytomine.instance.host);
                result = result.replace("$currentDate$", new Date().getTime());
                result = result.replace("$currentOntology$", this.ontology.id);
                return result;
            }
        },
        empty() {
            return this.internalValue == null || this.internalValue.length === 0;
        },
        validNumber() {
            return !isNaN(this.internalValue);
        },
        errorMessage() {
            if(this.empty) {
                return this.param.required ? this.$t("mandatory-parameter") : null;
            }
            if(this.param.type == "Number" && !this.validNumber) {
                return this.$t("must-be-number");
            }
        }
    },
    watch: {
        internalValue() {
            if(this.internalValue !== this.param.value) {
                this.$emit("changeValue", {value: this.internalValue, valid: this.errorMessage == null});
            }
        },
        "param.value": function() {
            this.internalValue = this.param.value;
        }
    },
    async created() {
        if(this.param.defaultParamValue) {
            this.internalValue = this.param.defaultParamValue;
        }
        else {
            this.internalValue = (this.param.type == "ListDomain") ? [] : (this.param.type == "Domain") ? null : "";
        }

        if(this.processedUri) {
            try {
                let {data} = await Cytomine.instance.api.get(this.processedUri);
                let options = data.collection.filter(option => option); // HACK because some returned values may be null (TODO fix in core - occurs for cytomine-user-job)
                if(this.param.uriSortAttribut) {
                    options.sort((a, b) => a[this.param.uriSortAttribut].localeCompare(b[this.param.uriSortAttribut]));
                }
                this.options = options;
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-analysis-parameters-options", {paramName: this.param.name})});
            }
        }
        this.loading = false;
    }
};
</script>

<style lang="scss">
@import "~bulma/sass/utilities/initial-variables.sass";

.is-danger .multiselect__tags {
    border-color: $red;
}

.is-danger .multiselect__select::before {
    border-color: $red transparent transparent;
}
</style>
