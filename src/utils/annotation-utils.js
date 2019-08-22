import {AnnotationTermCollection, AnnotationType, AnnotationTrackCollection} from 'cytomine-client';

/** Enum providing the actions that can be performed on annotations */
export const Action = Object.freeze({
  SELECT: 'select',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
});

/**
 * Fetch the terms associated to the provided annot, and populate term and userByTerm properties accordingly
 *
 * @param {Object} annot The annotation to update
 */
export async function updateTermProperties(annot) {
  let annotTerms = await AnnotationTermCollection.fetchAll({filterKey: 'annotation', filterValue: annot.id});
  annot.term = [];
  annot.userByTerm = [];
  let mapping = {};
  annotTerms.array.forEach(({term, user}) => {
    if(!annot.term.includes(term)) {
      mapping[term] = annot.term.length;
      annot.term.push(term);
      annot.userByTerm.push({term, user: [user]});
    }
    else { // this term was already treated => add user to existing userByTerm object related to the term
      annot.userByTerm[mapping[term]].user.push(user);
    }
  });
}

/**
 * Fetch the tracks associated to the provided annot, and populate track and annotationTrack properties accordingly
 *
 * @param {Object} annot The annotation to update
 */
export async function updateTrackProperties(annot) {
  let annotTracks = await AnnotationTrackCollection.fetchAll({filterKey: 'annotation', filterValue: annot.id});
  annot.track = annotTracks.array.map(at => at.track);
  annot.annotationTrack = annotTracks.array;
}

/**
 * Checks whether an annotation belongs to the provided layer and image
 *
 * @param {Object} annot The annotation
 * @param {Object} layer The layer
 * @param {Object} [image] The image
 *
 * @returns {Boolean} whether or not the annotation belongs to the provided layer and image
 */
export function annotBelongsToLayer(annot, layer, image=null) {
  if(image && annot.image !== image.id) {
    return false;
  }
  let isReviewed = annot.type === AnnotationType.REVIEWED;
  return layer.isReview ? isReviewed : (!isReviewed && annot.user === layer.id);
}
