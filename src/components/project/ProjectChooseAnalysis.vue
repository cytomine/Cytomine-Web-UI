<template>
   <div class="content-wrapper">
     <div class="panel">
       <div class="panel-heading" style="text-align: center; width: 50%; margin: auto;">
         <p>Choose wanted analysis</p>
       </div>
       <div class="panel-block grid" style="width: 50%; margin: auto;">
         <label>
           <input class="input" type="text" placeholder="Name your annotation group" v-model="name" />
         </label>
         <template v-for="analysis in availableTypes">
           <label :key="analysis.value" class="checkbox">
             <input type="checkbox" :value="analysis.value">
             {{ analysis.name }}
           </label>
         </template>
         <button class="button is-link" @click="sendAnalysisRequest">
           Start analysis
          </button>
       </div>
     </div>
   </div>
</template>

<script>
import {get} from '@/utils/store-helpers';

export default {
  name: 'ProjectChooseAnalysis',
  data() {
    return {
      name: '',
      availableTypes: [
        {
          name: 'Hematoxylin and eosin',
          value: 'he',
        },
        {
          name: 'RGB',
          value: 'rgb',
        },
      ],
    };
  },
  computed: {
    project: get('currentProject/project'),
  },
  methods: {
    async sendAnalysisRequest() {
      const data = {
        projectId: this.project.id,
        annotations: this.$store.state.projects[this.project.id].analysis.annotationsAddedForAnalysis,
        name: this.name,
      };

      if (this.name === '') {
        // Needs to have a name, throw error
        this.$notify({type: 'error', text: `You need to give the annotation group a name!`});
      }
      const response = await fetch('http://localhost:9292/annotationGroup', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json'
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data) // body data type must match "Content-Type" header
      });
      return await response.json(); // parses JSON response into native JavaScript objects
    },
  },
};
</script>

<style scoped>
  .grid {
    display: grid;
    grid-template-columns: 1fr;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  label {
    font-size: 24px;
    margin: 2rem 0;
  }
  button {
    width: 50%;
    margin: 3rem auto 2rem auto;
  }
</style>
