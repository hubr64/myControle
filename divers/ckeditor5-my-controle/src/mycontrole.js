/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module my-controle/mycontrole
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import MyControleEditing from './mycontroleediting';
import MyControleUI from './mycontroleui';

/**
 * The my controle feature.
 *
 * It provides the possibility to insert a multi line block into the rich-text editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MyControle extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [MyControleEditing, MyControleUI];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MyControle';
	}
}
