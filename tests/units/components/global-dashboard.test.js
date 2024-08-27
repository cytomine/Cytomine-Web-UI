import {createLocalVue, shallowMount} from '@vue/test-utils';
import Buefy from 'buefy';

import GlobalDashboard from '@/components/GlobalDashboard';
import {Configuration, ImageInstanceCollection, ProjectCollection} from 'cytomine-client';

jest.mock('cytomine-client', () => ({
  Configuration: {
    fetch: jest.fn()
  },
  ImageInstanceCollection: {
    fetchLastOpened: jest.fn()
  },
  ProjectCollection: {
    fetchAll: jest.fn(),
    fetchLastOpened: jest.fn()
  }
}));

describe('GlobalDashboard.vue', () => {
  const mocks = {
    $t: (message) => message,
  };

  let localVue;
  let wrapper;

  beforeEach(() => {
    ProjectCollection.fetchAll.mockResolvedValue({
      array: [
        {id: 1, name: 'Project 1', numberOfImages: 10, blindMode: false},
        {id: 2, name: 'Project 2', numberOfImages: 5, blindMode: true}
      ]
    });
    ProjectCollection.fetchLastOpened.mockResolvedValue([
      {id: 1},
      {id: 2}
    ]);
    ImageInstanceCollection.fetchLastOpened.mockResolvedValue([
      {id: 1, project: 1}
    ]);
    Configuration.fetch.mockResolvedValue({
      value: 'Welcome to the dashboard!'
    });

    localVue = createLocalVue();
    localVue.use(Buefy);

    wrapper = shallowMount(GlobalDashboard, {
      localVue,
      mocks: mocks,
      propsData: {
        nbRecent: 3
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
