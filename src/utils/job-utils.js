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
