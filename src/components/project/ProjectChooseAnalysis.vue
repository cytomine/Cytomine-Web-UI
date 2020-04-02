<template>
   <div class="content-wrapper">
     <div class="panel">
       <div class="panel-heading" style="text-align: center; width: 50%; margin: auto;">
         <p>Choose wanted analyses</p>
       </div>
       <div class="panel-block grid" style="width: 50%; margin: auto;">
         <div ref="analysisTypes">
           <template v-for="analysis in availableTypes">
             <label :key="analysis.value" class="checkbox">
               <input type="checkbox" :value="analysis.value" v-model="analysis.checked">
               {{ analysis.name }}
             </label>
           </template>
         </div>
         <label>
           <input class="input" type="text" placeholder="Name your annotation group" v-model="name" />
         </label>
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
          checked: false,
        },
        {
          name: 'RGB',
          value: 'rgb',
          checked: false,
        },
      ],
    };
  },
  computed: {
    project: get('currentProject/project'),
  },
  methods: {
    async sendAnalysisRequest() {
      const createGroupData = {
        projectId: this.project.id,
        annotations: this.$store.state.projects[this.project.id].analysis.annotationsAddedForAnalysis,
        name: this.name,
      };

      if (this.name === '') {
        // Needs to have a name, throw error
        this.$notify({type: 'error', text: 'You need to give the annotation group a name!'});
      }
      const createResponse = await fetch('http://localhost:9292/annotationGroup', {
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
        body: JSON.stringify(createGroupData) // body data type must match "Content-Type" header
      });
      const createResponseData = await createResponse.json(); // parses JSON response into native JavaScript objects
      const startAnalysisData = {
        groupId: createResponseData.groupId,
        analysis: this.availableTypes.filter(item => item.checked).map(item => item.value),
      };
      await fetch('http://localhost:9292/startAnalysis', {
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
        body: JSON.stringify(startAnalysisData) // body data type must match "Content-Type" header
      });

      await this.$router.push({ path: `/project/${this.project.id}/analyze` });
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
  .grid > div {
    display: grid;
    grid-template-columns: 1fr;
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
