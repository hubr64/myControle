/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
    config.language = 'fr';
    config.height = '100px';
    config.extraPlugins = 'mycontrole';
	config.floatSpaceDockedOffsetY = 20;
    config.floatSpaceDockedOffsetX = 0;
    config.mathJaxLib = 'https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML';
    config.mathJaxClass = 'my-math';
    startupFocus = false;
    
    config.toolbar = [
        [ 'Source','Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ],
        [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ],
        [ 'Form', 'Checkbox', 'Radio', 'Textfield', 'Textarea', 'Select', 'Button' ],
        [ 'Image', 'Table', 'HorizontalRule','SpecialChar','PageBreak','Mycontrole','Smiley' ],
        [ 'Link', 'Unlink', 'Anchor'],
        [ 'Mathjax', 'texzilla', 'EqnEditor'],
        '/',
        [ 'Bold', 'Italic', 'Underline', 'Strike', '-' , 'Subscript', 'Superscript', '-', 'RemoveFormat' ],
        [ 'NumberedList', 'BulletedList' , '-' , 'Outdent' , 'Indent','Blockquote', 'Creatediv','-' , 'JustifyLeft' , 'JustifyRight', 'JustifyCenter', 'JustifyBlock' ],
        [ 'Styles','Format','Font', 'FontSize'],
        [ 'TextColor', 'BGColor'],
    ];
};
