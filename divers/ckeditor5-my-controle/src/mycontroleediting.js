/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module my-controle/mycontroleediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import MyControleCommand from './mycontrolecommand';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import first from '@ckeditor/ckeditor5-utils/src/first';

import '../theme/mycontrole.css';

/**
 * The my controle editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MyControleEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MyControleEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.t;
		const conversion = editor.conversion;

		schema.register('myControle', {
			isObject: true,
			allowWhere: '$block',
			allowAttributes: "lines"
		});



		conversion.for('dataDowncast').elementToElement({
			model: 'myControle',
			view: (modelElement, viewWriter) => {
				const label = "Bloc de " + modelElement.getAttribute("lines") + " lignes";
				const divElement = viewWriter.createContainerElement("div", { class: "mycontrole-lines" });
				const spanElement = viewWriter.createContainerElement("span", { class: "mycontrole-lines__label" });
				const textElement = viewWriter.createText(label);

				viewWriter.insert(viewWriter.createPositionAt(divElement, 0), spanElement);
				viewWriter.insert(viewWriter.createPositionAt(spanElement, 0), textElement);

				return divElement;
			}
		});

		conversion.for('editingDowncast').elementToElement({
			model: 'myControle',
			view: (modelElement, viewWriter) => {

				const label = "Bloc de " + modelElement.getAttribute("lines") + " lignes";
				const viewWrapper = viewWriter.createContainerElement("div");
				const viewLabelElement = viewWriter.createContainerElement("span");
				const innerText = viewWriter.createText(label);

				viewWriter.addClass('mycontrole-lines', viewWrapper);
				viewWriter.setCustomProperty('myControle', true, viewWrapper);

				viewWriter.addClass('mycontrole-lines__label', viewLabelElement);

				viewWriter.insert(viewWriter.createPositionAt(viewWrapper, 0), viewLabelElement);
				viewWriter.insert(viewWriter.createPositionAt(viewLabelElement, 0), innerText);

				return toMyControleWidget(viewWrapper, viewWriter, label);
			}
		});

		conversion.for('upcast')
			.elementToElement({
				view: { name: "div", classes: "mycontrole-lines" },
				model: (viewElement, modelWriter) => {

					const i = first(viewElement.getChildren());
					const n = first(i.getChildren()).data.match(/\d+/g);

					return modelWriter.createElement('myControle', { lines: n });

				}
			});

		editor.commands.add('myControle', new MyControleCommand(editor));
	}
}

// Converts a given {@link module:engine/view/element~Element} to a my controle widget:
// * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to
//   recognize the my controle widget element.
// * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
//
//  @param {module:engine/view/element~Element} viewElement
//  @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
//  @param {String} label The element's label.
//  @returns {module:engine/view/element~Element}
function toMyControleWidget(viewElement, writer, label) {
	writer.setCustomProperty('myControle', true, viewElement);

	return toWidget(viewElement, writer, { label });
}
