<template>
<div class="modal-card term-modal">
  <form @submit.prevent="save()">
    <header class="modal-card-head">
      <p class="modal-card-title">{{$t(term ? 'update-term' : 'create-term')}}</p>
    </header>
    <section class="modal-card-body">
      <b-field
        :label="$t('name')"
        :type="!validName && displayErrors ? 'is-danger' : null"
        :message="!validName && displayErrors ? $t('field-cannot-be-empty') : ''"
      >
        <b-input v-model="name" />
      </b-field>

      <sketch-picker
        v-model="color"
        :presetColors="presetColors"
      />
    </section>
    <footer class="modal-card-foot">
      <button class="button" type="button" @click="$parent.close()">
        {{$t('button-cancel')}}
      </button>
      <button class="button is-link" :disabled="!validName && displayErrors">
        {{$t('button-save')}}
      </button>
    </footer>
  </form>
</div>
</template>

<script>
import {Term} from 'cytomine-client';
import {Sketch} from 'vue-color';

export default {
  name: 'term-modal',
  components: {'sketch-picker': Sketch},
  props: {
    term: Object,
    ontology: Object
  },
  data() {
    return {
      name: '',
      color: null,
      displayErrors: false
    };
  },
  computed: {
    validName() {
      return this.name.length > 0;
    },
    presetColors() {
      return [
        '#F44E3B',
        '#FB9E00',
        '#FCDC00',
        '#68BC00',
        '#16A5A5',
        '#009CE0',
        '#7B10D8',
        '#F06292',
        '#000',
        '#777',
        '#FFF'
      ];
    }
  },
  methods: {
    randomColor() {
      return '#' + (Math.random().toString(16) + '0000000').slice(2, 8);
    },
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
        this.$notify({type: 'success', text: this.$t('notif-success-term-creation')});
        this.$emit('newTerm', term);
        this.$parent.close();
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-term-creation')});
      }
    },
    async update() {
      let term = new Term(this.term);
      term.color = this.color.hex;
      term.name = this.name;
      try {
        await term.save();
        this.$notify({type: 'success', text: this.$t('notif-success-term-update')});
        this.$emit('updateTerm', term);
        this.$parent.close();
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-term-update')});
      }
    }
  },
  created() {
    this.name = this.term ? this.term.name : '';
    this.color = {hex: this.term ? this.term.color : this.randomColor()};
    this.displayErrors = false;
  }
};
</script>

<style>
.term-modal .vc-sketch {
  width: auto;
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
