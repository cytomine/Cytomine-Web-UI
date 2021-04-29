/*
* Copyright (c) 2009-2021. Authors: see NOTICE file.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import {JobStatus} from 'cytomine-client';

const jobStatusMapping = Object.freeze({
  [JobStatus.RUNNING]: {
    label: 'running',
    statLabel: 'numberOfRunning',
    color: '#209CEE'
  },
  [JobStatus.SUCCESS]: {
    label: 'success',
    statLabel: 'numberOfSuccess',
    color: '#23D160'
  },
  [JobStatus.FAILED]: {
    label: 'failed',
    statLabel: 'numberOfFailed',
    color: '#FF3860'
  },
  [JobStatus.NOTLAUNCH]: {
    label: 'not-launch',
    statLabel: 'numberOfNotLaunch',
    color: '#F5F5F5'
  },
  [JobStatus.WAIT]: {
    label: 'wait',
    statLabel: 'numberOfWait',
    color: '#F5F5F5'
  },
  [JobStatus.INQUEUE]: {
    label: 'in-queue',
    statLabel: 'numberOfInQueue',
    color: '#F5F5F5'
  },
  [JobStatus.INDETERMINATE]: {
    label: 'indeterminate',
    statLabel: 'numberOfIndeterminate',
    color: '#F5F5F5'
  },
  [JobStatus.KILLED]: {
    label: 'killed',
    statLabel: 'numberOfKilled',
    color: '#363636'
  }
});

export default jobStatusMapping;
