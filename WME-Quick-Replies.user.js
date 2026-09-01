// ==UserScript==
// @name         WME Quick Replies
// @name:es      WME Respuestas rápidas
// @namespace    https://github.com/danialonso/wme-quick-replies
// @version      2.1.0
// @description  Quick reply templates for Update Requests in Waze Map Editor. Unlimited replies, Normal/SuperFast modes, JSON import/export. Auto-detects EN/ES/FR/PT/DE and inserts the actual UR problem type.
// @description:es Plantillas de respuestas rápidas para las Solicitudes de actualización (UR) del Waze Map Editor. Respuestas ilimitadas, modos Normal/SuperFast, importar/exportar JSON. Detecta el idioma (EN/ES/FR/PT/DE) e inserta el tipo de problema real de la UR.
// @author       'osZONE' in Waze, 'Dani Alonso' in real world! :) https://www.linkedin.com/in/daalonso/
// @license      MIT
// @homepageURL  https://github.com/danialonso/wme-quick-replies
// @supportURL   https://github.com/danialonso/wme-quick-replies/issues
// @icon         https://www.waze.com/favicon.ico
// @match        https://www.waze.com/editor*
// @match        https://www.waze.com/*/editor*
// @match        https://beta.waze.com/editor*
// @match        https://beta.waze.com/*/editor*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const SCRIPT_VERSION = '2.1.0';

  /* ------------------------------------------------------------------ *
   *  Idioma  ·  Language
   *  Inglés por defecto; ES / FR / PT / DE si el editor está en ese idioma.
   *  Para añadir idiomas: amplía la lista 'supported', I18N y DEFAULTS.
   * ------------------------------------------------------------------ */
  const SUPPORTED = ['es', 'fr', 'pt', 'de']; // (+ 'en' por defecto)

  function detectLang() {
    // 1) Locale en la URL del editor: .../es-ES/editor, .../fr/editor, etc.
    const m = location.pathname.toLowerCase().match(/\/([a-z]{2})(?:-[a-z]{2})?\/editor/);
    const urlLoc = m ? m[1] : '';
    // 2) Atributo lang del documento (p. ej. "pt-BR" -> "pt")
    const htmlLang = (document.documentElement.getAttribute('lang') || '').toLowerCase().slice(0, 2);
    if (SUPPORTED.indexOf(urlLoc) !== -1) return urlLoc;
    if (SUPPORTED.indexOf(htmlLang) !== -1) return htmlLang;
    return 'en'; // por defecto
  }
  const LANG = detectLang();

  const I18N = {
    en: {
      tab: '💬 Quick Replies', tabTitle: 'Quick replies', button: '💬 Quick replies',
      empty: 'No replies configured. Edit them in the Scripts tab.',
      heading: '💬 Quick replies',
      help: 'Set up as many templates as you need. They appear next to the comment field of Update Requests. Leave the reply text empty to hide an entry.<br><br>The token <code>**problem type**</code> is automatically replaced with the request type (e.g. <em>Turn not allowed</em>) when you insert a reply.',
      reply: 'Reply', save: 'Save', reset: 'Restore defaults',
      saved: '✔ Replies saved successfully.', restored: '↺ Default templates restored.',
      modeHeading: 'Mode', modeNormal: 'Normal', modeSuperFast: 'SuperFast',
      modeHelp: '<strong>Normal</strong>: a single button opens a dropdown with all replies. <strong>SuperFast</strong>: each reply is shown as its own button (emoji + title), so one click is enough.',
      icon: 'Icon', title: 'Title', text: 'Reply',
      iconPh: '😀', titlePh: 'Short title for the button', textPh: 'Reply text…',
      emojiPick: 'Pick an emoji', emojiNone: 'No icon', emojiSearch: 'Search…', emojiNoResults: 'No emoji found.',
      emojiCats: { traffic: 'Traffic & map', status: 'Status', faces: 'Faces', hands: 'Hands', objects: 'Objects', misc: 'Misc' },
      addReply: '+ Add more replies', removeReply: 'Remove', removeConfirm: 'Remove this reply?',
      moveUp: 'Move up', moveDown: 'Move down',
      dataHeading: 'Backup & restore',
      dataHelp: 'Your settings live in this browser only. Export them to a JSON file to keep a backup or move them to another computer.',
      exportBtn: '⬇ Export JSON', importBtn: '⬆ Import JSON',
      exported: '⬇ Configuration exported.', imported: '⬆ Configuration imported successfully.',
      importError: '✖ That file is not a valid Quick Replies configuration.',
      resetConfirm: 'Restore the default templates?\n\nThis will permanently delete ALL your replies, titles, icons and the selected mode. This cannot be undone.\n\nTip: export your configuration first if you want a backup.',
      unsaved: '⚠ You have unsaved changes.',
      untitled: 'Reply'
    },
    es: {
      tab: '💬 Respuestas rápidas', tabTitle: 'Respuestas rápidas', button: '💬 Respuestas rápidas',
      empty: 'No hay respuestas configuradas. Edítalas en la pestaña Scripts.',
      heading: '💬 Respuestas rápidas',
      help: 'Configura tantas plantillas como necesites. Aparecerán junto al campo de comentario de las Solicitudes de actualización. Deja vacío el texto de una respuesta para ocultarla.<br><br>El token <code>**tipo problema**</code> se sustituye automáticamente por el tipo de la solicitud (ej. <em>Giro incorrecto</em>) al insertar la respuesta.',
      reply: 'Respuesta', save: 'Guardar', reset: 'Restaurar predefinidas',
      saved: '✔ Respuestas guardadas correctamente.', restored: '↺ Plantillas predefinidas restauradas.',
      modeHeading: 'Modo', modeNormal: 'Normal', modeSuperFast: 'SuperFast',
      modeHelp: '<strong>Normal</strong>: un único botón abre un desplegable con todas las respuestas. <strong>SuperFast</strong>: cada respuesta se muestra como su propio botón (emoji + título), así basta un clic.',
      icon: 'Icono', title: 'Título', text: 'Respuesta',
      iconPh: '😀', titlePh: 'Título corto para el botón', textPh: 'Texto de la respuesta…',
      emojiPick: 'Elegir un emoji', emojiNone: 'Sin icono', emojiSearch: 'Buscar…', emojiNoResults: 'Ningún emoji encontrado.',
      emojiCats: { traffic: 'Tráfico y mapa', status: 'Estado', faces: 'Caras', hands: 'Manos', objects: 'Objetos', misc: 'Varios' },
      addReply: '+ Añadir más respuestas', removeReply: 'Eliminar', removeConfirm: '¿Eliminar esta respuesta?',
      moveUp: 'Subir', moveDown: 'Bajar',
      dataHeading: 'Copia de seguridad',
      dataHelp: 'La configuración se guarda solo en este navegador. Expórtala a un archivo JSON para tener una copia de seguridad o llevártela a otro equipo.',
      exportBtn: '⬇ Exportar JSON', importBtn: '⬆ Importar JSON',
      exported: '⬇ Configuración exportada.', imported: '⬆ Configuración importada correctamente.',
      importError: '✖ Ese archivo no es una configuración válida de Respuestas rápidas.',
      resetConfirm: '¿Restaurar las plantillas predefinidas?\n\nSe eliminarán definitivamente TODAS tus respuestas, títulos, iconos y el modo seleccionado. Esta acción no se puede deshacer.\n\nConsejo: exporta antes tu configuración si quieres una copia de seguridad.',
      unsaved: '⚠ Tienes cambios sin guardar.',
      untitled: 'Respuesta'
    },
    fr: {
      tab: '💬 Réponses rapides', tabTitle: 'Réponses rapides', button: '💬 Réponses rapides',
      empty: "Aucune réponse configurée. Modifiez-les dans l'onglet Scripts.",
      heading: '💬 Réponses rapides',
      help: "Configurez autant de modèles que nécessaire. Ils apparaissent à côté du champ de commentaire des demandes de mise à jour. Laissez le texte d'une réponse vide pour la masquer.<br><br>Le jeton <code>**type de problème**</code> est automatiquement remplacé par le type de la demande (ex. <em>Virage interdit</em>) lors de l'insertion d'une réponse.",
      reply: 'Réponse', save: 'Enregistrer', reset: 'Restaurer les valeurs par défaut',
      saved: '✔ Réponses enregistrées avec succès.', restored: '↺ Modèles par défaut restaurés.',
      modeHeading: 'Mode', modeNormal: 'Normal', modeSuperFast: 'SuperFast',
      modeHelp: '<strong>Normal</strong> : un seul bouton ouvre un menu avec toutes les réponses. <strong>SuperFast</strong> : chaque réponse devient son propre bouton (emoji + titre), un seul clic suffit.',
      icon: 'Icône', title: 'Titre', text: 'Réponse',
      iconPh: '😀', titlePh: 'Titre court pour le bouton', textPh: 'Texte de la réponse…',
      emojiPick: 'Choisir un emoji', emojiNone: 'Aucune icône', emojiSearch: 'Rechercher…', emojiNoResults: 'Aucun emoji trouvé.',
      emojiCats: { traffic: 'Trafic et carte', status: 'Statut', faces: 'Visages', hands: 'Mains', objects: 'Objets', misc: 'Divers' },
      addReply: '+ Ajouter des réponses', removeReply: 'Supprimer', removeConfirm: 'Supprimer cette réponse ?',
      moveUp: 'Monter', moveDown: 'Descendre',
      dataHeading: 'Sauvegarde et restauration',
      dataHelp: "La configuration est enregistrée uniquement dans ce navigateur. Exportez-la dans un fichier JSON pour la sauvegarder ou la transférer sur un autre ordinateur.",
      exportBtn: '⬇ Exporter JSON', importBtn: '⬆ Importer JSON',
      exported: '⬇ Configuration exportée.', imported: '⬆ Configuration importée avec succès.',
      importError: '✖ Ce fichier n\'est pas une configuration valide de Réponses rapides.',
      resetConfirm: 'Restaurer les modèles par défaut ?\n\nTOUTES vos réponses, titres, icônes et le mode sélectionné seront définitivement supprimés. Cette action est irréversible.\n\nConseil : exportez d\'abord votre configuration si vous souhaitez une sauvegarde.',
      unsaved: '⚠ Vous avez des modifications non enregistrées.',
      untitled: 'Réponse'
    },
    pt: {
      tab: '💬 Respostas rápidas', tabTitle: 'Respostas rápidas', button: '💬 Respostas rápidas',
      empty: 'Não há respostas configuradas. Edita-as no separador Scripts.',
      heading: '💬 Respostas rápidas',
      help: "Configura tantos modelos quantos precisares. Aparecem junto ao campo de comentário dos Pedidos de atualização. Deixa o texto de uma resposta vazio para a ocultar.<br><br>O token <code>**tipo de problema**</code> é substituído automaticamente pelo tipo do pedido (ex. <em>Curva proibida</em>) ao inserir uma resposta.",
      reply: 'Resposta', save: 'Guardar', reset: 'Restaurar predefinições',
      saved: '✔ Respostas guardadas com sucesso.', restored: '↺ Modelos predefinidos restaurados.',
      modeHeading: 'Modo', modeNormal: 'Normal', modeSuperFast: 'SuperFast',
      modeHelp: '<strong>Normal</strong>: um único botão abre um menu com todas as respostas. <strong>SuperFast</strong>: cada resposta aparece como o seu próprio botão (emoji + título), basta um clique.',
      icon: 'Ícone', title: 'Título', text: 'Resposta',
      iconPh: '😀', titlePh: 'Título curto para o botão', textPh: 'Texto da resposta…',
      emojiPick: 'Escolher um emoji', emojiNone: 'Sem ícone', emojiSearch: 'Procurar…', emojiNoResults: 'Nenhum emoji encontrado.',
      emojiCats: { traffic: 'Trânsito e mapa', status: 'Estado', faces: 'Caras', hands: 'Mãos', objects: 'Objetos', misc: 'Vários' },
      addReply: '+ Adicionar mais respostas', removeReply: 'Remover', removeConfirm: 'Remover esta resposta?',
      moveUp: 'Subir', moveDown: 'Descer',
      dataHeading: 'Cópia de segurança',
      dataHelp: 'A configuração é guardada apenas neste navegador. Exporta-a para um ficheiro JSON para teres uma cópia de segurança ou a levares para outro computador.',
      exportBtn: '⬇ Exportar JSON', importBtn: '⬆ Importar JSON',
      exported: '⬇ Configuração exportada.', imported: '⬆ Configuração importada com sucesso.',
      importError: '✖ Esse ficheiro não é uma configuração válida de Respostas rápidas.',
      resetConfirm: 'Restaurar os modelos predefinidos?\n\nTODAS as tuas respostas, títulos, ícones e o modo selecionado serão eliminados definitivamente. Esta ação não pode ser anulada.\n\nSugestão: exporta primeiro a tua configuração se quiseres uma cópia de segurança.',
      unsaved: '⚠ Tens alterações por guardar.',
      untitled: 'Resposta'
    },
    de: {
      tab: '💬 Schnellantworten', tabTitle: 'Schnellantworten', button: '💬 Schnellantworten',
      empty: 'Keine Antworten konfiguriert. Bearbeite sie im Tab Scripts.',
      heading: '💬 Schnellantworten',
      help: "Richte so viele Vorlagen ein, wie du brauchst. Sie erscheinen neben dem Kommentarfeld der Update-Anfragen. Lass den Antworttext leer, um einen Eintrag auszublenden.<br><br>Der Platzhalter <code>**Problemtyp**</code> wird beim Einfügen automatisch durch den Anfragetyp ersetzt (z. B. <em>Abbiegen verboten</em>).",
      reply: 'Antwort', save: 'Speichern', reset: 'Standard wiederherstellen',
      saved: '✔ Antworten erfolgreich gespeichert.', restored: '↺ Standardvorlagen wiederhergestellt.',
      modeHeading: 'Modus', modeNormal: 'Normal', modeSuperFast: 'SuperFast',
      modeHelp: '<strong>Normal</strong>: Eine einzige Schaltfläche öffnet ein Menü mit allen Antworten. <strong>SuperFast</strong>: Jede Antwort wird als eigene Schaltfläche angezeigt (Emoji + Titel) – ein Klick genügt.',
      icon: 'Symbol', title: 'Titel', text: 'Antwort',
      iconPh: '😀', titlePh: 'Kurzer Titel für die Schaltfläche', textPh: 'Antworttext…',
      emojiPick: 'Emoji auswählen', emojiNone: 'Kein Symbol', emojiSearch: 'Suchen…', emojiNoResults: 'Kein Emoji gefunden.',
      emojiCats: { traffic: 'Verkehr & Karte', status: 'Status', faces: 'Gesichter', hands: 'Hände', objects: 'Objekte', misc: 'Sonstiges' },
      addReply: '+ Weitere Antworten hinzufügen', removeReply: 'Entfernen', removeConfirm: 'Diese Antwort entfernen?',
      moveUp: 'Nach oben', moveDown: 'Nach unten',
      dataHeading: 'Sicherung & Wiederherstellung',
      dataHelp: 'Die Konfiguration wird nur in diesem Browser gespeichert. Exportiere sie in eine JSON-Datei, um eine Sicherung zu behalten oder sie auf einen anderen Computer zu übertragen.',
      exportBtn: '⬇ JSON exportieren', importBtn: '⬆ JSON importieren',
      exported: '⬇ Konfiguration exportiert.', imported: '⬆ Konfiguration erfolgreich importiert.',
      importError: '✖ Diese Datei ist keine gültige Schnellantworten-Konfiguration.',
      resetConfirm: 'Standardvorlagen wiederherstellen?\n\nALLE deine Antworten, Titel, Symbole und der gewählte Modus werden endgültig gelöscht. Das kann nicht rückgängig gemacht werden.\n\nTipp: Exportiere vorher deine Konfiguration, wenn du eine Sicherung möchtest.',
      unsaved: '⚠ Du hast ungespeicherte Änderungen.',
      untitled: 'Antwort'
    }
  };
  const T = I18N[LANG] || I18N.en;

  /* ------------------------------------------------------------------ *
   *  Configuración y almacenamiento
   *  Esquema v2: { schemaVersion, scriptVersion, mode, replies:[{icon,title,text}] }
   * ------------------------------------------------------------------ */
  const STORAGE_KEY = 'WME_QuickReplies_v1'; // se mantiene la misma clave: migración in-place
  const SCHEMA_VERSION = 2;
  const MODES = ['normal', 'superfast'];

  // Tokens que se sustituyen por el tipo de la solicitud (en el idioma del editor).
  const TYPE_TOKENS = [
    /\*\*\s*tipo(?:\s+de)?\s+problema\s*\*\*/gi,   // ES y PT ("tipo de problema")
    /\*\*\s*problem\s*type\s*\*\*/gi,              // EN
    /\*\*\s*type\s+de\s+probl[eè]me\s*\*\*/gi,     // FR
    /\*\*\s*problemtyp\s*\*\*/gi,                  // DE
    /\{\s*tipo(?:[ _]problema)?\s*\}/gi,
    /\{\s*problem[ _]?type\s*\}/gi,
    /\{\s*type\s*\}/gi
  ];

  /* ------------------------------------------------------------------ *
   *  Catálogo de emojis del selector
   *  Cada entrada: [emoji, 'palabras clave multiidioma para el buscador']
   * ------------------------------------------------------------------ */
  const EMOJI_CATS = [
    { key: 'traffic', tab: '🚦', items: [
      ['🚦', 'traffic light semaforo semaforo feu ampel'],
      ['🚥', 'traffic light semaforo feu ampel'],
      ['🛑', 'stop pare arret halt'],
      ['🚧', 'works obras travaux baustelle construccion'],
      ['🛣️', 'road carretera estrada route strasse autopista'],
      ['🛤️', 'rail via voie schiene tren'],
      ['🗺️', 'map mapa carte karte'],
      ['📍', 'pin location ubicacion localizacion lieu ort'],
      ['🧭', 'compass brujula bussola boussole kompass navegacion'],
      ['🚗', 'car coche carro voiture auto'],
      ['🚙', 'car suv coche voiture auto'],
      ['🚕', 'taxi'],
      ['🚌', 'bus autobus autocarro'],
      ['🚚', 'truck camion camiao lkw'],
      ['🛻', 'truck pickup camioneta'],
      ['🏍️', 'motorbike moto motorrad'],
      ['🛵', 'scooter moto'],
      ['🚲', 'bike bici bicicleta velo fahrrad'],
      ['🚶', 'pedestrian peaton peao pieton fussganger walk'],
      ['🚏', 'bus stop parada arret haltestelle'],
      ['🅿️', 'parking aparcamiento estacionamento parken'],
      ['⛽', 'fuel gas gasolinera combustible tankstelle'],
      ['🚨', 'emergency emergencia urgence notfall alerta'],
      ['🚓', 'police policia polizei'],
      ['🌉', 'bridge puente ponte pont brucke'],
      ['🚇', 'metro subway ubahn'],
      ['✈️', 'airport aeropuerto avion flughafen'],
      ['⚓', 'port puerto porto hafen']
    ]},
    { key: 'status', tab: '✅', items: [
      ['✅', 'ok done solved resuelto resolvido resolu erledigt bien'],
      ['✔️', 'ok check tick correcto'],
      ['☑️', 'checkbox marcado'],
      ['❌', 'no error wrong mal falso falsch'],
      ['✖️', 'no cancel cancelar'],
      ['⚠️', 'warning aviso atencion attention warnung cuidado'],
      ['❓', 'question pregunta duda info question frage'],
      ['❔', 'question pregunta duda'],
      ['❗', 'important importante wichtig'],
      ['‼️', 'urgent urgente dringend'],
      ['⏳', 'wait espera pending pendiente attente warten recordatorio'],
      ['⌛', 'time tiempo timeout espera'],
      ['⏰', 'alarm reminder recordatorio alarma wecker'],
      ['🕐', 'clock hora reloj heure uhr'],
      ['🔒', 'closed cerrado fechado ferme geschlossen bloqueado'],
      ['🔓', 'open abierto aberto ouvert offen'],
      ['🔁', 'repeat repetir wiederholen'],
      ['🔄', 'update actualizar atualizar mise a jour aktualisieren'],
      ['🆕', 'new nuevo novo nouveau neu'],
      ['🆗', 'ok'],
      ['🏁', 'finish final fin ende cierre'],
      ['🎯', 'target objetivo cible ziel'],
      ['⭐', 'star estrella etoile stern favorito'],
      ['🌟', 'star estrella destacado'],
      ['🔔', 'bell notification aviso notificacion glocke'],
      ['🔕', 'mute silencio silenciado'],
      ['📈', 'up subida mejora'],
      ['📉', 'down bajada']
    ]},
    { key: 'faces', tab: '🙂', items: [
      ['😀', 'smile sonrisa sorriso sourire lachen feliz'],
      ['😃', 'smile sonrisa feliz'],
      ['😄', 'happy feliz content'],
      ['😁', 'grin sonrisa'],
      ['😊', 'happy amable simpatico'],
      ['🙂', 'smile sonrisa neutral'],
      ['😉', 'wink guino clin zwinkern'],
      ['😍', 'love amor gusta'],
      ['🤩', 'wow genial toll'],
      ['🤔', 'think pensar duda reflexion denken'],
      ['🤨', 'doubt duda sospecha'],
      ['😐', 'neutral neutro'],
      ['😴', 'sleep dormir inactivo sin respuesta'],
      ['😅', 'sweat nervios'],
      ['😂', 'laugh risa rire lachen'],
      ['🥳', 'party fiesta festa celebracion'],
      ['😎', 'cool guay'],
      ['🙃', 'upside irony ironia'],
      ['😢', 'sad triste'],
      ['😱', 'shock susto'],
      ['🤖', 'bot robot script automatico'],
      ['👤', 'user usuario utilisateur benutzer wazer']
    ]},
    { key: 'hands', tab: '👍', items: [
      ['👍', 'thumbs up bien gracias ok daumen pouce'],
      ['👎', 'thumbs down mal no'],
      ['👌', 'ok perfecto'],
      ['✋', 'stop mano hand main'],
      ['🤚', 'hand mano'],
      ['👏', 'clap aplauso applaudir gracias'],
      ['🙌', 'celebrate celebracion gracias'],
      ['🙏', 'thanks gracias obrigado merci danke por favor please'],
      ['🤝', 'deal acuerdo colaboracion handshake'],
      ['💪', 'strong fuerza animo'],
      ['👋', 'hello hola ola salut hallo saludo bienvenida'],
      ['👇', 'down abajo'],
      ['👆', 'up arriba'],
      ['👉', 'right derecha siguiente'],
      ['👈', 'left izquierda'],
      ['✍️', 'write escribir redactar schreiben'],
      ['🤷', 'shrug no se unknown desconocido']
    ]},
    { key: 'objects', tab: '💬', items: [
      ['💬', 'comment comentario comentario commentaire kommentar chat mensaje'],
      ['🗨️', 'chat mensaje message'],
      ['🗯️', 'shout queja'],
      ['📝', 'note nota edit editar notiz'],
      ['📄', 'document documento file archivo'],
      ['📋', 'clipboard portapapeles lista'],
      ['📌', 'pin chincheta fijar'],
      ['📎', 'clip adjunto anexo'],
      ['📢', 'announce anuncio aviso ankundigung'],
      ['📣', 'megaphone aviso'],
      ['📧', 'email correo mail'],
      ['✉️', 'mail correo carta'],
      ['📨', 'incoming mail correo recibido'],
      ['📬', 'mailbox buzon'],
      ['🔍', 'search buscar investigar recherche suchen revisar'],
      ['🔎', 'search buscar zoom'],
      ['💡', 'idea sugerencia tip vorschlag'],
      ['🔧', 'fix arreglar reparar reparer reparieren'],
      ['🛠️', 'tools herramientas ferramentas outils werkzeuge arreglado'],
      ['⚙️', 'settings ajustes configuracion einstellungen'],
      ['🧰', 'toolbox herramientas'],
      ['📅', 'calendar calendario fecha date datum'],
      ['📊', 'chart grafico datos'],
      ['🔗', 'link enlace ligacao lien'],
      ['📷', 'photo foto imagen bild'],
      ['📱', 'phone movil telefono app'],
      ['💻', 'computer ordenador editor pc']
    ]},
    { key: 'misc', tab: '✨', items: [
      ['✨', 'sparkles nuevo brillo magia'],
      ['🎉', 'party gracias celebracion festa'],
      ['❤️', 'heart corazon amor gracias'],
      ['💙', 'heart blue corazon azul waze'],
      ['💚', 'heart green corazon verde'],
      ['🧡', 'heart orange corazon naranja'],
      ['🔥', 'fire urgente hot'],
      ['💧', 'water agua lluvia inundacion'],
      ['🌧️', 'rain lluvia chuva pluie regen'],
      ['❄️', 'snow nieve neve neige schnee hielo'],
      ['☀️', 'sun sol soleil sonne'],
      ['🌍', 'world mundo europa africa'],
      ['🌎', 'world mundo america'],
      ['🌐', 'globe web internet global'],
      ['🌳', 'tree arbol arvore arbre baum vegetacion'],
      ['🏠', 'home casa hogar maison haus direccion'],
      ['🏢', 'building edificio empresa lugar poi'],
      ['🏗️', 'construction obra construccion baustelle'],
      ['🚀', 'rocket rapido superfast schnell'],
      ['🏆', 'trophy premio ganador'],
      ['🎁', 'gift regalo'],
      ['📦', 'box paquete caja'],
      ['🧩', 'puzzle pieza problema'],
      ['🗑️', 'trash borrar eliminar papelera']
    ]}
  ];

  // Iconos y títulos predefinidos (comunes a todos los idiomas).
  const DEFAULT_ICONS = ['❓', '⏳', '✅', '🔒', '💬'];
  const DEFAULT_TITLES = {
    en: ['More info', 'Reminder', 'Solved', 'Closing', ''],
    es: ['Más info', 'Recordatorio', 'Resuelto', 'Cierre', ''],
    fr: ['Plus d\'infos', 'Rappel', 'Résolu', 'Clôture', ''],
    pt: ['Mais info', 'Lembrete', 'Resolvido', 'Fecho', ''],
    de: ['Mehr Infos', 'Erinnerung', 'Gelöst', 'Abschluss', '']
  };

  // Plantillas predefinidas por idioma.
  const DEFAULTS = {
    en: [
      "Hi Wazer! Could you please provide more details about the reported problem (**problem type**) so we can fix it? Thank you very much!",
      "Hi Wazer. We haven't heard back from you. If we don't receive any updates, we'll close this request as 'Not identified'. Thank you!",
      "Hi Wazer! Thank you so much for your report — thanks to it we've been able to apply corrections in the area! The updated changes will appear in Waze within 48h. Thanks again for your help!",
      "Hi Wazer! Since we haven't received any responses regarding this update request, we're closing it as 'Not identified', but don't hesitate to report any problem you come across again. We'll be happy to fix it!",
      ""
    ],
    es: [
      "Hola Wazer! Por favor, ¿nos puedes dar más detalles del problema reportado (**tipo problema**) para que podamos solucionarlo? Muchas gracias!",
      "Hola Wazer. No hemos recibido respuesta por tu parte. Si no recibimos actualizaciones, procederemos a cerrar la solicitud como 'No identificado'. Muchas gracias!",
      "Hola Wazer! Muchas gracias por tu reporte, gracias a él hemos podido aplicar correcciones en la zona! En 48h se mostrarán los cambios actualizados en Waze. De nuevo, muchas gracias por tu ayuda!",
      "Hola Wazer! Debido a que no hemos recibido respuestas sobre esta solicitud de actualización, procedemos a cerrarla como 'No identificado', pero no dudes en volver a reportar cualquier problema que encuentres. Estaremos encantados de solucionarlo!",
      ""
    ],
    fr: [
      "Bonjour Wazer ! Pourriez-vous nous donner plus de détails sur le problème signalé (**type de problème**) afin que nous puissions le résoudre ? Merci beaucoup !",
      "Bonjour Wazer. Nous n'avons pas eu de réponse de votre part. Sans nouvelles de votre part, nous fermerons cette demande comme « Non identifié ». Merci !",
      "Bonjour Wazer ! Merci beaucoup pour votre signalement : grâce à lui, nous avons pu apporter des corrections dans la zone ! Les modifications apparaîtront dans Waze sous 48 h. Encore merci pour votre aide !",
      "Bonjour Wazer ! N'ayant reçu aucune réponse concernant cette demande de mise à jour, nous la fermons comme « Non identifié ». N'hésitez pas à signaler à nouveau tout problème que vous rencontrez. Nous serons ravis de le résoudre !",
      ""
    ],
    pt: [
      "Olá Wazer! Podes dar-nos mais detalhes sobre o problema reportado (**tipo de problema**) para que o possamos resolver? Muito obrigado!",
      "Olá Wazer. Não recebemos resposta da tua parte. Se não recebermos atualizações, iremos fechar este pedido como 'Não identificado'. Obrigado!",
      "Olá Wazer! Muito obrigado pelo teu reporte — graças a ele conseguimos aplicar correções na zona! As alterações aparecerão no Waze dentro de 48h. Mais uma vez, obrigado pela tua ajuda!",
      "Olá Wazer! Como não recebemos respostas sobre este pedido de atualização, vamos fechá-lo como 'Não identificado', mas não hesites em reportar novamente qualquer problema que encontres. Teremos todo o gosto em resolvê-lo!",
      ""
    ],
    de: [
      "Hallo Wazer! Könntest du uns bitte mehr Details zum gemeldeten Problem (**Problemtyp**) geben, damit wir es beheben können? Vielen Dank!",
      "Hallo Wazer. Wir haben keine Antwort von dir erhalten. Wenn wir keine Aktualisierungen erhalten, schließen wir diese Anfrage als « Nicht identifiziert ». Danke!",
      "Hallo Wazer! Vielen Dank für deine Meldung – dank ihr konnten wir Korrekturen im Bereich vornehmen! Die aktualisierten Änderungen erscheinen innerhalb von 48 Stunden in Waze. Nochmals vielen Dank für deine Hilfe!",
      "Hallo Wazer! Da wir keine Antworten zu dieser Aktualisierungsanfrage erhalten haben, schließen wir sie als « Nicht identifiziert ». Zögere aber nicht, jedes Problem, das dir auffällt, erneut zu melden. Wir helfen dir gerne weiter!",
      ""
    ]
  };

  function defaultReplies() {
    const texts = DEFAULTS[LANG] || DEFAULTS.en;
    const titles = DEFAULT_TITLES[LANG] || DEFAULT_TITLES.en;
    return texts.map((text, i) => ({
      icon: DEFAULT_ICONS[i] || '💬',
      title: titles[i] || '',
      text: text
    }));
  }

  function defaultConfig() {
    return {
      schemaVersion: SCHEMA_VERSION,
      scriptVersion: SCRIPT_VERSION,
      mode: 'normal',
      replies: defaultReplies()
    };
  }

  function sanitizeReply(r, idx) {
    if (typeof r === 'string') {
      // Formato v1: sólo texto. Recuperamos icono/título predefinidos por posición.
      return {
        icon: DEFAULT_ICONS[idx] || '💬',
        title: ((DEFAULT_TITLES[LANG] || DEFAULT_TITLES.en)[idx]) || '',
        text: r
      };
    }
    if (!r || typeof r !== 'object') return { icon: '💬', title: '', text: '' };
    return {
      icon: typeof r.icon === 'string' ? r.icon.trim().slice(0, 4) : '',
      title: typeof r.title === 'string' ? r.title.trim().slice(0, 40) : '',
      text: typeof r.text === 'string' ? r.text : ''
    };
  }

  /**
   * Migración automática: acepta cualquier formato guardado por versiones
   * anteriores (o futuras) y lo normaliza al esquema actual SIN perder
   * personalizaciones del usuario.
   */
  function migrateConfig(data) {
    const cfg = defaultConfig();

    // v1: un array plano de cadenas.
    if (Array.isArray(data)) {
      cfg.replies = data.map(sanitizeReply);
      cfg.mode = 'normal';
      return normalizeConfig(cfg);
    }

    if (!data || typeof data !== 'object') return cfg;

    if (Array.isArray(data.replies)) {
      cfg.replies = data.replies.map(sanitizeReply);
    }
    if (typeof data.mode === 'string' && MODES.indexOf(data.mode.toLowerCase()) !== -1) {
      cfg.mode = data.mode.toLowerCase();
    }
    return normalizeConfig(cfg);
  }

  function normalizeConfig(cfg) {
    cfg.schemaVersion = SCHEMA_VERSION;
    cfg.scriptVersion = SCRIPT_VERSION;
    if (MODES.indexOf(cfg.mode) === -1) cfg.mode = 'normal';
    if (!Array.isArray(cfg.replies)) cfg.replies = defaultReplies();
    cfg.replies = cfg.replies.map(sanitizeReply);
    if (!cfg.replies.length) cfg.replies = [{ icon: '💬', title: '', text: '' }];
    return cfg;
  }

  let CONFIG = null;

  function loadConfig(force) {
    if (CONFIG && !force) return CONFIG;
    let stored = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      stored = raw ? JSON.parse(raw) : null;
    } catch (e) {
      stored = null;
    }
    if (stored === null) {
      CONFIG = defaultConfig();
      return CONFIG;
    }
    const before = JSON.stringify(stored);
    CONFIG = migrateConfig(stored);
    // Si la migración cambió algo (versión antigua), lo persistimos ya.
    if (before !== JSON.stringify(CONFIG)) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(CONFIG)); } catch (e) {}
      console.log('[WME Quick Replies] Configuración migrada al esquema v' + SCHEMA_VERSION + ' ✔');
    }
    return CONFIG;
  }

  function saveConfig(cfg) {
    CONFIG = normalizeConfig(cfg);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(CONFIG)); } catch (e) {}
    refreshBars();
    return CONFIG;
  }

  function visibleReplies() {
    return loadConfig().replies.filter(r => r.text && r.text.trim());
  }

  function replyLabel(r, idx) {
    const title = (r.title || '').trim();
    if (title) return title;
    const t = (r.text || '').trim();
    if (!t) return T.untitled + ' ' + (idx + 1);
    return t.length > 24 ? t.slice(0, 24) + '…' : t;
  }

  /* ------------------------------------------------------------------ *
   *  Estilos
   * ------------------------------------------------------------------ */
  function injectStyles() {
    if (document.getElementById('qr-styles')) return;
    const css = `
      .qr-wrap { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; margin: 6px 0 4px 0; }
      .qr-btn {
        display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;
        padding: 3px 9px; border: 1px solid #c7c7c7; border-radius: 13px;
        background: #f3f6ff; color: #1f3b7a; cursor: pointer;
        font-weight: 600; font-size: 11px; line-height: 1.3; user-select: none;
      }
      .qr-btn:hover { background: #e6ecff; }
      .qr-menu {
        position: fixed; z-index: 999999;
        min-width: 280px; max-width: 360px; max-height: 320px; overflow-y: auto;
        background: #fff; border: 1px solid #c7c7c7; border-radius: 8px;
        box-shadow: 0 4px 14px rgba(0,0,0,.18); padding: 4px; font-size: 12px;
      }
      .qr-item {
        padding: 7px 9px; border-radius: 6px; cursor: pointer; color: #222;
        line-height: 1.35; border-bottom: 1px solid #f0f0f0;
      }
      .qr-item:last-child { border-bottom: none; }
      .qr-item:hover { background: #eef3ff; }
      .qr-item .qr-num { font-weight: 700; color: #1f3b7a; margin-right: 6px; }
      .qr-item .qr-title { font-weight: 700; color: #1f3b7a; margin-right: 6px; }
      .qr-empty { color: #999; font-style: italic; cursor: default; }
      .qr-empty:hover { background: transparent; }
      .qr-hidden { display: none !important; }

      .qr-settings { padding: 8px 4px; font-size: 13px; }
      .qr-settings h3 { margin: 0 0 6px 0; font-size: 15px; }
      .qr-settings h4 { margin: 16px 0 6px 0; font-size: 13px; text-transform: uppercase; letter-spacing: .03em; color: #444; }
      .qr-settings p.qr-help { color: #555; margin: 0 0 12px 0; font-size: 12px; }
      .qr-settings code { background:#eef; padding:1px 4px; border-radius:3px; }
      .qr-mode { display: flex; gap: 14px; align-items: center; margin-bottom: 6px; flex-wrap: wrap; }
      .qr-mode label { display: inline-flex; align-items: center; gap: 5px; font-weight: 600; cursor: pointer; }
      .qr-card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 8px 10px; margin-bottom: 10px; background: #fafbff; }
      .qr-card-head { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
      .qr-card-head .qr-idx { font-weight: 700; color: #1f3b7a; flex: 1; }
      .qr-mini {
        border: 1px solid #c7c7c7; background: #fff; border-radius: 5px; cursor: pointer;
        font-size: 12px; line-height: 1; padding: 3px 6px; color: #333;
      }
      .qr-mini:hover { background: #eef3ff; }
      .qr-mini[disabled] { opacity: .35; cursor: default; }
      .qr-mini.qr-del:hover { background: #ffecec; border-color: #e0a0a0; color: #a12; }
      .qr-row { display: flex; gap: 8px; margin-bottom: 6px; }
      .qr-row .qr-col-icon { width: 86px; flex: none; }
      .qr-row .qr-col-title { flex: 1; }
      .qr-field { margin-bottom: 4px; }
      .qr-field label, .qr-row label { display: block; font-weight: 600; margin-bottom: 3px; font-size: 11px; color: #555; }
      .qr-settings input[type="text"] {
        width: 100%; box-sizing: border-box; padding: 5px 8px;
        border: 1px solid #c7c7c7; border-radius: 6px; font-family: inherit; font-size: 12px;
      }
      .qr-settings input.qr-icon-input { text-align: center; font-size: 16px; padding: 3px 4px; cursor: pointer; }
      .qr-icon-box { display: flex; gap: 4px; align-items: center; }
      .qr-icon-box input { flex: 1; min-width: 0; }
      .qr-icon-open {
        border: 1px solid #c7c7c7; background: #fff; border-radius: 6px; cursor: pointer;
        font-size: 12px; line-height: 1; padding: 5px 6px; color: #1f3b7a;
      }
      .qr-icon-open:hover { background: #eef3ff; }
      .qr-emoji-pop {
        position: fixed; z-index: 1000000; width: 292px;
        background: #fff; border: 1px solid #c7c7c7; border-radius: 10px;
        box-shadow: 0 6px 20px rgba(0,0,0,.22); padding: 8px; font-size: 13px;
      }
      .qr-emoji-pop .qr-emoji-head { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
      .qr-emoji-pop .qr-emoji-head strong { flex: 1; font-size: 12px; color: #333; }
      .qr-emoji-pop input.qr-emoji-search {
        width: 100%; box-sizing: border-box; padding: 5px 8px; margin-bottom: 6px;
        border: 1px solid #c7c7c7; border-radius: 6px; font-family: inherit; font-size: 12px;
      }
      .qr-emoji-tabs { display: flex; gap: 3px; margin-bottom: 6px; flex-wrap: wrap; }
      .qr-emoji-tab {
        border: 1px solid transparent; background: #f1f1f1; border-radius: 6px; cursor: pointer;
        font-size: 15px; line-height: 1; padding: 4px 6px;
      }
      .qr-emoji-tab:hover { background: #e6ecff; }
      .qr-emoji-tab.qr-on { background: #e6ecff; border-color: #1f3b7a; }
      .qr-emoji-grid {
        display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px;
        max-height: 168px; overflow-y: auto;
      }
      .qr-emoji {
        border: none; background: transparent; border-radius: 6px; cursor: pointer;
        font-size: 19px; line-height: 1; padding: 4px 0; text-align: center;
      }
      .qr-emoji:hover { background: #e6ecff; }
      .qr-emoji-none {
        margin-top: 6px; width: 100%; padding: 5px; border-radius: 6px; cursor: pointer;
        border: 1px solid #c7c7c7; background: #f1f1f1; color: #333; font-size: 12px; font-weight: 600;
      }
      .qr-emoji-none:hover { background: #e6e6e6; }
      .qr-emoji-empty { grid-column: 1 / -1; color: #999; font-style: italic; font-size: 12px; padding: 8px 4px; }
      .qr-field textarea {
        width: 100%; box-sizing: border-box; min-height: 70px; resize: vertical;
        padding: 6px 8px; border: 1px solid #c7c7c7; border-radius: 6px;
        font-family: inherit; font-size: 12px; line-height: 1.4;
      }
      .qr-add {
        width: 100%; padding: 7px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;
        border: 1px dashed #1f3b7a; background: #f3f6ff; color: #1f3b7a; margin-bottom: 10px;
      }
      .qr-add:hover { background: #e6ecff; }
      .qr-actions { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
      .qr-save, .qr-reset, .qr-io {
        padding: 6px 14px; border-radius: 6px; cursor: pointer; font-weight: 600;
        border: 1px solid transparent;
      }
      .qr-save { background: #1f3b7a; color: #fff; }
      .qr-save:hover { background: #16306a; }
      .qr-reset { background: #fff1f1; color: #a12; border-color: #e0a0a0; }
      .qr-reset:hover { background: #ffe2e2; }
      .qr-io { background: #f1f1f1; color: #333; border-color: #c7c7c7; }
      .qr-io:hover { background: #e6e6e6; }
      .qr-status { margin-top: 8px; color: #1a7a1a; font-size: 12px; min-height: 16px; }
      .qr-status.qr-err { color: #a12; }
      .qr-status.qr-warn { color: #a67c00; }
      .qr-sep { border: none; border-top: 1px solid #e0e0e0; margin: 14px 0 4px 0; }
    `;
    const style = document.createElement('style');
    style.id = 'qr-styles';
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  /* ------------------------------------------------------------------ *
   *  Tipo de problema y expansión de tokens
   * ------------------------------------------------------------------ */
  function getProblemType(fromEl) {
    let node = fromEl;
    for (let i = 0; i < 14 && node; i++) {
      const sub = node.querySelector
        ? node.querySelector('.issue-panel-header .sub-title, .sub-title-and-actions .sub-title, .sub-title')
        : null;
      if (sub && sub.textContent.trim()) return sub.textContent.trim();
      node = node.parentElement;
    }
    const g = document.querySelector('.issue-panel-header .sub-title, .sub-title-and-actions .sub-title');
    return g && g.textContent.trim() ? g.textContent.trim() : '';
  }

  function expandPlaceholders(text, fromEl) {
    const type = getProblemType(fromEl);
    if (!type) return text;
    let out = text;
    TYPE_TOKENS.forEach(rx => { out = out.replace(rx, type); });
    return out;
  }

  /* ------------------------------------------------------------------ *
   *  Reemplaza TODO el contenido del campo por el texto (borra lo anterior)
   * ------------------------------------------------------------------ */
  function setFieldValue(el, text) {
    el.focus();
    const tag = el.tagName;
    if (tag === 'TEXTAREA' || tag === 'INPUT') {
      const proto = tag === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(el, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      try { el.setSelectionRange(text.length, text.length); } catch (e) {}
    } else {
      let ok = false;
      try {
        document.execCommand('selectAll', false, null);
        ok = document.execCommand('insertText', false, text);
      } catch (e) { ok = false; }
      if (!ok) {
        el.textContent = text;
        el.dispatchEvent(new InputEvent('input', { bubbles: true }));
      }
    }
  }

  function applyReply(text, targetEl) {
    setFieldValue(targetEl, expandPlaceholders(text, targetEl));
  }

  /* ------------------------------------------------------------------ *
   *  Menú único compartido (anclado a <body>)  ·  modo Normal
   * ------------------------------------------------------------------ */
  let qrMenu = null;
  function getMenu() {
    if (qrMenu && qrMenu.isConnected) return qrMenu;
    qrMenu = document.createElement('div');
    qrMenu.className = 'qr-menu qr-hidden';
    qrMenu.addEventListener('click', (e) => e.stopPropagation());
    document.body.appendChild(qrMenu);
    return qrMenu;
  }
  function hideMenu() { if (qrMenu) qrMenu.classList.add('qr-hidden'); }

  function openMenu(btn, targetEl) {
    const menu = getMenu();
    menu.innerHTML = '';
    const replies = visibleReplies();
    replies.forEach((r, idx) => {
      const item = document.createElement('div');
      item.className = 'qr-item';
      const preview = r.text.length > 90 ? r.text.slice(0, 90) + '…' : r.text;
      const num = document.createElement('span');
      num.className = 'qr-num';
      num.textContent = (r.icon || (idx + 1) + '.');
      item.appendChild(num);
      const title = (r.title || '').trim();
      if (title) {
        const tt = document.createElement('span');
        tt.className = 'qr-title';
        tt.textContent = title;
        item.appendChild(tt);
      }
      item.appendChild(document.createTextNode(preview));
      item.title = r.text;
      item.addEventListener('click', (ev) => {
        ev.stopPropagation();
        applyReply(r.text, targetEl);
        hideMenu();
      });
      menu.appendChild(item);
    });
    if (!replies.length) {
      const e = document.createElement('div');
      e.className = 'qr-item qr-empty';
      e.textContent = T.empty;
      menu.appendChild(e);
    }
    const r = btn.getBoundingClientRect();
    menu.style.visibility = 'hidden';
    menu.classList.remove('qr-hidden');
    let top = r.bottom + 4;
    const mh = menu.offsetHeight || 200;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 4);
    let left = r.left;
    const mw = menu.offsetWidth || 300;
    if (left + mw > window.innerWidth - 8) left = Math.max(8, window.innerWidth - mw - 8);
    menu.style.top = top + 'px';
    menu.style.left = left + 'px';
    menu.style.visibility = 'visible';
  }

  document.addEventListener('click', hideMenu);
  window.addEventListener('scroll', hideMenu, true);
  window.addEventListener('resize', hideMenu);

  /* ------------------------------------------------------------------ *
   *  Colocación de los botones (auto-reparable)
   *  Estilos EN LÍNEA: pueden vivir dentro del Shadow DOM de wz-textarea.
   * ------------------------------------------------------------------ */
  function styleButton(btn) {
    Object.assign(btn.style, {
      display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
      padding: '3px 9px', border: '1px solid #c7c7c7', borderRadius: '13px',
      background: '#f3f6ff', color: '#1f3b7a', cursor: 'pointer',
      fontWeight: '600', fontSize: '11px', lineHeight: '1.3', userSelect: 'none',
      fontFamily: 'inherit'
    });
    btn.addEventListener('mouseenter', () => { btn.style.background = '#e6ecff'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = '#f3f6ff'; });
  }

  function styleWrap(wrap) {
    Object.assign(wrap.style, {
      display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center'
    });
  }

  function makeDropdownButton(targetEl) {
    const btn = document.createElement('div');
    btn.className = 'qr-btn';
    btn.innerHTML = T.button + ' <span style="font-size:10px">▾</span>';
    styleButton(btn);
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const isOpen = qrMenu && !qrMenu.classList.contains('qr-hidden');
      hideMenu();
      if (!isOpen) openMenu(btn, targetEl);
    });
    return btn;
  }

  function makeReplyButton(reply, idx, targetEl) {
    const btn = document.createElement('div');
    btn.className = 'qr-btn';
    const icon = (reply.icon || '').trim();
    btn.textContent = (icon ? icon + ' ' : '') + replyLabel(reply, idx);
    btn.title = reply.text;
    styleButton(btn);
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      hideMenu();
      applyReply(reply.text, targetEl);
    });
    return btn;
  }

  // Registro de barras colocadas, para poder repintarlas al cambiar los ajustes.
  const bars = [];

  function renderBar(wrap, targetEl) {
    wrap.innerHTML = '';
    styleWrap(wrap);
    const cfg = loadConfig();
    if (cfg.mode === 'superfast') {
      const replies = visibleReplies();
      if (!replies.length) {
        wrap.appendChild(makeDropdownButton(targetEl));
        return;
      }
      replies.forEach((r, i) => wrap.appendChild(makeReplyButton(r, i, targetEl)));
    } else {
      wrap.appendChild(makeDropdownButton(targetEl));
    }
  }

  function registerBar(wrap, targetEl) {
    bars.push({ wrap: wrap, target: targetEl });
    renderBar(wrap, targetEl);
    return wrap;
  }

  function refreshBars() {
    for (let i = bars.length - 1; i >= 0; i--) {
      const b = bars[i];
      if (!b.wrap.isConnected || !b.target.isConnected) { bars.splice(i, 1); continue; }
      renderBar(b.wrap, b.target);
    }
  }

  function ensureInStatusContainer(container, targetEl) {
    let wrap = container.querySelector(':scope > .qr-wrap');
    if (wrap) return wrap;
    const cs = window.getComputedStyle(container);
    if (cs.display.indexOf('flex') === -1) {
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.flexWrap = 'wrap';
    }
    wrap = document.createElement('div');
    wrap.className = 'qr-wrap';
    wrap.style.marginRight = 'auto'; // empuja el contador (.length-text) a la derecha
    container.insertBefore(wrap, container.firstChild);
    return registerBar(wrap, targetEl);
  }

  function ensureAfterField(targetEl) {
    const next = targetEl.nextElementSibling;
    if (next && next.classList && next.classList.contains('qr-wrap') && next.isConnected) {
      return next;
    }
    const wrap = document.createElement('div');
    wrap.className = 'qr-wrap';
    wrap.style.margin = '6px 0 4px 0';
    targetEl.insertAdjacentElement('afterend', wrap);
    return registerBar(wrap, targetEl);
  }

  // ¿Es el <wz-textarea> del CAMPO DE COMENTARIO de la UR?
  // Evita colocar el botón en otros campos (p. ej. "Descripción", maxlength 300).
  function isCommentHost(host) {
    if (!host || (host.tagName || '').toLowerCase() !== 'wz-textarea') return false;
    // 1) Clase específica del compositor de comentarios
    if (host.classList && host.classList.contains('new-comment-text')) return true;
    // 2) Placeholder de "comentario" (multiidioma)
    const ph = (host.getAttribute('placeholder') || '').toLowerCase();
    if (/coment|comment|kommentar|commentaire|conversa/.test(ph)) return true;
    // 3) Botón de enviar adyacente (solo el compositor de comentarios lo tiene)
    const parent = host.parentElement;
    if (parent && parent.querySelector && parent.querySelector('.send-button, wz-button[type="submit"]')) return true;
    return false;
  }

  // Acepta el contenedor del contador solo si pertenece al wz-textarea del comentario.
  function isCommentStatusContainer(container) {
    const rootNode = container.getRootNode ? container.getRootNode() : null;
    const host = rootNode && rootNode.host;
    if (host) return isCommentHost(host);
    const near = container.closest && container.closest('wz-textarea'); // DOM claro
    return isCommentHost(near);
  }

  function isUrCommentField(el) {
    if (el.closest && el.closest('.qr-settings')) return false;
    // Si el textarea pertenece a un wz-textarea de comentario
    const host = (el.getRootNode && el.getRootNode().host) || (el.closest && el.closest('wz-textarea'));
    if (isCommentHost(host)) return true;
    // Atributos directos del propio campo
    const attrs = [
      el.getAttribute('placeholder'),
      el.getAttribute('aria-label'),
      el.getAttribute('data-placeholder')
    ].join(' ').toLowerCase();
    if (/coment|comment|kommentar|commentaire|conversa/.test(attrs)) return true;
    // Último recurso: límite de caracteres ALTO (evita el de "Descripción" = 300)
    if (el.tagName === 'TEXTAREA') {
      const ml = el.maxLength;
      if (typeof ml === 'number' && ml >= 1000 && ml <= 5000) return true;
    }
    return false;
  }

  // Recorre el documento y TODOS los shadow roots anidados.
  function eachRoot(cb) {
    const stack = [document];
    const seen = new Set();
    while (stack.length) {
      const root = stack.pop();
      if (seen.has(root)) continue;
      seen.add(root);
      if (cb(root) === true) return;
      let els;
      try { els = root.querySelectorAll('*'); } catch (e) { els = []; }
      for (const el of els) if (el.shadowRoot) stack.push(el.shadowRoot);
    }
  }

  function findTextareaFor(container) {
    const root = container.getRootNode ? container.getRootNode() : document;
    let ta = root.querySelector && (root.querySelector('#wz-textarea-0') || root.querySelector('textarea'));
    if (ta) return ta;
    let p = container.parentElement;
    for (let i = 0; i < 6 && p; i++) {
      ta = p.querySelector && p.querySelector('textarea');
      if (ta) return ta;
      p = p.parentElement;
    }
    return null;
  }

  // Barra cacheada: mientras siga conectada al DOM, scan() no hace nada caro.
  let placedWrap = null;

  function scan() {
    if (placedWrap && placedWrap.isConnected) return; // camino rápido O(1)
    placedWrap = null;

    eachRoot((root) => {
      if (!root.querySelectorAll) return;
      let containers;
      try { containers = root.querySelectorAll('.status-text-container'); } catch (e) { return; }
      for (const container of containers) {
        if (container.closest && container.closest('.qr-settings')) continue;
        if (!isCommentStatusContainer(container)) continue; // solo el campo de comentario
        const ta = findTextareaFor(container);
        if (!ta) continue;
        placedWrap = ensureInStatusContainer(container, ta);
      }
      return placedWrap ? true : undefined;
    });

    if (!placedWrap) {
      eachRoot((root) => {
        if (!root.querySelectorAll) return;
        let found = null;
        root.querySelectorAll('textarea, [contenteditable="true"]').forEach((el) => {
          if (!found && isUrCommentField(el)) found = el;
        });
        if (!found && root.querySelector) found = root.querySelector('#wz-textarea-0');
        if (found) { placedWrap = ensureAfterField(found); return true; }
      });
    }
  }

  let scanTimer = null;
  // Una mutación es "del mapa" si ocurre dentro del lienzo/tiles. Las ignoramos:
  // el mapa cambia constantemente al navegar y no afecta a los paneles de UR.
  function isMapMutation(m) {
    const t = m.target;
    if (!t || !t.closest) return false;
    return !!t.closest('#WazeMap, .leaflet-container, .olMap, canvas, svg');
  }
  function scheduleScan(mutations) {
    // Si TODAS las mutaciones son del mapa, no rastreamos (evita el recorrido continuo).
    if (mutations && mutations.length && mutations.every(isMapMutation)) return;
    if (scanTimer) return;
    scanTimer = setTimeout(() => { scanTimer = null; scan(); }, 400);
  }

  function startInjection() {
    injectStyles();
    loadConfig();
    scan();
    new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true });
    // Red de seguridad por si React quita los botones dentro del Shadow DOM (el observador
    // del body no ve cambios internos de los shadow roots). Es O(1) si la barra sigue puesta.
    setInterval(scan, 3000);
    console.log('[WME Quick Replies] cargado ✔ (v' + SCRIPT_VERSION + ' — idioma: ' + LANG + ', modo: ' + loadConfig().mode + ')');
  }

  /* ------------------------------------------------------------------ *
   *  Selector de emojis (sin dependencias externas)
   * ------------------------------------------------------------------ */
  let emojiPop = null;
  let emojiPopCleanup = null;

  function closeEmojiPicker() {
    if (emojiPopCleanup) { emojiPopCleanup(); emojiPopCleanup = null; }
    if (emojiPop && emojiPop.parentNode) emojiPop.parentNode.removeChild(emojiPop);
    emojiPop = null;
  }

  function normalizeSearch(s) {
    let out = String(s || '').toLowerCase();
    if (out.normalize) out = out.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return out.trim();
  }

  function openEmojiPicker(anchorEl, onPick) {
    closeEmojiPicker();

    const pop = document.createElement('div');
    emojiPop = pop;
    pop.className = 'qr-emoji-pop';
    pop.addEventListener('click', (e) => e.stopPropagation());
    pop.addEventListener('mousedown', (e) => e.stopPropagation());

    const head = document.createElement('div');
    head.className = 'qr-emoji-head';
    const title = document.createElement('strong');
    title.textContent = T.emojiPick;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'qr-mini';
    closeBtn.type = 'button';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', closeEmojiPicker);
    head.appendChild(title);
    head.appendChild(closeBtn);
    pop.appendChild(head);

    const search = document.createElement('input');
    search.type = 'text';
    search.className = 'qr-emoji-search';
    search.placeholder = T.emojiSearch;
    pop.appendChild(search);

    const tabs = document.createElement('div');
    tabs.className = 'qr-emoji-tabs';
    pop.appendChild(tabs);

    const grid = document.createElement('div');
    grid.className = 'qr-emoji-grid';
    pop.appendChild(grid);

    const noneBtn = document.createElement('button');
    noneBtn.className = 'qr-emoji-none';
    noneBtn.type = 'button';
    noneBtn.textContent = '🚫 ' + T.emojiNone;
    noneBtn.addEventListener('click', () => { onPick(''); closeEmojiPicker(); });
    pop.appendChild(noneBtn);

    let activeCat = 0;

    function paintGrid() {
      grid.innerHTML = '';
      const q = normalizeSearch(search.value);
      let items;
      if (q) {
        items = [];
        EMOJI_CATS.forEach(cat => {
          cat.items.forEach(it => {
            if (normalizeSearch(it[1]).indexOf(q) !== -1) items.push(it);
          });
        });
      } else {
        items = EMOJI_CATS[activeCat].items;
      }
      if (!items.length) {
        const empty = document.createElement('div');
        empty.className = 'qr-emoji-empty';
        empty.textContent = T.emojiNoResults;
        grid.appendChild(empty);
        return;
      }
      items.forEach((it) => {
        const b = document.createElement('button');
        b.className = 'qr-emoji';
        b.type = 'button';
        b.textContent = it[0];
        b.title = it[0];
        b.addEventListener('click', () => { onPick(it[0]); closeEmojiPicker(); });
        grid.appendChild(b);
      });
    }

    function paintTabs() {
      tabs.innerHTML = '';
      EMOJI_CATS.forEach((cat, i) => {
        const t = document.createElement('button');
        t.className = 'qr-emoji-tab' + (i === activeCat && !search.value ? ' qr-on' : '');
        t.type = 'button';
        t.textContent = cat.tab;
        t.title = (T.emojiCats && T.emojiCats[cat.key]) || cat.key;
        t.addEventListener('click', () => {
          activeCat = i;
          search.value = '';
          paintTabs();
          paintGrid();
        });
        tabs.appendChild(t);
      });
    }

    search.addEventListener('input', () => { paintTabs(); paintGrid(); });
    search.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeEmojiPicker(); });

    paintTabs();
    paintGrid();

    document.body.appendChild(pop);

    // Posicionado junto al campo, sin salirse de la ventana.
    const r = anchorEl.getBoundingClientRect();
    const pw = pop.offsetWidth || 292;
    const ph = pop.offsetHeight || 300;
    let top = r.bottom + 6;
    if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 6);
    let left = r.left;
    if (left + pw > window.innerWidth - 8) left = Math.max(8, window.innerWidth - pw - 8);
    pop.style.top = top + 'px';
    pop.style.left = left + 'px';

    const onDocClick = () => closeEmojiPicker();
    const onKey = (e) => { if (e.key === 'Escape') closeEmojiPicker(); };
    setTimeout(() => {
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onKey);
      window.addEventListener('resize', closeEmojiPicker);
      try { search.focus(); } catch (e) {}
    }, 0);
    emojiPopCleanup = () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', closeEmojiPicker);
    };
  }

  /* ------------------------------------------------------------------ *
   *  Panel de ajustes en la pestaña Scripts
   * ------------------------------------------------------------------ */
  function renderSettings(container) {
    injectStyles();
    container.innerHTML = '';

    const root = document.createElement('div');
    root.className = 'qr-settings';
    container.appendChild(root);

    // Copia de trabajo: no se persiste hasta pulsar Guardar.
    let draft = JSON.parse(JSON.stringify(loadConfig()));

    const status = document.createElement('div');
    status.className = 'qr-status';

    function say(msg, kind) {
      status.className = 'qr-status' + (kind ? ' qr-' + kind : '');
      status.textContent = msg;
      clearTimeout(say._t);
      say._t = setTimeout(() => { status.textContent = ''; status.className = 'qr-status'; }, 4000);
    }

    function build() {
      root.innerHTML = '';

      const head = document.createElement('div');
      head.innerHTML = '<h3>' + T.heading + '</h3>' + '<p class="qr-help">' + T.help + '</p>';
      root.appendChild(head);

      /* --- Modo --------------------------------------------------- */
      const modeH = document.createElement('h4');
      modeH.textContent = T.modeHeading;
      root.appendChild(modeH);

      const modeBox = document.createElement('div');
      modeBox.className = 'qr-mode';
      MODES.forEach((m) => {
        const label = document.createElement('label');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'qr-mode';
        radio.value = m;
        radio.checked = draft.mode === m;
        radio.addEventListener('change', () => { if (radio.checked) draft.mode = m; });
        label.appendChild(radio);
        label.appendChild(document.createTextNode(m === 'normal' ? T.modeNormal : T.modeSuperFast));
        modeBox.appendChild(label);
      });
      root.appendChild(modeBox);

      const modeHelp = document.createElement('p');
      modeHelp.className = 'qr-help';
      modeHelp.innerHTML = T.modeHelp;
      root.appendChild(modeHelp);

      /* --- Respuestas --------------------------------------------- */
      draft.replies.forEach((reply, i) => {
        const card = document.createElement('div');
        card.className = 'qr-card';

        const cardHead = document.createElement('div');
        cardHead.className = 'qr-card-head';
        const idxLabel = document.createElement('span');
        idxLabel.className = 'qr-idx';
        idxLabel.textContent = T.reply + ' ' + (i + 1) + ':';
        cardHead.appendChild(idxLabel);

        const up = document.createElement('button');
        up.className = 'qr-mini';
        up.type = 'button';
        up.textContent = '▲';
        up.title = T.moveUp;
        up.disabled = i === 0;
        up.addEventListener('click', () => {
          const tmp = draft.replies[i - 1];
          draft.replies[i - 1] = draft.replies[i];
          draft.replies[i] = tmp;
          build();
        });

        const down = document.createElement('button');
        down.className = 'qr-mini';
        down.type = 'button';
        down.textContent = '▼';
        down.title = T.moveDown;
        down.disabled = i === draft.replies.length - 1;
        down.addEventListener('click', () => {
          const tmp = draft.replies[i + 1];
          draft.replies[i + 1] = draft.replies[i];
          draft.replies[i] = tmp;
          build();
        });

        const del = document.createElement('button');
        del.className = 'qr-mini qr-del';
        del.type = 'button';
        del.textContent = '✕';
        del.title = T.removeReply;
        del.addEventListener('click', () => {
          if (!window.confirm(T.removeConfirm)) return;
          draft.replies.splice(i, 1);
          if (!draft.replies.length) draft.replies.push({ icon: '💬', title: '', text: '' });
          build();
        });

        cardHead.appendChild(up);
        cardHead.appendChild(down);
        cardHead.appendChild(del);
        card.appendChild(cardHead);

        const row = document.createElement('div');
        row.className = 'qr-row';

        const iconCol = document.createElement('div');
        iconCol.className = 'qr-col-icon';
        const iconLbl = document.createElement('label');
        iconLbl.textContent = T.icon;
        const iconInput = document.createElement('input');
        iconInput.type = 'text';
        iconInput.className = 'qr-icon-input';
        iconInput.maxLength = 4;
        iconInput.placeholder = T.iconPh;
        iconInput.value = reply.icon || '';
        iconInput.title = T.emojiPick;
        iconInput.addEventListener('input', () => { reply.icon = iconInput.value; });
        const iconBox = document.createElement('div');
        iconBox.className = 'qr-icon-box';
        const openPickerBtn = document.createElement('button');
        openPickerBtn.className = 'qr-icon-open';
        openPickerBtn.type = 'button';
        openPickerBtn.textContent = '▾';
        openPickerBtn.title = T.emojiPick;
        const pick = (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          openEmojiPicker(iconBox, (emoji) => {
            reply.icon = emoji;
            iconInput.value = emoji;
          });
        };
        openPickerBtn.addEventListener('click', pick);
        iconBox.appendChild(iconInput);
        iconBox.appendChild(openPickerBtn);
        iconCol.appendChild(iconLbl);
        iconCol.appendChild(iconBox);

        const titleCol = document.createElement('div');
        titleCol.className = 'qr-col-title';
        const titleLbl = document.createElement('label');
        titleLbl.textContent = T.title;
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.maxLength = 40;
        titleInput.placeholder = T.titlePh;
        titleInput.value = reply.title || '';
        titleInput.addEventListener('input', () => { reply.title = titleInput.value; });
        titleCol.appendChild(titleLbl);
        titleCol.appendChild(titleInput);

        row.appendChild(iconCol);
        row.appendChild(titleCol);
        card.appendChild(row);

        const field = document.createElement('div');
        field.className = 'qr-field';
        const textLbl = document.createElement('label');
        textLbl.textContent = T.text;
        const textarea = document.createElement('textarea');
        textarea.placeholder = T.textPh;
        textarea.value = reply.text || '';
        textarea.addEventListener('input', () => { reply.text = textarea.value; });
        field.appendChild(textLbl);
        field.appendChild(textarea);
        card.appendChild(field);

        root.appendChild(card);
      });

      const addBtn = document.createElement('button');
      addBtn.className = 'qr-add';
      addBtn.type = 'button';
      addBtn.textContent = T.addReply;
      addBtn.addEventListener('click', () => {
        draft.replies.push({ icon: '💬', title: '', text: '' });
        build();
      });
      root.appendChild(addBtn);

      /* --- Acciones ----------------------------------------------- */
      const actions = document.createElement('div');
      actions.className = 'qr-actions';
      const saveBtn = document.createElement('button');
      saveBtn.className = 'qr-save';
      saveBtn.type = 'button';
      saveBtn.textContent = T.save;
      saveBtn.addEventListener('click', () => {
        draft = JSON.parse(JSON.stringify(saveConfig(draft)));
        build();
        say(T.saved);
      });
      actions.appendChild(saveBtn);
      root.appendChild(actions);

      /* --- Copia de seguridad ------------------------------------- */
      root.appendChild(document.createElement('hr')).className = 'qr-sep';

      const dataH = document.createElement('h4');
      dataH.textContent = T.dataHeading;
      root.appendChild(dataH);

      const dataHelp = document.createElement('p');
      dataHelp.className = 'qr-help';
      dataHelp.textContent = T.dataHelp;
      root.appendChild(dataHelp);

      const ioActions = document.createElement('div');
      ioActions.className = 'qr-actions';

      const exportBtn = document.createElement('button');
      exportBtn.className = 'qr-io';
      exportBtn.type = 'button';
      exportBtn.textContent = T.exportBtn;
      exportBtn.addEventListener('click', () => { exportConfig(draft); say(T.exported); });

      const importBtn = document.createElement('button');
      importBtn.className = 'qr-io';
      importBtn.type = 'button';
      importBtn.textContent = T.importBtn;

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'application/json,.json';
      fileInput.style.display = 'none';
      importBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        fileInput.value = '';
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(String(reader.result));
            if (!parsed || (typeof parsed !== 'object' && !Array.isArray(parsed))) throw new Error('bad');
            if (!Array.isArray(parsed) && !Array.isArray(parsed.replies)) throw new Error('bad');
            draft = JSON.parse(JSON.stringify(saveConfig(migrateConfig(parsed))));
            build();
            say(T.imported);
          } catch (e) {
            say(T.importError, 'err');
          }
        };
        reader.onerror = () => say(T.importError, 'err');
        reader.readAsText(file);
      });

      const resetBtn = document.createElement('button');
      resetBtn.className = 'qr-reset';
      resetBtn.type = 'button';
      resetBtn.textContent = T.reset;
      resetBtn.addEventListener('click', () => {
        if (!window.confirm(T.resetConfirm)) return;
        draft = JSON.parse(JSON.stringify(saveConfig(defaultConfig())));
        build();
        say(T.restored);
      });

      ioActions.appendChild(exportBtn);
      ioActions.appendChild(importBtn);
      ioActions.appendChild(resetBtn);
      ioActions.appendChild(fileInput);
      root.appendChild(ioActions);

      root.appendChild(status);
    }

    build();
  }

  function exportConfig(cfg) {
    const data = normalizeConfig(JSON.parse(JSON.stringify(cfg)));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const stamp = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
    a.href = url;
    a.download = 'wme-quick-replies-' + stamp + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function registerScriptTab(sdk) {
    try {
      const { tabLabel, tabPane } = await sdk.Sidebar.registerScriptTab();
      tabLabel.innerText = T.tab;
      tabLabel.title = T.tabTitle;
      renderSettings(tabPane);
    } catch (e) {
      console.error('[WME Quick Replies] No se pudo registrar la pestaña:', e);
    }
  }

  /* ------------------------------------------------------------------ *
   *  Arranque
   * ------------------------------------------------------------------ */
  function bootstrap() {
    startInjection();
    if (typeof getWmeSdk === 'function') {
      try {
        const sdk = getWmeSdk({ scriptId: 'wme-quick-replies', scriptName: 'WME Quick Replies' });
        registerScriptTab(sdk);
      } catch (e) {
        console.error('[WME Quick Replies] Error inicializando el SDK:', e);
      }
    }
  }

  if (window.SDK_INITIALIZED && typeof window.SDK_INITIALIZED.then === 'function') {
    window.SDK_INITIALIZED.then(bootstrap);
  } else {
    let started = false;
    const safety = setTimeout(() => { if (!started) { started = true; startInjection(); } }, 4000);
    document.addEventListener('wme-ready', () => {
      if (started) { startInjection(); return; }
      started = true;
      clearTimeout(safety);
      bootstrap();
    }, { once: true });
  }
})();
