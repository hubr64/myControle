var _filteredContent = null;
var _importFileName = "";

/* Function in charge of creating a new suivi from scratch */
function openNewSuivi()
{	
	//First check if a document is not already currently in edition and warn user in this case
	if(_docIsEdited){
		if(confirm("Un fichier est en cours d'édition. Êtes-vous sûr de vouloir créer un nouveau suivi ?")){
			//Hide menu and continue procedure
			toggleMenu();
			openNewSuiviCb(true);
		}
	}else{
		//Hide menu and continue procedure
		toggleMenu();
		openNewSuiviCb(true);
	}
}
/* Function in charge of creating a new suivi from scratch 
   @input init_default: if true indicates that the MMI to configure suivi for the first time must be displayed
*/
function openNewSuiviCb(init_default)
{
	//Go in mode suivi (different from mode edition)
	_modeSuivi = true;
	//Hide elements of mode edition and display element of mode suivi
	toggleModeSuivi();
	//Load now all necessary information
	initContent();
	loadMetaData();
	//If this is the first time a suivi is created then display the dialog for suivi creation
	if(init_default == true){
		initDefaultDataSuivi();
	}
	loadDefaultDataSuivi();
}
/* Function in charge of siaplying in dialog used to configure a suivi for the first time */
function initDefaultDataSuivi()
{
	//Stop of suivi configuration
	var suivi_init_step = 0;
	//Class to use for the suivi
	var suivi_init_classe = null;
	//Grille to use for the suivi
	var suivi_init_grille = {id:null,titre:null};
	//Title to use for the suivi
	var suivi_init_titre = null;
	$("#s2").html("<div id='s2_suivi_init'><div>Vous allez créer un nouveau suivi annuel de classe.</div><div>Les informations saisies ici ne seront plus modifiables.</div><div>Voulez-vous continuer ?</div></div>");
	
	$("#s2").dialog({
		autoOpen: false,
		modal: true,
		closeText: "Annuler",
		title: "Création d'un suivi de classe",
		width:"50%",
		buttons: [
					{
						id:"s2_init_next",
						text:"Continuer",
						click: function() {
							suivi_init_step++;
							if(suivi_init_step == 1){
								$("#s2 > div").html("<div>Veuillez choisir une classe :</div><select></select>");
								$.each(global_configurations["classes"], function(classe_name,classe) {
									$("#s2 > div > select").append('<option>'+classe_name.substring(1)+'</option>');
								});
							}
							if(suivi_init_step == 2){
								suivi_init_classe = $("#s2 > div > select > option:selected").text();
								$("#s2 > div").html("<div><b>Classe</b> : "+suivi_init_classe+"</div><div>Veuillez choisir une grille de compétences :</div><select></select>");
								$.each(_grilles, function(grille_id,grille) {
									$("#s2 > div > select").append('<option value='+grille_id+'>'+grille.titre+'</option>');
								});
							}
							if(suivi_init_step == 3){
								suivi_init_grille.id = $("#s2 > div > select > option:selected").val();
								suivi_init_grille.titre = $("#s2 > div > select > option:selected").text();
								
								var now_date = new Date();
								$("#s2 > div").html("<div><div><b>Classe</b> : "+suivi_init_classe+"</div><div><b>Grille</b> : "+suivi_init_grille.titre+"</div></div><div>Veuillez choisir un titre pour le suivi :</div><input type='text' value='Suivi Physique/Chimie "+now_date.getFullYear()+"'/>");
								$("#s2 > div > input").select();
							}
							if(suivi_init_step == 4){
								suivi_init_titre = $("#s2 > div > input").val();
								$("#s2 > div").html("<div><div><b>Classe</b> : "+suivi_init_classe+"</div><div><b>Grille</b> : "+suivi_init_grille.titre+"</div><div><b>Titre</b> : "+suivi_init_titre+"</div></div>");
								$('#s2_init_next span').text('Terminer');
							}
							if(suivi_init_step == 5){
								$("#s2").dialog( "close" );
								
								_content.data.general.titre = suivi_init_titre;
								_content.data.general.classe = suivi_init_classe;
								_content.classes["_"+_content.data.general.classe] = global_configurations["classes"]["_"+_content.data.general.classe];
								_content.data.general.grille = {id:suivi_init_grille.id, titre:suivi_init_grille.titre, capacites:{}};
								_content.grilles[_content.data.general.grille.id] = _grilles[_content.data.general.grille.id];
								
								loadDefaultDataSuivi();
								
								//Memorize that document is modified
								toggleDocumentEdition(true);
								
							}
						}
					},
					{
						id:"s2_init_cancel",
						text:"Annuler",
						click: function() {
							$("#s2").html("");
							$("#s2").dialog( "close" );
							openNewDocumentCb();
						}
					}
				],
		close: function() {
			$("#s2").html("");
			$("#s2").dialog( "close" );
		}
	});
	$("#s2").dialog( "open" );
}
/* Function in charge of loading all default data for the suivi (title, classe, pupils, stats, grille) */
function loadDefaultDataSuivi()
{
	var local_content = _content;
	if(_filteredContent){
		local_content = _filteredContent
	}
	
	$('#s5_gen_title > span:nth-child(2)').html(local_content.data.general.titre);
	$('#s5_gen_classe > span:nth-child(2)').html(local_content.data.general.classe);
	var pupils = local_content.classes["_"+local_content.data.general.classe];
	if(pupils){
		$("#s5_gen_classe > span:nth-child(2)").attr("title",pupils.length+" élèves :\n"+pupils.join("\n"));	
	}
	
	$("#s5_gen_nb > span:last-child").html(local_content.data.general.stats.nb);
	$("#s5_gen_mean > span:last-child").html(local_content.data.general.stats.mean);
	$("#s5_gen_min > span:last-child").html(local_content.data.general.stats.min);
	$("#s5_gen_max > span:last-child").html(local_content.data.general.stats.max);
	
	$('#s5_gen_competence > span:nth-child(2)').html(local_content.data.general.grille.titre);
	if(local_content.data.general.grille && local_content.data.general.grille.id){
		buildCompetencesMenu();
	}
	
	//Collapse accordion to refresh the graphs
	$("#s5_stat").accordion( "option", "active", false );
	
	updateProgressBar(34,true);
	_semaphore.default_data_load = true;
}
/* Function in charge of opening an existing document suivi for edition */
function openEditSuivi()
{
	//First check if a document is not already currently in edition and warn user in this case
	if(_docIsEdited){
		if(confirm("Un fichier est en cours d'édition. Êtes-vous sûr de vouloir ouvrir un suivi existant ?")){
			//Continue to next step
			openEditSuiviCb();
		}
	}else{
		//Continue to next step
		openEditSuiviCb();
	}
}
/* Function in charge of opening an existing document suivi for edition */
function openEditSuiviCb()
{
	//The openning for edition is at the beginning similar that the creation instead that you do not display the configuration dialog
	openNewSuiviCb(false);
	//Add an event that will be called automatically to simplify the operation of the user
	document.getElementById('head_edit_file').addEventListener('change', openSuiviFile, false);
	var elem = document.getElementById("head_edit_file");
	if(elem && document.createEvent) {
		var evt = document.createEvent("MouseEvents");
		evt.initEvent("click", true, false);
		elem.dispatchEvent(evt);
	}
}
//Function aclled automatically to open a file that contains a suivi */
function openSuiviFile(evt)
{
	showProgressBar();
	var files = evt.target.files;
	for (var i = 0, f; f = files[i]; i++) {
		var reader = new FileReader();
		reader.onerror = function(e) {
			hideProgressBar();
			_currentFileName = "";
			switch(e.target.error.code) {
				case e.target.error.NOT_FOUND_ERR:
					error_message('Impossible de trouver le fichier demandé.');
					break;
				case e.target.error.NOT_READABLE_ERR:
					error_message('Impossible de lire le fichier demandé.');
					break;
				case e.target.error.ABORT_ERR:
					break; // noop
				default:
					error_message('Une erreur inattendue a été levée pendant la lecture du fichier.');
			};
		};
		//File in reading this is not finisehd
		reader.onprogress = function(e) {
			if (e.lengthComputable) {
				var percentLoaded = Math.round((e.loaded / e.total) * 100);
				updateProgressBar(percentLoaded,false);
			}
		};
		//User cancels loading of file
		reader.onabort = function(e) {
			hideProgressBar();
			warning_message('Abandon de l\'ouverture du fichier à votre demande.');
			_currentFileName = "";
		};
		//File starts to open
		reader.onloadstart = function(e) {
			updateProgressBar(0,false);
		};
		//FIle is now fully loaded
		reader.onload = function(e) {
			loadSuiviFile(e.target.result);
		};
		_currentFileName = f.name;
		reader.readAsText(f);
	}
	//Remove the event otherwise the function will be called twice at the next time
	document.getElementById('head_edit_file').removeEventListener('change', openSuiviFile);
}
/* Function in charge of convertinf suivi file into file content and set it into _content
   @input file_content: the file content
*/
function loadSuiviFile(file_content)
{
	//First try all possible errors that may appaers when openning the content (bas encoding, wrong chars, ...)
	var tmp_content;
	try{
		//Convert string into Json
		tmp_content = jQuery.parseJSON(file_content);
	}catch(err) {

	}
	setTimeout("hideProgressBar()",500);
	
	//FIle does not contains JSOn so this is not for us
	if(tmp_content == null){
		error_message("Le contenu du fichier n'est pas conforme.");
	}else{
		
		if(tmp_content.data.devoirs){
			
			//Content is compliant then transfer it in the globa var _content
			_content = tmp_content
			_content.meta.date_save = new Date(_content.meta.date_save);
			//First migrate
			migrateSuivi();
			//Load meta data
			loadMetaData();
			//Load general data
			loadDefaultDataSuivi();
			//Update the global suivi
			updateSuiviGlobal();
			//Update the pupil suivi
			updateSuiviPupil();
			//Hide menu
			toggleMenu();
			//Memorize that document is not modified (just be opened)
			toggleDocumentEdition(false);
			//Display info on saved documents
			setDocumentSaveInfo();
		//FIle is correct JSON nut is not correclty built so its's snomething else (devoir or other...)
		}else{
			error_message("Le fichier est valide mais ne correspond pas à un suivi annuel.");
		}
	}
}
/* Function called when the user imports a new devoir in the suivi */
function importSuivi()
{
	//Reinit globa var
	_importFileName = "";
	//Automatically open the browse file selector
	document.getElementById('head_edit_file').addEventListener('change', importSuiviFile, false);
	var elem = document.getElementById("head_edit_file");
	if(elem && document.createEvent) {
		var evt = document.createEvent("MouseEvents");
		evt.initEvent("click", true, false);
		elem.dispatchEvent(evt);
	}
}
/* Function called when the user has choosed a file in the file selector */
function importSuiviFile(evt) {

	var files = evt.target.files;
	for (var i = 0, f; f = files[i]; i++) {
		var reader = new FileReader();
		reader.onerror = function(e) {
			switch(e.target.error.code) {
				case e.target.error.NOT_FOUND_ERR:
					error_message('Impossible de trouver le fichier demandé. L\'importation a échoué !');
					break;
				case e.target.error.NOT_READABLE_ERR:
					error_message('Impossible de lire le fichier demandé. L\'importation a échoué !');
					break;
				case e.target.error.ABORT_ERR:
					break; // noop
				default:
					error_message('Une erreur inattendue a été levée pendant la lecture du fichier. L\'importation a échoué !');
			};
		};
		reader.onabort = function(e) {
			warning_message('Abandon de l\'importation du fichier à votre demande.');
		};
		reader.onload = function(e) {
			importSuiviFileCb(e.target.result);
		};
		_importFileName = f.name;
		reader.readAsText(f);
	}
	document.getElementById('head_edit_file').removeEventListener('change', importSuiviFile);
}
/* Function called when the file choosen in the file selector has finished to be loaded */
function importSuiviFileCb(file_content)
{
	//First try all possible errors that may appaers when openning the content (bas encoding, wrong chars, ...)
	var tmp_content;
	try{
		//Convert string into Json
		tmp_content = jQuery.parseJSON(file_content);
	}catch(err) {

	}
	//FIle does not contains JSOn so this is not for us
	if(tmp_content == null){
		error_message("Le contenu du fichier à importer n'est pas conforme. L'importation a échoué !");
	}else{
		//Content is compliant then continue to import
		if(tmp_content.data.exercices){
			//Check if the classe of the devoir is the class of the suivi (should be the same or it has no sense)
			if(tmp_content.data.general.classe!=_content.data.general.classe){
				error_message("La classe du devoir ne correspond pas à celle du suivi.<br\>L'importation ne peut pas se poursuivre !");
			}else{
				//If a grid is defined in the devoir and if the grid is the one of the suivi  (should be the same or it has no sense)
				if(tmp_content.data.general.grille){
					if(tmp_content.data.general.grille.id!=_content.data.general.grille.id){
						error_message("La grille de compétences du devoir ne correspond pas à celle du suivi.<br\>L'importation ne peut pas se poursuivre !");
					}else{
						if(tmp_content.meta.version < 0.6){
							error_message("La version du fichier du devoir n'est pas compatible de la version actuelle du logiciel.<br\>L'importation ne peut pas se poursuivre !<br\><br\>Veuillez ouvrir d'abord le devoir, le convertir dans la version actuelle puis essayer de nouveau une importation.");
						}else{
							//On transform la date string en vrai date javascript
							tmp_content.meta.date_save = new Date(tmp_content.meta.date_save);
							//Compute all stats of competences for this content
							var capacites_bareme = computeCompetencesStats(tmp_content);
							//Keep only import and needed information od the suivi (remove the devoir edition content for instance) and stats
							var tmp_devoir = {
								meta: tmp_content.meta,
								general: tmp_content.data.general,
								capacites: capacites_bareme,
								notes:{},
							}
							tmp_devoir.meta.file_name = _importFileName;
							tmp_devoir.general.date = new Date(tmp_devoir.general.date);
							//Now browse all notes stored in the devoir 
							$.each(tmp_content.data.notes, function(pupil_name,pupil) {

								//THe maximal note of the pupil is not necessarily the max bareme as some parts of the devoir may be optionnal
								var max_note = tmp_devoir.general.bareme;
								if(pupil.max){
									max_note = pupil.max;
								}
								//Keep in memory the pupil note, the comment, the max note possibile and initialize an object for capcities
								tmp_devoir.notes[pupil_name] = {
									note: pupil.note,
									max: max_note,
									commentaire: pupil.commentaire,
									capacites: {},
								}
								//Compute all capacities acquisition for each pupil with a note
								var capacites_eleve = {};
								$.each(tmp_content.data.general.grille.capacites, function(capacite_id,capacite_num) {
									tmp_devoir.notes[pupil_name].capacites[capacite_id] = null;
								});
								//Browse the content of the devoir to memorize notes of the pupil for each capacites
								$.each(tmp_content.data.exercices, function(nume,exercice) {
									if(exercice.type!="free" && pupil.exercices && pupil.exercices[nume]){
										$.each(exercice.questions, function(numq,question) {
											if(question.type!="free" && pupil.exercices[nume]["questions"] && pupil.exercices[nume]["questions"][numq]){
												$.each(question.criteres, function(numc,critere) {
													if(critere.type!="free" && pupil.exercices[nume]["questions"][numq]["criteres"] && pupil.exercices[nume]["questions"][numq]["criteres"][numc]){
														//If the capacite was never used then initialised it
														if(tmp_devoir.notes[pupil_name].capacites[tmp_content.data.exercices[nume]["questions"][numq]["criteres"][numc].competence] == null){
															tmp_devoir.notes[pupil_name].capacites[tmp_content.data.exercices[nume]["questions"][numq]["criteres"][numc].competence] = 0;
														}
														if(pupil.exercices[nume]["questions"][numq]["criteres"][numc].state == "ok"){
															tmp_devoir.notes[pupil_name].capacites[tmp_content.data.exercices[nume]["questions"][numq]["criteres"][numc].competence] += tmp_content.data.exercices[nume]["questions"][numq]["criteres"][numc].bareme;
														}
														if(pupil.exercices[nume]["questions"][numq]["criteres"][numc].state == "encours"){
															tmp_devoir.notes[pupil_name].capacites[tmp_content.data.exercices[nume]["questions"][numq]["criteres"][numc].competence] += tmp_content.data.exercices[nume]["questions"][numq]["criteres"][numc].bareme * global_configurations["coeff_capacite_encours"];
														}
													}
												});
											}
										});
									}
								});
							});
							
							//hide menu
							toggleMenu();
							
							//Hide and reinit the area that will temporarily contains the configuration of the document to import
							$('#s2').hide();
							$("#s2").append("<fieldset><legend>Devoir à importer :</legend><div><span>Titre : </span><span>"+tmp_devoir.general.titre+"</span></div><div><span>Date : </span><span>"+tmp_devoir.general.date.toLocaleDateString()+"</span></div></fieldset>");
							$("#s2").append("<fieldset><legend>Type d'importation :</legend><label for='import_note_type_normalise'>Normalisé</label><input checked type='radio' name='import_note_type' id='import_note_type_normalise' value='1'><label for='import_note_type_bulletin'>Bulletin</label><input type='radio' name='import_note_type' id='import_note_type_bulletin' value='2'><label for='import_note_type_reel'>Réel</label><input type='radio' name='import_note_type' id='import_note_type_reel' value='3'></fieldset>");
							$("#s2").append("<fieldset><legend>Coefficient :</legend><input type='text' value='1' id='import_coefficient'/></fieldset>");
							
							$( "#s2 input[type=radio]" ).checkboxradio({
							  icon: false
							});
							
							$("#s2").dialog({
								autoOpen: false,
								modal: true,
								width:"400px",
								closeText: "Annuler",
								title: "Importation d'un devoir",
								buttons: {
										Importer: function() {
											//Get the full configuration desired by the user
											var import_note_normalise = false;
											var import_note_bulletin = false;
											var import_coefficient = 1;
											if (parseInt($('input[name=import_note_type]:checked').val()) == 1){
												import_note_normalise = true;
											};
											if (parseInt($('input[name=import_note_type]:checked').val()) == 2){
												import_note_bulletin = true;
											};
											import_coefficient = parseFloat($('input#import_coefficient').val());
											//Close the export configuration window
											$("#s2").dialog( "close" );
											//Now proceed to final importation
											importSuiviFileCb2(tmp_devoir,import_note_normalise,import_note_bulletin,import_coefficient);
										}
									},
								close: function() {
									$("#s2").html("");
									$("#s2").dialog( "close" );
								}
							});
							$("#s2").dialog( "open" );
						}
					}
				}else{
					error_message("Le devoir ne contient aucune grille de compétence. L'importation ne peut pas se poursuivre !");
				}
			}
		//File is correct JSON but is not correclty built so its's snomething else (suivi or other...)	
		}else{
			error_message("Le fichier est valide mais ne correspond pas à un devoir. L'importation a échoué !");
		}
	}
}
function importSuiviFileCb2(tmp_devoir,import_note_normalise,import_note_bulletin,import_coefficient)
{
	//If user wants to import the standardised notes (proportionnel sur 20 arrondi à 0.5)
	if(import_note_normalise){
		tmp_devoir.general.note_arrondi = 0.5;
		tmp_devoir.general.note_final_mode = 3;
		tmp_devoir.general.note_final_cible = 20;
	}
	//If user wants to import the corrected notes of the normalized notes
	if(import_note_bulletin || import_note_normalise){
		
		//Adapt the global bareme
		tmp_devoir.general.bareme = tmp_devoir.general.note_final_cible;
		
		//Adapt the notes of all pupils
		$.each(tmp_devoir.notes, function(pupil_name,pupil_notes) {
			pupil_notes_bulletin = computeNoteFinal(tmp_devoir.notes[pupil_name].note, tmp_devoir.notes[pupil_name].max, tmp_devoir.general.note_arrondi,tmp_devoir.general.note_final_mode, tmp_devoir.general.note_final_cible);
			
			tmp_devoir.notes[pupil_name].note = pupil_notes_bulletin.note;
			tmp_devoir.notes[pupil_name].max = pupil_notes_bulletin.max;
		});
		//Adapt the stats
		tmp_devoir.general.stats = {mean: 0, min: 200, max: 0, nb_inf: 0};
		//Browse all pupils with notes (pupils without notes are not taking into account, pupils with at least one note are taken into account)
		$.each(tmp_devoir.notes, function(pupil_name,pupil_notes) {
			//Compute min, max and lower than mean
			if(tmp_devoir.notes[pupil_name].note < tmp_devoir.general.stats.min){
				tmp_devoir.general.stats.min = tmp_devoir.notes[pupil_name].note;
			}
			if(tmp_devoir.notes[pupil_name].note > tmp_devoir.general.stats.max){
				tmp_devoir.general.stats.max = tmp_devoir.notes[pupil_name].note;
			}
			if(tmp_devoir.notes[pupil_name].note < tmp_devoir.notes[pupil_name].max/2){
				tmp_devoir.general.stats.nb_inf++;
			}
			//The mean is computed in two steps (first step add all notes)...
			tmp_devoir.general.stats.mean += tmp_devoir.notes[pupil_name].note;
		});
		//If at least one note is defined then can finished to compute the mean
		if(Object.keys(tmp_devoir.notes).length != 0){
			tmp_devoir.general.stats.mean = Number((tmp_devoir.general.stats.mean / Object.keys(tmp_devoir.notes).length).toFixed(3));
		}
	}

	//Set coefficient of the devoir
	tmp_devoir.general.coefficient = import_coefficient;
	
	//Insert the new devoir in the array of devoirs but at the right position regarding its date
	var devoir_position = 0;
	$.each(_content.data.devoirs, function(numd,devoir) {
		if(devoir.general.date < tmp_devoir.general.date){
			devoir_position++;
		}else{
			return false;
		}
	});
	_content.data.devoirs.splice(devoir_position, 0, tmp_devoir);
	
	//COmpute all stats for the global suivi
	computeSuiviStats();
	//Update all information in the MMI (title, classe, pupils, stats, grille)
	loadDefaultDataSuivi();
	//Add the new devoir in the MMI array of all devoirs
	updateSuiviGlobal();
	//Add the new devoir in the MMI array of all pupils
	updateSuiviPupil();
	//Memorize that document is modified
	toggleDocumentEdition(true);
}
/* Function in charge of computing the stats global for the whole suivi - all the stats for all the devoirs */
function computeSuiviStats()
{
	var local_content = _content;
	if(_filteredContent){
		local_content = _filteredContent
	}
	//Compute nb for global mean
	var devoir_nb_coeff = 0;
	//Get number of devoirs
	local_content.data.general.stats.nb = local_content.data.devoirs.length;
	//Now compute the mean, min and max
	local_content.data.general.stats.mean = 0;
	local_content.data.general.stats.max = 0;
	local_content.data.general.stats.min = 200;
	$.each(local_content.data.devoirs, function(numd,devoir) {
		local_content.data.general.stats.mean += devoir.general.stats.mean * devoir.general.coefficient;
		if(devoir.general.stats.min < local_content.data.general.stats.min){local_content.data.general.stats.min = devoir.general.stats.min;}
		if(devoir.general.stats.max > local_content.data.general.stats.max){local_content.data.general.stats.max = devoir.general.stats.max;}
		devoir_nb_coeff += devoir.general.coefficient;
	});
	//If there is at least one devoir in the array (or creat an error /0)
	if(local_content.data.general.stats.nb != 0){
		local_content.data.general.stats.mean = Number((local_content.data.general.stats.mean / devoir_nb_coeff).toFixed(3));
	}else{
		local_content.data.general.stats.mean = "?";
		local_content.data.general.stats.max = "?";
		local_content.data.general.stats.min = "?";
	}
	//Memorize that document is modified
	toggleDocumentEdition(true);
}
/* Function in charge of generating an array with all devoirs of the suivi */
function updateSuiviGlobal()
{
	$("#s5_global .tablesorter").trigger('filterReset').trigger('sortReset');

	//First empty the array in MMI (always create array from scratch)
	$("#s5_global > table > tbody").html("");
	//var that will store the new line to append in the array
	var ligne_devoir = "";
	$.each(_content.data.devoirs, function(numd,devoir) {
	
		//Compute date from string and replace it as it is much more easier to work on date
		devoir.general.date = new Date(devoir.general.date);
		//Create a line for each devoir
		ligne_devoir = "<tr devoir_id='"+numd+"' contextmenu='devoir_menu'>";
		ligne_devoir += "<td>"+devoir.general.date.getDate()+'/'+(devoir.general.date.getMonth()+1)+'/'+devoir.general.date.getFullYear()+"</td>";
		ligne_devoir += "<td>"+devoir.meta.file_name+"</td>";
		ligne_devoir += "<td><a>"+devoir.general.titre+"</a></td>";
		ligne_devoir += "<td>"+devoir.general.bareme+"</td>";
		ligne_devoir += "<td>";
		$.each(_content.grilles[_content.data.general.grille.id].competences, function(competence_id,competence) {
			$.each(competence.capacites, function(capacite_id,capacite_texte) {
				if(devoir.capacites[capacite_id]){
					var capacite = getCapacite(capacite_id);
					if(capacite){
						ligne_devoir += "<span><div style='color:"+capacite.competence.couleur+"'>"+capacite_id+"</div><div>"+devoir.capacites[capacite_id].max+"pts</div></span>";
					}
				}
			});
		});
		ligne_devoir += "</td>";
		ligne_devoir += "<td><span contenteditable='true'>"+devoir.general.coefficient+"</span></td>";
		ligne_devoir += "<td>"+devoir.general.stats.mean+"</td>";
		ligne_devoir += "<td>"+devoir.general.stats.min+"</td>";
		ligne_devoir += "<td>"+devoir.general.stats.max+"</td>";
		ligne_devoir += "<td>"+devoir.general.stats.nb_inf+"</td>";
		ligne_devoir += "</tr>";
		//Add the created line in the array
		$("#s5_global > table > tbody").append(ligne_devoir);
	});
	
	$("#s5_global > table > tbody > tr > td > span").blur(function(event) {
		//Get devoir id
		var devoir_id = $(this).parent().parent().attr("devoir_id");
		//Get old value in cas of problem
		var old_coeff = _content.data.devoirs[devoir_id].general.coefficient;
		//Get new value, manage dot problem and convert it to float
		var new_coeff = $(this).html();
		new_coeff = new_coeff.replace(",", "."); 
		_content.data.devoirs[devoir_id].general.coefficient = parseFloat(new_coeff);
		//If the value is not a valid float
		if(isNaN(_content.data.devoirs[devoir_id].general.coefficient)){
			warning_message("Votre coefficient n'est pas un nombre valide.");
			_content.data.devoirs[devoir_id].general.coefficient = old_coeff;
			$(this).html(old_coeff);
		}else{
			//If round is valid float but is zero (impossible to manage)
			if(_content.data.devoirs[devoir_id].general.coefficient == 0){
				warning_message("Votre coefficient ne peut pas être égal à 0.");
				_content.data.devoirs[devoir_id].general.coefficient = old_coeff;
				$(this).html(old_coeff);
			}else{
				$(this).html(_content.data.devoirs[devoir_id].general.coefficient);
				//Recompute all stats without the removed devoir
				computeSuiviStats();
				//Reload all global information in MMI
				loadDefaultDataSuivi();
				//Generate a new array for the list of devoirs and for the list of pupils (much more simple than update them)
				updateSuiviGlobal();
				updateSuiviPupil();
				//Memorize that document is modified
				toggleDocumentEdition(true);
			}
		}
	});
	
	//Update the array to update the plugin table sorter
	$("#s5_global .tablesorter").trigger("update");
	var sorting = [[0,0]]; 
	$("#s5_global .tablesorter").trigger("sorton",[sorting]);
	//Create an action when the user clicks on the link (see devoir details)
	$("#s5_global .tablesorter a").unbind("click");
	$("#s5_global .tablesorter a").click(function(event) {
		var devoir_id = $(this).parent().parent().attr("devoir_id");
		openSuiviDetails(devoir_id);
	});
	//Create an action when the user right click on the row (add an action if he wants to remove the devoir selected from the suivi)
	$("#s5_global > table > tbody > tr").contextmenu(function(event) {
        var clicked_devoir = $(this);
        $('#devoir_menu > menuitem').unbind( "click" );
        $('#devoir_menu > menuitem').click(function(event) {
            var devoir_id = parseInt($(clicked_devoir).attr("devoir_id"));
            deleteSuivi(devoir_id);
        });
    });
}
/* Function in charge of generating an array with all pupils of the class of the suivi */
function updateSuiviPupil()
{
	var local_content = _content;
	if(_filteredContent){
		local_content = _filteredContent
	}
	
	//First empty the array (always create array from scratch)
	$("#s5_pupil > table > tbody").html("");

	//Now loop through all pupils of the class (if a pupil has a note in one devoir but is not defined in the classe thus this pupil is completly ignored)
	var classe_id = local_content.data.general.classe;
	//var that will store the new line to append in the array
	var ligne_pupil = "";
	$.each(local_content.classes["_"+classe_id], function(pupil_name,pupil) {
		
		ligne_pupil = "<tr>";
		ligne_pupil += "<td><a>"+pupil+"</a></td>";
		var pupil_mean = 0;
		var pupil_nb = 0;
		var pupil_nb_coeff = 0;
		var pupil_min = 200;
		var pupil_max = 0;
		var pupil_inf_moy = 0;
		$.each(local_content.data.devoirs, function(numd,devoir) {
			if(devoir.notes[pupil]){
				var pupil_note = devoir.notes[pupil].note;
				pupil_mean+=pupil_note * devoir.general.coefficient;
				if(pupil_note<pupil_min){pupil_min = pupil_note;}
				if(pupil_note>pupil_max){pupil_max = pupil_note;}
				if(pupil_note < devoir.notes[pupil].max/2){pupil_inf_moy++;}
				pupil_nb++;
				pupil_nb_coeff += devoir.general.coefficient;
			}
		});
		//If the pupil has a note at least on one devoir then display stats otherwise display NE for Not Evaluated
		if(pupil_nb!=0){
			pupil_mean = Number((pupil_mean/pupil_nb_coeff).toFixed(3));
		}else{
			pupil_mean = "-";
			pupil_nb = "-";
			pupil_min = "-";
			pupil_max = "-";
			pupil_inf_moy = "-";
		}
		
		ligne_pupil += "<td>"+pupil_nb+"</td>";
		ligne_pupil += "<td>"+pupil_mean+"</td>";
		ligne_pupil += "<td>&nbsp;</td>";
		ligne_pupil += "<td>"+pupil_min+"</td>";
		ligne_pupil += "<td>"+pupil_max+"</td>";
		ligne_pupil += "<td>"+pupil_inf_moy+"</td>";
		ligne_pupil += "</tr>";
		//Ad the line in the array
		$("#s5_pupil > table > tbody").append(ligne_pupil);
	});
	
	//Add now the final rank of each pupil (compute at the end to prvent a recursive loop inside each pupil)
	var pupil_notes = [];
	var pupil_rank = 0;
	//The rank is computed according to the global mean
	$.each($("#s5_pupil > table > tbody > tr"), function(index,pupil) {
		var pupil_note = parseFloat($(this).children("td:nth-child(3)").html());
		if(isNaN(pupil_note)){
			pupil_note = 0;
		}
		pupil_notes.push(pupil_note);
	});
	pupil_notes.sort(function(a, b){return b-a});
	//Now that all notes are retrieved ad ordered, loof for the note in the array to get its position and thus pupil rank
	$.each($("#s5_pupil > table > tbody > tr"), function(index,pupil) {
		var pupil_note = parseFloat($(this).children("td:nth-child(3)").html());
		if(pupil_notes.indexOf(pupil_note) == -1){
			pupil_rank = "-";
		}else{
			pupil_rank = pupil_notes.indexOf(pupil_note)+1; 
		}
		$(this).children("td:nth-child(4)").html(pupil_rank);
	});
		
	
	//Update the array to update the plugin table sorter
	$("#s5_pupil .tablesorter").trigger("update");
	var sorting = [[0,0]]; 
	$("#s5_pupil .tablesorter").trigger("sorton",[sorting]);
	//Create an action when the user clicks on the link (see pupil details)
	$("#s5_pupil .tablesorter a").unbind("click");
	$("#s5_pupil .tablesorter a").click(function(event) {
		var pupil_name = $(this).html();
		openSuiviPupilDetails(pupil_name, true);
	});
}
/* Function in charge of removing a devoir from the suivi
   @input devoir_id : a unique id represeting the position of the devoir in the MMI and in the list of devoirs
*/
function deleteSuivi(devoir_id)
{
	//Display confirmation
	if(confirm("Êtes-vous sûr de bien vouloir supprimer ce devoir ?")){
		//Remove the devoir
		_content.data.devoirs.splice(devoir_id, 1);
		//Recompute all stats without the removed devoir
		computeSuiviStats();
		//Reload all global information in MMI
		loadDefaultDataSuivi();
		//Generate a new array for the list of devoirs and for the list of pupils (much more simple than update them)
		updateSuiviGlobal();
		updateSuiviPupil();
	}
}
/* Function in charge of filtering all display results and memorize filter */
function filterSuivi()
{
	var filtered_devoir_nb = 0;
	_filteredContent = null;
	//If a filtered is applied it means that the number of displayed elements is differentt from the full list
	if($("#s5_global .tablesorter tbody tr:not(.filtered)").length != _content.data.devoirs.length){
		_filteredContent = JSON.parse(JSON.stringify(_content));
		//Then browse all notes and save them again in _content
		$.each($("#s5_global .tablesorter tbody tr.filtered"), function(numd,devoir) {
			var devoir_id = $(this).attr("devoir_id");
			devoir_id = parseInt(devoir_id)-filtered_devoir_nb;
			_filteredContent.data.devoirs.splice(devoir_id, 1);
			filtered_devoir_nb++;
		});
		//Convert into valid dates
		$.each(_filteredContent.data.devoirs, function(numd,devoir) {
			devoir.general.date = new Date(devoir.general.date);
		});
	}
	
	//Reload general stats
	computeSuiviStats();
	loadDefaultDataSuivi();
	updateSuiviPupil();
}
//Graphs used for devoir details
var s5_det_graph_inf_moy = null;
var s5_det_graph_comp_radar = null;
var s5_det_graph_comp_bar = null;
var s5_det_graph_comp_bar2 = null;
var s5_det_graph_comp_bar3 = null;
/* Function in charge of erasing all information given in the detailed of a devoir */
function cleanSuiviDetails()
{
	//Clean the general information
	$('#s5_det_title > span:nth-child(2)').html("");
	$('#s5_det_date > span:nth-child(2)').html("");	
	$("#s5_det_bareme > span:last-child").html("");
	$("#s5_det_coeff > span:last-child").html("");
	$("#s5_det_mean > span:last-child").html("");
	$("#s5_det_maximum > span:last-child").html("");
	$("#s5_det_minimum > span:last-child").html("");
	$('#s5_det_inf_moyenne > span:nth-child(2)').html("");
	//Clean the detailled information
	$("#s5_det_notes > tbody").html("");
	$("#s5_det_competences > tbody").html("");
	//CLean the graph
	if(s5_det_graph_inf_moy){s5_det_graph_inf_moy.destroy();}
	if(s5_det_graph_comp_radar){s5_det_graph_comp_radar.destroy();}
	if(s5_det_graph_comp_bar){s5_det_graph_comp_bar.destroy();}
	if(s5_det_graph_comp_bar2){s5_det_graph_comp_bar2.destroy();}
	if(s5_det_graph_comp_bar3){s5_det_graph_comp_bar3.destroy();}
}
function openSuiviDetails(devoir_id)
{
	//FIrst clean fully the MMI that give details of a devoir
	cleanSuiviDetails();
	//Get the devoir requested
	var devoir  = _content.data.devoirs[devoir_id];
	//Compute a real date
	devoir.general.date = new Date(devoir.general.date);
	//Add all global information
	$('#s5_det_title > span:nth-child(2)').html(devoir.general.titre);
	$('#s5_det_date > span:nth-child(2)').html(devoir.general.date.getDate()+'/'+(devoir.general.date.getMonth()+1)+'/'+devoir.general.date.getFullYear());	
	$("#s5_det_bareme > span:last-child").html(devoir.general.bareme);
	$("#s5_det_coeff > span:last-child").html(devoir.general.coefficient);
	$("#s5_det_mean > span:last-child").html(devoir.general.stats.mean);
	$("#s5_det_maximum > span:last-child").html(devoir.general.stats.max);
	$("#s5_det_minimum > span:last-child").html(devoir.general.stats.min);
	$('#s5_det_inf_moyenne > span:nth-child(2)').html(devoir.general.stats.nb_inf);
	//Add a row for each pupil that participes in the devoir (and only these ones, other pupils or not included)
	
	//Now loop through all pupils of the class (even pupil withou note in this devoir - will be indicated as not evaluated)
	var classe_id = _content.data.general.classe;
	$.each(_content.classes["_"+classe_id], function(pupil_name,pupil) {

			var pupil_line = "<tr>";
			pupil_line += '<td>'+pupil+'</td>';
			//If the pupil has been evaluated
			if(devoir.notes[pupil]){
				pupil_line += '<td>'+devoir.notes[pupil].note+'/'+devoir.notes[pupil].max+'</td>';
				pupil_line += '<td>';
				$.each(_content.grilles[_content.data.general.grille.id].competences, function(competence_id,competence) {
					$.each(competence.capacites, function(capacite_id,capacite_texte) {
						var capacite = getCapacite(capacite_id);
						if(devoir.notes[pupil].capacites[capacite.id] != null){
							pupil_line += "<span><div style='color:"+capacite.competence.couleur+"'>"+capacite.id+"</div><div>"+Math.round(100*devoir.notes[pupil].capacites[capacite.id]/devoir.capacites[capacite_id].max)+"%</div></span>";
						}
					});
				});
				pupil_line += '</td>';
				pupil_line += '<td>'+devoir.notes[pupil].commentaire+'</td>';
			//If there is no note for this pupil
			}else{
				pupil_line += '<td>Non évalué</td><td>&nbsp;</td><td>&nbsp;</td>';
			}
			pupil_line += "</tr>";
			$("#s5_det_notes > tbody").append(pupil_line);
	});
	
	$.each(_content.grilles[_content.data.general.grille.id].competences, function(competence_id,competence) {
		var competence_stat = {"nb":0, "max":0, "encours":0, "encours100":0, "acquis":0, "acquis100":0,"nonacquis":0,"nonacquis100":0, "moyenne":0, "moyenne100":0}
		var competence_txt = "";
		$.each(competence.capacites, function(capacite_id,capacite_texte) {
			if(devoir.capacites[capacite_id]){
				var capacite = getCapacite(capacite_id);
				
				competence_stat["nb"]++;
				competence_stat["max"] += devoir.capacites[capacite_id].max;
				competence_stat["encours"] += devoir.capacites[capacite_id].stats["encours"];
				competence_stat["encours100"] += devoir.capacites[capacite_id].stats["encours100"];
				competence_stat["acquis"] += devoir.capacites[capacite_id].stats["acquis"];
				competence_stat["acquis100"] += devoir.capacites[capacite_id].stats["acquis100"];
				competence_stat["nonacquis"] += devoir.capacites[capacite_id].stats["nonacquis"];
				competence_stat["nonacquis100"] += devoir.capacites[capacite_id].stats["nonacquis100"];
				competence_stat["moyenne"] += devoir.capacites[capacite_id].stats["moyenne"];
				competence_stat["moyenne100"] += devoir.capacites[capacite_id].stats["moyenne100"];

				competence_txt += "<tr><td style='color:"+capacite.competence.couleur+"'>"+capacite.id+"</td><td>"+capacite.texte+"</td><td>"+devoir.capacites[capacite_id].stats["acquis"]+"<div>"+devoir.capacites[capacite_id].stats["acquis100"]+"%</div></td><td>"+devoir.capacites[capacite_id].stats["encours"]+"<div>"+devoir.capacites[capacite_id].stats["encours100"]+"%</div></td><td>"+devoir.capacites[capacite_id].stats["nonacquis"]+"<div>"+devoir.capacites[capacite_id].stats["nonacquis100"]+"%</div></td><td>"+devoir.capacites[capacite_id].stats["moyenne"]+"/"+devoir.capacites[capacite_id].max+" pts<div>"+devoir.capacites[capacite_id].stats["moyenne100"]+"%</div></td></tr>";
			}
		});
		
		if(competence_stat["nb"] > 0){
			competence_stat["encours100"] =  Math.round(competence_stat["encours100"] / competence_stat["nb"]);
			competence_stat["acquis100"] =  Math.round(competence_stat["acquis100"] / competence_stat["nb"]);
			competence_stat["nonacquis100"] =  Math.round(competence_stat["nonacquis100"] / competence_stat["nb"]);
			competence_stat["moyenne"] =  Number((competence_stat["moyenne"]).toFixed(3));
			competence_stat["moyenne100"] =  Math.round(competence_stat["moyenne100"] / competence_stat["nb"]);
			
			$("#s5_det_competences > tbody").append("<tr class='s5_det_competences_comp'><td>&nbsp;</td><td style='color:"+competence.couleur+"'>"+competence.titre+"</td><td>"+competence_stat["acquis"]+"<div>"+competence_stat["acquis100"]+"%</div></td><td>"+competence_stat["encours"]+"<div>"+competence_stat["encours100"]+"%</div></td><td>"+competence_stat["nonacquis"]+"<div>"+competence_stat["nonacquis100"]+"%</div></td><td>"+competence_stat["moyenne"]+"/"+competence_stat.max+" pts<div>"+competence_stat["moyenne100"]+"%</div></td></tr>");
			$("#s5_det_competences > tbody").append(competence_txt);
		}
	});
	
	$("#s5_det_notes").trigger("update");
	$("#s5_det_competences").trigger("update");
	
	$("#s5_details").dialog({
		autoOpen: true,
		modal: true,
		width:"1024px",
		closeText: "Fermer",
		title: "Détails d'un devoir",
		close: function() {
			$("#s5_details").dialog( "close" );
		}
	});

	s5_det_graph_inf_moy = new Chart($("#s5_det_graph_inf_moy"),{
		type: 'doughnut',
		data: {
			labels: [
				"Inférieur Moyenne",
				"Supérieur Moyenne",
			],
			datasets: [{
				data: [devoir.general.stats.nb_inf, Object.keys(devoir.notes).length-devoir.general.stats.nb_inf],
				backgroundColor: ["#FF6384","#4BC0C0"],
				hoverBackgroundColor: ["#FF6384","#4BC0C0"]
			}]
		},
		options: {
			title: {
				display: true,
				text: 'Proportion vs. moyenne'
			},
			legend: {
				display: true,
				position: 'bottom',
			},
			animation: false
		}
	});
	
	var s5_det_graph_comp_labels = [];
	var s5_det_graph_comp_comp_labels = [];
	var s5_det_graph_comp_colors = [];
	var s5_det_graph_comp_comp_colors = [];
	
	var s5_det_graph_comp_bareme = [];
	var s5_det_graph_comp_moyenne = [];
	var s5_det_graph_comp_moyenne100 = [];
	var s5_det_graph_comp_comp_moyenne100 = [];
	
	var s5_det_graph_comp_acquis = [];
	var s5_det_graph_comp_encours = [];
	var s5_det_graph_comp_nonacquis = [];
	
	$.each(_content.grilles[_content.data.general.grille.id].competences, function(competence_id,competence) {
		
		var comp_moyenne100 = 0;
		var comp_moyenne100_nb = 0;
		$.each(competence.capacites, function(capacite_id,capacite_texte) {
			var capacite = getCapacite(capacite_id);
			if(devoir.capacites[capacite_id] != null){
				s5_det_graph_comp_labels.push(capacite_id);
				s5_det_graph_comp_colors.push(capacite.competence.couleur);
				s5_det_graph_comp_bareme.push(devoir.capacites[capacite_id].max);
				s5_det_graph_comp_moyenne.push(devoir.capacites[capacite_id].stats["moyenne"]);
				s5_det_graph_comp_moyenne100.push(devoir.capacites[capacite_id].stats["moyenne100"]);
				s5_det_graph_comp_acquis.push(devoir.capacites[capacite_id].stats["acquis"]);
				s5_det_graph_comp_nonacquis.push(devoir.capacites[capacite_id].stats["nonacquis"]);
				s5_det_graph_comp_encours.push(devoir.capacites[capacite_id].stats["encours"]);
				comp_moyenne100 += devoir.capacites[capacite_id].stats["moyenne100"];
				comp_moyenne100_nb++;
			}
		});
		s5_det_graph_comp_comp_labels.push(competence.titre);
		s5_det_graph_comp_comp_colors.push(competence.couleur);
		if(comp_moyenne100_nb > 0){
			s5_det_graph_comp_comp_moyenne100.push(Math.round(comp_moyenne100/comp_moyenne100_nb));
		}else{
			s5_det_graph_comp_comp_moyenne100.push(0);
		}
	});
	
	s5_det_graph_comp_radar = new Chart($("#s5_det_graph_comp_radar"),{
		type: 'doughnut',
		data: {
			labels: s5_det_graph_comp_labels,
			datasets: [{
				data: s5_det_graph_comp_bareme,
				backgroundColor: s5_det_graph_comp_colors,
				borderColor: "#FFF",
			}]

		},
		options: {
			title: {
				display: true,
				text: 'Répartition des capacités'
			},
			legend: {
				display: false,
				position: 'bottom',
			},
			animation: false
		}
	});
	
	s5_det_graph_comp_bar = new Chart($("#s5_det_graph_comp_bar"),{
		type: 'bar',
		data: {
			labels: s5_det_graph_comp_labels,
			datasets: [
				{
					label: "Non Acquis",
					backgroundColor: "#FF6384",
					borderWidth: 1,
					data: s5_det_graph_comp_nonacquis,
				},{
					label: "En cours",
					backgroundColor: "#FFCE56",
					borderWidth: 1,
					data: s5_det_graph_comp_encours,
				},{
					label: "Acquis",
					backgroundColor: "#4BC0C0",
					borderWidth: 1,
					data: s5_det_graph_comp_acquis,
				}
			]
		},
		options: {
			title: {
				display: true,
				text: 'Niveau d\'acquisition par capacités'
			},
			legend: {
				display: true,
				position: 'bottom',
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true,
					},
					stacked: true,
				}],
				xAxes: [{
					stacked: true,
				}]
			},
			animation: false
		}
	});
	
	s5_det_graph_comp_bar2 = new Chart($("#s5_det_graph_comp_bar2"),{
		type: 'bar',
		data: {
			labels: s5_det_graph_comp_labels,
			datasets: [
				{
					label: "% d'acquisition",
					backgroundColor: s5_det_graph_comp_colors,
					borderColor: s5_det_graph_comp_colors,
					borderWidth: 1,
					data: s5_det_graph_comp_moyenne100,
				}
			]
		},
		options: {
			title: {
				display: true,
				text: "Moyenne d'acquisition des capacités"
			},
			legend: {
				display: false,
				position: 'bottom',
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true,
					}
				}],
			},
			animation: false
		}
	});
	s5_det_graph_comp_bar3 = new Chart($("#s5_det_graph_comp_bar3"),{
		type: 'bar',
		data: {
			labels: s5_det_graph_comp_comp_labels,
			datasets: [
				{
					label: "% d'acquisition",
					backgroundColor: s5_det_graph_comp_comp_colors,
					borderColor: s5_det_graph_comp_comp_colors,
					borderWidth: 1,
					data: s5_det_graph_comp_comp_moyenne100,
				}
			]
		},
		options: {
			title: {
				display: true,
				text: "Moyenne d'acquisition des compétences"
			},
			legend: {
				display: false,
				position: 'bottom',
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true,
						min:0,
						max:0
					}
				}],
			},
			animation: false
		}
	});
}

var s5_det_pup_graph_evol_notes = null;
var s5_det_pup_graph_evol_comp = null;
var s5_det_pup_graph_cap = null;
function cleanSuiviPupilDetails()
{
	$('#s5_pupil_details #s5_det_pup_name > span:nth-child(2)').html("");
	$('#s5_pupil_details #s5_det_pup_nb > span:nth-child(2)').html("");	
	$('#s5_pupil_details #s5_det_pup_classement > span:nth-child(2)').html("");	
	$("#s5_pupil_details #s5_det_pup_moyenne > span:last-child").html("");
	$("#s5_pupil_details #s5_det_pup_maximum > span:last-child").html("");
	$("#s5_pupil_details #s5_det_pup_minimum > span:last-child").html("");
	$("#s5_pupil_details #s5_det_pup_inf_moyenne > span:last-child").html("");
	
	$("#s5_pupil_details #s5_det_pup_notes > tbody").html("");
	$("#s5_pupil_details #s5_det_pup_competences > thead").html("");
	$("#s5_pupil_details #s5_det_pup_competences > tbody").html("");
	$("#s5_pupil_details #s5_det_pup_capacites > tbody").html("");
	
	if(s5_det_pup_graph_evol_notes){s5_det_pup_graph_evol_notes.destroy();}
	if(s5_det_pup_graph_evol_comp){s5_det_pup_graph_evol_comp.destroy();}
	if(s5_det_pup_graph_cap){s5_det_pup_graph_cap.destroy();}
}
function openSuiviPupilDetails(pupil_name, in_dialog)
{
	cleanSuiviPupilDetails();
	
	var local_content = _content;
	if(_filteredContent){
		local_content = _filteredContent
	}
	
	var classe_id = local_content.data.general.classe;
	var grille_id = local_content.data.general.grille.id;
	
	var pupil_mean = 0;
	var pupil_nb = 0;
	var pupil_min = 200;
	var pupil_max = 0;
	var pupil_inf_moy = 0;
	var pupil_notes = [];
	var pupil_rank = [];
		
	$.each(local_content.classes["_"+classe_id], function(nump,pupil) {
		var pupil_mean_tmp = 0;
		var pupil_nb_tmp = 0;
		var pupil_nb_coeff_tmp = 0;
		var pupil_min_tmp = 200;{}
		var pupil_max_tmp = 0;
		var pupil_inf_moy_tmp = 0;
		var pupil_notes_tmp = [];
		$.each(local_content.data.devoirs, function(numd,devoir) {
			if(devoir.notes[pupil]){
				var pupil_note_tmp = devoir.notes[pupil].note;
				pupil_mean_tmp += pupil_note_tmp * devoir.general.coefficient;
				if(pupil_note_tmp<pupil_min_tmp){pupil_min_tmp = pupil_note_tmp;}
				if(pupil_note_tmp>pupil_max_tmp){pupil_max_tmp = pupil_note_tmp;}
				if(pupil_note_tmp<devoir.general.bareme/2){pupil_inf_moy_tmp++;}
				pupil_nb_tmp++;
				pupil_nb_coeff_tmp += devoir.general.coefficient;
				pupil_notes_tmp.push(pupil_note_tmp);
			}
		});
		if(pupil_nb_tmp!=0){
			pupil_mean_tmp = Number((pupil_mean_tmp/pupil_nb_coeff_tmp).toFixed(3));
			pupil_rank.push(pupil_mean_tmp);
		}else{
			pupil_mean_tmp = "-";
			pupil_nb_tmp = "-";
			pupil_min_tmp = "-";
			pupil_max_tmp = "-";
			pupil_inf_moy_tmp = "-";
		}
		
		if(pupil == pupil_name){
			pupil_mean = pupil_mean_tmp;
			pupil_nb = pupil_nb_tmp;
			pupil_min = pupil_min_tmp;
			pupil_max = pupil_max_tmp;
			pupil_inf_moy = pupil_inf_moy_tmp;
			pupil_notes = pupil_notes_tmp
		}
	});
	
	if(pupil_rank.indexOf(pupil_mean) == -1){
		pupil_rank = "-";
	}else{
		pupil_rank.sort(function(a, b){return b-a});
		pupil_rank = pupil_rank.indexOf(pupil_mean)+1; 
	}

	$('#s5_pupil_details #s5_det_pup_name > span:nth-child(2)').html(pupil_name);
	$('#s5_pupil_details #s5_det_pup_nb > span:nth-child(2)').html(pupil_nb);	
	$('#s5_pupil_details #s5_det_pup_classement > span:nth-child(2)').html(pupil_rank);	
	$("#s5_pupil_details #s5_det_pup_moyenne > span:last-child").html(pupil_mean);
	$("#s5_pupil_details #s5_det_pup_maximum > span:last-child").html(pupil_max);
	$("#s5_pupil_details #s5_det_pup_minimum > span:last-child").html(pupil_min);
	$("#s5_pupil_details #s5_det_pup_inf_moyenne > span:last-child").html(pupil_inf_moy);

	if(in_dialog)
	{
		$("#s5_pupil_details").dialog({
			autoOpen: true,
			modal: true,
			width:"1024px",
			closeText: "Fermer",
			title: "Détails d'un élève",
			close: function() {
				$("#s5_pupil_details").dialog( "close" );
			}
		});
	}
	
	var graph_dates = [];
	var graph_note = [];
	var graph_mean = [];
	
	$.each(local_content.data.devoirs, function(numd,devoir) {
		if(devoir.notes[pupil_name]){
			var pupil_line = '<tr>';
			pupil_line += '<td>'+devoir.general.date.getDate()+'/'+(devoir.general.date.getMonth()+1)+'/'+devoir.general.date.getFullYear()+'</td>';
			pupil_line += '<td>'+devoir.general.titre+'</td>';
			pupil_line += '<td>'+devoir.notes[pupil_name].note+'</td>';
			pupil_line += '<td>'+devoir.general.stats["mean"]+'</td>';
			pupil_line += '<td>';
			$.each(_content.grilles[_content.data.general.grille.id].competences, function(competence_id,competence) {
				$.each(competence.capacites, function(capacite_id,capacite_texte) {
					if(devoir.capacites[capacite_id]){
						var capacite = getCapacite(capacite_id);
						if(capacite){
							pupil_line += "<span><div style='color:"+capacite.competence.couleur+"'>"+capacite.id+"</div><div>"+Math.round(100*devoir.notes[pupil_name].capacites[capacite.id]/devoir.capacites[capacite_id].max)+"%</div></span>";
						}
					}
				});
			});
			pupil_line += '</td>';
			pupil_line += '<td>'+devoir.general.coefficient+'</td>';
			pupil_line += '<td>'+devoir.notes[pupil_name].commentaire+'</td>';
			pupil_line += '</tr>';
			$("#s5_pupil_details #s5_det_pup_notes > tbody").append(pupil_line);
			
			graph_dates.push(devoir.general.date.getDate()+'/'+(devoir.general.date.getMonth()+1)+'/'+devoir.general.date.getFullYear());
			graph_note.push(devoir.notes[pupil_name].note);
			graph_mean.push(devoir.general.stats["mean"]);
		}
	});
	
	s5_det_pup_graph_evol_notes = new Chart($("#s5_pupil_details #s5_det_pup_graph_evol_notes"), {
		type: 'line',
		data: {
			labels: graph_dates,
			datasets: [
			{
				label: "Note",
				data: graph_note,
				borderColor:"#36A2EB",
				backgroundColor:"#36A2EB",
				pointBorderColor:"#36A2EB",
				pointBackgroundColor:"#36A2EB",
				pointBorderWidth:"#36A2EB",
				fill: false
			},
			{
				label: "Moyenne",
				data: graph_mean,
				borderColor:"#FFCE56",
				backgroundColor:"#FFCE56",
				pointBorderColor:"#FFCE56",
				pointBackgroundColor:"#FFCE56",
				pointBorderWidth:"#FFCE56",
				fill: false
			}]
		},
		options: {
			responsive: true,
			animation: false,
			title: {
				display: true,
				text: "Evolution annuelle des notes de l'élève"
			},
			legend: {
				display: true,
				position: 'bottom',
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true,
					}
				}],
			},
			animation: false
		}
	});

	var comp_tmp =[];
	var comp_tmp_graph =[];
	var graph_dates =[];
	var graph_comp =[];
	
	$("#s5_pupil_details #s5_det_pup_competences").trigger("destroy");
	
	var comp_line = '<tr><th data-date-format="ddmmyyyy" data-sorter="shortDate" data-sortinitialorder="desc">Date</th><th>Titre</th>';
	$.each(local_content.grilles[grille_id].competences, function(numco,competence) {
		comp_line += "<th>"+competence.titre+"</th>";
		comp_tmp[numco] = [];
		comp_tmp_graph[numco] = [];
	});
	comp_line += "</tr>";
	$("#s5_pupil_details #s5_det_pup_competences > thead").append(comp_line);
	
	comp_line = "";
	$.each(local_content.data.devoirs, function(numd,devoir) {
		if(devoir.notes[pupil_name]){
			graph_dates.push(devoir.general.date.getDate()+'/'+(devoir.general.date.getMonth()+1)+'/'+devoir.general.date.getFullYear());
				
			comp_line += "<tr><td>"+devoir.general.date.getDate()+'/'+(devoir.general.date.getMonth()+1)+'/'+devoir.general.date.getFullYear()+"</td>";
			comp_line += "<td>"+devoir.general.titre+"</td>";
			$.each(local_content.grilles[grille_id].competences, function(numco,competence) {
				var competence_tmp = 0;
				var competence_nb = 0;
				$.each(devoir.capacites, function(numca,capacite) {
					if(competence.capacites[numca]){
						competence_tmp += 100 * devoir.notes[pupil_name].capacites[numca]/capacite.max;
						competence_nb++;
					}
				});
				if(competence_nb!=0){
					competence_tmp = Math.round(competence_tmp / competence_nb);
					comp_tmp[numco].push(competence_tmp);
					comp_tmp_graph[numco].push(competence_tmp);
					comp_line += "<td style='color:"+competence.couleur+"'>"+competence_tmp+"%</td>";
				}else{
					comp_tmp[numco].push(null);
					comp_tmp_graph[numco].push("-");
					comp_line += "<td style='color:"+competence.couleur+"'>- %</td>";
				}
			});
			comp_line += "</tr>";
		}
	});
	
	comp_line += "<tr><td>&nbsp;</td>";
	comp_line += "<td>Moyenne</td>";
	$.each(local_content.grilles[grille_id].competences, function(numco,competence) {
		
		var comp_tmp_mean = 0;
		var comp_tmp_nb_coeff = 0;
		$.each(local_content.data.devoirs, function(numd,devoir) {
			if(comp_tmp[numco][numd]){
				comp_tmp_mean += comp_tmp[numco][numd] * devoir.general.coefficient;
				comp_tmp_nb_coeff += devoir.general.coefficient;
			}
		});
		
		if(comp_tmp_nb_coeff > 0){
			comp_tmp_mean = Math.round(comp_tmp_mean/comp_tmp_nb_coeff);
		}else{
			comp_tmp_mean = "- ";
		}
		comp_line += "<td style='color:"+competence.couleur+"'>"+comp_tmp_mean+"%</td>";
		
		graph_comp.push({
			label: competence.titre,
			data: comp_tmp_graph[numco],
			borderColor:competence.couleur,
			backgroundColor:competence.couleur,
			pointBorderColor:competence.couleur,
			pointBackgroundColor:competence.couleur,
			pointBorderWidth:competence.couleur,
			fill: false,
			spanGaps: false
		});
	});
	$("#s5_pupil_details #s5_det_pup_competences > tbody").append(comp_line);
	
	s5_det_pup_graph_evol_comp = new Chart($("#s5_pupil_details #s5_det_pup_graph_evol_comp"), {
		type: 'line',
		data: {
			labels: graph_dates,
			datasets: graph_comp
		},
		options: {
			responsive: true,
			animation: false,
			title: {
				display: true,
				text: "Evolution annuelle des compétences de l'élève"
			},
			legend: {
				display: true,
				position: 'bottom',
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true,
						min:0,
						max:100
					}
				}],
			},
			animation: false
		}
	});
	
	//Bilan par capacité
	var cap_tmp =[];
	var cap_tmp_nb_coeff =[];
	var graph_capa_label =[];
	var graph_capa_val =[];
	$.each(local_content.grilles[grille_id].competences, function(numco,competence) {
		$.each(competence.capacites, function(numca,capacite) {
			cap_tmp[numca] = [];
			cap_tmp_nb_coeff[numca] = [];
			graph_capa_label.push(numca);
		});
	});

	$.each(local_content.data.devoirs, function(numd,devoir) {
		if(devoir.notes[pupil_name]){
			$.each(devoir.capacites, function(numca,capacite) {
				cap_tmp[numca].push(100 * devoir.notes[pupil_name].capacites[numca]/capacite.max);
				cap_tmp_nb_coeff[numca].push(devoir.general.coefficient);
			});
		}
	});
	
	var cap_line = "";
	$.each(local_content.grilles[grille_id].competences, function(numco,competence) {
		$.each(competence.capacites, function(numca,capacite) {
			if(cap_tmp[numca].length>0){
				var capacite = getCapacite(numca);
				cap_line += "<tr>";
				cap_line += "<td style='color:"+capacite.competence.couleur+"'>"+numca+"</td>";
				cap_line += "<td>"+capacite.texte+"</td>";
			
				var cap_tmp_mean = 0;
				var cap_tmp_mean_nb_coeff = 0;
				for( var i = 0; i < cap_tmp[numca].length; i++ ){
					cap_tmp_mean += cap_tmp[numca][i] * cap_tmp_nb_coeff[numca][i];
					cap_tmp_mean_nb_coeff += cap_tmp_nb_coeff[numca][i];
				}
				cap_tmp_mean = Math.round(cap_tmp_mean/cap_tmp_mean_nb_coeff);
				cap_line += "<td>"+cap_tmp_mean+"%</td>";
				graph_capa_val.push(cap_tmp_mean);
				cap_line += "</tr>";
			}else{
				graph_capa_val.push(0);
			}
		});
	});
	$("#s5_pupil_details #s5_det_pup_capacites > tbody").append(cap_line);

	s5_det_pup_graph_cap = new Chart($("#s5_pupil_details #s5_det_pup_graph_cap"),{
		type: 'radar',
		data: {
			labels: graph_capa_label,
			datasets: [
				{
					label: "Moyenne",
					backgroundColor: "#36A2EB",
					borderColor: "#36A2EB",
					pointBackgroundColor: "#36A2EB",
					pointBorderColor: "#fff",
					pointHoverBackgroundColor: "#fff",
					pointHoverBorderColor: "#36A2EB",
					data: graph_capa_val
				}
			]
		},
		options: {
			responsive: true,
			animation: false,
			title: {
				display: true,
				text: "Bilan d'acquisition par capacité"
			},
			legend: {
				display: false,
				position: 'bottom',
			}
		}
	});
	
	$("#s5_pupil_details #s5_det_pup_notes").trigger("update");
	$("#s5_pupil_details #s5_det_pup_competences").tablesorter({
		theme : 'blue',
		sortList: [[0,0]],
		widthFixed: true,
		widgets: ["zebra", "filter", "columns"],
		dateFormat : "ddmmyyyy",
	});
	$("#s5_pupil_details #s5_det_pup_capacites").trigger("update");
	
	if(in_dialog == false)
	{
		$("#s5_pupil_details").show();
	}
}

var s5_stat_evol_notes_graph = null;
var s5_stat_rep_notes_graph = null;
var s5_stat_evol_comp_graph = null;
var s5_stat_bilan_comp_graph = null;
var s5_stat_bilan_capa_graph = null;
function updateStatSuivi(stat_id)
{
	var local_content = _content;
	if(_filteredContent){
		local_content = _filteredContent
	}
	
	var grille_id = local_content.data.general.grille.id;
	
	if(stat_id == "s5_stat_evol_notes"){
		if($("#s5_stat_evol_notes > table").attr("role") == "grid"){$("#s5_stat_evol_notes > table").trigger("destroy");}
		$("#s5_stat_evol_notes > table > tbody").html("");
		
		var graph_dates = [];
		var graph_means = [];
		var graph_min = [];
		var graph_max = [];
		
		var html_table ="";
		$.each(local_content.data.devoirs, function(numd,devoir) {
			html_table += "<tr><td>"+devoir.general.date.getDate()+'/'+(devoir.general.date.getMonth()+1)+'/'+devoir.general.date.getFullYear()+"</td>";
			html_table += "<td>"+devoir.general.titre+"</td>";
			html_table += "<td>"+devoir.general.stats.mean+"</td>";
			html_table += "<td>"+devoir.general.stats.min+"</td>";
			html_table += "<td>"+devoir.general.stats.max+"</td></tr>";
			
			graph_dates.push(devoir.general.date.getDate()+'/'+(devoir.general.date.getMonth()+1)+'/'+devoir.general.date.getFullYear());
			graph_means.push(devoir.general.stats.mean);
			graph_min.push(devoir.general.stats.min);
			graph_max.push(devoir.general.stats.max);
		});
		
		$("#s5_stat_evol_notes > table > tbody").append(html_table);
		$("#s5_stat_evol_notes > table").tablesorter({theme : 'blue', sortList: [[0,0]] ,widthFixed: true,dateFormat : "ddmmyyyy",});
		
		s5_stat_evol_notes_graph = new Chart($("#s5_stat_evol_notes_graph"), {
			type: 'line',
			
			data: {
				labels: graph_dates,
				datasets: [
				{
					label: "Minimum",
					data: graph_min,
					borderColor:"#FF6384",
					backgroundColor:"#FF6384",
					pointBorderColor:"#FF6384",
					pointBackgroundColor:"#FF6384",
					pointBorderWidth:"#FF6384",
					fill: false
				}, {
					label: "Moyenne",
					data: graph_means,
					borderColor:"#FFCE56",
					backgroundColor:"#FFCE56",
					pointBorderColor:"#FFCE56",
					pointBackgroundColor:"#FFCE56",
					pointBorderWidth:"#FFCE56",
					fill: false
				}, {
					label: "Maximum",
					data: graph_max,
					borderColor:"#4BC0C0",
					backgroundColor:"#4BC0C0",
					pointBorderColor:"#4BC0C0",
					pointBackgroundColor:"#4BC0C0",
					pointBorderWidth:"#4BC0C0",
					fill: false
				}]
			},
			options: {
				responsive: true,
				animation: false,
				title: {
					display: false,
					text: 'Evolution annuelle des notes de la classe'
				},
				legend: {
					display: true,
					position: 'bottom',
				},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true,
					}
				}],
			}
			}
		});
	}
	if(stat_id == "s5_stat_rep_notes"){
		if($("#s5_stat_rep_notes > table").attr("role") == "grid"){$("#s5_stat_rep_notes > table").trigger("destroy");}
		$("#s5_stat_rep_notes > table > tbody").html("");
		
		var graph_dates = [];
		var graph_25 = [];
		var graph_50 = [];
		var graph_75 = [];
		var graph_100 = [];
		
		var html_table ="";
		$.each(local_content.data.devoirs, function(numd,devoir) {
			html_table += "<tr><td>"+devoir.general.date.getDate()+'/'+(devoir.general.date.getMonth()+1)+'/'+devoir.general.date.getFullYear()+"</td>";
			html_table += "<td>"+devoir.general.titre+"</td>";
			
			var tmp_25 = 0;
			var tmp_50 = 0;
			var tmp_75 = 0;
			var tmp_100 = 0;
			
			$.each(devoir.notes, function(pupil,pupil_info) {
				
				if(pupil_info.note < devoir.general.bareme*0.25){
					tmp_25++;
				}else{
					if(pupil_info.note < devoir.general.bareme*0.5){
						tmp_50++;
					}else{
						if(pupil_info.note < devoir.general.bareme*0.75){
							tmp_75++;
						}else{
							tmp_100++;
						}
					}
				}
			});
			
			html_table += "<td>"+tmp_25+"</td><td>"+tmp_50+"</td><td>"+tmp_75+"</td><td>"+tmp_100+"</td>";
			
			graph_dates.push(devoir.general.date.getDate()+'/'+(devoir.general.date.getMonth()+1)+'/'+devoir.general.date.getFullYear());
			graph_25.push(tmp_25);
			graph_50.push(tmp_50);
			graph_75.push(tmp_75);
			graph_100.push(tmp_100);

		});
		
		$("#s5_stat_rep_notes > table > tbody").append(html_table);
		$("#s5_stat_rep_notes > table").tablesorter({theme : 'blue', sortList: [[0,0]] ,widthFixed: true,dateFormat : "ddmmyyyy",});
		
		s5_stat_rep_notes_graph = new Chart($("#s5_stat_rep_notes_graph"),{
			type: 'bar',
			data: {
				labels: graph_dates,
				datasets: [
					{
						label: "Q1",
						backgroundColor: "#FF6384",
						borderWidth: 1,
						data: graph_25,
					},{
						label: "Q2",
						backgroundColor: "#FFCE56",
						borderWidth: 1,
						data: graph_50,
					},{
						label: "Q3",
						backgroundColor: "#36A2EB",
						borderWidth: 1,
						data: graph_75,
					},{
						label: "Q4",
						backgroundColor: "#4BC0C0",
						borderWidth: 1,
						data: graph_100,
					}
				]
			},
			options: {
				title: {
					display: true,
					text: 'Evolution annuelle de la répartition des notes de la classe'
				},
				legend: {
					display: true,
					position: 'bottom',
				},
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero:true,
						},
						stacked: true,
					}],
					xAxes: [{
						stacked: true,
					}]
				},
				animation: false
			}
		});
		
	}
	if(stat_id == "s5_stat_evol_comp"){
		$("#s5_stat_evol_comp > table").remove();
		
		var graph_dates = [];
		var graph_comp_tmp = [];
		var graph_comp = [];
		
		var html_table = "<table>";
		html_table += '<thead><tr><th data-date-format="ddmmyyyy" data-sorter="shortDate" data-sortinitialorder="desc">Date</th><th>Devoir</th>';
		
		$.each(local_content.grilles[grille_id].competences, function(numco,competence) {
			html_table += "<th>"+competence.titre+"</th>";
			graph_comp_tmp[numco] = new Array();
		});
		html_table += "</tr></thead><tbody>";

		$.each(local_content.data.devoirs, function(numd,devoir) {
			html_table += "<tr><td>"+devoir.general.date.getDate()+'/'+(devoir.general.date.getMonth()+1)+'/'+devoir.general.date.getFullYear()+"</td>";
			html_table += "<td>"+devoir.general.titre+"</td>";
			
			graph_dates.push(devoir.general.date.getDate()+'/'+(devoir.general.date.getMonth()+1)+'/'+devoir.general.date.getFullYear());
			
			$.each(local_content.grilles[grille_id].competences, function(numco,competence) {
			
				var competence_moyenne = 0;
				var competence_nb = 0;
			
				$.each(devoir.capacites, function(numca,capacite) {
					if(competence.capacites[numca]){
						competence_moyenne+= capacite.stats["moyenne100"];
						competence_nb++;
					}
				});
				
				if(competence_nb!=0){
					competence_moyenne = Math.round(competence_moyenne / competence_nb);
					html_table += "<td style='color:"+competence.couleur+"'>"+competence_moyenne+"%</td>";
				}else{
					html_table += "<td style='color:"+competence.couleur+"'>-</td>";
				}
				graph_comp_tmp[numco].push(competence_moyenne);
			});
			html_table += "</tr>";
		});
		
		$.each(local_content.grilles[grille_id].competences, function(numco,competence) {
			graph_comp.push({
				label: competence.titre,
				data: graph_comp_tmp[numco],
				borderColor:competence.couleur,
				backgroundColor:competence.couleur,
				pointBorderColor:competence.couleur,
				pointBackgroundColor:competence.couleur,
				pointBorderWidth:competence.couleur,
				fill: false,
				spanGaps: false
			});
		});

		html_table += "</tbody></table>";
		
		$("#s5_stat_evol_comp").prepend(html_table);
		$("#s5_stat_evol_comp > table").tablesorter({theme : 'blue', sortList: [[0,0]],widthFixed: true,dateFormat : "ddmmyyyy",});
		
		s5_stat_evol_comp_graph = new Chart($("#s5_stat_evol_comp_graph"), {
			type: 'line',
			data: {
				labels: graph_dates,
				datasets: graph_comp
			},
			options: {
				responsive: true,
				animation: false,
				title: {
					display: false,
					text: 'Evolution annuelle des notes de la classe'
				},
				legend: {
					display: true,
					position: 'bottom',
				},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true,
						min:0,
						max:100
					}
				}],
			}
			}
		});
	}
	if(stat_id == "s5_stat_bilan_comp"){
		
		var s5_stat_bilan_comp_labels = [];
		var s5_stat_bilan_comp_colors = [];
		var s5_stat_bilan_comp_moyenne100 = [];
		
		$.each(_content.grilles[_content.data.general.grille.id].competences, function(competence_id,competence) {
			var comp_moyenne100 = 0;
			var comp_moyenne100_nb = 0;
			$.each(competence.capacites, function(capacite_id,capacite_texte) {
				$.each(local_content.data.devoirs, function(numd,devoir) {
					if(devoir.capacites[capacite_id] != null){
						comp_moyenne100 += devoir.capacites[capacite_id].stats["moyenne100"] * devoir.general.coefficient;
						comp_moyenne100_nb += devoir.general.coefficient;
					}
				});
			});
			s5_stat_bilan_comp_labels.push(competence.titre);
			s5_stat_bilan_comp_colors.push(competence.couleur);
			if(comp_moyenne100_nb > 0){
				s5_stat_bilan_comp_moyenne100.push(Math.round(comp_moyenne100/comp_moyenne100_nb));
			}else{
				s5_stat_bilan_comp_moyenne100.push(0);
			}
		});

		s5_stat_bilan_comp_graph = new Chart($("#s5_stat_bilan_comp_graph"),{
			type: 'bar',
			data: {
				labels: s5_stat_bilan_comp_labels,
				datasets: [
					{
						label: "% d'acquisition",
						backgroundColor: s5_stat_bilan_comp_colors,
						borderColor: s5_stat_bilan_comp_colors,
						borderWidth: 1,
						data: s5_stat_bilan_comp_moyenne100,
					}
				]
			},
			options: {
				title: {
					display: true,
					text: 'Moyenne d\'acquisition des compétences'
				},
				legend: {
					display: false,
					position: 'bottom',
				},
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero:true,
							min:0,
							max:100
						}
					}],
				},
				animation: false
			}
		});
	}
	//Bilan d'utilisation des capacités
	if(stat_id == "s5_stat_bilan_capa"){
		//FIrst destroy the table and reinit it
		if($("#s5_stat_bilan_capa > table").attr("role") == "grid"){
			$("#s5_stat_bilan_capa > table").trigger("destroy");
		}
		$("#s5_stat_bilan_capa > table > tbody").html("");
		//var that will be used to display the graph
		var graph_colors = [];
		var graph_capacite_text = [];
		var graph_capacite_id = [];
		var graph_capacite_val = [];
		var graph_capacite_mean = [];
		var capacite_total_val = 0;
		
		var html_table ="";
		var capacite_is_used = false;
		var capacite_val = 0;
		var capacite_mean = 0;
		var capacite_nb_coeff = 0;
		//Browe all competences and all capacites of the grill (even unused ones)
		$.each(local_content.grilles[grille_id].competences, function(numco,competence) {
			$.each(competence.capacites, function(numca,capacite) {
				//Init usage to 0
				capacite_val = 0;
				capacite_mean = 0;
				capacite_nb_coeff = 0;
				//Now browse all devoirs to look for usage of this capacite
				$.each(local_content.data.devoirs, function(numd,devoir) {
					//If this capcite is used in the devoir
					if(devoir.capacites[numca]){
						//Add the amount of points used in the devoir
						capacite_val += devoir.capacites[numca].max * devoir.general.coefficient;
						capacite_mean += devoir.capacites[numca].stats["moyenne100"] * devoir.general.coefficient;
						capacite_nb_coeff += devoir.general.coefficient;
						//Add in the total (used to compute the ratio at the end)
						capacite_total_val += devoir.capacites[numca].max * devoir.general.coefficient;
						//Memorize that the capacite has been used at least one time
						capacite_is_used = true;
					}
				});
				if(capacite_is_used == true){
					//memorize their colors and their IDs
					graph_colors.push(competence.couleur);
					graph_capacite_text.push(capacite);
					graph_capacite_id.push(numca);
					//Init usage to 0
					graph_capacite_val.push(capacite_val);
					capacite_mean = Math.round(capacite_mean/capacite_nb_coeff);
					graph_capacite_mean.push(capacite_mean);
					//Reset capacite used
					capacite_is_used = false;
				}
			});
		});
		//Build the array with the several values computed before
		$.each(graph_capacite_id, function(num,capacite_id) {
			html_table += "<tr><td><div style='font-weight:bold;font-size:1.2em;color:"+graph_colors[num]+"'>"+capacite_id+"</div><div style='font-size:0.8em;color:#666'>"+graph_capacite_text[num]+"</div></td>";
			html_table += "<td>"+graph_capacite_mean[num]+"%</td>";
			html_table += "<td>"+graph_capacite_val[num]+"</td>";
			if(capacite_total_val!=0){
				html_table += "<td>"+Math.round(100*graph_capacite_val[num]/capacite_total_val)+"%</td></tr>";
			}else{
				html_table += "<td>-</td></tr>";
			}
		});
		//Create the final table and transform it to tablesorter
		$("#s5_stat_bilan_capa > table > tbody").append(html_table);
		$("#s5_stat_bilan_capa > table").tablesorter({theme : 'blue', sortList: [[0,0]],widthFixed: true,dateFormat : "ddmmyyyy",});
		
		s5_stat_bilan_capa_graph = new Chart($("#s5_stat_bilan_capa_graph"),{
			type: 'doughnut',
			data: {
				labels: graph_capacite_id,
				datasets: [{
						data: graph_capacite_val,
						backgroundColor: graph_colors,
						borderWidth:0,
						label: 'My dataset' // for legend
					}],
			},
			options: {
				responsive: true,
				//animation: false,
				animation: {
					duration: 500,
					easing: "easeOutQuart",
					onComplete: function () {
					  var ctx = this.chart.ctx;
					  ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontFamily, 'normal', Chart.defaults.global.defaultFontFamily);
					  ctx.textAlign = 'center';
					  ctx.textBaseline = 'bottom';
					  var datalabels = this.data.labels;
					  this.data.datasets.forEach(function (dataset) {

						for (var i = 0; i < dataset.data.length; i++) {
						  var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
							  total = dataset._meta[Object.keys(dataset._meta)[0]].total,
							  mid_radius = model.innerRadius + (model.outerRadius - model.innerRadius)/2,
							  start_angle = model.startAngle,
							  end_angle = model.endAngle,
							  mid_angle = start_angle + (end_angle - start_angle)/2;

						  var x = mid_radius * Math.cos(mid_angle);
						  var y = mid_radius * Math.sin(mid_angle);

						  ctx.fillStyle = '#fff';
						  if (i == 3){ // Darker text color for lighter background
							ctx.fillStyle = '#444';
						  }
						  var percent = String(Math.round(dataset.data[i]/total*100)) + "%";
						  ctx.fillText(datalabels[i], model.x + x, model.y + y);
						  // Display percent in another line, line break doesn't work for fillText
						  ctx.fillText(percent, model.x + x, model.y + y + 15);
						}
					  });               
					}
				  },
				title: {
					display: false,
					text: 'Proportion vs. moyenne'
				},
				legend: {
					display: false,
					position: 'bottom',
				}
			}
		});
	}
	
}
/*************************/
/*	VARIOUS SECTION	*/
/*************************/
/* Function in charge of migrating data in the data model has changed between version */
function migrateSuivi()
{
	var has_migrate = false;
	
	//Migration pour la version 0.6 (traitement des unknown)
	if(_content.meta.version < 0.71)
	{
		console.log("Migration pour traitement des coefficients de note.")
		//On ne migre que s'il y a des devoirs importés
		if(Object.keys(_content.data.devoirs).length != 0){
			
			console.log("Des devoirs doivent être migrés ("+Object.keys(_content.data.devoirs).length+" devoirs).");
			
			has_migrate = true;
			alert("Une migration des données doit être réalisée. A la fin de la migration, il est conseillé d'enregistrer le document dans un nouveau fichier.");

			$.each(_content.data.devoirs, function(numd,devoir) {
				devoir.general.coefficient = 1;
			});
		}
	}
	//Update to last version
	_content.meta.version = _version;
	//Migration is finisehd
	if(has_migrate == true){
		console.log("Migration terminée !");
	}
	//Memorize that document is modified
	toggleDocumentEdition(true);
}