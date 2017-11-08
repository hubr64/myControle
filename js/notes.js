/******************************************/
/* LOAD THE ARRAY WITH THE DEVOIR CONTENT */
/******************************************/

/* Function in charge of reseting all pupils and all notes in the MMI */
function reinitNotes()
{
	//Remove all pupils but keep the line with the global bareme
	$("#s1_note > table > thead").html("<tr><th></th></tr><tr><th></th></tr><tr><th>"+_content.data.general.bareme+" pts</th></tr>");
	//Remove all notes
	$("#s1_note > table > tbody").html("");
}
/* Function in charge of loading the note from the global var _content into the MMI */
function loadNotes()
{
	//First remove all existing notes of the MMI
	reinitNotes();
	
	//Then browse the whole devoir to construst the array structure in the MMi
	//Browse all exercises in the devoir
	$.each(_content.data.exercices, function(nume,exercice) {
		//Free texts do not have notes
        if(exercice.type=="free"){
        }else{
			//Add a line for the exercise (title and bareme only)
            $("#s1_note > table > tbody").append('<tr id="exe'+nume+'" class="exe_notes"><td><span>'+exercice.title+'</span><span>'+exercice.bareme+' pts</span></td></tr>');
            //Then browse all questions of the current exercise
			$.each(exercice.questions, function(numq,question) {
                //Free texts do not have notes
				if(question.type=="free"){  
                }else{
					//Add a line for the question (title and bareme only)
					$("#s1_note > table > tbody").append('<tr id="exe'+nume+'_que'+numq+'" class="que_notes"><td><span>'+question.title+'</span><span>'+question.bareme+' pts</span></td></tr>');
                    //Then browse all criteria of the current question
					$.each(question.criteres, function(numc,critere) {
                        //Free texts do not have notes
						if(critere.type=="free"){
                        }else{
							$("#s1_note > table > tbody").append('<tr id="exe'+nume+'_que'+numq+'_cri'+numc+'" class="cri_notes"><td><span>'+critere.text+'</span><span>'+critere.bareme+' pts</span></td></tr>');
						}
                    });
                }
            });
        }
    });
	
	//Get all pupils of the class and if there are pupils then add the notes for each pupil
	var pupils = _content.classes["_"+_content.data.general.classe];
    if(pupils != null){
        $.each(pupils, function(num,pupil) {
            addNotePup(pupil);
        });
    }
	
	//Adapt the width of the MMI according to the number of pupils
	$("#s1_note").css("width",500 + 50 * pupils.length);
	
	//ifthe cursor was never positionned then move it the first note of the array
	if(_current_criteria_position == "" && _current_note_position == -1)
	{
		_current_note_position = 2;
		_current_criteria_position = $("#s1_note > table > tbody > tr.cri_notes").first().attr("id");;
	}
	
	//Load groupes (move pupils notes into groupes)
	loadGroupeNote();
}

/*************************************/
/* MANAGE THE NOTES AND THE CRITERIA */
/*************************************/

/* Function in charge of saving the notes from the MMI into the global var _content
   @input note_position : the horizontal position (from the left) in the array of the pupil to save
*/
function savePupilNotes(note_position)
{
	var pupil_is_noted = false;
	//Get the pupil name
	var pupil_name = $("#s1_note > table > thead > tr:nth-child(1) > th:nth-child("+note_position+") > div > span").html();
    //Get the pupil comment and set it to empty if a comment has never been defined
	var pupil_comment = $("#s1_note > table > thead > tr:nth-child(2) > th:nth-child("+note_position+") > span.pup_comment").attr("val");
    if(pupil_comment == null){
        pupil_comment = "";
    }
	//Initialize the cotainer of the pupil notes (comment, global array and global note)
	var pupil_notes = {commentaire:pupil_comment, note: 0, max: 0, exercices:{}};
	var pupil_exe_is_noted = false;
	//Now loop through all the exercises to look for the note of each criteria
	$.each(_content.data.exercices, function(nume,exercice) {
        //Free texts do not have notes
		if(exercice.type!="free"){
			//Initialize the container of the exercice (global array of inner question and exercise note)
			var pupil_notes_exercice = {questions:{}, note: 0, max: 0 };
			var pupil_que_is_noted = false;
            $.each(exercice.questions, function(numq,question) {
                //Free texts do not have notes
				if(question.type!="free"){  
					//Initialize the container of the question (global array of inner criteria and question note)
					var pupil_notes_question = {criteres:{}, note: 0, max: 0 };
                    $.each(question.criteres, function(numc,critere) {
                        //Free texts do not have notes
						if(critere.type!="free"){
							//Compute note of the criteria according to its state : OK (criteria checked and full valid)...
							var note_state_ok = $('tr#exe'+nume+'_que'+numq+'_cri'+numc+' > td:nth-child('+note_position+') > div > span').hasClass("note_ok");
							//... KO (criteria checked but full wrong)...
							var note_state_ko = $('tr#exe'+nume+'_que'+numq+'_cri'+numc+' > td:nth-child('+note_position+') > div > span').hasClass("note_ko");
							//... en cours (criteria checked but partially wrong)...
							var note_state_encours = $('tr#exe'+nume+'_que'+numq+'_cri'+numc+' > td:nth-child('+note_position+') > div > span').hasClass("note_encours");
                            
							//Compute final value and final note according to criteria state
							var note_state = "unknown";
							var tmp_bareme_val;
                            if(note_state_ok){
                                note_state = "ok";
								tmp_bareme_val = critere.bareme;
                            }
                            if(note_state_ko){
                                note_state = "ko";
								tmp_bareme_val = 0;
                            }
                            if(note_state_encours){
                                note_state = "encours";
								tmp_bareme_val = critere.bareme * global_configurations["coeff_capacite_encours"];
                            }
							
							//Store the note only if it has been checked
							if(note_state!="unknown"){
								pupil_notes_question["criteres"][numc] = {state:note_state};
								pupil_notes_question.note += tmp_bareme_val;
								pupil_notes_question.max += critere.bareme;
                                //Set that a criteria has been noted
								pupil_is_noted = true;
								pupil_que_is_noted = true;
                            }
						}
                    });
					if(pupil_que_is_noted == true){
						//At least one question is noted then memorize it in the exercise
						pupil_notes_exercice["questions"][numq] = pupil_notes_question;
						pupil_notes_exercice.note += pupil_notes_question.note;
						pupil_notes_exercice.max += pupil_notes_question.max;
						//Set back to false to reinit the check
						pupil_que_is_noted = false;
						pupil_exe_is_noted = true;
					}
                }
            });
			if(pupil_exe_is_noted == true){
				//At least one question is noted then memorize it in the exercise
				pupil_notes["exercices"][nume] = pupil_notes_exercice;
				pupil_notes.note += pupil_notes_exercice.note;
				pupil_notes.max += pupil_notes_exercice.max;
				//Set back to false to reinit the check
				pupil_exe_is_noted = false;
			}
        }
    });
	
	//If the pupil is finally not noted (a note is set to unknown for instance) then remove the pupil 
	//We just want to keep pupils with notes for stats and management through the year.
	if(pupil_is_noted == true){
		_content.data.notes[pupil_name] = pupil_notes;
	}else{
		//If the pupil is not noted then remove it completly from the global var _content
		var index_pupil = Object.keys(_content.data.notes).indexOf(pupil_name);
		if (index_pupil > -1) {
			delete _content.data.notes[pupil_name];
		}
		$("#s1_note > table > thead > tr:nth-child(3) > th:nth-child("+note_position+") > span:last-child").html("/?");
	}
	//Compute the general stats of the devoir regarding this pupil notes
	computeNoteStat();
	//If a grille fo competences has been defined then update the stats of the competences of the grille that are selected in the devoir
	if(_content.data.general.grille){
		updateSelectedCompetences();
	}
    //Memorize that document is modified
	toggleDocumentEdition(true);
}
/*Function called when one of a criteria bareme already defined is updated and consequenlty need to recompute all notes for all pupils*/
function updateNotesBareme()
{
	//Browse all pupils of the array (all cell in header except first one witjout pupil name)
	$.each($("#s1_note > table > thead > tr:nth-child(1) > th:not(:first-child)"), function(nume,pupil) {
		//Save this pupil note with the new bareme according to its position
		savePupilNotes($(this).index()+1);
    });
}
/*Function called to compute the global stats of the devoir and store these stats in the global var _content*/
function computeNoteStat()
{
	//Init the stats with default values
    _content.data.general.stats = {mean: 0, min: 200, max: 0, nb_inf: 0};
    //Browse all pupils with notes (pupils without notes are not taking into account, pupils with at least one note are taken into account)
    $.each(_content.data.notes, function(nume,pupil) {
		var pupil_note_finale = computeNoteFinal(_content.data.notes[nume].note, _content.data.notes[nume].max, _content.data.general.note_arrondi,_content.data.general.note_final_mode, _content.data.general.note_final_cible);
		//Compute min, max and lower than mean
		if(pupil_note_finale.note < _content.data.general.stats.min){
			_content.data.general.stats.min = pupil_note_finale.note;
		}
		if(pupil_note_finale.note > _content.data.general.stats.max){
			_content.data.general.stats.max = pupil_note_finale.note;
		}
		if(pupil_note_finale.note < pupil_note_finale.max/2){
			_content.data.general.stats.nb_inf++;
		}
		//The mean is computed in two steps (first step add all notes)...
		_content.data.general.stats.mean += pupil_note_finale.note;
    });
	
	//If at least one note is defined then can finished to compute the mean
	if(Object.keys(_content.data.notes).length != 0){
		_content.data.general.stats.mean = Number((_content.data.general.stats.mean / Object.keys(_content.data.notes).length).toFixed(3));
	//If there is no notes at all the indicate undefined stats
	}else{
		_content.data.general.stats = {mean: "?", min: "?", max: "?", nb_inf: "?"};
	}
    //Display these stats in the MMI
    $("#gen_mean > span:last-child").html(_content.data.general.stats.mean);
    $("#gen_minimum > span:last-child").html(_content.data.general.stats.min);
    $("#gen_maximum > span:last-child").html(_content.data.general.stats.max);
    $("#gen_inf_moyenne > span:last-child").html(_content.data.general.stats.nb_inf);
    
	//Next compute the stats for each exercise of the devoir (used to give at the pupil a comparison to the other pupils)
	var nb_exe_note = 0;
    $.each(_content.data.exercices, function(nume,exercice) {
        //No note for free text
		if(exercice.type != "free"){
			//Init the stats with default values
			exercice.stats = {mean:0, min:200, max:0};
			//Browse all pupils with notes (pupils without notes are not taking into account, pupils with at least one note are taken into account)
			$.each(_content.data.notes, function(nump,pupil) {
				//If a note is defined for this exercise (case when the pupil is noted but not on this exercise)
				if(pupil.exercices){
					if(pupil.exercices[nume]){
						if(pupil.exercices[nume].note){
							//Compute min, max
							if(pupil.exercices[nume].note < exercice.stats.min){
								exercice.stats.min = pupil.exercices[nume].note;
							}
							if(pupil.exercices[nume].note > exercice.stats.max){
								exercice.stats.max = pupil.exercices[nume].note;
							}
							//The mean is computed in two steps (first step add all notes)...
							exercice.stats.mean += pupil.exercices[nume].note;
							nb_exe_note++;
						}
					}
				}
			});
			//If at least one note is defined then can finisehd to compute the mean
			if(nb_exe_note != 0){
				exercice.stats.mean = Number((exercice.stats.mean / nb_exe_note).toFixed(3));
			//If there is no notes at all the indicate undefined stats
			}else{
				exercice.stats = {mean: "?", min: "?", max: "?"};
			}
		}else{
			exercice.stats = null;
		}
    });
	//Memorize that document is modified
	toggleDocumentEdition(true);
}
/* Function in charge of adding a pupil column in the MMI
   @input pupil : the pupil name to add
*/
function addNotePup(pupil)
{
	//Add the pup name in the header
	$("#s1_note > table > thead > tr:nth-child(1)").append('<th><div><span>'+pupil+'</span></div></th>');
	//Add the comment
	$("#s1_note > table > thead > tr:nth-child(2)").append('<th><span class="pup_comment">&nbsp;</span></th>');
	//Add the global note 
	$("#s1_note > table > thead > tr:nth-child(3)").append('<th><span>?</span><span>/?</span></th>');
	//If a note has been defined (and consequently a comment) then add this note and eventually this comment
	if(_content.data.notes[pupil] != null){
		var pupil_note_finale = computeNoteFinal(_content.data.notes[pupil].note, _content.data.notes[pupil].max, _content.data.general.note_arrondi,_content.data.general.note_final_mode, _content.data.general.note_final_cible);
		$("#s1_note > table > thead > tr:nth-child(3) > th:last-child").html("<span>"+pupil_note_finale.note+"</span><span>/"+pupil_note_finale.max+"</span>");
		$("#s1_note > table > thead > tr:nth-child(3) > th:last-child").attr("title",_content.data.notes[pupil].note+"/"+_content.data.notes[pupil].max);        
    }
	if(_content.data.notes[pupil] != null && _content.data.notes[pupil].commentaire != ""){
        $("#s1_note > table > thead > tr:nth-child(2) > th:last-child > span.pup_comment").attr("val",_content.data.notes[pupil].commentaire);
    }
	//Action to execute when the user wants to comment this pupil (or see the comment)
	$("#s1_note > table > thead > tr:nth-child(2) > th:last-child > span.pup_comment").click(function(event) {
        editPupilInfo(pupil);
    });
	//Add an empty cell for the pupil for exercise, question and criteria
	addNoteExePup();
    addNoteQuePup();
    addNoteCriPup();
	//If at least one note has been defined for this pupil
	if(_content.data.notes[pupil] != null){
		//Browse all defined exercices with notes
        $.each(_content.data.notes[pupil].exercices, function(nume,exercice) {
			//Set the note for this exercise instead of default one (?)
			$('#exe'+nume+' > td:last-child').children("div.note_value").html(exercice.note);
			//Browse all defined questions with notes
            $.each(exercice.questions, function(numq,question) {
				//Set the note for this question instead of default one (?)
				$('#exe'+nume+'_que'+numq+' > td:last-child').children("div.note_value").html(question.note);
                //Set the state of the criteria according to its state in global var (can only be defined state : OK, KO,encours)
                $.each(question.criteres, function(numc,critere) {
                    var num_critere = parseInt(numc.substring(1))+1;
					$('#exe'+nume+'_que'+numq+'_cri'+numc+' > td:last-child').children("div.note_state").children("span").addClass("note_"+critere.state);
                });
            });
        });
    }

}
/* Function in charge of adding a cell for the exercise note of a pupil.
   The note is added always at the end of the array with default value "?" */
function addNoteExePup()
{	
	$('<td class="s1_det_note"><div class="note_value">?</div></td>').appendTo($("#s1_note > table > tbody > tr.exe_notes"));
}
/* Function in charge of adding a cell for the question note of a pupil.
   The note is added always at the end of the array with default value "?" */
function addNoteQuePup()
{
	$('<td class="s1_det_note"><div class="note_value">?</div></td>').appendTo($("#s1_note > table > tbody > tr.que_notes"));
}
/* Function in charge of adding a cell for the criteria state of a criteria of a pupil.
   The criteria is added always at the end of the array with no default state */
function addNoteCriPup()
{
	//Add the cell in the array
    $('<td class="s1_det_notation"><div class="note_state"><span>&nbsp;</span></div></td>').appendTo($("#s1_note > table > tbody > tr.cri_notes"));
	//Define the action to execute when the user click on the criteria state
	$("#s1_note > table > tbody > tr.cri_notes > td:last-child > div.note_state > span").click(function(event) {
        updateNoteStateClick($(this));
        event.preventDefault();
        return false;
    });
}
/* Function in charge of update the state of the criteria according ot its old state and the new state
   @input $note_state : the criteria to update
   @input new_state : the new state to apply to the criteria
*/
function updateNoteState($note_state, new_state)
{
	//Get the current old state of the criteria (usefull to compute the new note)
	var old_state = "";
    if($note_state.hasClass("note_ok")){old_state = "note_ok";}
    if($note_state.hasClass("note_ko")){old_state = "note_ko";}
    if($note_state.hasClass("note_encours")){old_state = "note_encours";}
    
	//Remove old class and add new one
    $note_state.removeClass("note_unknown note_ok note_ko note_encours");
    $note_state.addClass(new_state);
	
	//Recuperation du bareme du critère (calcul de la note total) et de la position de la note (position de l'éleve dans le tableau)
	var cri_id = $note_state.parents(".cri_notes").attr("id");
	cri_id = cri_id.split("_");
	var note_position = $note_state.parents(".s1_det_notation").index()+1;
	var pupil_name = $("#s1_note > table > thead > tr:nth-child(1) > th:nth-child("+note_position+") > div > span").html();
	
	//Enregistrement en mémoire
    savePupilNotes(note_position);
	
	if(_content.data.notes[pupil_name]){
		
		pupil_note_finale = computeNoteFinal(_content.data.notes[pupil_name].note, _content.data.notes[pupil_name].max, _content.data.general.note_arrondi,_content.data.general.note_final_mode, _content.data.general.note_final_cible);
		$("#s1_note > table > thead > tr:nth-child(3) > th:nth-child("+note_position+") > span:first-child").html(pupil_note_finale.note);
		$("#s1_note > table > thead > tr:nth-child(3) > th:nth-child("+note_position+") > span:last-child").html("/"+pupil_note_finale.max);
		$("#s1_note > table > thead > tr:nth-child(3) > th:nth-child("+note_position+")").attr("title",_content.data.notes[pupil_name].note+"/"+_content.data.notes[pupil_name].max);
		
		if(_content.data.notes[pupil_name].exercices && _content.data.notes[pupil_name].exercices["_"+cri_id[1]]){
			$note_state.parents(".cri_notes").prevAll(".exe_notes").first().find("td:nth-child("+note_position+") > div.note_value").html(_content.data.notes[pupil_name].exercices["_"+cri_id[1]].note);
			if(_content.data.notes[pupil_name].exercices["_"+cri_id[1]]["questions"] && _content.data.notes[pupil_name].exercices["_"+cri_id[1]]["questions"]["_"+cri_id[3]]){
				$note_state.parents(".cri_notes").prevAll(".que_notes").first().find("td:nth-child("+note_position+") > div.note_value").html(_content.data.notes[pupil_name].exercices["_"+cri_id[1]]["questions"]["_"+cri_id[3]].note);
			}else{
				$note_state.parents(".cri_notes").prevAll(".que_notes").first().find("td:nth-child("+note_position+") > div.note_value").html("?");
			}
		}else{
			$note_state.parents(".cri_notes").prevAll(".exe_notes").first().find("td:nth-child("+note_position+") > div.note_value").html("?");
			$note_state.parents(".cri_notes").prevAll(".que_notes").first().find("td:nth-child("+note_position+") > div.note_value").html("?");
		}
	}else{
		$("#s1_note > table > thead > tr:nth-child(3) > th:nth-child("+note_position+") > span:first-child").html("?");
		$("#s1_note > table > thead > tr:nth-child(3) > th:nth-child("+note_position+") > span:last-child").html("/?");
		$note_state.parents(".cri_notes").prevAll(".exe_notes").first().find("td:nth-child("+note_position+") > div.note_value").html("?");
		$note_state.parents(".cri_notes").prevAll(".que_notes").first().find("td:nth-child("+note_position+") > div.note_value").html("?");
	}
}
/* Function in charge of managing the state of a criteria if a clic happened on this criteria
   @input $note_state : the criteria to update
*/
function updateNoteStateClick($note_state)
{
	//Compute the new state according the old state
	var new_state = "";
    if($note_state.hasClass("note_ok")){
        new_state = "note_encours";
    }else{
		if($note_state.hasClass("note_encours")){
			new_state = "note_ko";
		}else{
			if($note_state.hasClass("note_ko")){
				new_state = "note_unknown";
			}else{
				new_state = "note_ok";
			}
		}
	}

	//Get the position to determine and select the pupil column in the array
    _current_note_position = $note_state.parents(".s1_det_notation").index()+1;
    selectNotePupil();
	//Get the position to determine and select the criteria row in the array
	_current_criteria_position = $note_state.parents(".cri_notes").attr("id");
    selectNoteCriteria(false);
	//Update the criteria state
    updateNoteState($note_state, new_state);
}
/* Function in charge of managing the state of a criteria if a keyboard is hitten on this criteria
   @input new_state : the new state to apply on the criteria (according to key pressed)
*/
function updateNoteStateKey(new_state)
{
	//Get selected criteria (look for a specific class named selected_criteria)
    $note_state = $("div.selected_criteria > span");
	//Update the criteria state
    updateNoteState($note_state, new_state);
}

/*********************/
/* MOVE IN THE ARRAY */
/*********************/

/* Function in charge of overlighting the full column of a pupil according to a global var _current_note_position */
function selectNotePupil()
{
	//First remove the class of the current selected pupil
	$("#s1_note > table *").removeClass("selected_pupil");
	//Then add a class in header and body of all cell at the choosen position
	$("#s1_note > table > thead > tr > th:nth-child("+_current_note_position+")").addClass("selected_pupil");
	$("#s1_note > table > tbody > tr > td:nth-child("+_current_note_position+")").addClass("selected_pupil");
}
/* Function in charge of moving overlight to the previous pupil of the current selected pupil */
function selectPrevNotePupil()
{
	//If there is at least one element before then move before
	if($("#s1_note > table > thead > tr:nth-child(1) > th:nth-child("+_current_note_position+")").prevAll(":not(:first-child):not(.s1_det_groupe)").length != 0){
		_current_note_position = $("#s1_note > table > thead > tr:nth-child(1) > th:nth-child("+_current_note_position+")").prevAll(":not(:first-child):not(.s1_det_groupe)").first().index()+1;
	//If nothing before then move to the end
	}else{
		_current_note_position = $("#s1_note > table > thead > tr:nth-child(1) > th:not(.s1_det_groupe)").last().index()+1;
	}
	//Select the pupil with this determined position (before or end)
    selectNotePupil();
	//Select the criteria without moving to it but just to overlight correctly
	selectNoteCriteria(false);
}
/* Function in charge of moving overlight to the previous pupil of the current selected pupil */
function selectNextNotePupil()
{
	//If there is at least one element after then move after
	if($("#s1_note > table > thead > tr:nth-child(1) > th:nth-child("+_current_note_position+")").nextAll(":not(.s1_det_groupe)").length != 0){
		_current_note_position = $("#s1_note > table > thead > tr:nth-child(1) > th:nth-child("+_current_note_position+")").nextAll(":not(.s1_det_groupe)").first().index()+1;
	//If nothing after then move to the beginning
	}else{
		_current_note_position = $("#s1_note > table > thead > tr:nth-child(1) > th:not(:first-child):not(.s1_det_groupe)").first().index()+1;
	}
    //Select the pupil with this determined position (after or begin)
    selectNotePupil();
	//Select the criteria without moving to it but just to overlight correctly
	selectNoteCriteria(false);
}
/* Function in charge of overlighting the full row of a criteria according to a global var _current_criteria_position and _current_note_position
   @input move_to_criteria :  a boolean to indicate if after overlighting the window must be moved until the criteria.
 */
function selectNoteCriteria(move_to_criteria)
{
	//Remove all existing class first
	$("#s1_note > table *").removeClass("selected_criteria selected_line");
	//Select the full line
	$("#s1_note > table > tbody > tr#"+_current_criteria_position).addClass("selected_line");
	//Select the criteria that is accross the selected line and the selected pupil
	$("#s1_note > table > tbody > tr#"+_current_criteria_position+" > td:nth-child("+_current_note_position+") > div").addClass("selected_criteria");
	//If the parameter asks to move then the winodw is moved to the selected criteria
	if(move_to_criteria == true){
		$(document).scrollTop($("#s1_note > table > tbody > tr#"+_current_criteria_position+" > td:nth-child("+_current_note_position+") > div").offset().top - 40 );
	}
	
	$(".s1_note_criteria_tooltip").remove();
	$(".s1_note_pupil_tooltip").remove();
	
	if($("#s1_note > table > tbody > tr#"+_current_criteria_position+" > td:nth-child("+_current_note_position+") > div").length > 0)
	{
		var offset = $("#s1_note > table > tbody > tr#"+_current_criteria_position+" > td:nth-child("+_current_note_position+") > div").offset();
		
		if($("#s1_note > table > tbody > tr.selected_line > td:first-child > span:first-child").length > 0){
			if(isScrolledIntoView($("#s1_note > table > tbody > tr.selected_line > td:first-child > span:first-child")) == false){
				$("body").append("<div style='top:"+(offset.top-$(window).scrollTop())+"px;left:"+(offset.left-$(window).scrollLeft())+"px' class='s1_note_criteria_tooltip'>"+$("#s1_note > table > tbody > tr.selected_line > td:first-child").html()+"</div>");
			}
		}
		if($("#s1_note > table > thead > tr:nth-child(1) > th.selected_pupil > div").length > 0){
			if(isScrolledIntoView($("#s1_note > table > thead > tr:nth-child(1) > th.selected_pupil > div")) == false){
				$("body").append("<div style='top:"+(offset.top-$(window).scrollTop())+"px;left:"+(offset.left-$(window).scrollLeft())+"px' class='s1_note_pupil_tooltip'>"+$("#s1_note > table > thead > tr:nth-child(1) > th.selected_pupil").html()+"</div>");
			}
		}
	}
}
function isScrolledIntoView(elem)
{
	var pageTop = $(window).scrollTop();
    var pageLeft = $(window).scrollLeft();
	var pageBottom = pageTop + $(window).height();
	var pageRight = pageLeft + $(window).width();

	var elementTop = $(elem).offset().top;
	var elementBottom = elementTop + $(elem).height();
	var elementLeft = $(elem).offset().left;
	var elementRight = elementLeft + $(elem).width();

	return ((pageTop < elementTop) && (pageBottom > elementBottom) && (pageLeft < elementLeft) && (pageRight > elementRight));
}

/* Function in charge of moving overlight to the previous criteria of the current selected criteria */
function selectPrevNoteCriteria()
{
	var move_to_criteria = false;
	//If there is at least one element before then move before
	if($("#s1_note > table > tbody > tr#"+_current_criteria_position).prevAll(".cri_notes").length != 0){
		_current_criteria_position = $("#s1_note > table > tbody > tr#"+_current_criteria_position).prevAll(".cri_notes").first().attr("id");
	//If nothing before then move to the end and decide to also move the window
	}else{
		_current_criteria_position = $("#s1_note > table > tbody > tr.cri_notes").last().attr("id");
		move_to_criteria = true;
	}
	//Select the criteria with or without moving to
    selectNoteCriteria(move_to_criteria);
}
/* Function in charge of moving overlight to the next criteria of the current selected criteria */
function selectNextNoteCriteria()
{
    var move_to_criteria = false;
	//If there is at least one element next then move next
	if($("#s1_note > table > tbody > tr#"+_current_criteria_position).nextAll(".cri_notes").length != 0){
		_current_criteria_position = $("#s1_note > table > tbody > tr#"+_current_criteria_position).nextAll(".cri_notes").first().attr("id");
	//If nothing after then move to the begin and decide to also move the window
	}else{
		_current_criteria_position = $("#s1_note > table > tbody > tr.cri_notes").first().attr("id");
		move_to_criteria = true;
	}
    //Select the criteria with or without moving to
    selectNoteCriteria(move_to_criteria);
}
/* Function in charge of going to next criteria and if at the bottom of the criteria list to go at the next pupil */
function selectNextNoteCriteriaPupil(){
	//Go to next criteria
	selectNextNoteCriteria();
	//IF we are at the first criteria then go at the next pupil
	if(_current_criteria_position == $("#s1_note > table > tbody > tr.cri_notes").first().attr("id")){
		selectNextNotePupil();
	}
	
}

/***********************/
/* MANAGE PUPIL GROUPS */
/***********************/

/* Function in charge of displaying a window to create groups of pupils for the notation */
function dialogNoteGroupe()
{
	//First reinit the window that will contains the form
	$("#s2").html("");
	//Get all pupils of the current classe
	var pupils = _content.classes["_"+_content.data.general.classe];
    //Fill the window with the form to set the group name and to select pupils of this group
	$("#s2").html("<div id='s2_suivi_init'><div>Nom du groupe:</div><input id='note_groupe_nom' type='text' value='Groupe'/><div>Elèves du groupe</div><select id='note_groupe_eleves' multiple></select></div>");
	//If no pupils do nothing
	if(pupils != null){
        //Browse each pupil and add it to the multiple select
		$.each(pupils, function(num,pupil) {
            $("#s2 select").append('<option value='+pupil+'>'+pupil+'</option>');
        });
    }
	//Step of progess of group creation (step 1 : edition, step 2 : save)
	var note_groupe_step = 0;
	//Name of the group
	var note_groupe_nom = "";
	//List of pupils
	var note_groupe_eleves = []; 
	//Display the modal form
	$("#s2").dialog({
		autoOpen: false,
		modal: true,
		closeText: "Annuler",
		title: "Création d'un groupe d'élèves",
		width:"50%",
		maxHeight:"100%",
		buttons: [
			{
				id:"s2_groupe_next",
				text:"Suivant >",
				click: function() {
					note_groupe_step++;
					if(note_groupe_step == 1)
					{
						//Check for a form error
						var note_groupe_erreur = false;
						//Check for a name error (nothing else than letter, numbers and space)
						note_groupe_nom = $("#note_groupe_nom").val();
						note_groupe_nom = note_groupe_nom.trim();
						if (/^([a-zA-Z0-9 ]+)$/.test(note_groupe_nom) == false){
							$("#note_groupe_nom").attr("style","color:red;background-color:LightPink;font-weight:bold");
							note_groupe_erreur = true;
						}else{
							$("#note_groupe_nom").removeAttr("style");
							$("#note_groupe_nom").attr("style","color:green;background-color:LightGreen");
						}
						//Check for a pupil list error (at least two pupils in the group)
						$('#note_groupe_eleves > option:selected').each(function(i, selected){ 
							note_groupe_eleves[i] = $(selected).text(); 
						});
						if(note_groupe_eleves.length<2){
							$("#note_groupe_eleves").attr("style","color:red;background-color:LightPink;font-weight:bold");
							note_groupe_erreur = true;
						}else{
							$("#note_groupe_eleves").removeAttr("style");
							$("#note_groupe_eleves").attr("style","color:green;background-color:LightGreen");
						}
						// IF there is an error thus display the error and stop creation
						if(note_groupe_erreur == true){
							note_groupe_step--;
						//If everything is OK in the form then display the confirmation
						}else{
							$("#s2 > div").html("<div><div><b>Nom</b> : "+note_groupe_nom+"</div><div><b>Elèves</b> : "+note_groupe_eleves+"</div>");
							$('#s2_groupe_next span').text('Créer');
						}
					}
					//Group creation is validated by the user thus the group can be created
					if(note_groupe_step == 2)
					{
						//Create the group in the MMI
						addNoteGroupe(note_groupe_nom, note_groupe_eleves);
						//Save group in the global var _content
						saveGroupeNote();
						//Close the form window
						$("#s2").dialog( "close" );
					}
				}
			},
			{
				id:"s2_groupe_cancel",
				text:"Annuler",
				click: function() {
					$("#s2").html("");
					$("#s2").dialog( "close" );
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
/* Function in charge of creating a group in the array of pupils
   @input groupe : the name of the group
   @input groupe_eleves : the list of pupils in the group
*/
function addNoteGroupe(groupe, groupe_eleves)
{
	//Create in the header a new cell with the group name at the end of the array (always at the end)
	$("#s1_note > table > thead > tr:nth-child(1)").append("<th class='s1_det_groupe' contextmenu='groupe_menu'><div><span>"+groupe+"</span></div></th>");
	//No comments for a group
	$("#s1_note > table > thead > tr:nth-child(2)").append("<th class='s1_det_groupe'>&nbsp;</th>");
	//No total note for a group
	$("#s1_note > table > thead > tr:nth-child(3)").append("<th class='s1_det_groupe'>&nbsp;</th>");
	//Create a cell for each exercise for the group with nothing inside it (no note for groups)
	$("#s1_note > table > tbody > tr.exe_notes").append("<td class='s1_det_groupe'>&nbsp;</td>");
	//Create a cell for each question for the group with nothing inside it (no note for groups)
	$("#s1_note > table > tbody > tr.que_notes").append("<td class='s1_det_groupe'>&nbsp;</td>");
	//Create a cell for each criteria for the group with the default value (unknown)
	$("#s1_note > table > tbody > tr.cri_notes").append("<td class='s1_det_groupe s1_det_notation s1_det_notation_groupe'><div class='note_state'><span>&nbsp;</span></div></td>");
	//Set the event when the user click on a criteria state of a group
	$("#s1_note > table > tbody > tr.cri_notes > td:last-child > div.note_state > span").click(function(event) {
        updateGroupeStateClick($(this));
        event.preventDefault();
        return false;
    });
	
	//Increase size of the array because of the column creation
	var width = $("#s1_note").width();
	$("#s1_note").css("width",width + 50);
	//Create a context menu entry to remove a group
	$("#s1_note > table > thead > tr:nth-child(1) > th:last-child").contextmenu(function(event) {
		var clicked_groupe = $(this);
		$('#groupe_menu > menuitem#delete_groupe').unbind( "click" );
		$('#groupe_menu > menuitem#delete_groupe').click(function(event) {
			deleteNoteGroupe(clicked_groupe);
		});
	});
	
	//Now will move of pupils of the choosen group just after the group column that has just been created
	//if a pupil is already in a group he is moved from existing group to new created group
	$.each(groupe_eleves, function(num,groupe_eleve) {
		//Get pupil position according to its name
		var $pupil = $("#s1_note > table > thead > tr:nth-child(1) > th > div > span:contains('"+groupe_eleve+"')").parent().parent();
		var note_position = $pupil.index()+1;
		//Move header and body of the pupil from current position to then end of the array
		$.each($("#s1_note > table > tbody > tr > td:nth-child("+note_position+"), #s1_note > table > thead > tr > th:nth-child("+note_position+")"), function(num,note) {
			var $parent = $(this).parent();
			$(this).detach().appendTo($parent);
		});
	});
}
/* Function in charge of memorizing all groups defined in the global var _content. The full list is always built from scratch. */
function saveGroupeNote()
{
	//Initialize the list of groups
	_content.data.groupes = [];
	//Browse all groups in the array
	$.each($("#s1_note > table > thead > tr:nth-child(1) > th.s1_det_groupe"), function(num,groupe) {
		//Create a temp object for each groupe with the name and an empty list of pupils
		var nouveau_groupe = {nom:$(this).text(),eleves:[]};
		$.each($(this).nextUntil( "th.s1_det_groupe" ), function(num,eleve) {
			nouveau_groupe.eleves.push($(this).text());
		});
		//Add this new group. A group can be saved even if no pupils inside it (should not happen)
		_content.data.groupes.push(nouveau_groupe);
	});
	//Memorize that document is modified
	toggleDocumentEdition(true);
}
/* Function in charge of loading the groupes MMI from global var _content */
function loadGroupeNote()
{
	//If at least one groupe is defined
	if(_content.data.groupes){
		//Get group one by one and create a group MMI for each group
		$.each(_content.data.groupes, function(num,groupe) {
			addNoteGroupe(groupe.nom,groupe.eleves);
		});
	}
}
/* Function in charge of managing the action when a user clicks on a criteria state of a group 
   @input $groupe_state : the criteria state of the group that is changed
*/
function updateGroupeStateClick($groupe_state)
{
	//Compute new state according to old one
	var new_state = "";
    if($groupe_state.hasClass("note_ok")){
        new_state = "note_encours";
    }else{
		if($groupe_state.hasClass("note_encours")){
			new_state = "note_ko";
		}else{
			if($groupe_state.hasClass("note_ko")){
				new_state = "note_unknown";
			}else{
				new_state = "note_ok";
			}
		}
	}
	//Now new state is computed then apply it to the group
    updateGroupeState($groupe_state, new_state);
}
/* Function in charge of updating the state of a whole group
   @input $groupe_state : the criteria state of the group that is changed
   @input new_state : the value of the new criteria state
*/
function updateGroupeState($groupe_state, new_state)
{
	//Remove old class and create the new one
	$groupe_state.removeClass("note_ok note_ko note_encours note_unknown");
    $groupe_state.addClass(new_state);
	//Browse each pupil of the group (all column until the end of the array or until the other group) and update criteria state of each pupil
	$.each($groupe_state.parents(".s1_det_notation").nextUntil( "td.s1_det_notation_groupe" ), function(num,eleve_state) {
		updateNoteState($(this).find(".note_state span"),new_state);
	});
}
/* Function in charge of removing the groupe in the MMI and saving the modification
   @input $groupe : the group to remove
*/
function deleteNoteGroupe($groupe)
{
	//Get position from parameter
	var groupe_position = $groupe.index()+1;
	//Remove the full column of the group
	$.each($("#s1_note > table > tbody > tr > td:nth-child("+groupe_position+"), #s1_note > table > thead > tr > th:nth-child("+groupe_position+")"), function(num,note) {
		$(this).remove();
	});	
	//Save the modification in the global var _content
	saveGroupeNote();
}

/******************************/
/* VARIOUS FUNCTIONS ON NOTES */
/******************************/

/* Function in charge of cumputing a final note according to notation configuration */
function computeNoteFinal(note,note_max,note_arrondi,note_mode,note_cible)
{
	//Var sthat sore the final note with all computation activated
	var note_final = note;
	var note_final_max = note_max;
	
	//Convert final note according to mode selected
	switch(note_mode) {
	//Normal mode : nothing to do
    case 1:
        note_final = note_final;
		note_final_max = note_final_max;
        break;
    //Rapporté mode : nothing to do
    case 2:
        if(note_max > note_cible){
			note_final = note_cible;
		}
		note_final_max = note_cible;
        break;
    //Proportionnel mode : nothing to do
    case 3:
        note_final = (note_final * note_cible) / note_max;
		note_final_max = note_cible;
        break;
    //Default : nothing to do
	default:
       note_final = note_final;
	   note_final_max = note_final_max;
    }
	
	//If a round is defined and if it's note 0 (impossible because of /0)
	if(note_arrondi!=0){
		note_final = Math.round(note_final/note_arrondi)*note_arrondi;
		note_final_max = Math.round(note_final_max/note_arrondi)*note_arrondi;
	}
	
	return {note:note_final,max:note_final_max};	
}
/* Function in charge of returning the rank of the pupil in the whole class
   @input pupil_name  the name of the pupil to compute the rank
   @return : an integer which is the rank of the note
   */
function computeNoteRank(pupil_name){
	var pupil_rank = [];
	var classe = "_"+_content.data.general.classe;
	var pupils = _content.classes[classe];
	var pupil_note = 0;
	if(_content.data.notes[pupil_name]){
		pupil_note = _content.data.notes[pupil_name].note;
	}
	//If there are pupils in that class
	if(pupils != null){
		$.each(pupils, function(num,pupil) {
			if(_content.data.notes[pupil]){
				pupil_rank.push(_content.data.notes[pupil].note);
			}
		});
	}
	
	if(pupil_rank.indexOf(pupil_note) == -1){
		pupil_rank = 0;
	}else{
		pupil_rank.sort(function(a, b){return b-a});
		pupil_rank = pupil_rank.indexOf(pupil_note)+1; 
	}
	
	return pupil_rank;
}