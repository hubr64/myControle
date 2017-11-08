var _version = 0.71;

var _semaphore = { };
_semaphore.mmi_load = false;
_semaphore.default_data_load = false;
_semaphore.meta_data_load = false;

var _content = {};
var _current_note_position = -1;
var _current_criteria_position = "";
var _modeNotation = false;
var _modeSuivi = false;
var _docIsEdited = false;
var _currentFileName = "";

var NO_CLASSE = "Aucune classe";
var NO_GRILLE = "Aucune grille de compétences";
var NO_COMPETENCE = "Aucune";
var TEXTE_CAPACITE = {"acquis":"<b>Acquis</b>","encours":"En cours","nonacquis":"Non acquis","inconnu":"Inconnu"};
var NOTATION_FINAL = {1:{titre:"Normal",description:"La note du devoir reste en l'état."},2:{titre:"Rapporté",description:"La note du devoir est ramenée sur la note cible (un élève qui a 22/22 avec une cible a 20 aura 20/20, un élève qui a 12/22 avec une cible à 20 aura 12/20)."},3:{titre:"Proportionnel",description:"La note du devoir est proportionelle à la note cible (un élève qui a 18/22 avec une cible à 20 aura 16,4/20)."}}

/*************************/
/*	   LOAD SECTION	*/
/*************************/
function loadindex()
{
	//init progress bar
	showProgressBar();

	//Load cookies
	load_cookie();

	//init content
	initContent();

	//Load all MMI items
	setTimeout("loadMMI()",10);

	//Load default data
	setTimeout("loadDefaultData()",10);

	//Load meta data
	setTimeout("loadMetaData()",10);

	//Load competence
	setTimeout("loadCompetences()",10);

	//Everythin is ended can continue
	if(_semaphore.mmi_load == false &&
	   _semaphore.meta_data_load &&
	   _semaphore.default_data_load == false
	){
		setTimeout("loadindex()",100);
	}else{
		setTimeout("hideProgressBar()",1000);
		setTimeout("toggleMenu()",1200);
	}
}
function initContent()
{
	_currentFileName = "";
	_content = {};
	_content.classes = global_configurations["classes"];
	_content.grilles = _grilles;
	_content.meta = {};
	_content.meta.version = _version;
	_content.meta.author = global_configurations["nom_professeur"];
	_content.meta.date_save = null;
	_content.data = {};
	_content.data.general = {};

	if(_modeSuivi == false){
		_content.data.general.titre = "Titre du devoir";
		_content.data.general.date = new Date();
		_content.data.general.classe = NO_CLASSE;
		_content.data.general.grille = {id:null, titre:NO_GRILLE, capacites:{}};
		_content.data.general.note_arrondi = 0.5;
		_content.data.general.note_final_mode = 1;
		_content.data.general.note_final_cible = 0;
		_content.data.general.bareme = 0;
		_content.data.general.stats = {mean: "Non évalué", min: "Non évalué", max: "Non évalué", nb_inf: "Non évalué"};
		_content.data.exercices = {};
		_content.data.notes = {};
		_content.data.groupes = [];
	}else{
		_content.data.general.titre = "Titre du suivi";
		_content.data.general.classe = NO_CLASSE;
		_content.data.general.grille = {id:null, titre:NO_GRILLE, capacites:{}};
		_content.data.general.stats = {nb: 0, mean: 0, max: 0, min: 0};
		_content.data.devoirs = [];
	}

	$("#s1_det_que").html("");
	reinitNotes();
	$("#s1_gen_competence tbody").html('<tr><td colspan="5">Non évalué</td></tr>');

	$("#gen_competence > span:nth-child(3)").hide();

	$("#s5_global > table > tbody").html("");
	$("#s5_pupil > table > tbody").html("");
	cleanSuiviDetails();
	cleanSuiviPupilDetails();

	$(".ui-dialog-content").dialog("close");
	$("#s4").hide();

	//Memorize that document is no more modified
	toggleDocumentEdition(false);
	resetDocumentSaveInfo();
}
function loadMMI()
{
	if(_semaphore.mmi_load == false)
	{
		window.onbeforeunload = confirmExit;
		function confirmExit()
		{
			if(_docIsEdited){
				return "Vous souhaitez quitter la page. Voulez-vous vraiment continuer ?";
			}
		}

		//Header
		$("header").hide();
		$("#s5").hide();
		$("#s1_note").hide();

		$("#head_new").click(function(event) {
			openNewDocument();
		});
		$("#head_edit").click(function(event) {
			openEditDocument();
		});
		$("#header_menu, #s1_menu, #s5_menu").click(function(event) {
			toggleMenu();
			event.stopPropagation();
		});
		$("#head_save").click(function(event) {
			saveDocument();
		});
		$("#head_print").click(function(event) {
			printDocumentEdition();
		});
		$("#head_print_correction").click(function(event) {
			printDocumentCorrection();
		});
		$("#head_export").click(function(event) {
			printDocumentNotes();
		});
		$("#head_print_bilan").click(function(event) {
			printDocumentBilan();
		});
		$("#head_new_suivi").click(function(event) {
			openNewSuivi();
		});
		$("#head_edit_suivi").click(function(event) {
			openEditSuivi();
		});
		$("#head_import_suivi").click(function(event) {
			importSuivi();
		});
		$("#head_export_global").click(function(event) {
			printSuiviGlobal();
		});
		$("#head_export_eleves").click(function(event) {
			printSuiviPupils();
		});
		$("#head_configurer").click(function(event) {
			load_configuration(false);
		});
		$("#head_import_suivi,#head_export_global, #head_export_eleves").hide();

		$("#s1_mode").click(function(event) {
			toggleModeNotation();
		});

		//General Information
		$("#s1_gen").accordion({
			collapsible: true,
			heightStyle: 'fill',
		});
		$("#s5_gen").accordion({
			active: false,
			collapsible: true,
			heightStyle: 'content',
		});
		$("#s5_stat").accordion({
			active: false,
			collapsible: true,
			heightStyle: 'content',
			beforeActivate: function( event, ui ) {
				if(ui.newPanel){
					updateStatSuivi(ui.newPanel.attr("id"));
				}
			},
		});

		$("#gen_title > span:nth-child(2)").blur(function(event) {
			_content.data.general.titre = $("#gen_title > span:nth-child(2)").html();
			//Memorize that document is modified
			toggleDocumentEdition(true);
		});
		$("#gen_date > span:nth-child(2)").click(function(event) {
			var gen_date = $(this).html().split("/");
			var gen_date = new Date(parseInt(gen_date[2]), (parseInt(gen_date[1])-1), parseInt(gen_date[0]));
			$(this).datepicker(
				"dialog",
				gen_date,
				function(dateText,inst){
					var gen_date = dateText.split("/");
					var gen_date = new Date(parseInt(gen_date[2]), (parseInt(gen_date[1])-1), (parseInt(gen_date[0])+1));
					_content.data.general.date = gen_date;
					$("#gen_date > span:nth-child(2)").html(dateText);
					//Memorize that document is modified
					toggleDocumentEdition(true);
				} ,
				{dateFormat:"dd/mm/yy",showButtonPanel:true,showWeek:true,duration:"fast",}, [event.pageX, event.pageY]);
			    $(this).datepicker( "option",$.datepicker.regional["fr"] );
		});

		$('#classe_menu').html("");
		$.each(global_configurations["classes"], function(classe_name,classe) {
			$('#classe_menu').append('<menuitem label="'+classe_name.substring(1)+'" icon="./style/images/classe.png"></menuitem>');
		});
		$("#classe_menu > menuitem").click(function(event) {
			var classe_name = $(this).attr("label");
			loadClasse(classe_name);
		});

		$('#grille_menu').html("");
		$.each(_grilles, function(grille_id,grille) {
			$('#grille_menu').append('<menuitem grille_id="'+grille_id+'" label="'+grille.titre+'" icon="./style/images/competence.png"></menuitem>');
		});
		$("#grille_menu > menuitem").click(function(event) {
			var grille_id = $(this).attr("grille_id");
			var grille_titre = $(this).attr("label");
			loadGrille(grille_id,grille_titre);
		});

		$("#gen_competence > span:nth-child(3), #s5_gen_competence > span:nth-child(3)").click(function(event) {
			seeCompetences();
		});

		$('#note_final_mode_menu').html("");
		$.each(NOTATION_FINAL, function(note_mode_id,note_mode) {
			$('#note_final_mode_menu').append('<menuitem note_mode_id="'+note_mode_id+'" title=""'+note_mode.description+'"" label="'+note_mode.titre+'" icon="./style/images/competence.png"></menuitem>');
		});
		$("#note_final_mode_menu > menuitem").click(function(event) {
			var note_mode_id = $(this).attr("note_mode_id");
			_content.data.general.note_final_mode = parseInt(note_mode_id);
			$('#gen_note_final_mode > span:nth-child(2)').html(NOTATION_FINAL[_content.data.general.note_final_mode].titre);
			$('#gen_note_final_mode > span:nth-child(2)').attr("title",NOTATION_FINAL[_content.data.general.note_final_mode].description);

			if(note_mode_id!="1"){
				$("#gen_note_final_cible").show();
			}else{
				$("#gen_note_final_cible").hide();
			}

			_content.data.general.note_final_cible = _content.data.general.bareme;
			$("#gen_note_final_cible > span:nth-child(2)").html(_content.data.general.note_final_cible);
			//Memorize that document is modified
			toggleDocumentEdition(true);
		});
		$("#gen_note_final_cible > span:nth-child(2)").blur(function(event) {
			//Get old value in cas of problem
			var old_note_final_cible = _content.data.general.note_final_cible;
			//Get new value, manage dot problem and convert it to float
			var new_note_final_cible = $("#gen_note_final_cible > span:nth-child(2)").html();
			new_note_final_cible = new_note_final_cible.replace(",", ".");
			_content.data.general.note_final_cible = parseFloat(new_note_final_cible);
			//If the value is not a valid float
			if(isNaN(_content.data.general.note_final_cible)){
				warning_message("Votre note cible n'est pas un nombre valide.");
				_content.data.general.note_final_cible = old_note_final_cible;
				$("#gen_note_final_cible > span:nth-child(2)").html(old_note_final_cible);
			}else{
				//If round is valid float but is zero (impossible to manage)
				if(_content.data.general.note_final_cible == 0){
					warning_message("Votre note cible ne peut pas être égale à 0.");
					_content.data.general.note_final_cible = old_note_final_cible;
					$("#gen_note_final_cible > span:nth-child(2)").html(old_note_final_cible);
				}else{
					$("#gen_note_final_cible > span:nth-child(2)").html(new_note_final_cible);
					//Memorize that document is modified
					toggleDocumentEdition(true);
				}
			}
			_content.data.general.note_final_cible = parseFloat($("#gen_note_final_cible > span:nth-child(2)").html());
		});
		//Manage the option of global note round
		$("#gen_note_arrondi > span:nth-child(2)").blur(function(event) {
			//Get old value in cas of problem
			var old_note_arrondi = _content.data.general.note_arrondi;
			//Get new value, manage dot problem and convert it to float
			var new_note_arrondi = $("#gen_note_arrondi > span:nth-child(2)").html();
			new_note_arrondi = new_note_arrondi.replace(",", ".");
			_content.data.general.note_arrondi = parseFloat(new_note_arrondi);
			//If the value is not a valid float
			if(isNaN(_content.data.general.note_arrondi)){
				warning_message("Votre arrondi de note n'est pas un nombre valide.");
				_content.data.general.note_arrondi = old_note_arrondi;
				$("#gen_note_arrondi > span:nth-child(2)").html(old_note_arrondi);
			}else{
				//If round is valid float but is zero (impossible to manage)
				if(_content.data.general.note_arrondi == 0){
					warning_message("Votre arrondi de note ne peut pas être égal à 0.");
					_content.data.general.note_arrondi = old_note_arrondi;
					$("#gen_note_arrondi > span:nth-child(2)").html(old_note_arrondi);
				}else{
					$("#gen_note_arrondi > span:nth-child(2)").html(new_note_arrondi);
					//Memorize that document is modified
					toggleDocumentEdition(true);
				}
			}
		});

		//Edition information
		$('#s1_det_new_exe').click(function(event) {
			addEditionExe();
		});
		$('#s1_det_new_free').click(function(event) {
			addEditionFree( $("#s1_det_que") );
		});
		$('#s1_det_paste_exe').click(function(event) {
			pasteEditionExe();
		});
		$('#s1_note_add_groupe').click(function(event) {
			dialogNoteGroupe();
		});
		$( "#s1_det_que").sortable({
			axis: "y",
			cursor:"move",
			handle: ".exe_move, .free_move[level~=exercices]",
			opacity: 0.8,
			placeholder: "s1_placeholder_exe",
			revert: false,
			scroll: true,
			helper: "clone",
			stop: function( event, ui ) {
				setTimeout("saveEdition()",10);
			}
		});
		$("#s1_det_info").dialog({
			autoOpen: false,
			modal: true,
			closeText: "Fermer",
			title: "Informations sur l'élève",
			width:950,
			buttons: {
				Annuler: function() {
					$("#s1_det_comment").html("");
					$("#s1_det_competence").html("");
					$("#s1_det_info_pupil").val("");
					$('#s1_det_comment_gen').show();
					$('#s1_det_comment_gen_text').hide();
					$("#s1_det_comment_gen_text").html("");
					$("#s1_det_info").dialog( "close" );
				},
				Enregistrer: function() {
					savePupilInfo();
					$("#s1_det_comment").html("");
					$("#s1_det_competence").html("");
					$("#s1_det_info_pupil").val("");
					$('#s1_det_comment_gen').show();
					$('#s1_det_comment_gen_text').hide();
					$("#s1_det_comment_gen_text").html("");
					$("#s1_det_info").dialog( "close" );
				}
			},
			close: function() {
				$("#s1_det_comment").html("");
				$("#s1_det_competence").html("");
				$("#s1_det_info_pupil").val("");
				$('#s1_det_comment_gen').show();
				$('#s1_det_comment_gen_text').hide();
				$("#s1_det_comment_gen_text").html("");
				$("#s1_det_info").dialog( "close" );
			}
		});
		$('#s1_det_comment_gen').click(function(event) {
			generateComment();
		});

		$("#s5_details").hide();
		$("#s5_pupil_details").hide();
		$("#s5_global .tablesorter").tablesorter( {
			theme : 'blue',
			widthFixed: true,
			widgets: ["zebra", "filter", "columns"],
			dateFormat : "ddmmyyyy"
		})
		.bind('filterEnd', function(e, filter) {
			if (e.type === 'filterEnd') {
				if(_modeSuivi == true){
					filterSuivi();
				}
			}
		});

		$("#s5_pupil .tablesorter").tablesorter( {
			theme : 'blue',
			widthFixed: true,
			widgets: ["zebra", "filter", "columns"],
		});
		$("#s5_det_notes").tablesorter({
			theme : 'blue',
			widthFixed: true,
			widgets: ["zebra", "filter", "columns"],
			dateFormat : "ddmmyyyy",
		});
		$("#s5_det_competences").tablesorter({
			theme : 'blue',
			widthFixed: true,
			widgets: ["zebra", "filter", "columns"],
			dateFormat : "ddmmyyyy",
		});
		$("#s5_det_pup_notes").tablesorter({
			theme : 'blue',
			sortList: [[0,0]],
			widthFixed: true,
			widgets: ["zebra", "filter", "columns"],
			dateFormat : "ddmmyyyy",
		});
		$("#s5_det_pup_competences").tablesorter({
			theme : 'blue',
			sortList: [[0,0]],
			widthFixed: true,
			widgets: ["zebra", "filter", "columns"],
			dateFormat : "ddmmyyyy",
		});
		$("#s5_det_pup_capacites").tablesorter({
			theme : 'blue',
			sortList: [[0,0]],
			widthFixed: true,
			widgets: ["zebra", "filter", "columns"],
			dateFormat : "ddmmyyyy",
		});

		updateProgressBar(33,true);

		_semaphore.mmi_load = true;
	}
}
function loadMetaData()
{
	if(_currentFileName == ""){
		$("#head_nosave").hide();
		$("#head_edit_file").val("");
	}else{
		$("#head_nosave").hide();
	}

	updateProgressBar(33,true);
	_semaphore.meta_data_load = true;
}
function loadDefaultData()
{
	$('#gen_title > span:nth-child(2)').html(_content.data.general.titre);
	$('#gen_date > span:nth-child(2)').html(_content.data.general.date.getDate()+'/'+(_content.data.general.date.getMonth()+1)+'/'+_content.data.general.date.getFullYear());
	$('#gen_classe > span:nth-child(2)').html(_content.data.general.classe);
	var pupils = _content.classes["_"+_content.data.general.classe];
	if(pupils){
		$("#gen_classe > span:nth-child(2)").attr("title",pupils.length+" élèves :\n"+pupils.join("\n"));
	}

	if(_content.data.general.grille){
		$('#gen_competence > span:nth-child(2)').html(_content.data.general.grille.titre);
	}
	if(_content.data.general.note_final_mode){
		$('#gen_note_final_mode > span:nth-child(2)').html(NOTATION_FINAL[_content.data.general.note_final_mode].titre);
		$('#gen_note_final_mode > span:nth-child(2)').attr("title",NOTATION_FINAL[_content.data.general.note_final_mode].description);
		$('#gen_note_final_cible > span:nth-child(2)').html(_content.data.general.note_final_cible);
		if(_content.data.general.note_final_mode && _content.data.general.note_final_mode != 1){
			$('#gen_note_final_cible').show();
		}else{
			$('#gen_note_final_cible').hide();
		}
	}
	if(_content.data.general.note_arrondi){
		$('#gen_note_arrondi > span:nth-child(2)').html(_content.data.general.note_arrondi);
	}
	$("#gen_mean > span:last-child").html(_content.data.general.stats.mean);
	$("#gen_minimum > span:last-child").html(_content.data.general.stats.min);
	$("#gen_maximum > span:last-child").html(_content.data.general.stats.max);
	$("#gen_inf_moyenne > span:last-child").html(_content.data.general.stats.nb_inf);

	$('#s1_det_title > span:nth-child(2)').html(_content.data.general.bareme);

	updateProgressBar(34,true);
	_semaphore.default_data_load = true;
}

/* Function in charge of loading the selected classe into the globa var _content and display it in memory
   @input classe_name : thr name of the classe to load
   @return : nothing
*/
function loadClasse(classe_name)
{
	//Get current classe name
	var old_classe = _content.data.general.classe;
	//If no old classe and no new classe (normally never happened)
	if(old_classe == NO_CLASSE && classe_name == NO_CLASSE){
		//Store new class name
		_content.data.general.classe = classe_name;
		//Memorize the classe content according to the value in configuration
		_content.classes["_"+_content.data.general.classe] = global_configurations["classes"]["_"+_content.data.general.classe];
		//Reset all the defined groupes
		_content.data.groupes = [];

	}
	//If no old classe and new classe
	if(old_classe == NO_CLASSE && classe_name != NO_CLASSE){
		//Store new class name_content
		_content.data.general.classe = classe_name;
		//Memorize the classe content according to the value in configuration
		_content.classes["_"+_content.data.general.classe] = global_configurations["classes"]["_"+_content.data.general.classe];
		//There are notes defined thus reset all notes
		_content.data.notes = {};
		//Reset all the defined groupes
		_content.data.groupes = [];
	}
	//If old classe and no new classe (normally never happened)
	if(old_classe != NO_CLASSE && classe_name == NO_CLASSE){
		//COnfirm the replacement as all notes will be erased
		if(confirm("Une classe était déjà en cours d'évaluation. Êtes vous sûr de vouloir ne plus choisir de classe ?")){
			//Store new class name
			_content.data.general.classe = classe_name;
			//Memorize the classe content according to the value in configuration
			_content.classes["_"+_content.data.general.classe] = global_configurations["classes"]["_"+_content.data.general.classe];
			//There are notes defined thus reset all notes
			_content.data.notes = {};
			//Reset all the defined groupes
			_content.data.groupes = [];
		}else{
			return;
		}
	}
	//If old classe and new classe and if the new classe is different from the old one
	if(old_classe != NO_CLASSE && classe_name != NO_CLASSE && classe_name != old_classe){
		//COnfirm the replacement as all notes will be erased
		if(confirm("Une classe était déjà en cours d'évaluation. Êtes vous sûr de vouloir changer de classe (toutes les notes déjà inscrites seront effacées) ?")){
			//Store new class name
			_content.data.general.classe = classe_name;
			//Memorize the classe content according to the value in configuration
			_content.classes["_"+_content.data.general.classe] = global_configurations["classes"]["_"+_content.data.general.classe];
			//There are notes defined thus reset all notes
			_content.data.notes = {};
			//Reset all the defined groupes
			_content.data.groupes = [];
		}else{
			return;
		}
	}

	//Get all pupils of the selected class
	var pupils = _content.classes["_"+_content.data.general.classe];
	//Display class name in MMI
	$("#gen_classe > span:nth-child(2)").html(classe_name);
	//Display all pupils of the classe in the MMI
	$("#gen_classe > span:nth-child(2)").attr("title",pupils.length+" élèves :\n"+pupils.join("\n"));
	//Memorize that document is modified
	toggleDocumentEdition(true);
}

/*************************/
/*   DOCUMENT SECTION	*/
/*************************/
function openNewDocument()
{
	if(_docIsEdited){
		if(confirm("Un fichier est en cours d'édition. Êtes-vous sûr de vouloir créer un nouveau document ?")){
			toggleMenu();
			openNewDocumentCb();
		}
	}else{
		toggleMenu();
		openNewDocumentCb();
	}
}
function openNewDocumentCb()
{
	_modeSuivi = false;
	toggleModeSuivi();

	initContent();
	loadMetaData();
	loadDefaultData();

	if(_modeNotation){
		toggleModeNotation();
	}
}
/* Function in charge of openning an existing document */
function openEditDocument()
{
	//First check if a document is not already edited
	if(_docIsEdited){
		//If edited, ask confirmation to continue
		if(confirm("Un fichier est en cours d'édition. Êtes vous sûr de vouloir ouvrir un document existant ?")){
			openEditDocumentCb();
		}
	}else{
		openEditDocumentCb();
	}
}
function openEditDocumentCb()
{
	//Prepare all (MMI and default data)
	openNewDocumentCb();

	//Make things as if the user has clicked on a browse button
	document.getElementById('head_edit_file').addEventListener('change', openDocumentFile, false);
	var elem = document.getElementById("head_edit_file");
	if(elem && document.createEvent) {
		var evt = document.createEvent("MouseEvents");
		evt.initEvent("click", true, false);
		elem.dispatchEvent(evt);
	}
}
function openDocumentFile(evt) {

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
		reader.onprogress = function(e) {
			if (e.lengthComputable) {
				var percentLoaded = Math.round((e.loaded / e.total) * 100);
				updateProgressBar(percentLoaded,false);
			}
		};
		reader.onabort = function(e) {
			hideProgressBar();
			warning_message('Abandon de l\'ouverture du fichier à votre demande.');
			_currentFileName = "";
		};
		reader.onloadstart = function(e) {
			updateProgressBar(0,false);
		};
		reader.onload = function(e) {
			loadDocumentFile(e.target.result);
		};
		_currentFileName = f.name;
		reader.readAsText(f);
	}
	document.getElementById('head_edit_file').removeEventListener('change', openDocumentFile);
}
function loadDocumentFile(file_content)
{
	var tmp_content = jQuery.parseJSON(file_content);
	setTimeout("hideProgressBar()",500);

	if(tmp_content == null){
		error_message("Le contenu du fichier n'est pas conforme.");
	}else{
		if(tmp_content.data.exercices){
			_content = tmp_content
			_content.meta.date_save = new Date(_content.meta.date_save);
			_content.data.general.date = new Date(_content.data.general.date);

			if(_content.data.general.grille.id){
				var grilles_count = Object.keys(_content.grilles).length;
				if(grilles_count == 0){
						warning_message("Une grille est définie mais la définition de cette grille n'est pas enregistrée dans le fichier.");
						if(_grilles[_content.data.general.grille.id]){
								_content.grilles[_content.data.general.grille.id] = _grilles[_content.data.general.grille.id];
								ok_message("La grille "+_content.data.general.grille.id+" a été associée à ce devoir.");
						}else{
								error_message("Impossible d'attribuer une grille à ce devoir.");
						}
				}
			}

			//Load meta data
			loadMetaData();
			//Load general data
			loadDefaultData();
			//Load exercices
			loadEdition();
			//Load competence
			loadCompetences();
			//Migrate document if necessary
			migrateContent();
			//Hide menu
			toggleMenu();
			//Memorize that document is not modified (just be opened)
			toggleDocumentEdition(false);
			//Display info on saved documents
			setDocumentSaveInfo();
		}else{
			error_message("Le fichier est valide mais ne correspond pas à un devoir.");
		}
	}
}
/* Function in charge of saving the current edited document */
function saveDocument()
{
	//First compute the save name
	var save_name = "";
	//If this a a new file the the name is computed from date and title
	if(_currentFileName == ""){
		var titre_for_file = _content.data.general.titre.replace(/[^a-z0-9]/gi,'');
		if(_content.data.general.date){
			save_name = _content.data.general.date.getFullYear()+""+(_content.data.general.date.getMonth()+1)+""+_content.data.general.date.getDate()+"_"+titre_for_file+'.json';
		}else{
			save_name = titre_for_file+'.json';
		}
	//If a file is already open then the file name will stay the same
	}else{
		save_name = _currentFileName;
	}

	//Store that new save date
	_content.meta.date_save = new Date();
	_currentFileName = save_name;

	//Transform json into string
	var content = JSON.stringify(_content);
	//Manage automatically the action of opennig a saving file dialog
	var saveLink = document.createElement('a');
	saveLink.setAttribute("download",_currentFileName);
	saveLink.setAttribute('href', 'data:text/json;base64,' + window.btoa(unescape(encodeURIComponent(content))));
	saveLink.appendChild(document.createTextNode(_currentFileName));
	document.getElementById('head_nosave').appendChild(saveLink);
	saveLink.click();
	//Remove finally the link
	$('#head_nosave > a').remove();
	//Memorize that document is modified
	toggleDocumentEdition(false);
}
/*************************/
/*	VARIOUS SECTION	*/
/*************************/
/* Function in charge of migrating data in the data model has changed between version */
function migrateContent()
{
	var has_migrate = false;

	//Migration pour la version 0.6 (traitement des unknown)
	if(_content.meta.version < 0.6)
	{
		console.log("Migration pour traitement des modes de notation.")
		_content.data.general.note_arrondi = 0.5;
		_content.data.general.note_final_mode = 1;
		_content.data.general.note_final_cible = 0;

		console.log("Migration nécessaire suite au traitement des unknown.");

		//On ne migre que s'il y a des notes
		if(Object.keys(_content.data.notes).length != 0){

			console.log("Des notes doivent être migrées ("+Object.keys(_content.data.notes).length+" notes).");

			has_migrate = true;
			alert("Une migration des données doit être réalisée. A la fin de la migration, il est conseillé d'enregistrer le document dans un nouveau fichier.");

			//First load all notes  in MMI
			loadNotes();

			//Then browse all notes and save them again in _content
			$.each($("#s1_note > table > thead > tr:nth-child(1) > th:not(:first-child)"), function(nume,pupil) {
				//Save this pupil note with the new bareme according to its position
				savePupilNotes($(this).index()+1);
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
function setDocumentSaveInfo(){
	$("#head_saveinfo").show();

	var document_info = "";
	if(_currentFileName){
		document_info += "Nom du fichier : "+_currentFileName;
	}
	if(_content.meta.author){
		document_info += "\nAuteur : "+_content.meta.author;
	}
	if(_content.meta.version){
		document_info += "\nVersion : "+_content.meta.version;
	}
	$("#head_saveinfo").attr("title",document_info);
}
function resetDocumentSaveInfo(){
	$("#head_saveinfo").hide();
	$("#head_saveinfo").removeAttr("title");
}
function toggleDocumentEdition(isEdited){

	if(isEdited){
		_docIsEdited = true;
		$("#head_nosave").show();
		if(_content.meta.date_save){
			$("#head_nosave").attr("title","Le document en cours a été modifié depuis son dernier enregistrement\nDernier enregistrement : "+_content.meta.date_save.toLocaleDateString()+" à "+_content.meta.date_save.toLocaleTimeString());
		}else{
			$("#head_nosave").attr("title","Ce document n'a jamais été enregistré");
		}
	}else{
		_docIsEdited = false;
		$("#head_nosave").hide();
		$("#head_nosave").removeAttr("title");
	}
}
function toggleMenu()
{
	$("header").animate({width:'toggle'},350);
}
function toggleModeNotation()
{
	var canToogle = true;
	if(_modeNotation == false)
	{
		if(_content.data.general.classe != NO_CLASSE){
			loadNotes();
			selectNotePupil();
			selectNoteCriteria(false);
			canToogle = true;
		}else{
			warning_message("Une classe doit d'abord être choisie pour continuer.");
			canToogle = false;
		}
	}else{
		canToogle = true;
	}

	if(canToogle == true){
		$('#s1_det').animate({height:'toggle'},350);
		$('#s1_note').animate({height:'toggle'},350);
		_modeNotation = !_modeNotation;
	}
}
function toggleModeSuivi()
{
	if(_modeSuivi == true){
		$("#s1").hide();
		$("#s5").show();
		$("#head_print, #head_export, #head_print_bilan, #head_print_correction").hide();
		$("#head_import_suivi,#head_export_global, #head_export_eleves").show();
	}else{
		$("#s1").show();
		$("#s5").hide();
		$("#head_print, #head_export, #head_print_bilan, #head_print_correction").show();
		$("#head_import_suivi,#head_export_global, #head_export_eleves").hide();
	}
}

function showProgressBar()
{
	$("#s0_bar").progressbar({
		value: false,
		change: function() {
			$("#s0_label").text($(this).progressbar( "value" ) + "%" );
		},
		complete: function() {
			$("#s0_label").text( "Terminé !" );
		}
	});
	$('#s0').show();
}
function updateProgressBar(value, delta)
{
	if($("#s0_bar").attr("role") == "progressbar"){
		var new_value = value;
		if(delta){
			new_value += ($("#s0_bar").progressbar( "value" ) || 0);
		}
		$("#s0_bar").progressbar( "option", "value", new_value );
	}
}
function hideProgressBar()
{
	$('#s0').hide();
	$("#s0_bar").progressbar( "destroy" );
}
function error_message(message)
{
	var temp_id = Math.floor((Math.random()*100)+1);
	$('#s3').append('<div class="error_box" id="error_'+temp_id+'"><div>Erreur !</div><div>'+message+'</div></div>');
	setTimeout('show_message("error_'+temp_id+'")',100);
}
function warning_message(message)
{
	var temp_id = Math.floor((Math.random()*100)+1);
	$('#s3').append('<div class="warning_box" id="warning_'+temp_id+'"><div>Attention !</div><div>'+message+'</div></div>');
	setTimeout('show_message("warning_'+temp_id+'")',100);
}
function ok_message(message)
{
	var temp_id = Math.floor((Math.random()*100)+1);
	$('#s3').append('<div class="message_box" id="message_'+temp_id+'"><div>Information</div><div>'+message+'</div></div>');
	setTimeout('show_message("message_'+temp_id+'")',100);
}
function show_message(box_id)
{
	$('#'+box_id).attr("selected","selected");
	setTimeout('hide_message("'+box_id+'")',5000);
}
function hide_message(box_id)
{
	$('#'+box_id).removeAttr("selected");
	setTimeout('delete_message("'+box_id+'")',500);
}
function delete_message(box_id)
{
	$('#'+box_id).remove();
}

function manage_key_up(e){
	var keynum;

	if(e.which)	{
		keynum = e.which;
	}
	if(keynum==117){//F6
		toggleModeNotation();
		return false;
	}
	if(keynum==119){//F8
		toggleMenu();
		return false;
	}

	if(_modeNotation == true){
		if( $("span:focus").length == 0 && $("input:focus").length == 0 && $("textarea:focus").length == 0 && $("#s1_det_comment:focus").length == 0 ){
			if(keynum==37){
				selectPrevNotePupil();
				e.preventDefault();
				return false;
			}
			if(keynum==39){
				selectNextNotePupil();
				e.preventDefault();
				return false;
			}
			if(keynum==38){
				selectPrevNoteCriteria();
				e.preventDefault();
				return false;
			}
			if(keynum==40){
				selectNextNoteCriteria();
				e.preventDefault();
				return false;
			}
			if(keynum==13){
				selectNextNoteCriteriaPupil();
				e.preventDefault();
				return false;
			}
			if(keynum==48 || keynum==96){
				updateNoteStateKey("note_unknown");
				e.preventDefault();
				return false;
			}
			if(keynum==49 || keynum==97){
				updateNoteStateKey("note_ko");
				e.preventDefault();
				return false;
			}
			if(keynum==50 || keynum==98){
				updateNoteStateKey("note_encours");
				e.preventDefault();
				return false;
			}
			if(keynum==51 || keynum==99){
				updateNoteStateKey("note_ok");
				e.preventDefault();
				return false;
			}
		}
	}
}
jQuery.fn.selectText = function(){
   var doc = document;
   var element = this[0];
   if (doc.body.createTextRange) {
	   var range = document.body.createTextRange();
	   range.moveToElementText(element);
	   range.select();
   } else if (window.getSelection) {
	   var selection = window.getSelection();
	   var range = document.createRange();
	   range.selectNodeContents(element);
	   selection.removeAllRanges();
	   selection.addRange(range);
   }
};