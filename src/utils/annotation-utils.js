/*
* Copyright (c) 2009-2021. Authors: see NOTICE file.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import {AnnotationTermCollection, AnnotationType} from 'cytomine-client';

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
