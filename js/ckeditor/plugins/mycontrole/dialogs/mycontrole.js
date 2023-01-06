CKEDITOR.dialog.add( 'mycontrole', function( editor ) {
    return {
        title: 'Edition d\'un bloc de lignes',
        minWidth: 200,
        minHeight: 100,
        contents: [
            {
                id: 'info',
                elements: [
                    {
                        id: 'nb_lignes',
                        type: 'text',
                        label: 'Nombre de lignes',
                        width: '50px',
                        setup: function( widget ) {
                            this.setValue( widget.data.nb_lignes );
                        },
                        commit: function( widget ) {
                            widget.setData( 'nb_lignes', this.getValue() );
                        }
                    }
                ]
            }
        ]
    };
} );