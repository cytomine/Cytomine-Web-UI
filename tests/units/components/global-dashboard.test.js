import {createLocalVue, mount} from '@vue/test-utils';
import Buefy from 'buefy';
import VTooltip from 'v-tooltip';

import GlobalDashboard from '@/components/GlobalDashboard';
import {Configuration, ImageInstanceCollection, ProjectCollection} from 'cytomine-client';

jest.mock('cytomine-client', () => ({
  Configuration: {
    fetch: jest.fn().mockResolvedValue({
      value: 'Welcome to the dashboard!'
    })
  },
  ImageInstanceCollection: {
    fetchLastOpened: jest.fn().mockResolvedValue([
      {id: 1, project: 1}
    ])
  },
  ProjectCollection: {
    fetchAll: jest.fn().mockResolvedValue({
      array: [
        {id: 1, name: 'Project 1', numberOfImages: 10, blindMode: false},
        {id: 2, name: 'Project 2', numberOfImages: 5, blindMode: true}
      ]
    }),
    fetchLastOpened: jest.fn().mockResolvedValue([
      {id: 1},
      {id: 2}
    ])
  }
}));

jest.mock('@/utils/image-utils', () => ({
  ...jest.requireActual('@/utils/image-utils'),
  isWebPSupported: jest.fn(() => true) // Mock to return true or false as needed
}));

describe('GlobalDashboard.vue', () => {
  let localVue;
  let wrapper;

  beforeEach(() => {
    localVue = createLocalVue();
    localVue.use(Buefy);
    localVue.use(VTooltip);

    wrapper = mount(GlobalDashboard, {
      localVue,
      mocks: {
        $t: (message) => message,
      },
      propsData: {
        nbRecent: 3
      },
      stubs: {
        'image-preview': true,
        'list-images-preview': true,
      }
    });
  });

  it('should render the component correctly', () => {
    const headers = wrapper.findAll('h2');

    expect(headers.length).toBe(3);
    expect(headers.at(0).text()).toBe('recently-opened');
    expect(headers.at(1).text()).toBe('statistics');
    expect(headers.at(2).text()).toBe('last-opened-image');

    expect(wrapper.vm.loading).toBe(false);
  });

  it('should render correctly when data is loaded', () => {
    expect(wrapper.find('h2').text()).toContain('recently-opened');
    expect(wrapper.findAll('router-link').length).toBeGreaterThan(0);
  });

  it('should render the welcome message', () => {
    expect(Configuration.fetch).toHaveBeenCalled();
    expect(wrapper.vm.welcomeMessage).toBe('Welcome to the dashboard!');
    expect(wrapper.find('.box').text()).toContain('Welcome to the dashboard!');
  });

  it('should fetch projects and compute statistics', () => {
    expect(ProjectCollection.fetchAll).toHaveBeenCalled();
    expect(wrapper.vm.projects.array.length).toBe(2);
    expect(wrapper.vm.nbImages).toBe(15);
  });

  it('should fetch recent projects and display them correctly', async () => {
    expect(ProjectCollection.fetchLastOpened).toHaveBeenCalled();
    expect(wrapper.vm.recentProjects.length).toBe(2);
    expect(wrapper.vm.recentProjects[0].name).toBe('Project 1');
  });

  it('should fetch the last opened image and bind it to the template', async () => {
    expect(ImageInstanceCollection.fetchLastOpened).toHaveBeenCalled();
    expect(wrapper.vm.lastOpenedImage.projectName).toBe('Project 1');
  });
});
