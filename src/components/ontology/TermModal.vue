<template>
<b-modal class="term-modal" :active="active" @close="$emit('update:active', false)" :has-modal-card="true">
    <form>
        <div class="modal-card add-image-modal">
            <header class="modal-card-head">
                <p class="modal-card-title">{{$t(term ? "update-term" : "create-term")}}</p>
            </header>
            <section class="modal-card-body">
                <b-field :label="$t('name')"
                         :type="!validName && displayErrors ? 'is-danger' : null"
                         :message="!validName && displayErrors ? $t('field-cannot-be-empty') : ''">
                    <b-input v-model="name"></b-input>
                </b-field>

                <sketch-picker v-model="color"
                    :presetColors="['#F44E3B', '#FB9E00', '#FCDC00', '#68BC00', '#16A5A5', '#009CE0', '#7B10D8', '#F06292', '#000', '#777', '#FFF']">
                </sketch-picker>
            </section>
            <footer class="modal-card-foot">
                <button class="button" type="button" @click="$emit('update:active', false)">
                    {{$t("button-cancel")}}
                </button>
                <button class="button is-link" :disabled="!validName && displayErrors" @click="save()">
                    {{$t("button-save")}}
                </button>
            </footer>
        </div>
    </form>
</b-modal>
</template>

<script>
import {Term} from "cytomine-client";
import {Sketch} from "vue-color";

const defaultColor = {hex: "#4480c4"};

export default {
    name: "term-modal",
    components: {"sketch-picker": Sketch},
    props: [
        "active",
        "term",
        "ontology"
    ],
    data() {
        return {
            name: "",
            color: defaultColor,
            displayErrors: false
        };
    },
    computed: {
        validName() {
            return this.name.length > 0;
        }
    },
    watch: {
        active(val) {
            if(val) {
                this.name = this.term ? this.term.name : "";
                this.color = this.term ? {hex: this.term.color} : defaultColor;
                this.displayErrors = false;
            }
        }
    },
    methods: {
        async save() {
            if(!this.validName) {
                this.displayErrors = true;
                return;
            }

            if(this.term) {
                this.update();
            }
            else {
                this.create();
            }
        },
        async create() {
            try {
                let term = await new Term({name: this.name, color: this.color.hex, ontology: this.ontology.id}).save();
                this.$notify({type: "success", text: this.$t("notif-success-term-creation")});
                this.$emit("newTerm", term);
                this.$emit("update:active", false);
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-term-creation")});
            }
        },
        async update() {
            let term = new Term(this.term);
            term.color = this.color.hex;
            term.name = this.name;
            try {
                await term.save();
                this.$notify({type: "success", text: this.$t("notif-success-term-update")});
                this.$emit("updateTerm", term);
                this.$emit("update:active", false);
            }
            catch(error) {
                console.log(error);
                this.$notify({type: "error", text: this.$t("notif-error-term-update")});
            }
        }
    }
};
</script>

<style>
.term-modal .vc-sketch {
    width: unset;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
}

.term-modal .vc-sketch-active-color {
    box-shadow: inset 0 0 0 1px rgba(10, 10, 10, 0.1);
}

.term-modal .vc-sketch-saturation-wrap {
    padding-bottom: 15vh;
}

/* hide alpha channel */
.term-modal .vc-sketch-field--single:last-child {
    display: none;
}
/* --- */

.term-modal .vc-sketch-sliders {
    display: flex;
    align-items: center;
}

.term-modal .vc-sketch-hue-wrap {
    flex-grow: 1;
}

.term-modal .vc-sketch-alpha-wrap {
    display: none;
}
</style>
