/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module my-controle/mycontroleui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import myControleIcon from '../theme/icons/mycontrole.svg';

/**
 * The my controle UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MyControleUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Add myControle button to feature components.
		editor.ui.componentFactory.add('myControle', locale => {
			const command = editor.commands.get('myControle');
			const view = new ButtonView(locale);

			view.set({
				label: 'Bloc de lignes',
				icon: myControleIcon,
				tooltip: true
			});

			view.bind('isEnabled').to(command, 'isEnabled');

			// Execute command.
			this.listenTo(view, 'execute', () => {
				editor.execute('myControle');
				editor.editing.view.focus();
			});

			return view;
		});
	}
}
