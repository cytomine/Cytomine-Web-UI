// Key list reference: https://github.com/iFgR/vue-shortkey#key-list

let shortkey = 'ctrl'; //should be meta on Mac OS

export default Object.freeze({
  'general-close-modal': ['esc'], // Handled by Bulma
  // 'navbar-dashboard': ['g', 'd'],
  // 'navbar-projects': ['g', 'p'],
  // 'navbar-ontologies': ['g', 'o'],
  // 'navbar-storage': ['g', 's'],
  // 'navbar-algorithms': ['g', 'a'],
  // 'navbar-user': ['g', 'u'],
  // 'navbar-help': ['g', 'h'],
  // 'navbar-admin': ['g', 'z'],
  // 'project-images': [],
  // 'project-annotations': [],
  // 'project-jobs': [],
  // 'project-activities': [],
  // 'project-information': [],
  // 'project-configuration': [],
  'viewer-nav-zoom-in': ['+'], // Handled by Openlayers KeyboardZoom
  'viewer-nav-zoom-out': ['-'], // Handled by Openlayers KeyboardZoom
  'viewer-nav-move-up': ['arrowup'], // Handled by Openlayers KeyboardPan
  'viewer-nav-move-down': ['arrowdown'], // Handled by Openlayers KeyboardPan
  'viewer-nav-move-left': ['arrowleft'], // Handled by Openlayers KeyboardPan
  'viewer-nav-move-right': ['arrowright'], // Handled by Openlayers KeyboardPan
  'viewer-nav-next-image': ['shift', 'arrowright'],
  'viewer-nav-previous-image': ['shift', 'arrowleft'],
  /*'viewer-nav-next-t': ['pageup'],
  'viewer-nav-previous-t': ['pagedown'],
  'viewer-nav-first-t': ['home'],
  'viewer-nav-last-t': ['end'],
  'viewer-nav-next-c': ['alt', 'pageup'],
  'viewer-nav-previous-c': ['alt', 'pagedown'],
  'viewer-nav-first-c': ['alt', 'home'],
  'viewer-nav-last-c': ['alt', 'end'],
  'viewer-nav-next-z': ['shift', 'pageup'],
  'viewer-nav-previous-z': ['shift', 'pagedown'],
  'viewer-nav-first-z': ['shift', 'home'],
  'viewer-nav-last-z': ['shift', 'end'],
  'viewer-nav-next-slice': ['alt', 'shift', 'pageup'],
  'viewer-nav-previous-slice': ['alt', 'shift', 'pagedown'],
  'viewer-nav-first-slice': ['alt', 'shift', 'home'],
  'viewer-nav-last-slice': ['alt', 'shift', 'end'],*/
  'viewer-nav-drag-rotate': ['alt', 'shift', 'drag'], // Handled by Openlayers
  'viewer-nav-drag-zoom': ['shift', 'drag'], // Handled by Openlayers
  'viewer-tool-select': ['s'],
  'viewer-tool-point': ['o'],
  'viewer-tool-line': ['l'],
  'viewer-tool-freehand-line': ['shift', 'l'],
  'viewer-tool-rectangle': ['r'],
  'viewer-tool-circle': ['c'],
  'viewer-tool-polygon': ['p'],
  'viewer-tool-freehand-polygon': ['shift', 'p'],
  'viewer-tool-fill': ['f'],
  'viewer-tool-correct-add': ['shift', 'c'],
  'viewer-tool-correct-remove': ['alt', 'shift', 'c'],
  'viewer-tool-modify': ['m'],
  'viewer-tool-modify-delete-vertex': ['ctrl', 'click'], // Handled by Openlayers
  // 'viewer-tool-rescale': ['shift', 'm'],
  'viewer-tool-move': ['t'],
  'viewer-tool-rotate': ['shift', 't'],
  'viewer-tool-delete': ['del'],
  'viewer-tool-undo': [shortkey, 'z'],
  'viewer-tool-redo': [shortkey, 'y'],
  'viewer-tool-review-accept': ['j'],
  'viewer-tool-review-reject': ['k'],
  'viewer-tool-review-toggle': ['i'],
  // 'viewer-tool-go-to-slice-t': ['g'],
  // 'viewer-tool-go-to-slice-z': ['shift', 'g'],
  // 'viewer-tool-go-to-slice-c': ['alt', 'g'],
  'viewer-toggle-information': ['alt', 'i'],
  'viewer-toggle-zoom': ['alt', 'z'],
  'viewer-toggle-link': ['alt', 's'],
  'viewer-toggle-filters': ['alt', 'f'],
  'viewer-toggle-layers': ['alt', 'l'],
  'viewer-toggle-ontology': ['alt', 't'],
  'viewer-toggle-properties': ['alt', 'p'],
  'viewer-toggle-broadcast': ['alt', 'b'],
  'viewer-toggle-review': ['alt', 'r'],
  'viewer-toggle-overview': ['alt', 'o'],
  'viewer-toggle-annotations': ['alt', 'a'],
  'viewer-toggle-current': ['alt', 'c'],
  'viewer-toggle-add-image': ['alt', '+'],
  'text-editor-bold': [shortkey, 'b'], // Handled by Quill editor
  'text-editor-italic': [shortkey, 'i'], // Handled by Quill editor
  'text-editor-underline': [shortkey, 'u'], // Handled by Quill editor
});
