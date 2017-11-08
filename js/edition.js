/* Function in charge of loading all the documention edition (exercices, questions, criteres and free)
   from global var _content and include them in the window MMI */
function loadEdition()
{
    $.each(_content.data.exercices, function(nume,exercice) {
        if(exercice.type=="free"){
            $free = addEditionFree($("#s1_det_que"), exercice.text);
        }else{
            $exe = addEditionExe(exercice.title, exercice.bareme)
            $.each(exercice.questions, function(numq,question) {
                if(question.type=="free"){
                    $free = addEditionFree($exe.find(".exe_questions"), question.text);
                }else{
                    $que = addEditionQue($exe, question.title, question.bareme)
                    $.each(question.criteres, function(numc,critere) {
                        if(critere.type=="free"){
                            $free = addEditionFree($que.find(".que_criteres"), critere.text);
                        }else{
                            $cri = addEditionCri($que, critere.text, critere.bareme, critere.competence)
                        }
                    });
                }
            });
        }
    });
}
/* Function in charge of retrieving all edition information to store them into the global var _content */
function saveEdition()
{
    _content.data.general.bareme = 0;
    _content.data.exercices = {};
	if(_content.data.general.grille)
	{
		_content.data.general.grille.capacites = {};
    }

    $.each($("#s1_det_que").children(".s1_det_exercice, .s1_det_freetext"), function(nume,exercice) {
        if($(this).hasClass("s1_det_freetext")){
            _content.data.exercices["_"+nume] = {type:"free", text:$(this).children("span.free_text").children("div").html() };
        }else{
            _content.data.exercices["_"+nume] = {type:"exe", title:$(this).children("span.exe_title").children("span").html(), questions:{}, bareme: 0 };
            $.each($(this).children("span.exe_questions").children(".s1_det_question, .s1_det_freetext"), function(numq,question) {
                if($(this).hasClass("s1_det_freetext")){
                    _content.data.exercices["_"+nume]["questions"]["_"+numq] = {type:"free", text:$(this).children("span.free_text").children("div").html() };
                }else{
                    _content.data.exercices["_"+nume]["questions"]["_"+numq] = {type:"que", title:$(this).children("span.que_title").children("span").html(), criteres:{}, bareme: 0 };
                    $.each($(this).children("span.que_criteres").children(".s1_det_critere, .s1_det_freetext"), function(numc,critere) {
                        if($(this).hasClass("s1_det_freetext")){
                            _content.data.exercices["_"+nume]["questions"]["_"+numq]["criteres"]["_"+numc] = {type:"free", text:$(this).children("span.free_text").children("div").html() };
                        }else{
                            var cri_bareme_val = parseFloat($(this).children("span.cri_bareme").children("span:first-child").html());
                            cri_bareme_val = Number(cri_bareme_val.toFixed(3));

							var cri_competence = $(this).children("span.cri_competence").children("span:first-child").html();

							if(cri_competence!=NO_COMPETENCE){
								if(_content.data.general.grille.capacites[cri_competence]){
									_content.data.general.grille.capacites[cri_competence]++;
								}else{
									_content.data.general.grille.capacites[cri_competence] = 1;
								}
							}
                            _content.data.exercices["_"+nume]["questions"]["_"+numq]["criteres"]["_"+numc] = {type:"cri", text:$(this).children("span.cri_text").children("div").html(), bareme:cri_bareme_val, competence: cri_competence};
                            _content.data.exercices["_"+nume]["questions"]["_"+numq].bareme += cri_bareme_val;
                            _content.data.exercices["_"+nume].bareme += cri_bareme_val;
                            _content.data.general.bareme += cri_bareme_val;
                        }
                    });
                }
            });
        }
    });

	if(_content.data.general.grille)
	{
		updateSelectedCompetences();
	}

    //Memorize that document is modified
	toggleDocumentEdition(true);
}
/* Function in charge of recimputing the global total bareme of the devoir
   @input old_value : the old value to remove from the global bareme
   @input new_value : the new value to add in the global bareme
*/
function updateEditionTotalBareme(old_value, new_value)
{
    var total_bar_val = $("#s1_det_title > span:last-child").html();
    var total_bar_val = parseFloat(total_bar_val);
    $("#s1_det_title > span:last-child").html(total_bar_val-old_value+new_value);
}
/* Function in charge pf adding an exercice in the MMI
   @input def_title : optionnal. a default title for the exercise
   @input def_bareme : optionnal. a default valeu for the bareme of the exercise
   @return : the mmi object of the exercise
*/
function addEditionExe(def_title, def_bareme)
{
    var $clone = $("#s1_det_exercice_template").clone();
    $clone.attr("id","");

    if(def_title==null || def_bareme==null){

    }else{
        $clone.find(".exe_title span").html(def_title);
        $clone.find(".exe_bareme span").html(def_bareme);
    }
	$clone.find(".exe_notes").hide();

	$clone.find(".exe_title span").blur(function(event) {
        var current_text = $(this).text();
		$(this).html(current_text);
		saveEditionExe($clone);
    });

    $clone.find(".exe_questions").sortable({
        axis: "y",
        cursor:"move",
        handle: ".que_move, .free_move[level~=exe_questions]",
        opacity: 0.8,
        placeholder: "s1_placeholder_que",
        revert: false,
        scroll: true,
        stop: function( event, ui ) {
            setTimeout("saveEdition()",10);
        }
    });
    $clone.find(".exe_menu .exe_minimize, .exe_menu .exe_maximize").click(function(event) {
        toggleExe($clone);
    });
    $clone.find(".exe_menu .exe_del").click(function(event) {
        deleteEditionExe($clone);
    });
	$clone.find(".exe_copy").click(function(event) {
        copyEditionExe($clone);
    });
    $clone.find(".new_que").click(function(event) {
        addEditionQue($clone);
    });
    $clone.find(".new_free").click(function(event) {
        addEditionFree($clone.find(".exe_questions"));
    });
    $clone.appendTo("#s1_det_que");

	if(def_title==null || def_bareme==null){
		$clone.find(".exe_title span").focus();
		$clone.find(".exe_title span").selectText();
    }

    return $clone;
}
function copyEditionExe($exe)
{
	var exe_content = "";
	var exe_pos = $exe.index();
	$.each(_content.data.exercices, function(nume,exercice) {
        if(nume == "_"+exe_pos){
			exe_content = JSON.stringify(exercice);
		}
    });
	$("#s2").html("<textarea style='width:100%;font-size:0.6em;'></textarea>");
	$("#s2").append("<div>Appuyer simultanément sur CTRL+C pour copier</div>");
	$("#s2 > textarea").val(exe_content);

	$("#s2").dialog({
		autoOpen: false,
		modal: true,
		closeText: "Fermer",
		title: "Copie d'un exercice",
		width:"50%",
		close: function() {
			$("#s2").html("");
			$("#s2").dialog( "close" );
		}
	});
	$("#s2").dialog( "open" );
	$("#s2 > textarea").select();
}
function pasteEditionExe($exe)
{
	$("#s2").html(
		"<textarea style='width:100%;font-size:0.6em;'></textarea>\
		<div>Appuyer simultanément sur CTRL+V pour coller</div>\
		<fieldset><legend>Coller les barèmes :</legend>\
	    <label for='paste_bareme_yes'>Oui</label><input checked type='radio' name='paste_bareme' id='paste_bareme_yes' value='1'>\
		<label for='paste_bareme_no'>Non</label><input type='radio' name='paste_bareme' id='paste_bareme_no' value='0'>\
		</fieldset>\
		<fieldset><legend>Coller les capacités :</legend>\
	    <label for='paste_capacite_yes'>Oui</label><input checked type='radio' name='paste_capacite' id='paste_capacite_yes' value='1'>\
		<label for='paste_capacite_no'>Non</label><input type='radio' name='paste_capacite' id='paste_capacite_no' value='0'>\
		</fieldset>");

	$( "#s2 input" ).checkboxradio({
		icon: false
    });

	$("#s2").dialog({
		autoOpen: false,
		modal: true,
		closeText: "Fermer",
		title: "Collage d'un exercice",
		width:"50%",
		buttons: {
				Coller: function() {
					try {

						var paste_bareme = false;
						var paste_capacite = false;
						if (parseInt($('input[name=paste_bareme]:checked').val()) == 1){
							paste_bareme = true;
						};
						if (parseInt($('input[name=paste_capacite]:checked').val()) == 1){
							paste_capacite = true;
						};

						var exercice = jQuery.parseJSON($("#s2 > textarea").val());
						if(exercice.type=="exe"){
							$exe = addEditionExe(exercice.title, paste_bareme?exercice.bareme:0);
							$.each(exercice.questions, function(numq,question) {
								if(question.type=="free"){
									$free = addEditionFree($exe.find(".exe_questions"), question.text);
								}else{
									$que = addEditionQue($exe, question.title, paste_bareme?question.bareme:0)
									$.each(question.criteres, function(numc,critere) {
										if(critere.type=="free"){
											$free = addEditionFree($que.find(".que_criteres"), critere.text);
										}else{
											$cri = addEditionCri($que, critere.text, paste_bareme?critere.bareme:0, paste_capacite?critere.competence:null)
										}
									});
								}
							});

							$("#s2").html("");
							$("#s2").dialog( "close" );
						}else{
							error_message("Le texte saisi ne correspond pas à un exercice !");
						}
					} catch (e) {
						error_message("Le texte saisi n'est pas valide !");
						console.error("Le texte saisi n'est pas valide : ", e);
					}
				}
			},
		close: function() {
			$("#s2").html("");
			$("#s2").dialog( "close" );
		}
	});
	$("#s2").dialog( "open" );
	$("#s2 > textarea").select();
}
/* Function in charge to save the exercise according to its state */
function saveEditionExe($exe)
{
    var exe_title = $exe.find(".exe_title span").html();
    if(exe_title!= ""){
        setTimeout("saveEdition()",10);
    }else{
        warning_message("Vous devez saisir un titre d\'exercice.")
    }
}
/* Function in charge to remove the exercise from the MMI and save removal */
function deleteEditionExe($exe)
{
    var nb_questions = $exe.find(".s1_det_question").length;
    var nb_criteres = $exe.find(".s1_det_critere").length;
    var msg_criteres = "";
    if(nb_questions+nb_criteres>0){
        msg_criteres = "(";
        if(nb_questions>0){
            msg_criteres += nb_questions+" question(s) ";
        }
        if(nb_criteres>0){
            if(nb_questions>0){msg_criteres += "et "}
            msg_criteres += nb_criteres+" critère(s) ";
        }
        msg_criteres += "dans l'exercice)";
    }

    if(confirm("Voulez-vous vraiment supprimer cet exercice "+msg_criteres+" ?")){

        var old_exe_bareme_val = 0;
        $.each($exe.children("span.exe_questions").children(".s1_det_question"), function(numq,question) {
            $.each($(this).children("span.que_criteres").children(".s1_det_critere"), function(numc,critere) {
                old_exe_bareme_val += Number(parseFloat($(this).find(".cri_bareme span:first-child").html()).toFixed(3));
            });
        });
        if(isNaN(old_exe_bareme_val)){old_exe_bareme_val=0;}

        updateEditionTotalBareme(old_exe_bareme_val,0);

        $exe.remove();
        setTimeout("saveEdition()",10);
    }
}
/* Function in charge of showing/hidding and exercise
   @input $exe : the exercise to toggle visibility
*/
function toggleExe($exe)
{
    if($exe.find(".exe_menu").find(".exe_minimize").length == 0){
        $exe.find(".exe_menu").find(".exe_maximize").removeClass("exe_maximize").addClass("exe_minimize");
    }else{
        $exe.find(".exe_menu").find(".exe_minimize").removeClass("exe_minimize").addClass("exe_maximize");
    }
    $exe.find(".exe_questions").toggle();
}
function updateEditionExeBareme($exe, old_value, new_value)
{
    var exe_bar_val = $exe.find(".exe_bareme").children("span").html();
    var exe_bar_val = parseFloat(exe_bar_val);
    $exe.find(".exe_bareme").children("span").html(exe_bar_val-old_value+new_value);
}
/* Function in charge of adding a question in the MMI
   @input exe : the exercise that contains the question
   @input def_title : optionnal. a default title for the question
   @input def_bareme : optionnal. a default value for the bareme of the question
   @return : the mmi object of the question
*/
function addEditionQue($exe, def_title, def_bareme)
{
    var $clone = $("#s1_det_question_template").clone();
    $clone.attr("id","");

    if(def_title==null || def_bareme==null){

    }else{
        $clone.find(".que_title span").html(def_title);
        $clone.find(".que_bareme span").html(def_bareme);
    }
	$clone.find(".que_notes").hide();

	$clone.find(".que_title span").blur(function(event) {
        var current_text = $(this).text();
		$(this).html(current_text);
		saveEditionQue($clone);
    });

    $clone.find(".que_criteres").sortable({
        axis: "y",
        cursor:"move",
        handle: ".cri_move, .free_move[level~=que_criteres]",
        opacity: 0.5,
        placeholder: "s1_placeholder_cri",
        revert: false,
        scroll: true,
        stop: function( event, ui ) {
            setTimeout("saveEdition()",10);
        }
    });
    $clone.find(".que_minimize, .que_maximize").click(function(event) {
        toggleQue($clone);
    });
    $clone.find(".que_menu .que_del").click(function(event) {
        deleteEditionQue($clone);
    });
    $clone.find(".new_cri").click(function(event) {
        addEditionCri($clone);
    });
    $clone.find(".new_free").click(function(event) {
        addEditionFree($clone.find(".que_criteres"));
    });

    $clone.appendTo($exe.children("span.exe_questions"));

    if ($exe.children(".exe_questions").is(":visible") == false){
        toggleExe($exe);
    }

	if(def_title==null || def_bareme==null){
		$clone.find(".que_title span").focus();
		$clone.find(".que_title span").selectText();
    }

	return $clone;
}
/* Function in charge to save the question according to its state */
function saveEditionQue($que)
{
    var que_title = $que.find(".que_title span").html();
    if(que_title!= ""){
        setTimeout("saveEdition()",10);
    }else{
        warning_message("Vous devez saisir un intitulé de question.")
    }
}
/* Function in charge to remove the question from the MMI, update inner exercise bareme and save removal */
function deleteEditionQue($que)
{
    var nb_criteres = $que.find(".s1_det_critere").length;
    var msg_criteres = "";
    if(nb_criteres>0){
        msg_criteres = "("+nb_criteres+" critère(s) dans la question)";
    }
    if(confirm("Voulez-vous vraiment supprimer cette question "+msg_criteres+" ?")){

        var old_que_bareme_val = 0;
        $.each($que.children("span.que_criteres").children(".s1_det_critere"), function(numc,critere) {
            old_que_bareme_val += Number(parseFloat($(this).find(".cri_bareme span:first-child").html()).toFixed(3));
        });
        if(isNaN(old_que_bareme_val)){old_que_bareme_val=0;}

        updateEditionExeBareme($que.parent().parent(),old_que_bareme_val,0);
        updateEditionTotalBareme(old_que_bareme_val,0);

        $que.remove();
        setTimeout("saveEdition()",10);
    }
}
/* Function in charge of showing/hidding a question
   @input $que : the question to toggle visibility
*/
function toggleQue($que)
{
    if($que.find(".que_menu").find(".que_minimize").length == 0){
        $que.find(".que_menu").find(".que_maximize").removeClass("que_maximize").addClass("que_minimize");
    }else{
        $que.find(".que_menu").find(".que_minimize").removeClass("que_minimize").addClass("que_maximize");
    }
    $que.find(".que_criteres").toggle();
}
function updateEditionQueBareme($que, old_value, new_value)
{
    var que_bar_val = $que.find(".que_bareme").children("span").html();
    var que_bar_val = parseFloat(que_bar_val);
    $que.find(".que_bareme").children("span").html(que_bar_val-old_value+new_value);
}
/* Function in charge of adding a criteria in the MMI
   @input que : the question that contains the criteria
   @input def_text : optionnal. a default text for the criteria
   @input def_bareme : optionnal. a default value for the bareme of the question
   @input def_competence : optionnal. a default competence for  question
   @return : the mmi object of the criteria
*/
function addEditionCri($que, def_text, def_bareme, def_competence){
    var $clone = $("#s1_det_critere_template").clone();
    $clone.attr("id","");
    $clone.find(".cri_text div").uniqueId();
    var cri_id = $clone.find(".cri_text div").attr("id");
    $clone.find(".cri_text div").attr("name",cri_id);

    if(def_text==null || def_bareme==null){

    }else{
		$clone.find(".cri_text > div").html(def_text);
        $clone.find(".cri_bareme span:first-child").html(def_bareme);
        $clone.find(".cri_bareme span:first-child").attr("old_bareme",def_bareme);

		if(def_competence){
			$clone.find(".cri_competence span:first-child").html(def_competence);
			var capacite = getCapacite(def_competence);
			if(capacite){
				$clone.find(".cri_competence span:first-child").attr("title",capacite.texte);
				$clone.find(".cri_competence span:first-child").css("color",capacite.competence.couleur);
			}else{
				$clone.find(".cri_competence span:first-child").attr("title",def_competence);
			}
		}
    }
	$clone.find(".cri_notes").hide();

    $clone.find(".cri_menu .cri_del").click(function(event) {
        deleteEditionCri($clone);
    });
    $clone.find(".cri_text div").focus(function(event) {
        CKEDITOR.inline(cri_id);
        CKEDITOR.on('instanceReady', function(event) {
            var editor = event.editor;
            if(typeof(editor) !== 'undefined') {
               editor.focus();
            }
        });
    });
	$clone.find(".cri_text div").blur(function(event) {
        saveEditionCri($clone);
    });
	$clone.find(".cri_bareme span").blur(function(event) {
        saveEditionCri($clone);
    });
	$clone.find(".cri_competence span").click(function(event) {
        chooseCompetence($clone);
    });

    $clone.appendTo($que.children("span.que_criteres"));

	if(def_text==null || def_bareme==null){
		$clone.find(".cri_text div").focus();
    }
    return $clone;
}
/* Function in charge to save the criteria according to its state */
function saveEditionCri($cri)
{
	var cri_text = $cri.find(".cri_text div").html();
	var cri_bareme = $cri.find(".cri_bareme span").html();

    if(cri_text!= "" && cri_bareme!= ""){
        var cri_bareme_val = parseFloat(cri_bareme);
        if(isNaN(cri_bareme_val)){
            warning_message("Votre barême n'est pas un nombre valide.")
        }else{
            cri_bareme_val = Number(cri_bareme_val.toFixed(3));
            var old_cri_bareme_val = Number(parseFloat($cri.find(".cri_bareme span:first-child").attr("old_bareme")).toFixed(3));
            if(isNaN(old_cri_bareme_val)){old_cri_bareme_val=0;}

			updateEditionQueBareme($cri.parent().parent(),old_cri_bareme_val,cri_bareme_val);
            updateEditionExeBareme($cri.parent().parent().parent().parent(),old_cri_bareme_val,cri_bareme_val);
            updateEditionTotalBareme(old_cri_bareme_val,cri_bareme_val);
			updateNotesBareme();

			$cri.find(".cri_bareme span:first-child").attr("old_bareme",cri_bareme_val)

            setTimeout("saveEdition()",10);
        }
    }else{
        warning_message("Vous devez saisir un critère et un barême pour le critère.")
    }
}
/* Function in charge to remove the criteria from the MMI, update inner question and exercise bareme and save removal */
function deleteEditionCri($cri)
{
    if(confirm("Voulez-vous vraiment supprimer ce critère ?")){

        var old_cri_bareme_val = Number(parseFloat($cri.find(".cri_bareme span:first-child").html()).toFixed(3));
        if(isNaN(old_cri_bareme_val)){old_cri_bareme_val=0;}

        updateEditionQueBareme($cri.parent().parent(),old_cri_bareme_val,0);
        updateEditionExeBareme($cri.parent().parent().parent().parent(),old_cri_bareme_val,0);
        updateEditionTotalBareme(old_cri_bareme_val,0);

        $cri.remove();
        setTimeout("saveEdition()",10);
    }
}

/* Function in charge of adding a free text in the MMI
   @input destination : the exercise, question or criteria that contains the free text
   @input def_text : optionnal. a default text for the free text
   @return : the mmi object of the free text
*/
function addEditionFree($destination, def_text)
{
    var $clone = $("#s1_det_freetext_template").clone();
    $clone.attr("id","");
    $clone.find(".free_text div").uniqueId();
    var free_id = $clone.find(".free_text div").attr("id");
    $clone.find(".free_text div").attr("name",free_id);

    if(def_text==null){
        $clone.find(".free_text > div").html("<p></p>");
    }else{
		$clone.find(".free_text > div").html(def_text);
    }
    $clone.find(".free_menu .free_del").click(function(event) {
        deleteEditionFree($clone);
    });

	$clone.find(".free_text div").focus(function(event) {
        CKEDITOR.inline(free_id);
        CKEDITOR.on('instanceReady', function(event) {
            var editor = event.editor;
            if(typeof(editor) !== 'undefined') {
               editor.focus();
            }
        });
    });
	$clone.find(".free_text div").blur(function(event) {
        saveEditionFree($clone);
    });

    $clone.appendTo($destination);
    $clone.find(".free_menu .free_move").attr("level",$clone.parent().attr("class"));

	if(def_text==null){
		$clone.find(".free_text div").focus();
    }

    return $clone;
}
/* Function in charge to save the free text according to its state */
function saveEditionFree($free)
{
	var free_text = $free.find(".free_text div").html();

    if(free_text!= ""){
        setTimeout("saveEdition()",10);
    }else{
        warning_message("Vous devez saisir un texte libre.")
    }
}
/* Function in charge to remove the free text from the MMI and save removal */
function deleteEditionFree($free)
{
    if(confirm("Voulez-vous vraiment supprimer ce texte libre ?")){
        $free.remove();
        setTimeout("saveEdition()",10);
    }
}