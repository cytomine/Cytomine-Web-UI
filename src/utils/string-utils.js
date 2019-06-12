import _ from 'lodash';

/**
 * Return a Regexp based on the provided search string, and using * as a wildcard character.
 * @param {String} str The string entered by the user
 * @return {RegExp}
 */
export function getWildcardRegexp(str) {
  let escapedString = _.escapeRegExp(str); // escape all RegExp special characters (only * should have a special behaviour)
  return new RegExp('(' + escapedString.split('\\*').join('.*') + ')', 'gi');
}
