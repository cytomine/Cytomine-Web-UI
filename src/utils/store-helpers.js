import {isBoundsFilterActive} from './bounds';

// Helpers for vuex (inspired by https://github.com/davestewart/vuex-pathify)

function arrayPath(path) {
  if(Array.isArray(path)) {
    return path;
  }
  if(typeof path === 'string') {
    return path.split('/');
  }
  throw new Error('Path must be a string or an array');
}

function getValue(store, path) {
  let obj = store.state;
  for(let i = 0; i < path.length; i++) {
    obj = obj[path[i]];
  }
  return obj;
}

/**
 * Getter for a computed property allowing to easily retrieve the value of a store property
 * This function must be called from a Vue.js component
 * @example
 * computed: {
 *   myProp: get('myModule/myProp')
 * }
 *
 * @param {String|Array<String>} path Store path to the property
 * @returns A computed getter for the targetted property
 */
export function get(path) {
  path = arrayPath(path);
  return {
    get() {
      return getValue(this.$store, path);
    },
  };
}

function getMutationName(path) {
  let variableName = path[path.length - 1];
  let modulePath = path.slice(0, path.length -1);
  return modulePath.join('/') + '/set' + variableName.charAt(0).toUpperCase() + variableName.slice(1);
}

/**
 * Provides getter and setter for a computed property that should be synchronized with a store property
 * This function must be called from a Vue.js component
 * @example
 * computed: {
 *   myProp: sync('myModule/myProp')
 * }
 *
 * @param {String|Array<String>} path Store path to the property
 * @returns Computed getter and setter for the targetted property
 */
export function sync(path) {
  path = arrayPath(path);
  return {
    ...get(path),
    set(value) {
      this.$store.commit(getMutationName(path), value);
    }
  };
}

/**
 * Provides getter and setter for a computed property that should be synchronized with a bounds filter (min, max bounds)
 * stored in Vuex
 * This function must be called from a Vue.js component, that also defines a property giving the max upper bound, and the
 * targetted module should be constructed as shown in the example
 * @example
 * // Vue.js component
 * computed: {
 *   myFilter: sync('myModule', 'myFilter', 'maxValue'),
 *   maxValue() {return 15;}
 * }
 * // myModule structure
 * namespaced: true,
 * state: {
 *   filters: {
 *     myFilter: null // null value for inactive filter (computed property will be equal to [0, maxValue])
 *   }
 * },
 * mutations: {
 *   setFilter(state, {filterName, propValue}) {
 *     state.filters[filterName] = propValue;
 *   },
 * }
 *
 *
 * @param {String|Array<String>} path Path to the store module containing the filters
 * @param {String} filterName The name of the filter property
 * @param {String} maxProp The name of the component property containing the max allowed value
 * @returns Computed getter and setter for the targetted filter
 */
export function syncBoundsFilter(modulePath, filterName, maxProp) {
  modulePath = arrayPath(modulePath);

  return {
    get() {
      let value = getValue(this.$store, modulePath).filters[filterName];
      return value ? value : [0, this[maxProp]];
    },
    set(bounds) {
      let propValue = isBoundsFilterActive(bounds, this[maxProp]) ? bounds : null;
      this.$store.commit(modulePath.join('/') + '/setFilter', {filterName, propValue});
    }
  };
}

/**
 * Provides getter and setter for a computed property that should be synchronized with a multiselect filter stored in Vuex
 * This function must be called from a Vue.js component, that also defines a property giving the available options, and the
 * targetted module should be constructed as shown in the example
 * @example
 * // Vue.js component
 * computed: {
 *   myFilter: sync('myModule', 'myFilter', 'availableOptions'),
 *   availableOptions() {return [1, 2, 3];}
 * }
 * // myModule structure
 * namespaced: true,
 * state: {
 *   filters: {
 *     myFilter: null // null value for inactive filter (computed property will be equal to copy of available options)
 *   }
 * },
 * mutations: {
 *   setFilter(state, {filterName, propValue}) {
 *     state.filters[filterName] = propValue;
 *   },
 * }
 *
 *
 * @param {String|Array<String>} path Path to the store module containing the filters
 * @param {String} filterName The name of the filter property
 * @param {String} optionsProp The name of the component property containing the available options
 * @returns Computed getter and setter for the targetted filter
 */
export function syncMultiselectFilter(modulePath, filterName, optionsProp) {
  modulePath = arrayPath(modulePath);

  return {
    get() {
      let value = getValue(this.$store, modulePath).filters[filterName];
      return value ? value : this[optionsProp].slice();
    },
    set(selectedOptions) {
      let propValue = (selectedOptions.length === this[optionsProp].length) ? null : selectedOptions;
      this.$store.commit(modulePath.join('/') + '/setFilter', {filterName, propValue});
    }
  };
}
