var _generated_comments = {
	"note":{
		0:["Devoir vraiment très mauvais !",
		   "Très mauvais devoir, resaisis-toi !"
		   ],
		1:["Devoir très mauvais !"
		   ],
		2:["Devoir très insuffisant.",
		   "Résultat très faible."
		   ],
		3:["Devoir insuffisant",
		   "La note révèle des faiblesses qu'il faut absolument travailler."
		   ],
		4:["Devoir insatisfaisant.",
		   "Ensemble un peu faible.",
		   "Ensemble très juste"
		   ],
		5:["Devoir tout juste passable.",
		   "Ensemble convenable",
		   "Ensemble un peu juste",
		   "Ensemble moyen."
		   ],
		6:["Devoir satisfaisant.",
		   "Ensemble convenable mais vous manquez parfois de rigueur et de méthode."
		   ],
		7:["Devoir correct."
		   ],
		8:["Bon devoir !",
		   "Résultat tout à fait satisfaisant."],
		9:["Très bon devoir !",
		   "Très bon travail : bonne méthode de travail, de la réflexion."
		  ],
		10:["Excellent devoir !",
		    "Devoir parfait !"],
	},
	"evol":{
		0:["Attention, tu regresses !",
		   "Tu devrais te mettre au travail avant qu'il ne soit réellement trop tard!",
		   "Tu ne maitrises pas des connaissances indispensables pour pouvoir progresser. Mets-toi au travail!",
		   "Il faudrait te réveiller et travailler pour améliorer tes résultats.",
		   "Investis-toi davantage dans ton travail, avec plus de rigueur."
		   ],
		1:["Tu dois travailler avec davantage de régularité, en fournissant plus de réflexion.",
		   "Il faut que tu travailles avec plus de rigueur et de régularité pour progresser.",
		   "Tu dois continuer à t'accrocher, à suivre les conseils pour progresser.",
		   "Ensemble convenable mais tu as une marge de progression."
		   ],
		2:["Continues ainsi.",
		   "Continues à travailler avec sérieux pour maintenir tes résultats.",
		   "Continues à travailler avec sérieux pour progresser.",
		   "Continues à fournir un travail régulier, avec méthode et réflexion.",
		   "De la rigueur, de la réflexion, continue ainsi !"
		   ],
		3:["Il faut continuer à faire des efforts de rigueur, tu vas progresser.",
		   "Il faut continuer à faire des efforts de rigueur, tu as une marge de progression!",
		   "Résultats plutôt encourageants. Tu dois continuer de progresser."
		   ],
		4:["Vous évoluez positivement ! Maintenez votre effort.",
		   "Tu sembles t'être vraiment mis au travail, continues pour progresser!",
		   "Résultats très encourageants. Tu évolues très positivement."
		   ],
	},
	"competence":{
		"acquis":   ["La competence %str% est bien acquise.",
		             "La maîtrise de %str% est correcte."
				     ],
		"encours":  ["La competence %str% est en cours d'acquisition.",
		             "Vous n'avez pas encore achevé de maîtriser %str%."
				     ],
		"nonacquis":["La competence %str% n'est pas acquise.", 
		             "%str% n'est pas encore maîtrisé. Poursuis tes efforts."
					 ],
	},
};
var _generated_comments_pos = {};

/* Function in charge of returning a string from different possibilites according to configuration
   @input type : the type of comment (for note, for pupil evolution of for competence)
   @input level : the level of the comment inside the type of comment
   @input str_replace : an optionnal string to include in the generated comment
   @return : a random comment from global var _generated_comments
*/
function getComment(type, level, str_replace, increment)
{
	var returned_comment = "";
	//FIrst check if type is compatible
	if(type == "note" || type == "evol" || type == "competence")
	{
		//Now check that the level exists in that type
		if(_generated_comments[type][level]){
				//Get a position in the array of possible comments
			if(typeof _generated_comments_pos[type] === 'undefined' ){
				_generated_comments_pos[type] = {};
			}
			if(typeof _generated_comments_pos[type][level] !== 'undefined' ){
				_generated_comments_pos[type][level] = _generated_comments_pos[type][level] + increment;
				
				if(_generated_comments_pos[type][level] + 1 > _generated_comments[type][level].length){
					_generated_comments_pos[type][level] = 0;
				}
				if(_generated_comments_pos[type][level] < 0 ){
					_generated_comments_pos[type][level] = _generated_comments[type][level].length - 1;
				}
			}else{
				_generated_comments_pos[type][level] = 0;
			}
			
			returned_comment = _generated_comments[type][level][_generated_comments_pos[type][level]];
			if(str_replace){
				returned_comment = returned_comment.replace("%str%", str_replace); 
			}
		}else{
			returned_comment = "Le niveau de commentaire demandé ("+level+") n'existe pas pour le type "+type+"."
		}
	}else{
		returned_comment = "Le type de commentaire demandé ("+type+") n'existe pas."
	}
	
	return returned_comment;
}

/*************************/
/* MANAGE PUPIL COMMENTS */
/*************************/

/* Function in charge of displaying the information on the pupil (comment and acquired competences) 
   @input pupil_name : the name of the pupil to edit comment
*/
function editPupilInfo(pupil_name)
{
	var pupil_comment = "";
	var pupil_note = "?/?";
	var pupil_note_finale = "?/?";
	//Get current comment if existing
	if(_content.data.notes[pupil_name]){
		pupil_comment = _content.data.notes[pupil_name].commentaire;
		pupil_note = _content.data.notes[pupil_name].note+"/"+_content.data.notes[pupil_name].max;
		pupil_note_finale = computeNoteFinal(_content.data.notes[pupil_name].note, _content.data.notes[pupil_name].max, _content.data.general.note_arrondi,_content.data.general.note_final_mode, _content.data.general.note_final_cible);
		pupil_note_finale = pupil_note_finale.note+"/"+pupil_note_finale.max;
	}
	
	//Put note information
	$("#s1_det_info #s1_det_info_note > #s1_det_info_note_exacte > span:last-child").html(pupil_note);
	$("#s1_det_info #s1_det_info_note > #s1_det_info_note_finale > span:last-child").html(pupil_note_finale);
	
	//Put it in the edit form (can be null)
	$("#s1_det_info #s1_det_comment").html(pupil_comment);
	//Memorize the name of the edited pupil
	$("#s1_det_info #s1_det_info_pupil").val(pupil_name);
	//Display information on competences
	var pupil_competences = getPupilCompetence(pupil_name);
	$("#s1_det_info #s1_det_competence").html(pupil_competences.html);
	
	//Open and focus the window that contains the edition form
	$("#s1_det_info").dialog( "open" );
	//Set focus to the button and not to the comment
	$("#s1_det_comment_gen").focus();
	
}
/* Function in charge of memorizing the comment in global var _content */
function savePupilInfo()
{
	//Get memorized pupil name
	var pupil_commented = $("#s1_det_info #s1_det_info_pupil").val();
	//Get pupil object according to name memorized
	var $pupil = $("#s1_note > table > thead > tr:nth-child(1) > th > div > span:contains('"+pupil_commented+"')").parent().parent();
	//Compute its position (necessary to save the pupil informations and notes)
	var note_position = $pupil.index()+1;
    //Set the comment according to information in form
    $("#s1_note > table > thead > tr:nth-child(2) > th:nth-child("+note_position+") > span.pup_comment").attr("val",$("#s1_det_comment").html());
	//Save in global var _content
	savePupilNotes(note_position);
}

/*Function in charge of displaying the comment generator*/
function generateComment()
{
	//Get memorized pupil name
	var pupil_commented = $("#s1_det_info #s1_det_info_pupil").val();
	//Get note
	var pupil_note = 0;
	if(_content.data.notes[pupil_commented] != null){
        pupil_note = _content.data.notes[pupil_commented].note;
    }
	if(pupil_note != 0 && _content.data.general.bareme != 0){
		pupil_note = Math.round(pupil_note/(_content.data.general.bareme/10));
	}
	
	var pupil_comment = $("#s1_det_comment").text();
	
	if(pupil_comment != ""){
		if(confirm("Un commentaire existe déjà. Voulez-vous continuer ?") == false){
			return;
		}
	}
	
	//First reinit everyhting
	$("#s1_det_comment_gen_text").html("");
	//Hide the button
	$('#s1_det_comment_gen').hide();
	//Next build the MMI
	$("#s1_det_comment_gen_text").append('<div><h2>Niveau de la note</h2><div class="s1_det_comment_slider" id="s1_det_comment_slider_note"></div><div id="s1_det_comment_slider_note_txt"><input type="button" value=" "/><span>'+getComment("note",pupil_note,"",1)+'</span><input type="button" value=" "/></div></div>');
	$("#s1_det_comment_gen_text").append('<div><h2>Evolution de l\'élève</h2><div class="s1_det_comment_slider" id="s1_det_comment_slider_evol"></div><div id="s1_det_comment_slider_evol_txt"><input type="button" value=" "/><span>'+getComment("evol",2,"",1)+'</span><input type="button" value=" "/></div></div>');
	
	var pupil_competences = getPupilCompetence(pupil_commented);
	var pupil_competences_text = "";
	$.each(pupil_competences.list, function(competence_id,competence_stat) {
		var competence = _content.grilles[_content.data.general.grille.id].competences[competence_id];
		pupil_competences_text += "<div competence_id='"+competence_id+"' competence_state='"+competence_stat.state+"'><input type='button' value=' '/><span>"+getComment("competence",competence_stat.state,"<b style='color:"+competence.couleur+"'>"+competence.titre+"</b>",1)+"</span><input type='button' value=' '/></div>";
	});
	$("#s1_det_comment_gen_text").append('<div><h2>Maîtrise des compétences</h2><div id="s1_det_comment_slider_comp_txt">'+pupil_competences_text+'</div></div>');
	
	$("#s1_det_comment_gen_text").append('<button id="s1_det_comment_gen2" type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false"><span class="ui-button-text">Générer</span></button>');
	
	//Associate actions
	$("#s1_det_comment_slider_note").slider({
      value:pupil_note,
      min: 0,
      max: 10,
      step: 1,
      slide: function( event, ui ) {
		$('#s1_det_comment_slider_note_txt > span').html(getComment("note",ui.value,"",1));
      }
    }).each(function() {
		// Add labels to slider whose values are specified by min, max
		// Get the options for this slider (specified above)
		var opt = $("#s1_det_comment_slider_note").slider( "option" );
		// Get the number of possible values
		var vals = opt.max - opt.min;
		// Position the labels
		for (var i = 0; i <= vals; i++) {
			// Create a new element and position it with percentages
			var el = $('<label>' + (i + opt.min) + '</label>').css('left', (i/vals*100) + '%');
			// Add the element inside #s1_det_comment_slider_note
			$("#s1_det_comment_slider_note").append(el);
		}
	});
	$("#s1_det_comment_slider_evol").slider({
      value:2,
      min: 0,
      max: 4,
      step: 1,
      slide: function( event, ui ) {
		$('#s1_det_comment_slider_evol_txt > span').html(getComment("evol",ui.value,"",1));
      }
    }).each(function() {
		var EVOL_TEXT = ["--","-","Stable","+","++"]
		// Add labels to slider whose values are specified by min, max
		// Get the options for this slider (specified above)
		var opt = $("#s1_det_comment_slider_evol").slider( "option" );
		// Get the number of possible values
		var vals = opt.max - opt.min;
		// Position the labels
		for (var i = 0; i <= vals; i++) {
			// Create a new element and position it with percentages
			var el = $('<label>' + EVOL_TEXT[i] + '</label>').css('left', (i/vals*100) + '%');
			// Add the element inside #s1_det_comment_slider_evol
			$("#s1_det_comment_slider_evol").append(el);
		}
	});
	$('#s1_det_comment_slider_note_txt > input:first-child').click(function(event) {
		$('#s1_det_comment_slider_note_txt > span').html(getComment("note",$("#s1_det_comment_slider_note").slider( "value" ),"",-1));
	});
	$('#s1_det_comment_slider_note_txt > input:last-child').click(function(event) {
		$('#s1_det_comment_slider_note_txt > span').html(getComment("note",$("#s1_det_comment_slider_note").slider( "value" ),"",1));
	});
	$('#s1_det_comment_slider_evol_txt > input:first-child').click(function(event) {
		$('#s1_det_comment_slider_evol_txt > span').html(getComment("evol",$("#s1_det_comment_slider_evol").slider( "value" ),"", -1));
	});
	$('#s1_det_comment_slider_evol_txt > input:last-child').click(function(event) {
		$('#s1_det_comment_slider_evol_txt > span').html(getComment("evol",$("#s1_det_comment_slider_evol").slider( "value" ),"", 1));
	});
	$('#s1_det_comment_slider_comp_txt > div > input:first-child').click(function(event) {
		var competence_id = $(this).parent().attr("competence_id");
		var competence_state = $(this).parent().attr("competence_state");
		var competence = _content.grilles[_content.data.general.grille.id].competences[competence_id];
		
		$(this).parent().children("span").html(getComment("competence",competence_state,"<b style='color:"+competence.couleur+"'>"+competence.titre+"</b>",-1));
	});
	$('#s1_det_comment_slider_comp_txt > div > input:last-child').click(function(event) {
		var competence_id = $(this).parent().attr("competence_id");
		var competence_state = $(this).parent().attr("competence_state");
		var competence = _content.grilles[_content.data.general.grille.id].competences[competence_id];
		
		$(this).parent().children("span").html(getComment("competence",competence_state,"<b style='color:"+competence.couleur+"'>"+competence.titre+"</b>",1));
	});
	$('#s1_det_comment_gen2').click(function(event) {
		generateCommentCb();
	});
	
	//Finally display the box
	$('#s1_det_comment_gen_text').show();
}

function generateCommentCb()
{
	//Put generated text in the comment textfield
	var generated_text = $('#s1_det_comment_slider_note_txt > span').html()+"<br/>"+$('#s1_det_comment_slider_evol_txt > span').html()+"<br/>";
	$('#s1_det_comment_slider_comp_txt > div > span').each(function() {
	   generated_text += $(this).html()+"<br/>";
	});
	$("#s1_det_comment").html(generated_text);
	//Show the button
	$('#s1_det_comment_gen').show();
	//Finally hide the box
	$('#s1_det_comment_gen_text').hide();
	//Reinit everyhting
	$("#s1_det_comment_gen_text").html("");
}