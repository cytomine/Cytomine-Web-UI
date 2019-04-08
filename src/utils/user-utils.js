import moment from 'moment';

export function fullName(user) {
  if(!user) {
    return '';
  }

  if(!user.algo) {
    return `${user.firstname} ${user.lastname} (${user.username})`;
  }
  else {
    let date = moment(Number(user.created)).format('L LTS');
    return `${user.softwareName} - ${date}`;
  }
}
