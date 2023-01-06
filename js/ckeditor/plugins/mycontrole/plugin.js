CKEDITOR.plugins.add( 'mycontrole', {
    requires: 'widget',

    icons: 'mycontrole',

    init: function( editor ) {
        CKEDITOR.dialog.add( 'mycontrole', this.path + 'dialogs/mycontrole.js' );
        editor.widgets.add( 'mycontrole', {
            button: 'Insérer un bloc de lignes',
            template: '<div class="mycontrole-lines">Bloc de <strong>5</strong> lignes</div>',
            allowedContent: 'div(!mycontrole-lines)',
            requiredContent: 'div(mycontrole-lines)',
            dialog: 'mycontrole',
            upcast: function( element ) {
                return element.name == 'div' && element.hasClass( 'mycontrole-lines' );
            },
            init: function() {
                this.setData( 'nb_lignes', 5 );
            },
            data: function() {

                if ( this.data.nb_lignes > 0 ){
                    this.element.setHtml("Bloc de <strong>"+this.data.nb_lignes+"</strong> lignes");
                }
            }
        });

    }
} );