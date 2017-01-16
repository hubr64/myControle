var global_configurations = {};
var CONFIGURATION_EXPIRATION_DELAY = 365;
var DEFAULT_PROF_NAME = "Votre nom";
var COEFF_CAPACITE_ACQUIS = 0.8;
var COEFF_CAPACITE_ENCOURS = 0.5;
global_configurations["nom_professeur"] = DEFAULT_PROF_NAME;
global_configurations["classes"] = _classes;
global_configurations["coeff_capacite_acquis"] = COEFF_CAPACITE_ACQUIS;
global_configurations["coeff_capacite_encours"] = COEFF_CAPACITE_ENCOURS;

//Function called at start to get the configuration
function load_cookie()
{
    //Get current configuration according to cookie set
    var current_configuration = document.cookie;
    //If no cookie is set
    if(current_configuration != "" && current_configuration != null)
    {
        //Get cookies values
        var ca = document.cookie.split('; ');
        $.each(ca, function(key,c) {
            var c = c.split("=");
            global_configurations[c[0]] = c[1];
            //console.info("Cookie "+c[0]+" = "+c[1]);
        });
		
		if(global_configurations["classes"]){
			global_configurations["classes"] = jQuery.parseJSON(global_configurations["classes"]);
		}
    }
	
	if(global_configurations["nom_professeur"] == DEFAULT_PROF_NAME)
	{
		load_configuration(true);
	}
}
function load_configuration(first_init)
{	
	var config_init_step = 0;
	var config_nom_professeur = "";
	var config_coeff_capacite_acquis = "";
	var config_coeff_capacite_encours = "";
	var config_classes = {};
	var config_classes_str = "";
	
	if(first_init){
		$("#s2").html("<div id='s2_suivi_init'><div>Aucune configuration n'est actuellement réalisée !</div><div>Il est conseillé de réaliser la configuration pour créer un nouveau devoir sinon les valeurs par défaut seront utilisées.</div><div>Voulez-vous continuer ?</div></div>");
	}else{
		$("#s2").html("<div id='s2_suivi_init'><div>Vous allez modifier la configuration de l'outil.</div><div>Voulez-vous continuer ?</div></div>");
	}
	
	$("#s2").dialog({
		autoOpen: false,
		modal: true,
		closeText: "Annuler",
		title: "Configuration de myControle",
		width:"50%",
		maxHeight:"100%",
		buttons: [
			{
				id:"s2_init_next",
				text:"Continuer",
				click: function() {
					config_init_step++;
					if(config_init_step == 1){
						$("#s2 > div").html("<div>Votre nom :</div><input id='config_nom_professeur' type='text' value='"+global_configurations["nom_professeur"]+"'/><div>Coefficient de capacité acquise :</div><input id='config_coeff_capacite_acquis' type='text' value='"+global_configurations["coeff_capacite_acquis"]+"'/><div>Coefficient de capacité en cours d'acquisition :</div><input id='config_coeff_capacite_encours' type='text' value='"+global_configurations["coeff_capacite_encours"]+"'/>");
					}
					if(config_init_step == 2){
						config_nom_professeur = $("#config_nom_professeur").val();
						config_coeff_capacite_acquis = $("#config_coeff_capacite_acquis").val();
						config_coeff_capacite_encours = $("#config_coeff_capacite_encours").val();
						
						var config_classes_form = "";
						var config_classes_num = 1;
						$.each(global_configurations["classes"], function(classe_nom,classe_eleves) {
							
							classe_nom = classe_nom.substring(1);
							config_classes_form += "<div>Classe "+config_classes_num+" :</div><input id='config_classe_"+config_classes_num+"_nom' type='text' value='"+classe_nom+"'/><input id='config_classe_"+config_classes_num+"_eleves' type='text' value='"+classe_eleves+"'/>";
							config_classes_num++;
						});
						for(i=config_classes_num;i<11;i++){
							config_classes_form += "<div>Classe "+i+" :</div><input id='config_classe_"+i+"_nom' type='text' value=''/><input id='config_classe_"+i+"_eleves' type='text' value=''/>";
						}						
						$("#s2 > div").html(config_classes_form);
						$("#s2").dialog( "option", "position", { my: "center top", at: "center bottom", of: window } );
					}
					if(config_init_step == 3){
						
						var config_classes_erreur = false;
						for(i=1;i<11;i++){
							var config_classe_nom = $("#config_classe_"+i+"_nom").val();
							var config_classe_eleves = $("#config_classe_"+i+"_eleves").val();
							var config_classe_eleves_consolides = [];
							
							config_classe_nom = config_classe_nom.trim();
							config_classe_eleves = config_classe_eleves.split(",");
							
							if(config_classe_nom && config_classe_nom!="")
							{
								if (/^([a-zA-Z1-6]+)$/.test(config_classe_nom) == false){
									$("#config_classe_"+i+"_nom").attr("style","color:red;background-color:LightPink;font-weight:bold");
									config_classes_erreur = true;
								}else{
									$("#config_classe_"+i+"_nom").removeAttr("style");
									$("#config_classe_"+i+"_nom").attr("style","color:green;background-color:LightGreen");
								}

								for(j=0;j<config_classe_eleves.length;j++){
									var config_classe_eleve = config_classe_eleves[j].trim();
									if (/^[a-zA-ZÀ-ÿ\s\’-]{1,29}$/.test(config_classe_eleve) == false){
										$("#config_classe_"+i+"_eleves").attr("style","color:red;background-color:LightPink;font-weight:bold");
										config_classes_erreur = true;
									}else{
										config_classe_eleves_consolides.push(config_classe_eleve);
									}
								}
								
								if(config_classe_eleves_consolides.length == config_classe_eleves.length)
								{
									$("#config_classe_"+i+"_eleves").removeAttr("style");
									$("#config_classe_"+i+"_eleves").attr("style","color:green;background-color:LightGreen");
								}
								
								if(config_classes_erreur == false){
									config_classes["_"+config_classe_nom]=config_classe_eleves_consolides;
									config_classes_str += "<div><div><b>"+config_classe_nom+"</b></div><div><i>"+config_classe_eleves_consolides+"</i></div></div>";
								}
							}
						}	
						
						if(config_classes_erreur == true){
							config_init_step--;
						}else{
							$("#s2 > div").html("<div><div><b>Nom</b> : "+config_nom_professeur+"</div><div><b>Coefficient de capacité acquise</b> : "+config_coeff_capacite_acquis+"</div><div><b>Coefficient de capacité en cours d'acquisition</b> : "+config_coeff_capacite_encours+"</div><div><b>Classes</b> : "+config_classes_str+"</div></div><div>L'application doit redémarrer pour que la configuration soit prise en compte...</div>");
							$('#s2_init_next span').text('Terminer');
						}
					}
					if(config_init_step == 4){
						$("#s2").dialog( "close" );
						
						global_configurations["nom_professeur"] = config_nom_professeur;
						global_configurations["classes"] = config_classes;
						global_configurations["coeff_capacite_acquis"] = config_coeff_capacite_acquis;
						global_configurations["coeff_capacite_encours"] = config_coeff_capacite_encours;

						//Expiration of cookies is set to a certain number of days
						var date = new Date();
						date.setTime(date.getTime()+(CONFIGURATION_EXPIRATION_DELAY*24*60*60*1000));
						document.cookie = 'nom_professeur='+config_nom_professeur+'; expires='+date.toGMTString()+'; path=/'
						document.cookie = 'classes='+JSON.stringify(config_classes)+'; expires='+date.toGMTString()+'; path=/'							
						document.cookie = 'coeff_capacite_acquis='+config_coeff_capacite_acquis+'; expires='+date.toGMTString()+'; path=/'							
						document.cookie = 'coeff_capacite_encours='+config_coeff_capacite_encours+'; expires='+date.toGMTString()+'; path=/'							
						
						window.location.reload();
					}
				}
			},
			{
				id:"s2_init_cancel",
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