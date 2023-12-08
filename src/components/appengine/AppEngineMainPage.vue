<template>
  <div class="content-wrapper">
    <b-loading v-if="loading" :is-full-page="false" :active="loading" />
    <div v-else class="panel">
      <p class="panel-heading">
        {{$t('tasks')}}
        <UploadAppButton btnFunc="upload" @taskUploadSuccess="handleTaskUploadSuccess"></UploadAppButton>
      </p>
      <section class="panel-block">
        <section id="lower-section-flex">
        <AppCard v-for="app in applications" :key="app.id" :appData="app" />
        </section>
      </section>
    </div>
  </div>
</template>
  
<script>
import UploadAppButton from './UploadAppButton.vue';
import AppCard from './AppCard.vue';
import Task from '@/utils/appengine/task';


export default {
  name: 'AppEngineMainPage',
  components: {
    UploadAppButton,
    AppCard
  },
  data() {
    return {
      applications: [],
      loading: true,
      error: null
    };
  },
  async created() {
    this.applications = await Task.fetchAll();
    this.loading = false;
  },
  methods: {
    async handleTaskUploadSuccess() {
      try {
        // this.applications.push(await Task.fetchAll());
        this.applications = await Task.fetchAll();

      } catch (error) {
        console.error('Error fetching tasks after upload:', error);
      }
    },
  },
};
</script>
  
<style scoped>

.panel-block {
  padding-top: 0.8em;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#upper-section-flex {
  display: flex;
  flex-direction: row;
  /* Aligns items to the edges */
  justify-content: space-between;
  /* Aligns items vertically */
  align-items: center;
}

#upper-section-flex>* {
  padding: 1em;
}


#lower-section-flex {
  display: flex;
  /* justify-content: center; */
  flex-direction: row;
  gap: 1%;

  flex-wrap: wrap;

  flex-basis: 30%;

}

#lower-section-flex>* {
  flex-basis: 20%;
  margin: 1em;
}
</style>
  