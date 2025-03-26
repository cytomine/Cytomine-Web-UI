import {createLocalVue, shallowMount} from '@vue/test-utils';
import Buefy from 'buefy';

import BooleanField from '@/components/appengine/forms/fields/BooleanField';

describe('BooleanField.vue', () => {
  let localVue;
  let wrapper;

  const mockParameter = {
    // eslint-disable-next-line
    display_name: 'Test Parameter',
    default: true,
    description: 'This is a test description',
  };

  beforeEach(() => {
    localVue = createLocalVue();
    localVue.use(Buefy);

    wrapper = shallowMount(BooleanField, {
      localVue,
      propsData: {
        parameter: mockParameter,
        value: null,
      },
    });
  });

  it('should render the display name correctly', () => {
    expect(wrapper.find('.display-name').text()).toBe(mockParameter.display_name);
  });

  it('should render the description correctly', () => {
    expect(wrapper.vm.tooltip).toBe(mockParameter.description);
  });

  it('should not have a default value', () => {
    expect(wrapper.vm.input).toBe(null);
  });
});
