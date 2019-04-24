<template>
<div class="tile is-child box last-actions">
  <b-message v-if="error" type="is-danger" has-icon icon-size="is-small">
    <h2> {{ $t('error') }} </h2>
    <p> {{ $t('unexpected-error-info-message') }} </p>
  </b-message>
  <template v-else>
    <h2>{{$t('activity-logs')}}</h2>

    <b-select v-model="selectedUser">
      <option :value="null">{{$t('all-users-analyses')}}</option>
      <optgroup :label="$t('members')">
        <option v-for="member in members" :value="member.id" :key="member.id">{{member.fullName}}</option>
      </optgroup>
      <optgroup :label="$t('analyses')">
        <option v-for="uJob in userJobs" :value="uJob.id" :key="uJob.id">{{uJob.fullName}}</option>
      </optgroup>
    </b-select>

    <div class="list-actions" @scroll="scrollHandler" ref="listActions" v-if="actions.length > 0">
      <div v-for="(month, idx) in formattedActions" :key="idx">
        <h3>{{month.refDate | moment('MMMM YY')}}</h3>
        <div v-for="(day, idx) in month.days" :key="idx">
          <h4>{{day.refDate | moment('ll')}}</h4>
          <ul>
            <li v-for="action in day.actions" :key="action.id">
              <strong>{{Number(action.created) | moment('l LTS')}}:</strong> {{action.message}}
            </li>
          </ul>
        </div>
      </div>

      <button class="button" :class="{'is-loading': loading}" v-if="!loadedAllActions" @click="loadActions()">
        {{$t('button-load-more')}}
      </button>
    </div>

    <div class="no-result" v-else>
      <em class="has-text-grey">{{$t('no-log-to-display')}}</em>
    </div>
  </template>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';

import {UserJobCollection} from 'cytomine-client';
import {fullName} from '@/utils/user-utils.js';

import moment from 'moment';

import _ from 'lodash';

export default {
  name: 'project-activity-logs',
  props: {
    startDate: Number,
    endDate: Number
  },
  data() {
    return {
      loading: true,
      error: false,

      offset: 0,
      nbActionsPerPage: 50,
      loadedAllActions: false,

      userJobs: [],
      members: [],
      selectedUser: null,

      actions: []
    };
  },
  computed: {
    project: get('currentProject/project'),
    formattedActions() {
      let results = [];
      let lastDate = null;
      let idxMonths = -1;
      let idxDays = -1;
      for(let i = 0; i < this.actions.length; i++) {
        let action = this.actions[i];
        let date = moment(Number(action.created));
        if(!lastDate || !date.isSame(lastDate, 'day')) {
          if(!lastDate || !date.isSame(lastDate, 'month')) {
            results.push({
              refDate: Number(action.created),
              days: []
            });
            idxMonths++;
            idxDays = -1;
          }

          results[idxMonths].days.push({refDate: Number(action.created), actions: [action]});
          idxDays++;
        }
        else {
          results[idxMonths].days[idxDays].actions.push(action);
        }
        lastDate = date;
      }

      return results;
    }
  },
  watch: {
    selectedUser() {
      this.loadActions(false);
    },
    startDate() {
      this.loadActions(false);
    },
    endDate() {
      this.loadActions(false);
    }
  },
  methods: {
    scrollHandler: _.debounce(function() {
      let scrollBlock = this.$refs.listActions;
      let bottom = (scrollBlock.scrollTop + scrollBlock.clientHeight === scrollBlock.scrollHeight);

      if (bottom && !this.loadedAllActions) {
        this.loadActions();
      }
    }, 100),

    async loadActions(append=true) {
      this.loading = true;
      if(!append) {
        this.actions = [];
        this.offset = 0;
        this.loadedAllActions = false;
      }

      try {
        let data = await this.project.fetchCommandHistory({
          max: this.nbActionsPerPage,
          offset: this.offset,
          user: this.selectedUser,
          startDate: this.startDate,
          endDate: this.endDate
        });

        this.actions.push(...data);
        this.offset += this.nbActionsPerPage;

        if(data.length < this.nbActionsPerPage) {
          this.loadedAllActions = true;
        }
      }
      catch(error) {
        console.log(error);
        this.error = true;
      }

      this.loading = false;
    },

    async fetchMembers() {
      this.members = (await this.project.fetchUsers()).array;
      this.members.forEach(member => member.fullName = fullName(member));
    },

    async fetchUserJobs() {
      this.userJobs = (await UserJobCollection.fetchAll({filterKey: 'project', filterValue: this.project.id})).array;
      this.userJobs = this.userJobs.filter(uj => uj.id); // HACK because some returned jobs are empty objects
      this.userJobs.forEach(uJob => uJob.fullName = fullName(uJob));
    }
  },
  async created() {
    try {
      await Promise.all([
        this.loadActions(),
        this.fetchMembers(),
        this.fetchUserJobs()
      ]);
    }
    catch(error) {
      console.log(error);
      this.error = true;
    }

    this.loading = false;
  }
};
</script>

<style scoped>
.last-actions {
  height: 100%;
  display: flex;
  flex-direction: column;
  word-wrap: break-word;
}

.list-actions {
  overflow: auto;
  margin-top: 1em;
}

.no-result {
  margin-top: 1em;
}

h3 {
  font-weight: bold;
  color: #555;
}

.list-actions div:not(:first-child) h3 {
  padding: 0.5em 0;
  margin-top: 1em;
  border-top: rgba(0, 0, 0, 0.1) 2px solid;
}

h4 {
  padding: 0.9em 1.2em 0.9em;
  color: #aaa;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 0.9rem;
}

ul {
  margin-left: 2.5em;
}

li {
  margin-bottom: 0.6em;
}

.button {
  display: block;
  margin: auto;
}
</style>
