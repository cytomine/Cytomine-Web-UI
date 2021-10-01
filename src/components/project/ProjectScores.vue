<!-- Copyright (c) 2009-2021. Authors: see NOTICE file.

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
  <div class="box error" v-if="!configUI['project-scores-tab']">
    <h2> {{ $t('access-denied') }} </h2>
    <p>{{ $t('insufficient-permission') }}</p>
  </div>
  <div v-else class="project-scores-wrapper content-wrapper">
    <div class="columns">
      <div class="column">
        <b-field class="radio-buttons-fullwidth is-hovered">
          <b-radio-button v-model="activeTab" native-value="images" type="is-link">
            {{$t('scores-by-images')}}
          </b-radio-button>

          <b-radio-button v-model="activeTab" native-value="members" type="is-link">
            {{$t('scores-by-members')}}
          </b-radio-button>

          <b-radio-button v-model="activeTab" native-value="report" type="is-link">
            {{$t('scores-report')}}
          </b-radio-button>
        </b-field>
      </div>
    </div>
    <div class="component-wrapper">
      <keep-alive>
        <component
          :is="activeComponent"
          :startDate="startDate ? startDate.getTime() : null"
          :endDate="endDate ? endDate.setHours(23, 59, 59, 999) : null"
        />
      </keep-alive>
    </div>
  </div>
</template>

<script>
import {get} from '@/utils/store-helpers';
import moment from 'moment';
import ProjectScoresGroupByImage from './ProjectScoresGroupByImage';
import ProjectScoresGroupByUser from './ProjectScoresGroupByUser';
import ProjectScoresReport from './ProjectScoresReport';
const defaultTab = 'images';

export default {
  name: 'project-scores',
  components: {},
  data() {
    return {
      activeTab: defaultTab,
      startDate: null,
      endDate: null
    };
  },
  computed: {
    configUI: get('currentProject/configUI'),
    canManageProject() {
      return this.$store.getters['currentProject/canManageProject'];
    },
    moment() {
      return moment;
    },
    queriedTab() {
      return this.$route.query.tab;
    },
    activeComponent() {
      switch(this.activeTab) {
        case 'images':
          return ProjectScoresGroupByImage;
        case 'members':
          return ProjectScoresGroupByUser;
        case 'report':
          return ProjectScoresReport;
      }
    }
  },
  watch: {
    queriedTab() {
      this.changeTab();
    },
    activeTab() {
      if(this.activeTab !== defaultTab || this.queriedTab) {
        this.$router.push(`?tab=${this.activeTab}`);
      }
    }
  },
  methods: {
    changeTab() {
      this.activeTab = this.queriedTab || defaultTab;
      if(!this.activeComponent) {
        this.activeTab = defaultTab;
      }
    }
  },
  created() {
    this.changeTab();
  }
};
</script>

<style scoped>
.project-scores-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.component-wrapper {
  flex: 1;
  min-height: 20em;
}
</style>

<style>
.project-scores-wrapper .date-picker-dropdown.dropdown > .dropdown-menu {
  min-width: 20em;
}
</style>
