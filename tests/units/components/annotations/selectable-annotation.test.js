import {shallowMount} from '@vue/test-utils';
import SelectableAnnotation from '@/components/annotations/SelectableAnnotation';
import AnnotationPreview from '@/components/annotations/AnnotationPreview';

describe('SelectableAnnotation.vue', () => {
  let wrapper;

  const annotationMock = {id: 1};
  const imagesMock = [{id: 101, name: 'Image 1'}];
  const usersMock = [{id: 201, username: 'User1'}];

  beforeEach(() => {
    wrapper = shallowMount(SelectableAnnotation, {
      propsData: {
        annotation: annotationMock,
        images: imagesMock,
        users: usersMock,
        isSelected: false,
      },
    });
  });

  it('The component should be rendered correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('The component should render the selected class when isSelected is true', async () => {
    await wrapper.setProps({isSelected: true});

    expect(wrapper.classes()).toContain('selected');
  });

  it('The component should not apply the selected class when isSelected is false', () => {
    expect(wrapper.classes()).not.toContain('selected');
  });

  it('The component should render AnnotationPreview with correct props', () => {
    const annotationPreview = wrapper.findComponent(AnnotationPreview);

    expect(annotationPreview.exists()).toBe(true);
    expect(annotationPreview.props('annot')).toBe(annotationMock);
    expect(annotationPreview.props('images')).toBe(imagesMock);
    expect(annotationPreview.props('users')).toBe(usersMock);
    expect(annotationPreview.props('size')).toBe(85);
  });

  it('Clicking on the AnnotationPreview should emit update:selected', async () => {
    await wrapper.trigger('click');

    expect(wrapper.emitted('update:selected')).toBeTruthy();
    expect(wrapper.emitted('update:selected')[0]).toEqual([annotationMock]);
  });
});
