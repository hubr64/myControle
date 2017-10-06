/* Function in charge of loading the new grille selected by the user
   @input grille_id : a unique identifier for the grille
   @input grille_title : the name of the grille
   @return : nothing
*/
function loadGrille(grille_id, grille_titre)
{
	//If a grille is already selected then get its id and reinit the several variables related to it
	var old_grille_id = null;
	if(_content.data.general.grille){
		old_grille_id = _content.data.general.grille.id;
		_content.grilles = {};
		_content.grilles[_content.data.general.grille.id] = _grilles[_content.data.general.grille.id];
	}
	//There was no grid selected and no new grid (should not happen)
	if(old_grille_id == null && grille_id == null){
		_content.data.general.grille = {id:grille_id, titre:grille_titre, capacites:{}};
		_content.grilles = {};
		_content.grilles[_content.data.general.grille.id] = _grilles[_content.data.general.grille.id];
	}
	//There was no grid and a new grid is selected
	if(old_grille_id == null && grille_id != null){
		_content.data.general.grille = {id:grille_id, titre:grille_titre, capacites:{}};
		_content.grilles = {};
		_content.grilles[_content.data.general.grille.id] = _grilles[_content.data.general.grille.id];
		reinitCompetences();
	}
	//There was an old grid and a new and different one is selected
	if(old_grille_id != null && grille_id != null && grille_id != old_grille_id){
		//ASk confirmation before replacement
		if(confirm("Une grille de compétences a déjà été utilisée. Êtes vous sûr de vouloir en choisir une nouvelle (et perdre toutes les capacités assignées aux critères) ?"))
		{
			_content.data.general.grille = {id:grille_id, titre:grille_titre, capacites:{}};
			_content.grilles = {};
			_content.grilles[_content.data.general.grille.id] = _grilles[_content.data.general.grille.id];
			reinitCompetences();
		}else{
			return;
		}
	}
	//Load in MMI all the competences and capacites of the new grid
	loadCompetences();

	//Memorize that document is modified
	toggleDocumentEdition(true);
}
/* Function in charge of reseting all capacites used in criteria in the devoir */
function reinitCompetences()
{
	//Browse all exercises
	$.each(_content.data.exercices, function(nume,exercice) {
		//Free text are not under competences
		if(exercice.type!="free"){
			//Browse all questions
			$.each(exercice.questions, function(numq,question) {
				//Free text are not under competences
				if(question.type!="free"){
					//Browse all criteria
					$.each(question.criteres, function(numc,critere) {
						//Free text are not under competences
						if(critere.type!="free"){
							//Empty the competence assignated (precisly assign NO_COMPETENCE)
							_content.data.exercices[nume]["questions"][numq]["criteres"][numc].competence = NO_COMPETENCE;
						}
					});
				}
			});
		}
    });
	//Replace all competences in MMI to the value NO_COMPETENCE
	$("#s1_det .cri_competence > span").html(NO_COMPETENCE);

	//Memorize that document is modified
	toggleDocumentEdition(true);
}
/* Function in charge of loading in MMI all information related to the competences and capacites defined for the devoir */
function loadCompetences()
{
	//Load the competences only if a grid is correctly defined
	if(_content.data.general.grille && _content.data.general.grille.id)
	{
		//Display the name of the grid and add a button to consult the grid definition
		$('#gen_competence > span:nth-child(2)').html(_content.data.general.grille.titre);
		$("#gen_competence > span:nth-child(3)").show();
		//Build the grid definition in a dedicated window
		buildCompetencesMenu();
		//Look for competences/capacites that are used in criteria and compute the stats for these selected capacites
		updateSelectedCompetences();
	}
}
/* Function in charge of building the grid definition in a dedicated window */
function buildCompetencesMenu()
{
	//Initialize the window content
	$( "#s4" ).html("");
	//Browse all competences
	$.each(_content.grilles[_content.data.general.grille.id].competences, function(competence_id,competence) {
		//Add a title for the competence name
		$( "#s4" ).append("<div style='border-color:"+competence.couleur+"'><h2 style='background-color:"+competence.couleur+"'>"+competence.titre+"</h2></div>");
		//Browse all capacites
		$.each(competence.capacites, function(capacite_id,capacite_texte) {
			//Add a box for each capacite with id and name
			$( "#s4 > div:last-child" ).append("<div capacite_id="+capacite_id+"><span style='color:"+competence.couleur+"'>"+capacite_id+"</span><span>"+capacite_texte+"</span></div>");
		});
	});
}
/* Function in charge of returning all information related to a given capacite
   @input current_capacite_id : the capacite to get information
   @return : the information on the desired capacite
*/
function getCapacite(current_capacite_id)
{
	var capacite = null;
	//If a grid is correctly defined
	if(_content.data.general.grille && _content.data.general.grille.id){
		$.each(_content.grilles[_content.data.general.grille.id].competences, function(competence_id,competence) {
			$.each(competence.capacites, function(capacite_id,capacite_texte) {
				//Yes, I've found the desired capacite then build the object with all usefull informations
				if(current_capacite_id==capacite_id){
					capacite = {id:current_capacite_id, texte: capacite_texte, competence: {id:competence_id,couleur:competence.couleur,titre:competence.titre}} ;
				}
			});
		});
	}
	return capacite;
}
/* Function in charge of swhoing the window that display the grid definition of the devoir */
function seeCompetences()
{
	//Display only if a grid is correclty defined
	if(_content.data.general.grille && _content.data.general.grille.id){

		var dialog = $( "#s4" ).dialog({
			autoOpen: false,
			modal: true,
			closeText: "Fermer",
			title: "Liste des compétences et capacités pour "+_content.data.general.grille.titre,
			width:"90%",
			buttons: {
				Fermer: function() {
					dialog.dialog( "close" );
				}
			},
			close: function() {
				dialog.dialog( "close" );
			}
		});
		dialog.dialog( "open" );
	}else{
		error_message('Aucune grille de compétence choisie !');
	}
}
/* Function in charge of attributing a capacite to a given criteria
   @input $cri : the criteria that will be linked with a given capacite
*/
function chooseCompetence($cri)
{
	//If a grid is correctly defined
	if(_content.data.general.grille && _content.data.general.grille.id){

		var dialog;
		//Define the action when a capacite is selected (it will be linked in the criteria)
		$( "#s4 > div > div" ).click(function(event) {
			//Add the id of the capacite in the devoir edition at the given criteria
			$cri.find(".cri_competence > span").html($(this).children("span:first-child").html());
			//Set the capacite color to the right color
			$cri.find(".cri_competence > span").css("color",$(this).children("span:first-child").css("color"));
			//Set the title to the capacite definition (give user more info that the ID can not explain)
			$cri.find(".cri_competence > span").attr("title",$(this).children("span:last-child").html());
			//Save this modification in the global var _content (wait a bit to be sure that the MMI is fully modified)
			setTimeout("saveEdition()",10);
			//Close the window
			dialog.dialog( "close" );
			$( "#s4 > div > div" ).unbind( "click" );
		});
		//Display the grid definition
		dialog = $( "#s4" ).dialog({
			autoOpen: false,
			modal: true,
			closeText: "Fermer",
			title: "Liste des compétences pour "+_content.data.general.grille.titre,
			width:"90%",
			buttons: {
				Fermer: function() {
					dialog.dialog( "close" );
				}
			},
			close: function() {
				dialog.dialog( "close" );
			}
		});
		dialog.dialog( "open" );
	}else{
		error_message('Aucune grille de compétence choisie !');
	}
}
/* Function in charge of highlighting selected capacites in the grid definition window and
   compute stats for each selected capacite */
function updateSelectedCompetences()
{
	//First reinit the grid definition window to unselect all caapcites
	$("#s4 > div > div").removeAttr("selected");
	//EMpty the capacites stat sum up box
	$("#s1_gen_competence tbody").html("");
	//Browse all capacites used in the devoir
	$.each(_content.data.general.grille.capacites, function(capacite_id,capacite_num) {
		//Highlight this capacite in the grid definition
		$("#s4 div[capacite_id="+capacite_id+"]").attr("selected","selected");
		//Compute the number of points given at this capacite in the whole devoir (browse all criteria with this competence)
		var competence_bareme = 0;
		$.each(_content.data.exercices, function(nume,exercice) {
			if(exercice.type!="free"){
				$.each(exercice.questions, function(numq,question) {
					if(question.type!="free"){
						$.each(question.criteres, function(numc,critere) {
							if(critere.type!="free"){
								if(critere.competence == capacite_id){
									competence_bareme += critere.bareme;
								}
							}
						});
					}
				});
			}
		});
		//Display a sum up of the capacite through the whole devoir
		$("#s4 div[capacite_id="+capacite_id+"]").attr("title","Sélectionné "+capacite_num+" fois pour un total de "+competence_bareme+" point(s)");
	});

	//Get all stats for the function in charge of computing the stats for all capacites in the devoir
	var capacites_bareme = computeCompetencesStats();
	//Browse all capacites used in the devoir

	if(_content.data.general.grille && _content.data.general.grille.id){
		$.each(_content.grilles[_content.data.general.grille.id].competences, function(competence_id,competence) {
			$.each(competence.capacites, function(capacite_id,capacite_texte) {
				//Get all usefull info on this capacite (from grid definition)
				var capacite = getCapacite(capacite_id);
				if(capacite){
					if(_content.data.general.grille.capacites[capacite_id]){
						$("#s1_gen_competence tbody").append("<tr><td style='color:"+capacite.competence.couleur+"'>"+capacite.id+"</td><td>"+capacites_bareme[capacite_id].stats["acquis"]+"<div>"+capacites_bareme[capacite_id].stats["acquis100"]+"%</div></td><td>"+capacites_bareme[capacite_id].stats["encours"]+"<div>"+capacites_bareme[capacite_id].stats["encours100"]+"%</div></td><td>"+capacites_bareme[capacite_id].stats["nonacquis"]+"<div>"+capacites_bareme[capacite_id].stats["nonacquis100"]+"%</div></td><td>"+capacites_bareme[capacite_id].stats["moyenne"]+"/"+capacites_bareme[capacite_id].max+" pts<div>"+capacites_bareme[capacite_id].stats["moyenne100"]+"%</div></td></tr>");
					}
				}
			});
		});
	}
}

/* Function in charge of computing ll stats about competences and capacites in the devoir
   @input tmp_content : an optional content to compute stats instead of the current global car _content
   @return : the full stats of the competences/capacites
*/
function computeCompetencesStats(tmp_content)
{
	//CHeck if stats must be computed on global var _content or on given parameter
	var local_content = tmp_content
	if(tmp_content == null){
		local_content = _content;
	}

	//The object that will be returned with all usefull stats
	var capacites_bareme = {};
	//A temporary object that will be used to compute the notes of a pupil on the devoir to compute after the notes on capacites
	//This object is an array indexed with capacite IDs
	var capacites_eleve = {};

	//FIrst initialize the stats array with the used capacites in the devoir (only these ones not all capacites of the grid)
	$.each(local_content.data.general.grille.capacites, function(capacite_id,capacite_num) {
		capacites_bareme[capacite_id] = { max: 0, notes: [], stats:{"encours":0, "encours100":0, "acquis":0, "acquis100":0,"nonacquis":0,"nonacquis100":0, "moyenne":0} };
		capacites_eleve[capacite_id] = null;
	});

	// Now we will compute the maximum value for each capacite used in the devoir

	//Now browse the whole devoir to compute the maximum possible value of criteria (sum of bareme defined to criteria that used capacites)
	$.each(local_content.data.exercices, function(nume,exercice) {
		//Free text don't have capacites
		if(exercice.type!="free"){
			$.each(exercice.questions, function(numq,question) {
				//Free text don't have capacites
				if(question.type!="free"){
					$.each(question.criteres, function(numc,critere) {
						//Free text don't have capacites
						if(critere.type!="free"){
							//If a capacite is defined
							if(local_content.data.exercices[nume]["questions"][numq]["criteres"][numc].competence != NO_COMPETENCE){
								//Add the criteria bareme to the max value of the capacite linked with this criteria
								capacites_bareme[local_content.data.exercices[nume]["questions"][numq]["criteres"][numc].competence].max += local_content.data.exercices[nume]["questions"][numq]["criteres"][numc].bareme;
							}
						}
					});
				}
			});
		}
    });

	//Now we will compute the notes for each pupil for each capacites in the devoir

	//If a classe has been defined in this devoir
	if(local_content.data.general.classe != NO_CLASSE){
		//Get all pupils of this classe
		$.each(local_content.classes["_"+local_content.data.general.classe], function(num,pupil) {
			//If this pupil has notes (a pupil is in a class and a class is linked with the devoir but the notation phase has not begin)
			if(local_content.data.notes[pupil]){
				//Now browse the whiole devoir to look for the notes of the pupils and thus to know the notes for each capacites
				$.each(local_content.data.exercices, function(nume,exercice) {
					//Free text don't have notes
					if(exercice.type!="free" && local_content.data.notes[pupil].exercices && local_content.data.notes[pupil].exercices[nume]){
						$.each(exercice.questions, function(numq,question) {
							//Free text don't have notes
							if(question.type!="free" && local_content.data.notes[pupil].exercices[nume]["questions"] && local_content.data.notes[pupil].exercices[nume]["questions"][numq]){
								$.each(question.criteres, function(numc,critere) {
									//Free text don't have notes
									if(critere.type!="free" && local_content.data.notes[pupil].exercices[nume]["questions"][numq]["criteres"] && local_content.data.notes[pupil].exercices[nume]["questions"][numq]["criteres"][numc]){
										//If the capacite was never used then initialised it
										if(capacites_eleve[local_content.data.exercices[nume]["questions"][numq]["criteres"][numc].competence] == null){
											capacites_eleve[local_content.data.exercices[nume]["questions"][numq]["criteres"][numc].competence] = 0;
										}
										//Everythins is OK so a state has been given to the criteria and a note can then be computed
										if(local_content.data.notes[pupil].exercices[nume]["questions"][numq]["criteres"][numc].state == "ok"){
											capacites_eleve[local_content.data.exercices[nume]["questions"][numq]["criteres"][numc].competence] += local_content.data.exercices[nume]["questions"][numq]["criteres"][numc].bareme;
										}
										if(local_content.data.notes[pupil].exercices[nume]["questions"][numq]["criteres"][numc].state == "encours"){
											capacites_eleve[local_content.data.exercices[nume]["questions"][numq]["criteres"][numc].competence] += local_content.data.exercices[nume]["questions"][numq]["criteres"][numc].bareme * global_configurations["coeff_capacite_encours"];
										}
									}
								});
							}
						});
					}
				});
				//Browse the used capacites in the devoir (only these ones not all capacites of the grid)
				$.each(local_content.data.general.grille.capacites, function(capacite_id,capacite_num) {
					if(capacites_eleve[capacite_id] != null){
						//Add the note obtained by this pupil in the list of notes of the capacite
						capacites_bareme[capacite_id].notes.push(capacites_eleve[capacite_id]);
						//Go back to zero to compute for the next pupil
						capacites_eleve[capacite_id] = null;
					}
				});
			}
		});
	}

	//According to max and to all computed notes of each pupils for each capacity, compute the stats for each capacite

	//Browse the used capacites in the devoir (only these ones not all capacites of the grid)
	$.each(local_content.data.general.grille.capacites, function(capacite_id,capacite_num){
		//If at least one note exists for this capacite
		if(capacites_bareme[capacite_id].notes.length > 0)
		{
			//Compute stat from notes for this capacite
			$.each(capacites_bareme[capacite_id].notes, function(num,note) {
				if(note >= global_configurations["coeff_capacite_acquis"] * capacites_bareme[capacite_id].max){
					capacites_bareme[capacite_id].stats["acquis"]++;
				}else{
					if(note >= global_configurations["coeff_capacite_encours"] * capacites_bareme[capacite_id].max){
						capacites_bareme[capacite_id].stats["encours"]++;
					}else{
						capacites_bareme[capacite_id].stats["nonacquis"]++;
					}
				}
				capacites_bareme[capacite_id].stats["moyenne"]+=note;
			});
			//Finalize stats with the computation of the final mean and the percent values
			capacites_bareme[capacite_id].max = Number((capacites_bareme[capacite_id].max).toFixed(2));
			capacites_bareme[capacite_id].stats["moyenne"] = Number((capacites_bareme[capacite_id].stats["moyenne"]/capacites_bareme[capacite_id].notes.length).toFixed(2));
			if(capacites_bareme[capacite_id].max!=0){
				capacites_bareme[capacite_id].stats["moyenne100"] = Math.round(100*capacites_bareme[capacite_id].stats["moyenne"]/capacites_bareme[capacite_id].max);
			}else{
				capacites_bareme[capacite_id].stats["moyenne100"] = 100;
			}
			capacites_bareme[capacite_id].stats["acquis100"] = Math.round(100*capacites_bareme[capacite_id].stats["acquis"]/capacites_bareme[capacite_id].notes.length);
			capacites_bareme[capacite_id].stats["encours100"] = Math.round(100*capacites_bareme[capacite_id].stats["encours"]/capacites_bareme[capacite_id].notes.length);
			capacites_bareme[capacite_id].stats["nonacquis100"] = Math.round(100*capacites_bareme[capacite_id].stats["nonacquis"]/capacites_bareme[capacite_id].notes.length);
		//No notes defined thus can not determine the stats
		}else{
			capacites_bareme[capacite_id].stats = {"encours":"?", "encours100":"?", "acquis":"?", "acquis100":"?","nonacquis":"?","nonacquis100":"?", "moyenne":"?"};
		}
	});
	return capacites_bareme;
}
/* Function in charge of displaying the sum up of capacites for the selected pupil
   @input pupil_name : the name of the pupil to display capacites
   @input pupil_name : the name of the pupil to display capacites
   @return : an object with a html string and a another object with all competences of the pupil
*/
function getPupilCompetence(pupil_name)
{
	var pupil_competences = {html:"",list:{}};
	//If a grid is correctly defined
	if(_content.data.general.grille && _content.data.general.grille.id)
	{
		//First initialise the temp array of capacities used in the devoirs with null
		var capacites_eleve = {};
		$.each(_content.data.general.grille.capacites, function(capacite_id,capacite_num) {
			capacites_eleve[capacite_id] = null;
		});
		//If the selected pupil has at least one note defined (can have no note if the notation of this pupil has not begun or if only unknown state are defined)
		if (_content.data.notes[pupil_name]) {
			$.each(_content.data.exercices, function(nume,exercice) {
				//Free text don't have notes
				if(exercice.type!="free"){
					$.each(exercice.questions, function(numq,question) {
						//Free text don't have notes
						if(question.type!="free"){
							$.each(question.criteres, function(numc,critere) {
								//Free text don't have notes
								if(critere.type!="free"){
									//Do several check to be sure that a state is defined for this criteria for this pupil
									if(_content.data.notes[pupil_name].exercices && _content.data.notes[pupil_name].exercices[nume]){
										if(_content.data.notes[pupil_name].exercices[nume]["questions"] && _content.data.notes[pupil_name].exercices[nume]["questions"][numq]){
											if(_content.data.notes[pupil_name].exercices[nume]["questions"][numq]["criteres"] && _content.data.notes[pupil_name].exercices[nume]["questions"][numq]["criteres"][numc]){
												//If the capacite was never used then initialised it
												if(capacites_eleve[_content.data.exercices[nume]["questions"][numq]["criteres"][numc].competence] == null){
													capacites_eleve[_content.data.exercices[nume]["questions"][numq]["criteres"][numc].competence] = 0;
												}
												//Everythins is OK so a state has been given to the criteria and a note can then be computed
												if(_content.data.notes[pupil_name].exercices[nume]["questions"][numq]["criteres"][numc].state == "ok"){
													capacites_eleve[_content.data.exercices[nume]["questions"][numq]["criteres"][numc].competence] += _content.data.exercices[nume]["questions"][numq]["criteres"][numc].bareme;
												}
												if(_content.data.notes[pupil_name].exercices[nume]["questions"][numq]["criteres"][numc].state == "encours"){
													capacites_eleve[_content.data.exercices[nume]["questions"][numq]["criteres"][numc].competence] += _content.data.exercices[nume]["questions"][numq]["criteres"][numc].bareme * global_configurations["coeff_capacite_encours"];
												}
											}
										}
									}
								}
							});
						}
					});
				}
			});
			//Get the global stats for all capacites used in the devoir
			var capacites_bareme = computeCompetencesStats();

			//If at least one capacite has been used in the devoir
			if(Object.keys(capacites_bareme).length!=0){

				//Browse all competences
				$.each(_content.grilles[_content.data.general.grille.id].competences, function(competence_id,competence) {
					//Browse all capacites
					var pupil_competence_capacites = {};
					var pupil_competence_capacites_text = "";
					var pupil_competence_capacites_nb = 0;
					var pupil_competence_max = 0;
					var pupil_competence_moyenne = 0;
					var pupil_competence_note = 0;
					$.each(competence.capacites, function(capacite_id,capacite_texte) {
						//If this capacite is evaluated for that pupil
						if(capacites_eleve[capacite_id] != null){
							//Compute the comment according to the pupil note and the capacite max value
							var capacite_comment = "nonacquis";
							if(capacites_eleve[capacite_id] >= global_configurations["coeff_capacite_encours"] * capacites_bareme[capacite_id].max){capacite_comment = "encours"};
							if(capacites_eleve[capacite_id] >= global_configurations["coeff_capacite_acquis"] * capacites_bareme[capacite_id].max){capacite_comment = "acquis"};
							pupil_competence_capacites_text += "<div class='s1_det_competence_capa'><span style='color:"+competence.couleur+"'>"+capacite_id+"</span><span>"+TEXTE_CAPACITE[capacite_comment]+"</span><span>("+capacites_eleve[capacite_id]+"/"+capacites_bareme[capacite_id].max+" points - Moyenne : "+capacites_bareme[capacite_id].stats["moyenne"]+" points)</span><span>"+capacite_texte+"</span></div>";

							pupil_competence_note += capacites_eleve[capacite_id];
							pupil_competence_max += capacites_bareme[capacite_id].max;
							pupil_competence_moyenne += capacites_bareme[capacite_id].stats["moyenne"];
							pupil_competence_capacites_nb++;

							pupil_competence_capacites[capacite_id] = {state: capacite_comment, note: capacites_eleve[capacite_id], max: capacites_bareme[capacite_id].max, mean: capacites_bareme[capacite_id].stats["moyenne"]};
						}
					});

					if(pupil_competence_capacites_nb!=0){
						pupil_competence_moyenne = Number((pupil_competence_moyenne / pupil_competence_capacites_nb).toFixed(2));
						var competence_comment = "nonacquis";
						if(pupil_competence_note >= global_configurations["coeff_capacite_encours"] * pupil_competence_max){competence_comment = "encours"};
						if(pupil_competence_note >= global_configurations["coeff_capacite_acquis"] * pupil_competence_max){competence_comment = "acquis"};
						pupil_competences.html += "<div><span style='color:"+competence.couleur+"'>"+competence.titre+"</span><span>"+TEXTE_CAPACITE[competence_comment]+"</span><span>("+pupil_competence_note+"/"+pupil_competence_max+" points - Moyenne : "+pupil_competence_moyenne+" points)</span><span></span></div>";
						pupil_competences.html += pupil_competence_capacites_text;

						pupil_competences.list[competence_id] = {state:competence_comment, note: pupil_competence_note, max: pupil_competence_max, mean: pupil_competence_moyenne, capacites: pupil_competence_capacites};
					}
				});

			}else{
				pupil_competences.html = "Aucune capacité n'a été mise en oeuvre dans ce devoir ! Veuillez d'abord attribuer au moins une capacité pour consulter l'avancement de leur acquisition.";
			}
		}else{
			pupil_competences.html = "L'élève n'a pas été évalué sur au moins une compétence !";
		}
	}else{
		pupil_competences.html = 'Aucune grille de compétence choisie !';
	}

	return pupil_competences;
}