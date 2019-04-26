export function formatMinutesSeconds(time) {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time - minutes * 60);
    return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
}