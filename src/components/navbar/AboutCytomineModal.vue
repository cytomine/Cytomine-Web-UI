<!-- Copyright (c) 2009-2019. Authors: see NOTICE file.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.-->

<template>
<cytomine-modal-card :title="$t('about-cytomine')" @close="$parent.close()">
  <template v-if="!loading">
    <dl>
      <dt>{{$t('version')}}</dt>
      <dd>{{version || '?'}}</dd>

      <dt>{{$t('sponsors')}}</dt>
      <dd>
        <a href="https://cytomine.coop" target="_blank">
          <img src="@/assets/sponsors/logo-cytomine-coop.png" class="sponsor">
        </a>
        <a href="https://uliege.cytomine.org" target="_blank">
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
          <a place="cytomineULiegeLink" href="https://uliege.cytomine.org" target="_blank">
            {{$t('university-of-liege')}}</a>
        </i18n>
      </dd>

      <dt>{{$t('open-source-project')}}</dt>
      <dd>
        <i18n path="cytomine-org-info">
          <a place="websiteOrgLink" href="https://cytomine.org" target="_blank">cytomine.org</a>
        </i18n>
      </dd>

      <dt>{{$t('services')}}</dt>
      <dd>
        <i18n path="cytomine-company-info">
          <a place="websiteCompanyLink" href="https://cytomine.coop" target="_blank">{{$t('cytomine-company')}}</a>
        </i18n>
      </dd>

      <dt>{{$t('R&D')}}</dt>
      <dd>
        <i18n path="cytomine-uliege-info">
          <a place="websiteULiegeLink" href="https://uliege.cytomine.org" target="_blank">{{$t('cytomine-uliege-team')}}</a>
        </i18n>
      </dd>

      <dt>{{$t('source-code')}}</dt>
      <dd>
        <i18n path="source-code-info">
          <a place="githubOrgLink" href="http://github.com/cytomine/" target="_blank">
            {{$t('github-repository')}}</a>
          <a place="githubULiegeLink" href="http://github.com/cytomine-uliege/" target="_blank">
            {{$t('github-repository')}}</a>
        </i18n>
      </dd>

      <dt>{{$t('documentation')}}</dt>
      <dd>
        <i18n path="documentation-info">
          <a place="docOrgLink" href="https://doc.cytomine.org/" target="_blank">{{$t('here')}}</a>
          <a place="docULiegeLink" href="https://doc.uliege.cytomine.org/" target="_blank">{{$t('here')}}</a>
          <a place="apiDocLink" :href="apiDocLink" target="_blank">{{$t('here')}}</a>
        </i18n>
      </dd>

      <dt>{{$t('contact')}}</dt>
      <dd>
        <i18n path="forum-info">
          <a place="forumLink" href="https://forum.image.sc/tags/cytomine">{{$t('forum-image-sc')}}</a>
        </i18n>
        <br>
        <i18n path="contact-info">
          <a place="contactMail" href="mailto:info@cytomine.org">info@cytomine.org</a>
        </i18n>
      </dd>
    </dl>
  </template>
</cytomine-modal-card>
</template>

<script>
import {Cytomine} from 'cytomine-client';
import constants from '@/utils/constants.js';
import CytomineModalCard from '@/components/utils/CytomineModalCard';

export default {
  name: 'about-cytomine-wrapper',
  components: {CytomineModalCard},
  data() {
    return {
      version: null,
      loading: true,
      flavour: 'ULiege'
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
      this.version = (version) ? `${version} ${this.flavour}` : null;
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
