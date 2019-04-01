import {AnnotationTermCollection} from "cytomine-client";

/** Enum providing the actions that can be performed on annotations */
export const Action = Object.freeze({
    SELECT: "select",
    CREATE: "create",
    UPDATE: "update",
    DELETE: "delete"
});

/**
 * Fetch the terms associated to the provided annot, and populate term and userByTerm properties accordingly
 * 
 * @param {Object} annot The annotation to update
 */
export async function updateTermProperties(annot) {
    let annotTerms = await AnnotationTermCollection.fetchAll({filterKey: "annotation", filterValue: annot.id});
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