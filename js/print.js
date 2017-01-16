/* Function in charge of printing the edition version of the devoir 
   => Document given to pupils before notation */
function printDocumentEdition()
{
	//Hide and reinit the area that will temporily contain the document to print
    $('#s2').hide();
    $('#s2').html("");
    //Create a page that will contain the document
    $('#s2').append('<div class="s2_page"></div>');
	//Put a header with title, date, class name and empty area reserved to pupil name 
    $('#s2').children('div.s2_page:last-child').append('<div class="s2_title"><span>'+_content.data.general.titre+'</span><span>'+_content.data.general.date.getDate()+'/'+(_content.data.general.date.getMonth()+1)+'/'+_content.data.general.date.getFullYear()+'</span></div>');
    if(_content.data.general.classe!=null){
        $('#s2').children('div.s2_page:last-child').append('<div class="s2_classe"><span>Votre classe</span><span>'+_content.data.general.classe+'</span></div>');
    }else{
        $('#s2').children('div.s2_page:last-child').append('<div class="s2_classe"><span>Votre classe</span><span></span></div>');
    }
    $('#s2').children('div.s2_page:last-child').append('<div class="s2_pupilbox"><span>Votre nom</span><span></span></div>');
    
	//Now browse the devoir to get the content
    $.each(_content.data.exercices, function(nume,exercice) {
        if(exercice.type=="free"){
            $('#s2').children('div.s2_page:last-child').append('<div class="s2_free">'+exercice.text+'</div>');
        }else{
            $('#s2').children('div.s2_page:last-child').append('<div class="s2_exe"><span>'+exercice.title+'</span><span>'+exercice.bareme+' pts</span></div>');
            $.each(exercice.questions, function(numq,question) {
                if(question.type=="free"){
                    $('#s2').children('div.s2_page:last-child').append('<div class="s2_free">'+question.text+'</div>');
                }else{
                    $('#s2').children('div.s2_page:last-child').append('<div class="s2_que"><span>'+question.title+'</span><span>'+question.bareme+' pts</span></div>');
                    $.each(question.criteres, function(numc,critere) {
                        //Do not display criteria as they contain the answer
						if(critere.type=="free"){
                            $('#s2').children('div.s2_page:last-child').append('<div class="s2_free">'+critere.text+'</div>');
                        }
                    });
                }
            });
        }
    });
    
	//Replace special block of control lines with lines where the pupil will give the answer
    $.each($("#s2").find(".mycontrole-lines"), function(nume,bloc_lignes) {
        var nb_lignes = parseInt($(this).find("strong").html());
        $(this).html("");
        $(this).removeClass("mycontrole-lines");
        for(i=0;i<nb_lignes;i++){
            $(this).append('<div class="mycontrole-line">&nbsp;</div>');
        }
    });
	//Remove strange blocks created by ckeditor
	$.each($("#s2").find(".cke_reset"), function(nume,bloc_lignes) {
        $(this).remove();
    });
    
	//On recupere le contenu fabrique
	var document_content = $("#s2").html();
	//On ouvre une nouvelle fenêtre
	var w = window.open("print_edition.html");
	//On met le contenu fabriqué dans la nouvelle fenetre (on attend un peu pou êtrd sûr que tout le contenu fabriqué a bien été récupéré)
	setTimeout(function(){ $(w.document.body).html(document_content); }, 3000);
}

/* Function in charge of printing the correction version of the devoir 
   => Document for the teacher to realise a live correction */
function printDocumentCorrection()
{
    //Hide and reinit the area that will temporily contain the document to print
    $('#s2').hide();
    $('#s2').html("");
    //Create a page that will contain the document
    $('#s2').append('<div class="s2_page"></div>');
    //Put a header with title, date, class name and empty area reserved to pupil or group name 
    $('#s2').children('div.s2_page:last-child').append('<div class="s2_title"><span>'+_content.data.general.titre+'</span><span>'+_content.data.general.date.getDate()+'/'+(_content.data.general.date.getMonth()+1)+'/'+_content.data.general.date.getFullYear()+'</span></div>');
    if(_content.data.general.classe!=null){
        $('#s2').children('div.s2_page:last-child').append('<div class="s2_classe"><span>Votre classe</span><span>'+_content.data.general.classe+'</span></div>');
    }else{
        $('#s2').children('div.s2_page:last-child').append('<div class="s2_classe"><span>Votre classe</span><span></span></div>');
    }
	
	$('#s2').children('div.s2_page:last-child').append('<div class="s2_pupilbox"><span>Nom de l\'élève ou du groupe</span><span></span></div>');

    //Now browse the devoir to get the content
    $.each(_content.data.exercices, function(nume,exercice) {
        if(exercice.type=="free"){
            $('#s2').children('div.s2_page:last-child').append('<div class="s2_free">'+exercice.text+'</div>');
        }else{
            $('#s2').children('div.s2_page:last-child').append('<div class="s2_exe"><span>'+exercice.title+'</span><span>'+exercice.bareme+' pts</span></div>');
            $.each(exercice.questions, function(numq,question) {
                if(question.type=="free"){
                    $('#s2').children('div.s2_page:last-child').append('<div class="s2_free">'+question.text+'</div>');
                }else{
                    $('#s2').children('div.s2_page:last-child').append('<div class="s2_que"><span>'+question.title+'</span><span>'+question.bareme+' pts</span></div>');
                    $.each(question.criteres, function(numc,critere) {
                        if(critere.type=="free"){
                            $('#s2').children('div.s2_page:last-child').append('<div class="s2_free">'+critere.text+'</div>');
                        }else{
							//In this case we display the criteria with the capacites to help teahcer to realise the live notation
							if(critere.competence != null && critere.competence != "" && critere.competence != NO_COMPETENCE){
								var capacite = getCapacite(critere.competence);
								try {
									var critere_texte =  $(critere.text+"").text();
									if(critere_texte != ""){
										$('#s2').children('div.s2_page:last-child').append('<div class="s2_cri"><span style="color:'+capacite.competence.couleur+'">'+critere.competence+'</span><span>'+critere.text+'</span><span><span></span></span></div>');
									}else{
										$('#s2').children('div.s2_page:last-child').append('<div class="s2_cri"><span style="color:'+capacite.competence.couleur+'">'+critere.competence+'</span><span>'+capacite.texte+'</span><span><span></span></span></div>');
									}
								}catch(e){
									$('#s2').children('div.s2_page:last-child').append('<div class="s2_cri"><span style="color:'+capacite.competence.couleur+'">'+critere.competence+'</span><span>'+critere.text+'</span><span><span></span></span></div>');
								}
							}else{
								$('#s2').children('div.s2_page:last-child').append('<div class="s2_cri"><span style="color:#666">'+NO_COMPETENCE+'</span><span>'+critere.text+'</span><span><span></span></span></div>');
							}
						}
                    });
                }
            });
        }
    });
    //Remove the lines for pupil answer (no need here)
    $.each($("#s2").find(".mycontrole-lines"), function(nume,bloc_lignes) {
        $(this).remove();
    });
	//Remove strange blocks created by ckeditor
	$.each($("#s2").find(".cke_reset"), function(nume,bloc_lignes) {
        $(this).remove();
    });
    
	//On recupere le contenu fabrique
	var document_content = $("#s2").html();
	//On ouvre une nouvelle fenêtre
	var w = window.open("print_edition.html");
	//On met le contenu fabriqué dans la nouvelle fenetre (on attend un peu pou êtrd sûr que tout le contenu fabriqué a bien été récupéré)
	setTimeout(function(){ $(w.document.body).html(document_content); }, 3000);
}

/* Function in charge of printing the correction version of the devoir for each pupil
   => Document for the pupils - one document each - including correction and notes */
function printDocumentNotes()
{
	//Hide and reinit the area that will temporarily contains the configuration of the document to print
	$('#s2').hide();
	$("#s2").html(
		"<fieldset><legend>Inclure les élèves et critères non évalués :</legend>\
	    <label for='print_notes_validated_yes'>Oui</label><input type='radio' name='print_notes_validated' id='print_notes_validated_yes' value='1'>\
		<label for='print_notes_validated_no'>Non</label><input checked type='radio' name='print_notes_validated' id='print_notes_validated_no' value='0'>\
		</fieldset>\
		<fieldset><legend>Afficher les notes réelles :</legend>\
	    <label for='print_notes_reel_yes'>Oui</label><input checked type='radio' name='print_notes_reel' id='print_notes_reel_yes' value='1'>\
		<label for='print_notes_reel_no'>Non</label><input type='radio' name='print_notes_reel' id='print_notes_reel_no' value='0'>\
		</fieldset>\
		<fieldset><legend>Afficher les notes bulletin :</legend>\
	    <label for='print_notes_bulletin_yes'>Oui</label><input checked type='radio' name='print_notes_bulletin' id='print_notes_bulletin_yes' value='1'>\
		<label for='print_notes_bulletin_no'>Non</label><input type='radio' name='print_notes_bulletin' id='print_notes_bulletin_no' value='0'>\
		</fieldset>\
		<fieldset><legend>Exporter les capacités dans le bilan :</legend>\
	    <label for='print_capacites_bilan_yes'>Oui</label><input checked type='radio' name='print_capacites_bilan' id='print_capacites_bilan_yes' value='1'>\
		<label for='print_capacites_bilan_no'>Non</label><input type='radio' name='print_capacites_bilan' id='print_capacites_bilan_no' value='0'>\
		</fieldset>");
	
	$( "#s2 input" ).checkboxradio({
      icon: false
    });
	
	$("#s2").dialog({
		autoOpen: false,
		modal: true,
		width:"400px",
		closeText: "Annuler",
		title: "Génération des notes pour chaque élève",
		buttons: {
				Générer: function() {
					//Get the full configuration desired by the user
					var display_only_validated = true;
					var display_notes_reel = false;
					var display_notes_bulletin = false;
					var print_capacites_bilan = false;
					if (parseInt($('input[name=print_notes_validated]:checked').val()) == 1){
						display_only_validated = false;
					};
					if (parseInt($('input[name=print_notes_reel]:checked').val()) == 1){
						display_notes_reel = true;
					};
					if (parseInt($('input[name=print_notes_bulletin]:checked').val()) == 1){
						display_notes_bulletin = true;
					};
					if (parseInt($('input[name=print_capacites_bilan]:checked').val()) == 1){
						print_capacites_bilan = true;
					};
					//Close the export configuration window
					$("#s2").dialog( "close" );
					//Execute the fonction in charge of exporting the document
					printDocumentNotesCb(display_only_validated, display_notes_reel,display_notes_bulletin,print_capacites_bilan);
					
				}
			},
		close: function() {
			$("#s2").html("");
			$("#s2").dialog( "close" );
		}
	});
	$("#s2").dialog( "open" );
}
/* Function in charge of printing the correction version of the devoir for each pupil
   @input display_only_validated : a boolean indicating if the export includes also unvalided items
   @input display_notes_reel : a boolean indicating if the export includes the real note of each pupil
   @input display_notes_bulletin : a boolean indicating if the export includes the bulletin note of each pupil
*/
function printDocumentNotesCb(display_only_validated, display_notes_reel,display_notes_bulletin,print_capacites_bilan)
{
	//If no classe is defined then nothing to export
    if(_content.data.general.classe != null)
    {
        //Hide and reinit the area that will temporily contain the document to print
		$('#s2').hide();
        $('#s2').html("");
        //Get the class and all pupils inside it
        var classe = "_"+_content.data.general.classe;
        var pupils = _content.classes[classe];
        //If there are pupils in that class
        if(pupils != null){
			//Now browse each pupil of the class
			$.each(pupils, function(num,pupil) {
                //If this pupil has notes or if the user ask to print even unvalidated elements
                if(_content.data.notes[pupil] || display_only_validated == false){
                    //Create a new page for this pupil
					$('#s2').append('<div class="s2_page"></div>');
                    //Put a header with title, date, pupil name, note
					$('#s2').children('div.s2_page:last-child').append('<div class="s2_title"><span>'+_content.data.general.titre+'</span><span>'+_content.data.general.date.getDate()+'/'+(_content.data.general.date.getMonth()+1)+'/'+_content.data.general.date.getFullYear()+'</span></div>');
                    $('#s2').children('div.s2_page:last-child').append('<div class="s2_pupil"><span></span><span>'+pupil+'</span></div>');
                    
					var note_display_txt = "";
					if(display_notes_reel){
						note_display_txt = '<div><span>'+(display_notes_bulletin?'Note exacte':'&nbsp;')+'</span><span>'+(_content.data.notes[pupil]?_content.data.notes[pupil].note:'Non évalué')+'</span><span>'+(_content.data.notes[pupil]?'/'+_content.data.notes[pupil].max:'')+'</span></div>';
                    }
					if(display_notes_bulletin){
						pupil_note_finale = computeNoteFinal(_content.data.notes[pupil].note, _content.data.notes[pupil].max, _content.data.general.note_arrondi,_content.data.general.note_final_mode, _content.data.general.note_final_cible);
						note_display_txt += '<div><span>'+(display_notes_reel?'Note bulletin':'&nbsp;')+'</span><span>'+(_content.data.notes[pupil]?pupil_note_finale.note:'Non évalué')+'</span><span>'+(_content.data.notes[pupil]?'/'+pupil_note_finale.max:'')+'</span></div>';
					}
					$('#s2').children('div.s2_page:last-child').append('<div class="s2_note"><span></span><span>'+note_display_txt+'</span></div>');
					//If a comment has been done then add it in the print
                    $('#s2').children('div.s2_page:last-child').append('<div class="s2_comment"><span></span><span>'+(_content.data.notes[pupil]?_content.data.notes[pupil].commentaire:'Non commenté')+'</span></div>');
					//Add an area to display the global stats on this devoir
                    $('#s2').children('div.s2_page:last-child').append('<table class="s2_gen_stats"><thead><tr><th colspan="4">Bilan général de la classe</th></tr><tr><th>Moyenne</th><th>Minimum</th><th>Maximum</th><th>Inférieur Moyenne</th></tr></thead><tbody><tr><td>'+_content.data.general.stats.mean+'</td><td>'+_content.data.general.stats.min+'</td><td>'+_content.data.general.stats.max+'</td><td>'+_content.data.general.stats.nb_inf+'</td></tr></tbody></table>');
                    
					//Add an area to display the detailled stat of the pupil for each exercise
                    $('#s2').children('div.s2_page:last-child').append('<table class="s2_det_stats"><thead><tr><th colspan="3">Bilan personnel par exercice</th></tr><tr><th>&nbsp;</th><th>Votre Bilan</th><th>Moyenne Classe</th></tr></thead><tbody></tbody></table>');
                    //Browse all eercices of the devoir
                    $.each(_content.data.exercices, function(nume,exercice) {
                        //No note for fre text
						if(exercice.type!="free"){
							//If the exercice is compliant and stats are generated
							if(exercice.bareme && exercice.stats && exercice.stats.mean){
								//If the pupil is evaluated on this exercise
								if(_content.data.notes[pupil] && _content.data.notes[pupil].exercices && _content.data.notes[pupil].exercices[nume]){
									$('#s2').children('div.s2_page:last-child').children('table.s2_det_stats').children('tbody').append('<tr><td>'+exercice.title+'</td><td>'+_content.data.notes[pupil].exercices[nume].note+'/'+_content.data.notes[pupil].exercices[nume].max+'</td><td>'+exercice.stats.mean+'/'+exercice.bareme+'</td></tr>');
								}else{
									//If the pupil is not evaluated but if the user asks to display also unvalidated elements
									if(display_only_validated == false){
										$('#s2').children('div.s2_page:last-child').children('table.s2_det_stats').children('tbody').append('<tr><td>'+exercice.title+'</td><td>Non évalué</td><td>'+exercice.stats.mean+'/'+exercice.bareme+'</td></tr>');
									}
								}
							}
						}
                    });
					
					//Add an area to display the detailled stat of the pupil for each capacite
					$('#s2').children('div.s2_page:last-child').append('<table class="s2_competences"><thead><tr><th colspan="5">Bilan personnel de compétences</th></tr><tr><th>Compétence/Capacité</th><th>&nbsp;</th><th>Etat</th><th>Note</th><th>Moyenne Classe</th></tr></thead><tbody></tbody></table>');
					
					var pupil_competences = getPupilCompetence(pupil);
					var pupil_competences_text = "";
					$.each(pupil_competences.list, function(competence_id,competence_stat) {
						var competence = _content.grilles[_content.data.general.grille.id].competences[competence_id];
						pupil_competences_text += "<tr class='s2_competences_comp'><td colspan='2'>"+competence.titre+"</td><td>"+TEXTE_CAPACITE[competence_stat.state]+"</td><td>"+competence_stat.note+"/"+competence_stat.max+"</td><td>"+competence_stat.mean+"/"+competence_stat.max+"</td></tr>";
						
						if(print_capacites_bilan){
							$.each(competence_stat.capacites, function(capacite_id,capacite_stat) {
								var capacite = getCapacite(capacite_id);
								pupil_competences_text += "<tr class='s2_competences_cap'><td>"+capacite.id+"</td><td>"+capacite.texte+"</td><td>"+TEXTE_CAPACITE[capacite_stat.state]+"</td><td>"+capacite_stat.note+"/"+capacite_stat.max+"</td><td>"+capacite_stat.mean+"/"+capacite_stat.max+"</td></tr>";
							});
						}
					});
					$('#s2').children('div.s2_page:last-child').children('table.s2_competences').children('tbody').append(pupil_competences_text);

					
                    //Now that the global and detailled resume are included, we will now include the details for the devoir
					$.each(_content.data.exercices, function(nume,exercice) {
						//Print exercise only if not free text and only if a note has been given to the pupil
						if(exercice.type!="free"){
							if(_content.data.notes[pupil] && _content.data.notes[pupil].exercices && _content.data.notes[pupil].exercices[nume]){	
								$('#s2').children('div.s2_page:last-child').append('<div class="s2_exe"><span>'+exercice.title+'</span><span>'+_content.data.notes[pupil].exercices[nume].note+'/'+_content.data.notes[pupil].exercices[nume].max+' pts</span></div>');
							}else{
								if(display_only_validated == false){
									$('#s2').children('div.s2_page:last-child').append('<div class="s2_exe"><span>'+exercice.title+'</span><span>?/'+exercice.bareme+' pts</span></div>');
								}
							}
							$.each(exercice.questions, function(numq,question) {
								//Print question only if not free text and only if a note has been given to the pupil
								if(question.type!="free"){
									if(_content.data.notes[pupil] && _content.data.notes[pupil].exercices && _content.data.notes[pupil].exercices[nume] && _content.data.notes[pupil].exercices[nume].questions && _content.data.notes[pupil].exercices[nume].questions[numq]){
										$('#s2').children('div.s2_page:last-child').append('<div class="s2_que"><span>'+question.title+'</span><span>'+_content.data.notes[pupil].exercices[nume].questions[numq].note+'/'+_content.data.notes[pupil].exercices[nume].questions[numq].max+' pts</span></div>');
									}else{
										if(display_only_validated == false){
											$('#s2').children('div.s2_page:last-child').append('<div class="s2_que"><span>'+question.title+'</span><span>?/'+question.bareme+' pts</span></div>');
										}
									}
									$.each(question.criteres, function(numc,critere) {
										//Print criteria only if not free text and only if a note has been given to the pupil
										if(critere.type!="free"){
											if(_content.data.notes[pupil] && _content.data.notes[pupil].exercices && _content.data.notes[pupil].exercices[nume] && _content.data.notes[pupil].exercices[nume].questions && _content.data.notes[pupil].exercices[nume].questions[numq] && _content.data.notes[pupil].exercices[nume].questions[numq].criteres && _content.data.notes[pupil].exercices[nume].questions[numq].criteres[numc]){
												var critere_note = "0";
												if(_content.data.notes[pupil].exercices[nume].questions[numq].criteres[numc].state == "ok"){
													critere_note = critere.bareme;
												}
												if(_content.data.notes[pupil].exercices[nume].questions[numq].criteres[numc].state == "encours"){
													critere_note = critere.bareme * global_configurations["coeff_capacite_encours"];
												}
												$('#s2').children('div.s2_page:last-child').append('<div class="s2_cri"><span>'+critere.competence+'</span><span>'+critere.text+'</span><span>'+critere_note+'/'+critere.bareme+'</span></div>');
											}else{
												if(display_only_validated == false){
													$('#s2').children('div.s2_page:last-child').append('<div class="s2_cri"><span>'+critere.competence+'</span><span>'+critere.text+'</span><span>?/'+critere.bareme+'</span></div>');
												}
											}
										}
									});
								}
							});
						}
					});
                }
				$('#s2').append('<div class="s2_page_break" title="Insérer un saut de page ici" onclick="add_page_break(this)">&nbsp;</div>');
            });
        }
		
		//On recupere le contenu fabrique
		var document_content = $("#s2").html();
		//On ouvre une nouvelle fenêtre
		var w = window.open("print_notes.html");
		//On met le contenu fabriqué dans la nouvelle fenetre (on attend un peu pou êtrd sûr que tout le contenu fabriqué a bien été récupéré)
		setTimeout(function(){ $(w.document.body).html(document_content); }, 3000);

    }else{
        warning_message("Une classe doit d'abord être choisie pour continuer.")
    }
}

/* Function in charge of printing the resume of the devoir for all pupil
   => Document for the teacher including all notes, capacites and stats but not details */
function printDocumentBilan()
{
	//Hide and reinit the area that will temporarily contains the configuration of the document to print
	$('#s2').hide();
	$("#s2").html(
		"<fieldset><legend>Inclure les élèves et critères non évalués :</legend>\
	    <label for='print_notes_validated_yes'>Oui</label><input type='radio' name='print_notes_validated' id='print_notes_validated_yes' value='1'>\
		<label for='print_notes_validated_no'>Non</label><input checked type='radio' name='print_notes_validated' id='print_notes_validated_no' value='0'>\
		</fieldset>\
		<fieldset><legend>Afficher les notes réelles :</legend>\
	    <label for='print_notes_reel_yes'>Oui</label><input checked type='radio' name='print_notes_reel' id='print_notes_reel_yes' value='1'>\
		<label for='print_notes_reel_no'>Non</label><input type='radio' name='print_notes_reel' id='print_notes_reel_no' value='0'>\
		</fieldset>\
		<fieldset><legend>Afficher les notes bulletin :</legend>\
	    <label for='print_notes_bulletin_yes'>Oui</label><input checked type='radio' name='print_notes_bulletin' id='print_notes_bulletin_yes' value='1'>\
		<label for='print_notes_bulletin_no'>Non</label><input type='radio' name='print_notes_bulletin' id='print_notes_bulletin_no' value='0'>\
		</fieldset>\
		<fieldset><legend>Exporter les capacités dans le bilan :</legend>\
	    <label for='print_capacites_bilan_yes'>Oui</label><input checked type='radio' name='print_capacites_bilan' id='print_capacites_bilan_yes' value='1'>\
		<label for='print_capacites_bilan_no'>Non</label><input type='radio' name='print_capacites_bilan' id='print_capacites_bilan_no' value='0'>\
		</fieldset>");
	
	$( "#s2 input" ).checkboxradio({
		icon: false
    });
	
	$("#s2").dialog({
		autoOpen: false,
		modal: true,
		width:"400px",
		closeText: "Annuler",
		title: "Génération du bilan de la classe",
		buttons: {
				Générer: function() {
					//Get the full configuration desired by the user
					var display_only_validated = true;
					var display_notes_reel = false;
					var display_notes_bulletin = false;
					var print_capacites_bilan = false;
					if (parseInt($('input[name=print_notes_validated]:checked').val()) == 1){
						display_only_validated = false;
					};
					if (parseInt($('input[name=print_notes_reel]:checked').val()) == 1){
						display_notes_reel = true;
					};
					if (parseInt($('input[name=print_notes_bulletin]:checked').val()) == 1){
						display_notes_bulletin = true;
					};
					if (parseInt($('input[name=print_capacites_bilan]:checked').val()) == 1){
						print_capacites_bilan = true;
					};
					//Close the export configuration window
					$("#s2").dialog( "close" );
					//Execute the fonction in charge of exporting the document
					printDocumentBilanCb(display_only_validated, display_notes_reel,display_notes_bulletin,print_capacites_bilan);
					
				}
			},
		close: function() {
			$("#s2").html("");
			$("#s2").dialog( "close" );
		}
	});
	$("#s2").dialog( "open" );	
}
/* Function in charge of printing the resume of the devoir for all pupil
   @input display_only_validated : a boolean indicating if the export includes also unvalided items
   @input display_notes_reel : a boolean indicating if the export includes the real note of each pupil
   @input display_notes_bulletin : a boolean indicating if the export includes the bulletin note of each pupil
*/
function printDocumentBilanCb(display_only_validated, display_notes_reel,display_notes_bulletin,print_capacites_bilan)
{
	//If no classe is defined then nothing to export
    if(_content.data.general.classe != null)
    {
		//Hide and reinit the area that will temporily contain the document to print
		$('#s2').hide();
		$('#s2').html("");
		//Get the class and all pupils inside it
		var classe = "_"+_content.data.general.classe;
		var pupils = _content.classes[classe];
		//If there are pupils in that class
		if(pupils != null){

			//Put a header with title and date
			$('#s2').append('<div class="s2_page"></div>');
			$('#s2').children('div.s2_page:last-child').append('<div class="s2_title"><span>'+_content.data.general.titre+'</span><span>'+_content.data.general.date.getDate()+'/'+(_content.data.general.date.getMonth()+1)+'/'+_content.data.general.date.getFullYear()+'</span></div>');
			//Add an area to display the global stats on this devoir
			$('#s2').children('div.s2_page:last-child').append('<table class="s2_gen_stats"><thead><tr><th colspan="4">Bilan général de la classe</th></tr><tr><th>Moyenne</th><th>Minimum</th><th>Maximum</th><th>Inférieur Moyenne</th></tr></thead><tbody><tr><td>'+_content.data.general.stats.mean+'</td><td>'+_content.data.general.stats.min+'</td><td>'+_content.data.general.stats.max+'</td><td>'+_content.data.general.stats.nb_inf+'</td></tr></tbody></table>');
			
			//Compute array header according to export configuration
			var note_display_txt = "";
			if(display_notes_reel){
				note_display_txt = '<th>Note réelle</th>';
			}
			if(display_notes_bulletin){
				note_display_txt += '<th>Note Bulletin</th>';
			}
			//Add an area to display the note of every pupils
			$('#s2').children('div.s2_page:last-child').append('<table class="s2_bilan"><thead><tr><th colspan="5">Bilan des notes</th></tr><tr><th>Elève</th>'+note_display_txt+'<th>Classement</th><th>Commentaire</th></tr></thead><tbody></tbody></table>');
			$.each(pupils, function(num,pupil) {
				if(_content.data.notes[pupil]){
					
					//Generate the notes to display according to configuration
					pupil_note_finale = computeNoteFinal(_content.data.notes[pupil].note, _content.data.notes[pupil].max, _content.data.general.note_arrondi,_content.data.general.note_final_mode, _content.data.general.note_final_cible);		
					note_display_txt = "";
					if(display_notes_reel){
						note_display_txt = '<td>'+_content.data.notes[pupil].note+'/'+_content.data.notes[pupil].max+'</td>';
					}
					if(display_notes_bulletin){
						note_display_txt += '<td>'+pupil_note_finale.note+'/'+pupil_note_finale.max+'</td>';
					}
					//Export the row for the pupil
					$('#s2').children('div.s2_page:last-child').children('table.s2_bilan').children('tbody').append('<tr><td>'+pupil+'</td>'+note_display_txt+'<td>'+computeNoteRank(pupil)+'</td><td>'+_content.data.notes[pupil].commentaire+'</td></tr>');
				}else{
					if (display_only_validated == false){
						var colspan = 1;
						if(display_notes_reel){colspan++;}
						if(display_notes_bulletin){colspan++;}
						$('#s2').children('div.s2_page:last-child').children('table.s2_bilan').children('tbody').append('<tr><td>'+pupil+'</td><td colspan="'+colspan+'">Non évalué</td></tr>');
					}
				}
			});
			
			//Add an area to display the detailled stat of each capacite
			$('#s2').children('div.s2_page:last-child').append('<table class="s2_competences"><thead><tr><th colspan="6">Bilan des compétences</th></tr><tr><th>Capacité</th><th>&nbsp;</th><th>Acquis</th><th>En cours</th><th>Non acquis</th><th>Moyenne</th></tr></thead><tbody></tbody></table>');
			
			var capacites_bareme = computeCompetencesStats();
			$.each(_content.grilles[_content.data.general.grille.id].competences, function(competence_id,competence) {
				var competence_stat = {"nb":0, "max":0, "encours":0, "encours100":0, "acquis":0, "acquis100":0,"nonacquis":0,"nonacquis100":0, "moyenne":0, "moyenne100":0}
				var competence_txt = "";
				$.each(competence.capacites, function(capacite_id,capacite_texte) {
					if(capacites_bareme[capacite_id]){
						if(capacites_bareme[capacite_id].notes.length > 0){
							var capacite = getCapacite(capacite_id);
							competence_stat["nb"]++;
							competence_stat["max"] += capacites_bareme[capacite_id].max;
							competence_stat["encours"] += capacites_bareme[capacite_id].stats["encours"];
							competence_stat["encours100"] += capacites_bareme[capacite_id].stats["encours100"];
							competence_stat["acquis"] += capacites_bareme[capacite_id].stats["acquis"];
							competence_stat["acquis100"] += capacites_bareme[capacite_id].stats["acquis100"];
							competence_stat["nonacquis"] += capacites_bareme[capacite_id].stats["nonacquis"];
							competence_stat["nonacquis100"] += capacites_bareme[capacite_id].stats["nonacquis100"];
							competence_stat["moyenne"] += capacites_bareme[capacite_id].stats["moyenne"];
							competence_stat["moyenne100"] += capacites_bareme[capacite_id].stats["moyenne100"];
							competence_txt += "<tr class='s2_competences_cap'><td style='color:"+capacite.competence.couleur+"'>"+capacite.id+"</td><td>"+capacite.texte+"</td><td>"+capacites_bareme[capacite_id].stats["acquis"]+"<div>"+capacites_bareme[capacite_id].stats["acquis100"]+"%</div></td><td>"+capacites_bareme[capacite_id].stats["encours"]+"<div>"+capacites_bareme[capacite_id].stats["encours100"]+"%</div></td><td>"+capacites_bareme[capacite_id].stats["nonacquis"]+"<div>"+capacites_bareme[capacite_id].stats["nonacquis100"]+"%</div></td><td>"+capacites_bareme[capacite_id].stats["moyenne"]+"/"+capacites_bareme[capacite_id].max+" pts<div>"+capacites_bareme[capacite_id].stats["moyenne100"]+"%ACQ</div></td></tr>";
						}
					}
				});
				
				if(competence_stat["nb"] > 0){
					
					competence_stat["encours100"] =  Math.round(competence_stat["encours100"] / competence_stat["nb"]);
					competence_stat["acquis100"] =  Math.round(competence_stat["acquis100"] / competence_stat["nb"]);
					competence_stat["nonacquis100"] =  Math.round(competence_stat["nonacquis100"] / competence_stat["nb"]);
					competence_stat["moyenne"] =  Number((competence_stat["moyenne"]).toFixed(2));
					competence_stat["moyenne100"] =  Math.round(competence_stat["moyenne100"] / competence_stat["nb"]);
				
					$(".s2_competences tbody").append("<tr class='s2_competences_comp'><td colspan='2' style='color:"+competence.couleur+"'>"+competence.titre+"</td><td>"+competence_stat["acquis"]+"<div>"+competence_stat["acquis100"]+"%</div></td><td>"+competence_stat["encours"]+"<div>"+competence_stat["encours100"]+"%</div></td><td>"+competence_stat["nonacquis"]+"<div>"+competence_stat["nonacquis100"]+"%</div></td><td>"+competence_stat["moyenne"]+"/"+competence_stat["max"]+" pts<div>"+competence_stat["moyenne100"]+"%ACQ</div></td></tr>");
					if(print_capacites_bilan){
						$(".s2_competences tbody").append(competence_txt);
					}
				}
			});
			
			//On recupere le contenu fabrique
			var document_content = $("#s2").html();
			//On ouvre une nouvelle fenêtre
			var w = window.open("print_bilan.html");
			//On met le contenu fabriqué dans la nouvelle fenetre (on attend un peu pou êtrd sûr que tout le contenu fabriqué a bien été récupéré)
			setTimeout(function(){ $(w.document.body).html(document_content); }, 3000);
		}
	}else{
		warning_message("Une classe doit d'abord être choisie pour continuer.")
	}
}

/* Function in charge of converting a Canvas into an image. This is necessary for exporting curves */
function getImageFromCanvas(current_canvas)
{
	var image_from_canvas = new Image();
	image_from_canvas.id = "pic"
	image_from_canvas.src = document.getElementById(current_canvas).toDataURL();
	return image_from_canvas;
}

function printSuiviGlobal()
{
	$('#s2').hide();
    $('#s2').html("");
    
	$('#s2').append('<div class="s2_page"></div>');
	$("#s2 > div.s2_page:last-child").append("<h2><span>"+_content.data.general.titre+"</span><span>"+_content.data.general.classe+"</span></h2>");
	$( "#s5_global" ).clone().appendTo("#s2 > div.s2_page:last-child");
	
	$('#s2').append('<div class="s2_page"></div>');
	$("#s2 > div.s2_page:last-child").append("<h2><span>"+_content.data.general.titre+"</span><span>"+_content.data.general.classe+"</span></h2>");
	$( "#s5_pupil" ).clone().appendTo("#s2 > div.s2_page:last-child");
	
	$("#s5_stat_evol_notes").show();
	updateStatSuivi("s5_stat_evol_notes");
	$('#s2').append('<div class="s2_page s5_stat"></div>');
	$("#s2 > div.s2_page:last-child").append("<h2><span>"+_content.data.general.titre+"</span><span>"+_content.data.general.classe+"</span></h2>");
	$("#s5_stat_evol_notes").prev().clone().appendTo("#s2 > div.s2_page:last-child");
	$("#s5_stat_evol_notes").clone().show().css("height","auto").appendTo("#s2 > div.s2_page:last-child");
	$("#s2 > div.s2_page:last-child canvas").replaceWith(getImageFromCanvas("s5_stat_evol_notes_graph"));
	$("#s5_stat_evol_notes").hide();
	
	$("#s5_stat_rep_notes").show();
	updateStatSuivi("s5_stat_rep_notes");
	$('#s2').append('<div class="s2_page s5_stat"></div>');
	$("#s2 > div.s2_page:last-child").append("<h2><span>"+_content.data.general.titre+"</span><span>"+_content.data.general.classe+"</span></h2>");
	$("#s5_stat_rep_notes").prev().clone().appendTo("#s2 > div.s2_page:last-child");
	$("#s5_stat_rep_notes").clone().show().css("height","auto").appendTo("#s2 > div.s2_page:last-child");
	$("#s2 > div.s2_page:last-child canvas").replaceWith(getImageFromCanvas("s5_stat_evol_notes_graph"));
	$("#s5_stat_rep_notes").hide();

	$("#s5_stat_evol_comp").show();
	updateStatSuivi("s5_stat_evol_comp");
	$('#s2').append('<div class="s2_page s5_stat"></div>');
	$("#s2 > div.s2_page:last-child").append("<h2><span>"+_content.data.general.titre+"</span><span>"+_content.data.general.classe+"</span></h2>");
	$("#s5_stat_evol_comp").prev().clone().appendTo("#s2 > div.s2_page:last-child");
	$("#s5_stat_evol_comp").clone().show().css("height","auto").appendTo("#s2 > div.s2_page:last-child");
	$("#s2 > div.s2_page:last-child canvas").replaceWith(getImageFromCanvas("s5_stat_evol_comp_graph"));
	$("#s5_stat_evol_comp").hide();
	
	$("#s5_stat_bilan_capa").show();
	updateStatSuivi("s5_stat_bilan_capa");
	$('#s2').append('<div class="s2_page s5_stat"></div>');
	$("#s2 > div.s2_page:last-child").append("<h2><span>"+_content.data.general.titre+"</span><span>"+_content.data.general.classe+"</span></h2>");
	$("#s5_stat_bilan_capa").prev().clone().appendTo("#s2 > div.s2_page:last-child");
	$("#s5_stat_bilan_capa").clone().show().css("height","auto").appendTo("#s2 > div.s2_page:last-child");
	$("#s2 > div.s2_page:last-child canvas").replaceWith(getImageFromCanvas("s5_stat_bilan_capa_graph"));
	$("#s5_stat_bilan_capa").hide();
	
	$('#s2 tr.tablesorter-filter-row').remove();
	$('#s2 table.tablesorter').addClass("tablesorter-default");
	$('#s2 table.tablesorter tr.odd').removeClass("odd");
	$('#s2 table.tablesorter tr.even').removeClass("even");
	
	//On recupere le contenu fabrique
	var document_content = $("#s2").html();
	//On ouvre une nouvelle fenêtre
	var w = window.open("print_suivi_global.html");
	//On met le contenu fabriqué dans la nouvelle fenetre (on attend un peu pou être sûr que tout le contenu fabriqué a bien été récupéré)
	setTimeout(function(){ $(w.document.body).html(document_content); }, 3000);
}
function printSuiviPupils()
{
	$('#s2').hide();
    $('#s2').html("");
    
	$( "#s5_global" ).clone().appendTo("#s2 > div.s2_page:last-child");
	
	var pupils = _content.classes["_"+_content.data.general.classe];
	$.each(pupils, function(num,pupil) {
		$('#s2').append('<div class="s2_page"></div>');
		$("#s2 > div.s2_page:last-child").append("<h2><span>"+_content.data.general.titre+"</span><span>"+_content.data.general.classe+"</span></h2>");
		$("#s2 > div.s2_page:last-child").append("<h3>"+pupil+"</h3>");
		
		openSuiviPupilDetails(pupil, false);
		
		$("#s5_pupil_details").clone().removeAttr("id").addClass("s5_pupil_details").appendTo("#s2 > div.s2_page:last-child");
		$("#s2 > div.s2_page:last-child canvas#s5_det_pup_graph_evol_notes").replaceWith(getImageFromCanvas("s5_det_pup_graph_evol_notes"));
		$("#s2 > div.s2_page:last-child canvas#s5_det_pup_graph_evol_comp").replaceWith(getImageFromCanvas("s5_det_pup_graph_evol_comp"));
		$("#s2 > div.s2_page:last-child canvas#s5_det_pup_graph_cap").replaceWith(getImageFromCanvas("s5_det_pup_graph_cap"));
	
	
	});
	
	$('#s2 tr.tablesorter-filter-row').remove();
	$('#s2 table.tablesorter').addClass("tablesorter-default");
	$('#s2 table.tablesorter tr.odd').removeClass("odd");
	$('#s2 table.tablesorter tr.even').removeClass("even");
	
	//On recupere le contenu fabrique
	var document_content = $("#s2").html();
	//On ouvre une nouvelle fenêtre
	var w = window.open("print_suivi_global.html");
	//On met le contenu fabriqué dans la nouvelle fenetre (on attend un peu pou être sûr que tout le contenu fabriqué a bien été récupéré)
	setTimeout(function(){ $(w.document.body).html(document_content); }, 3000);
}