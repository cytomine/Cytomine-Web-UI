import {JobStatus} from "cytomine-client";

const jobStatusLabelMapping = Object.freeze({
    [JobStatus.NOTLAUNCH]: "not-launch",
    [JobStatus.INQUEUE]: "in-queue",
    [JobStatus.RUNNING]: "running",
    [JobStatus.SUCCESS]: "success",
    [JobStatus.FAILED]: "failed",
    [JobStatus.INDETERMINATE]: "indeterminate",
    [JobStatus.WAIT]: "wait",
    [JobStatus.PREVIEWED]: "previewed"
});

export default jobStatusLabelMapping;