<template>
   <div class="content-wrapper">
     <div class="panel">
       <div class="panel-heading" style="text-align: center; width: 50%; margin: auto;">
         <p>Choose wanted analysis</p>
       </div>
       <div class="panel-block grid" style="width: 50%; margin: auto;">
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
export default {
  name: 'ProjectChooseAnalysis',
  data() {
    return {
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
  methods: {
    sendAnalysisRequest() {
      console.log('send to backend');
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
    width: 40rem;
    margin: 3rem auto 2rem auto;
  }
</style>
