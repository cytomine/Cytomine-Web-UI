<template>
  <div class="app-engine-main-page">
    <section id="upper-section-flex">

      <h1 class="title is-1">{{ $t('tasks') }}</h1>

      <div class="apps-upload-button">
        <UploadAppButton btnFunc="upload" />
      </div>
    </section>

    <section id="lower-section-flex">
      <AppCard v-for="app in applications" :key="app.id" :appData="app" />
    </section>

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
    };
  },
  async created() {
    this.applications = await Task.fetchAll();
  },
};
</script>
  
<style scoped>
#upper-section-flex {
  display: flex;
  flex-direction: row;
  /* Aligns items to the edges */
  justify-content: space-between;
  /* Aligns items vertically */
  align-items: center;
}

#upper-section-flex > * {
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

#lower-section-flex > * {
  flex-basis: 20%;
  margin: 1em;
}
</style>
  