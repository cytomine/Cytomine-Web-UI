<template>
<b-modal :active="active" @close="$emit('update:active', false)" :has-modal-card="true" class="launch-algo-modal">
    <form>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">{{$t("launch-new-algorithm")}}</p>
            </header>
            <section class="modal-card-body">
                <div class="columns">
                    <div class="column is-narrow">
                        <strong>{{$t("software")}}</strong>
                    </div>
                    <div class="column">
                        <cytomine-multiselect v-model="selectedSoftware" :options="softwares" track-by="id" label="name">
                        </cytomine-multiselect>
                    </div>
                </div>
                <template v-if="selectedSoftware">
                    <table class="table is-fullwidth">
                        <thead>
                            <tr>
                                <th>{{$t("name")}}</th>
                                <th>{{$t("value")}}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <algo-parameter-row v-for="param in paramsMandatoryNoDefault" :displayErrors="displayErrors"
                                :param="param" :key="param.id" @changeValue="event => changeParam(param, event)">
                            </algo-parameter-row>

                            <tr class="row-separator" v-if="optionalParams.length > 0">
                                <td colspan="2">
                                    {{$t("optional-parameters")}}
                                    <button class="button is-small" @click="showOptional = !showOptional">
                                        {{$t(showOptional ? 'button-hide' : 'button-show')}}
                                    </button>
                                </td>
                            </tr>
                            <template v-if="showOptional">
                                <algo-parameter-row v-for="param in optionalParams" :displayErrors="displayErrors"
                                    :param="param" :key="param.id" @changeValue="event => changeParam(param, event)">
                                </algo-parameter-row>
                            </template>

                            <tr class="row-separator" v-if="prefilledParams.length > 0">
                                <td colspan="2">
                                    {{$t("prefilled-parameters")}}
                                    <button class="button is-small" @click="showPrefilled = !showPrefilled">
                                        {{$t(showPrefilled ? 'button-hide' : 'button-show')}}
                                    </button>
                                </td>
                            </tr>
                            <template v-if="showPrefilled">
                                <algo-parameter-row v-for="param in prefilledParams" :displayErrors="displayErrors"
                                    :param="param" :key="param.id" @changeValue="event => changeParam(param, event)">
                                </algo-parameter-row>
                            </template>
                        </tbody>
                    </table>
                </template>
            </section>
            <footer class="modal-card-foot">
                <button class="button" type="button" @click="$emit('update:active', false)">
                    {{$t("button-cancel")}}
                </button>
                <button class="button is-link" :disabled="!validForm && displayErrors" @click="createJob()">
                    {{$t("button-launch-new-algorithm")}}
                </button>
            </footer>
        </div>
    </form>
</b-modal>
</template>

<script>
import {SoftwareCollection, Job, JobParameter} from "cytomine-client";
import CytomineMultiselect from "@/components/form/CytomineMultiselect";
import AlgoParameterRow from "./AlgoParameterRow";

export default {
    name: "launch-algorithm-modal",
    components: {
        CytomineMultiselect,
        AlgoParameterRow
    },
    props: ["active"],
    data() {
        return {
            softwares: [],
            selectedSoftware: null,
            displayErrors: false,
            showPrefilled: false,
            showOptional: false
        };
    },
    computed: {
        project() {
            return this.$store.state.project.project;
        },
        params() {
            return this.selectedSoftware ? this.selectedSoftware.parameters.array : [];
        },
        optionalParams() {
            return this.params.filter(param => !param.required);
        },
        prefilledParams() {
            return this.params.filter(param => param.defaultParamValue != null);
        },
        paramsMandatoryNoDefault() {
            return this.params.filter(param => param.required && param.defaultParamValue == null);
        },
        validForm() {
            return this.params.every(param => param.valid);
        },
        jobParameters() {
            return this.params.map(param => {
                let value = param.value;
                if(value.id) {
                    value = value.id;
                }
                if(Array.isArray(value) && value.length > 0 && value[0].id) {
                    value = value.map(model => model.id);
                }
                return new JobParameter({softwareParameter: param.id, value});
            });
        }
    },
    watch: {
        active(val) {
            if(val) {
                this.selectedSoftware = null;
                this.showOptional = false;
                this.showPrefilled = false;
                this.displayErrors = false;
            }
        },
        async selectedSoftware() {
            if(this.selectedSoftware == null) {
                return;
            }

            for(let param of this.selectedSoftware.parameters) {
                this.$set(param, "value", param.defaultParamValue);
                this.$set(param, "valid", !param.required || !param.hasDefault);
            }
        }
    },
    methods: {
        async createJob() {
            if(!this.validForm) {
                this.displayErrors = true;
                return;
            }

            try {
                let job = new Job({
                    software: this.selectedSoftware.id,
                    project: this.project.id,
                    jobParameters: this.jobParameters
                });
                await job.save();
                this.$emit("add", job);
                this.$emit("update:active", false);
                await job.execute();
                this.$notify({type: "success", text: this.$t("notif-success-algo-launch")});
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-algo-launch")});
            }
        },
        changeParam(param, {value, valid}) {
            param.value = value;
            param.valid = valid;
        }
    },
    async created() {
        this.softwares = (await SoftwareCollection.fetchAll({filterKey: "project", filterValue: this.project.id})).array;
    }
};
</script>

<style scoped>
.launch-algo-modal .modal-card {
    width: 100%;
    min-height: 70vh;
}

.columns {
    align-items: center;
}

.table {
    margin-bottom: 1em;
}

th:first-child {
    width: 20%;
}

td {
    vertical-align: middle !important;
}

.row-separator td {
    border-top-width: 2px !important;
    border-bottom-width: 1px !important;
    font-weight: 600;
}
</style>

<style>
.launch-algo-modal .animation-content {
    min-width: 70vw;
    min-height: 70vh;
}
</style>