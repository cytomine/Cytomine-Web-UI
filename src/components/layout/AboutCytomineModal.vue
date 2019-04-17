<template>
<div class="modal-card">
  <header class="modal-card-head">
    <p class="modal-card-title">{{$t('about-cytomine')}}</p>
  </header>
  <section v-if="!loading" class="modal-card-body">
    <dl>
      <dt>{{$t('version')}}</dt>
      <dd>{{version || '?'}}</dd>

      <dt>{{$t('sponsors')}}</dt>
      <dd>
        <a href="https://cytomine.coop" target="_blank">
          <img src="@/assets/sponsors/logo-cytomine-coop.png" class="sponsor">
        </a>
        <a href="https://www.uliege.be" target="_blank">
          <img src="@/assets/sponsors/logo-uliege.png" class="sponsor">
        </a>
        <a href="https://www.wallonie.be/" target="_blank">
          <img src="@/assets/sponsors/logo-wallonie.png" class="sponsor">
        </a>
      </dd>

      <dt>{{$t('description')}}</dt>
      <dd>
        <i18n path="cytomine-sponsors-info">
          <a place="cytomineCompanyLink" href="https://cytomine.coop" target="_blank">
            {{$t('cytomine-company')}}</a>
        </i18n>
      </dd>

      <dt>{{$t('website')}}</dt>
      <dd>
        <i18n path="cytomine-website-info">
          <a place="websiteLink" href="https://cytomine.coop" target="_blank">cytomine.org</a>
        </i18n>
      </dd>

      <dt>{{$t('source-code')}}</dt>
      <dd>
        <i18n path="source-code-info">
          <a place="githubLink" href="http://github.com/cytomine/" target="_blank">
            {{$t('github-repository')}}</a>
        </i18n>
      </dd>

      <dt>{{$t('documentation')}}</dt>
      <dd>
        <i18n path="documentation-info">
          <a place="docLink" href="https://doc.cytomine.be/" target="_blank">{{$t('here')}}</a>
          <a place="apiDocLink" :href="apiDocLink" target="_blank">{{$t('here')}}</a>
        </i18n>
      </dd>

      <dt>{{$t('contact')}}</dt>
      <dd>
        <i18n path="contact-info">
          <a place="contactMail" href="mailto:info@cytomine.org">info@cytomine.org</a>
        </i18n>
      </dd>
    </dl>
  </section>
  <footer class="modal-card-foot">
    <button class="button" type="button" @click="$parent.close()">
      {{$t('button-close')}}
    </button>
  </footer>
</div>
</template>

<script>
import {Cytomine} from 'cytomine-client';
import constants from '@/utils/constants.js';

export default {
  name: 'about-cytomine-wrapper',
  data() {
    return {
      version: null,
      loading: true
    };
  },
  computed: {
    apiDocLink() {
      let core = constants.CYTOMINE_CORE_HOST;
      return `${core}/restApiDoc/?doc_url=${core}/restApiDoc/api`;
    }
  },
  async created() {
    try {
      let {version} = await Cytomine.instance.ping();
      this.version = version;
    }
    catch(error) {
      console.log(error);
    }
    this.loading = false;
  }
};
</script>

<style scoped>
.modal-card, .modal-card-body {
  width: 50vw;
  min-width: 700px;
  font-weight: normal;
}

dt {
  float: left;
  width: 12rem;
  text-align: right;
  padding-right: 1rem;
  clear: both;
  font-weight: 600;
}

dd {
  margin-left: 14rem;
  background-color: #fff;
  margin-bottom: 0.75rem;
}

img.sponsor {
  max-height: 7rem;
  margin-right: 1rem;
}
</style>
