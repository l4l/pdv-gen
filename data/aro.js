// ARO/AIS offices — AIC A 19/2026 Anexo ALFA (ANAC). Hint only; verify before filing.
// Note: the Anexo lists only ICAO indicator, AMHS address, e-mail and phones. "name" and "local"
// are NOT printed in the AIC; "local" was cross-checked against ANAC MADHEL by ICAO indicator,
// and the app shows the MADHEL name (data/aerodromes.js) when available.
window.PDV_ARO_INFO = {
  aic: "A 19/2026",
  date: "2026-06-17",
  es: "Enviar el plan de vuelo completo, firmado y digitalizado en PDF, por correo electrónico a la oficina ARO/AIS del aeródromo de salida (o la más cercana en servicio), indicando en el asunto el N° de vuelo/matrícula; no enviarlo a TWR, ACC u otras dependencias. El usuario es responsable de confirmar telefónicamente con la oficina ARO/AIS la recepción y aceptación del plan. FPL, CHG, DLA y CNL se envían a las direcciones del Anexo ALFA dentro de los tiempos establecidos. Conservar el formulario durante 1 (un) año; ante falla de sistemas, presentarlo en papel.",
  en: "Send the complete flight plan, signed and scanned as a PDF, by e-mail to the ARO/AIS office of the departure aerodrome (or the nearest one in service), with the flight number/registration in the subject line; do not send it to TWR, ACC or other units. The user is responsible for phoning the ARO/AIS office to confirm receipt and acceptance. FPL, CHG, DLA and CNL go to the Annex ALFA addresses within the established times. Keep the form for 1 (one) year; if systems fail, file on paper."
};
window.PDV_ARO = [
  // FIR Resistencia
  {"name":"Corrientes","icao":"SARC","local":"CRR","email":"accrr@eana.com.ar","phone":["(+54 379) 4458844","ARO-AIS móvil/mobile (+54 9 379) 488177"],"amhs":"SARCZPZX"},
  {"name":"Resistencia","icao":"SARE","local":"SIS","email":"acsis@eana.com.ar","phone":["(+54 362) 4436280 - INT / EXT 32146-32151","(+54 3624) 436291/2/3"],"amhs":"SAREZPZX"},
  {"name":"Formosa","icao":"SARF","local":"FSA","email":"acfsa@eana.com.ar","phone":["(+54 370) 4454448"],"amhs":"SARFZPZX"},
  {"name":"Puerto Iguazú","icao":"SARI","local":"IGU","email":"acigu@eana.com.ar","phone":["(+54 3757) 564632","(+54 3757) 530075","(+54 11) 36701386","(+54 3757) 420595"],"amhs":"SARIZPZX"},
  {"name":"Paso de los Libres","icao":"SARL","local":"LIB","email":"aclib@eana.com.ar","phone":["Conmutador/Switch (+54 362) 4436291/2/3 - INT / EXT 32933","(+54 377) 2425528"],"amhs":"SARLZPZX"},
  {"name":"Posadas","icao":"SARP","local":"POS","email":"acpos@eana.com.ar","phone":["(+54 376) 4451903"],"amhs":"SARPZPZX"},
  {"name":"Goya","icao":"SATG","local":"GOY","email":"acgoy@eana.com.ar","phone":["(+54 3624) 436291-2-3 - INT / EXT 32972"],"amhs":"SATGZPZX"},
  {"name":"Reconquista","icao":"SATR","local":"RTA","email":"acrta@eana.com.ar","phone":["(+54 3624) 436291/2/3 - INT / EXT 32941"],"amhs":"SATRZPZX"},
  // FIR Córdoba
  {"name":"Córdoba","icao":"SACO","local":"CBA","email":"accba@eana.com.ar","phone":["(+54 351) 4756428"],"amhs":"SACOZPZX"},
  {"name":"Catamarca","icao":"SANC","local":"CAT","email":"accat@eana.com.ar","phone":["(+54 383) 4453686"],"amhs":"SANCZPZX"},
  {"name":"Santiago del Estero","icao":"SANE","local":"SDE","email":"acsde@eana.com.ar","phone":["(+54 385) 4340710 - INT / EXT 36960"],"amhs":"SANEZPZX"},
  {"name":"La Rioja","icao":"SANL","local":"LAR","email":"aclar@eana.com.ar","phone":["(+54 380) 4439211"],"amhs":"SANLZPZX"},
  {"name":"Tucumán","icao":"SANT","local":"TUC","email":"actuc@eana.com.ar","phone":["(+54 381) 4511036","(+54 381) 4260756 - INT / EXT 52311"],"amhs":"SANTZPZX"},
  {"name":"Valle del Conlara","icao":"SAOS","local":"SRC","email":"acsrc@eana.com.ar","phone":["(+54 9 351) 2921338"],"amhs":"SAOSZPZX"},
  {"name":"Salta","icao":"SASA","local":"SAL","email":"acsal@eana.com.ar","phone":["(+54 387) 4375113 - INT / EXT 52643 - 52648"],"amhs":"SASAZPZX"},
  {"name":"Jujuy","icao":"SASJ","local":"JUJ","email":"acjuj@eana.com.ar","phone":["(+54 388) 4911102","(+54 388) 4911104 - INT / EXT 131 / RTI 58212"],"amhs":"SASJZPZX"},
  {"name":"Termas de Río Hondo","icao":"SANR","local":"TRH","email":"actrh@eana.com.ar","phone":["(+54 11) 44802211/9 - INT / EXT 36926"],"amhs":"SANRZPZX"},
  {"name":"Río Cuarto","icao":"SAOC","local":"TRC","email":"acrcu@eana.com.ar","phone":["(+54 358) 4970883"],"amhs":"SAOCZPZX"},
  // FIR Mendoza
  {"name":"San Juan","icao":"SANU","local":"JUA","email":"acjua@eana.com.ar","phone":["(+54 264) 4250400 - INT / EXT 47614"],"amhs":"SANUZPZX"},
  {"name":"Mendoza","icao":"SAME","local":"DOZ","email":"acdoz@eana.com.ar","phone":["(+54 261) 4487486 - INT / EXT 65413 - 65337"],"amhs":"SAMEZPZX"},
  {"name":"Malargüe","icao":"SAMM","local":"MLG","email":"acmlg@eana.com.ar","phone":["(+54 260) 4471265"],"amhs":"SAMMZPZX"},
  {"name":"San Rafael","icao":"SAMR","local":"SRA","email":"acsra@eana.com.ar","phone":["(+54 260) 4430703"],"amhs":"SAMRZPZX"},
  {"name":"San Luis","icao":"SAOU","local":"UIS","email":"acuis@eana.com.ar","phone":["(+54 266) 4423047 - INT / RTI 43317","Móvil / Mobile (+54 9 11) 23604976"],"amhs":"SAOUZPZX"},
  {"name":"Villa Reynolds","icao":"SAOR","local":"RYD","email":"acryd@eana.com.ar","phone":["(+54 11) 54910878"],"amhs":"SAORZPZX"},
  // FIR Comodoro Rivadavia
  {"name":"Comodoro Rivadavia","icao":"SAVC","local":"CRV","email":"accrv@eana.com.ar","phone":["(+54 297) 4549439 - INT / EXT 50356","5374714, 4548084"],"amhs":"SAVCZPZX"},
  {"name":"Esquel","icao":"SAVE","local":"ESQ","email":"acesq@eana.com.ar","phone":["(+54 294) 5451354 - INT / EXT 45304 - 45300"],"amhs":"SAVEZPZX"},
  {"name":"Trelew","icao":"SAVT","local":"TRE","email":"actre@eana.com.ar","phone":["(+54 280) 4421009 - INT / EXT 46309","Corp.Ais-Com (+54 9 11) 31977395"],"amhs":"SAVTZPZX"},
  {"name":"Viedma","icao":"SAVV","local":"VIE","email":"acvie@eana.com.ar","phone":["(+54 2920) 424416 - INT / EXT 46203 - 46204"],"amhs":"SAVVZPZX"},
  {"name":"Puerto Madryn","icao":"SAVY","local":"DRY","email":"acdry@eana.com.ar","phone":["(+54 280) 4475938"],"amhs":"SAVYZPZX"},
  {"name":"El Calafate","icao":"SAWC","local":"ECA","email":"aceca@eana.com.ar","phone":["(+54 2902) 492051","(+54 2902) 493702","Ofic. Corporativo móvil / CorporativeOffice mobile (+54 9 2902) 485640"],"amhs":"SAWCZPZX"},
  {"name":"Río Grande","icao":"SAWE","local":"GRA","email":"acgde@eana.com.ar","phone":["(+54 2964) 492351 - INT / EXT 44209"],"amhs":"SAWEZPZX"},
  {"name":"Ushuaia","icao":"SAWH","local":"USU","email":"acusu@eana.com.ar","phone":["(+54 2901) 434390","(+54 11) 44802385 - INT / EXT 44306"],"amhs":"SAWHZPZX"},
  {"name":"Río Gallegos","icao":"SAWG","local":"GAL","email":"acgal@eana.com.ar","phone":["(+54 2966) 442044"],"amhs":"SAWGZPZX"},
  // FIR Ezeiza
  {"name":"Concordia","icao":"SAAC","local":"DIA","email":"acdia@eana.com.ar","phone":["(+54 11) 44802210"],"amhs":"SAACZPZX"},
  {"name":"Paraná","icao":"SAAP","local":"PAR","email":"acpar@eana.com.ar","phone":["(+54 343) 4261914 - INT / EXT 67324 - 67325"],"amhs":"SAAPZPZX"},
  {"name":"Rosario","icao":"SAAR","local":"ROS","email":"acros@eana.com.ar","phone":["(54 341) 4513202 - INT / EXT 1120 - 1134","(+54 341) 5038804"],"amhs":"SAARZPZX"},
  {"name":"Santa Fe (Sauce Viejo)","icao":"SAAV","local":"SVO","email":"acsvo@eana.com.ar","phone":["(+54 342) 4995065 - INT / EXT 67600"],"amhs":"SAAVZPZX"},
  {"name":"Aeroparque Jorge Newbery","icao":"SABE","local":"AER","email":"acaer@eana.com.ar","phone":["(+54 11) 45141513 / 1611"],"amhs":"SABEZPZX"},
  {"name":"Morón","icao":"SADM","local":"MOR","email":"acmor@eana.com.ar","phone":["(+54 11) 46279402","móvil / mobile (+54 9 11) 41792087"],"amhs":"SADMZPZX"},
  {"name":"San Fernando","icao":"SADF","local":"FDO","email":"acfdo@eana.com.ar","phone":["(+54 11) 45800261"],"amhs":"SADFZPZX"},
  {"name":"El Palomar","icao":"SADP","local":"PAL","email":"acpal@eana.com.ar","phone":["(+54 11) 60064271","(+54 11) 44802413"],"amhs":"SADPZPZX"},
  {"name":"Ezeiza","icao":"SAEZ","local":"EZE","email":"aceze@eana.com.ar","phone":["(+54 11) 44800331 - INT / EXT 57330","Fax (+54 11) 44802330"],"amhs":"SAEZZPZX"},
  {"name":"Bahía Blanca","icao":"SAZB","local":"BCA","email":"acbca@eana.com.ar","phone":["(+54 351) 4756428 - INT / EXT 36428"],"amhs":"SAZBZPZX"},
  {"name":"Mar del Plata","icao":"SAZM","local":"MDP","email":"acmdp@eana.com.ar","phone":["(+54 223) 4786444 - INT / EXT 53530"],"amhs":"SAZMZPZX"},
  {"name":"Neuquén","icao":"SAZN","local":"NEU","email":"acneu@eana.com.ar","phone":["(+54 011) 44802444"],"amhs":"SAZNZPZX"},
  {"name":"Santa Rosa","icao":"SAZR","local":"OSA","email":"acosa@eana.com.ar","phone":["(+54 2954) 426664 - INT / EXT 57064","(+54 2954) 433814"],"amhs":"SAZRZPZX"},
  {"name":"San Carlos de Bariloche","icao":"SAZS","local":"BAR","email":"acbar@eana.com.ar","phone":["(+54 294) 4405030/29 - INT / EXT 57870"],"amhs":"SAZSZPZX"},
  {"name":"Tandil","icao":"SAZT","local":"DIL","email":"acdil@eana.com.ar","phone":["(+54 249) 4440043","móvil / mobile (+54 9 11) 65290132"],"amhs":"SAZTZPZX"},
  {"name":"Chapelco (San Martín de los Andes)","icao":"SAZY","local":"CHP","email":"acchp@eana.com.ar","phone":["(+54 297) 2428398 INT / EXT 57975"],"amhs":"SAZYZPZX"}
];
