/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module my-controle/mycontrolecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';

/**
 * The my controle command.
 *
 * The command is registered by {@link module:my-controle/mycontroleediting~MyControleEditing} as `'myControle'`.
 *
 * To insert a block of lines at the current selection, execute the command:
 *
 *		editor.execute( 'myControle' );
 *
 * @extends module:core/command~Command
 */
export default class MyControleCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = isMyControleAllowed(this.editor.model);
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;

		model.change(writer => {

			const nb = prompt("Nombre de lignes")
			const myControleElement = writer.createElement('myControle');
			model.insertContent(myControleElement);
			myControleElement._setAttribute("lines", nb);

			let nextElement = myControleElement.nextSibling;

			// Check whether an element next to the inserted blick is defined and can contain a text.
			const canSetSelection = nextElement && model.schema.checkChild(nextElement, '$text');

			// If the element is missing, but a paragraph could be inserted next to theblock, let's add it.
			if (!canSetSelection && model.schema.checkChild(myControleElement.parent, 'paragraph')) {
				nextElement = writer.createElement('paragraph');

				model.insertContent(nextElement, writer.createPositionAfter(myControleElement));
			}

			// Put the selection inside the element, at the beginning.
			if (nextElement) {
				writer.setSelection(nextElement, 0);
			}
		});
	}
}

// Checks if the `myControle` element can be inserted at the current model selection.
//
// @param {module:engine/model/model~Model} model
// @returns {Boolean}
function isMyControleAllowed(model) {
	const schema = model.schema;
	const selection = model.document.selection;

	return isMyControleAllowedInParent(selection, schema, model) &&
		!checkSelectionOnObject(selection, schema);
}

// Checks if a block is allowed by the schema in the optimal insertion parent.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/model/model~Model} model Model instance.
// @returns {Boolean}
function isMyControleAllowedInParent(selection, schema, model) {
	const parent = getInsertMyControleParent(selection, model);

	return schema.checkChild(parent, 'myControle');
}

// Checks if the selection is on object.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/schema~Schema} schema
// @returns {Boolean}
function checkSelectionOnObject(selection, schema) {
	const selectedElement = selection.getSelectedElement();

	return selectedElement && schema.isObject(selectedElement);
}

// Returns a node that will be used to insert a block with `model.insertContent` to check if the block can be placed there.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/model~Model} model Model instance.
// @returns {module:engine/model/element~Element}
function getInsertMyControleParent(selection, model) {
	const insertAt = findOptimalInsertionPosition(selection, model);

	const parent = insertAt.parent;

	if (parent.isEmpty && !parent.is('$root')) {
		return parent.parent;
	}

	return parent;
}
