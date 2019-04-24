export function isBetweenBounds(val, bounds) {
  return val >= bounds[0] && val <= bounds[1];
}

export function isBoundsFilterActive(bounds, max) {
  return bounds[0] !== 0 || bounds[1] !== max;
}

export function boundsComputedHandler(moduleName, propName, maxProp) {
  return {
    get() {
      let value = this.$store.state[moduleName].filters[propName];
      return value ? value : [0, this[maxProp]];
    },
    set(bounds) {
      let propValue = isBoundsFilterActive(bounds, this[maxProp]) ? bounds : null;
      this.$store.commit(moduleName + '/setFilter', {propName, propValue});
    }
  };
}

export function multiselectComputedHandler(moduleName, propName, optionsProp) {
  return {
    get() {
      let value = this.$store.state[moduleName].filters[propName];
      return value ? value : this[optionsProp].slice();
    },
    set(selectedOptions) {
      let propValue = (selectedOptions.length === this[optionsProp].length) ? null : selectedOptions;
      this.$store.commit(moduleName + '/setFilter', {propName, propValue});
    }
  };
}
