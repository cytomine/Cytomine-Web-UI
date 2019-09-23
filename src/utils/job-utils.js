import {JobStatus} from 'cytomine-client';

export const jobStatusLabelMapping = Object.freeze({
  [JobStatus.NOTLAUNCH]: 'not-launch',
  [JobStatus.WAIT]: 'wait',
  [JobStatus.INQUEUE]: 'in-queue',
  [JobStatus.RUNNING]: 'running',
  [JobStatus.SUCCESS]: 'success',
  [JobStatus.FAILED]: 'failed',
  [JobStatus.INDETERMINATE]: 'indeterminate',
  // [JobStatus.PREVIEWED]: 'previewed'
});

export const jobStatusMapping = Object.freeze({
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
