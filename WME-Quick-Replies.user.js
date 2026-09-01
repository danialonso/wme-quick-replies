// ==UserScript==
// @name         WME Quick Replies
// @name:es      WME Respuestas rápidas
// @namespace    https://github.com/danialonso/wme-quick-replies
// @version      2.1.1
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

  const SCRIPT_VERSION = '2.1.1';

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
      titlePh: 'Short title for the button', textPh: 'Reply text…',
      emojiPick: 'Pick an emoji', emojiNone: 'No icon',
      emojiCats: { traffic: 'Traffic & map', status: 'Status', faces: 'Faces', hands: 'Hands', objects: 'Objects', misc: 'Misc' },
      addReply: '+ Add more replies', removeReply: 'Remove', removeConfirm: 'Remove this reply?',
      moveUp: 'Move up', moveDown: 'Move down',
      dataHeading: 'Backup & restore',
      dataHelp: 'Your settings live in this browser only. Export them to a JSON file to keep a backup or move them to another computer.',
      exportBtn: '⬇ Export JSON', importBtn: '⬆ Import JSON',
      exported: '⬇ Configuration exported.', imported: '⬆ Configuration imported successfully.',
      importError: '✖ That file is not a valid Quick Replies configuration.',
      resetConfirm: 'Restore the default templates?\n\nThis will permanently delete ALL your replies, titles, icons and the selected mode. This cannot be undone.\n\nTip: export your configuration first if you want a backup.',
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
      titlePh: 'Título corto para el botón', textPh: 'Texto de la respuesta…',
      emojiPick: 'Elegir un emoji', emojiNone: 'Sin icono',
      emojiCats: { traffic: 'Tráfico y mapa', status: 'Estado', faces: 'Caras', hands: 'Manos', objects: 'Objetos', misc: 'Varios' },
      addReply: '+ Añadir más respuestas', removeReply: 'Eliminar', removeConfirm: '¿Eliminar esta respuesta?',
      moveUp: 'Subir', moveDown: 'Bajar',
      dataHeading: 'Copia de seguridad',
      dataHelp: 'La configuración se guarda solo en este navegador. Expórtala a un archivo JSON para tener una copia de seguridad o llevártela a otro equipo.',
      exportBtn: '⬇ Exportar JSON', importBtn: '⬆ Importar JSON',
      exported: '⬇ Configuración exportada.', imported: '⬆ Configuración importada correctamente.',
      importError: '✖ Ese archivo no es una configuración válida de Respuestas rápidas.',
      resetConfirm: '¿Restaurar las plantillas predefinidas?\n\nSe eliminarán definitivamente TODAS tus respuestas, títulos, iconos y el modo seleccionado. Esta acción no se puede deshacer.\n\nConsejo: exporta antes tu configuración si quieres una copia de seguridad.',
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
      titlePh: 'Titre court pour le bouton', textPh: 'Texte de la réponse…',
      emojiPick: 'Choisir un emoji', emojiNone: 'Aucune icône',
      emojiCats: { traffic: 'Trafic et carte', status: 'Statut', faces: 'Visages', hands: 'Mains', objects: 'Objets', misc: 'Divers' },
      addReply: '+ Ajouter des réponses', removeReply: 'Supprimer', removeConfirm: 'Supprimer cette réponse ?',
      moveUp: 'Monter', moveDown: 'Descendre',
      dataHeading: 'Sauvegarde et restauration',
      dataHelp: "La configuration est enregistrée uniquement dans ce navigateur. Exportez-la dans un fichier JSON pour la sauvegarder ou la transférer sur un autre ordinateur.",
      exportBtn: '⬇ Exporter JSON', importBtn: '⬆ Importer JSON',
      exported: '⬇ Configuration exportée.', imported: '⬆ Configuration importée avec succès.',
      importError: '✖ Ce fichier n\'est pas une configuration valide de Réponses rapides.',
      resetConfirm: 'Restaurer les modèles par défaut ?\n\nTOUTES vos réponses, titres, icônes et le mode sélectionné seront définitivement supprimés. Cette action est irréversible.\n\nConseil : exportez d\'abord votre configuration si vous souhaitez une sauvegarde.',
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
      titlePh: 'Título curto para o botão', textPh: 'Texto da resposta…',
      emojiPick: 'Escolher um emoji', emojiNone: 'Sem ícone',
      emojiCats: { traffic: 'Trânsito e mapa', status: 'Estado', faces: 'Caras', hands: 'Mãos', objects: 'Objetos', misc: 'Vários' },
      addReply: '+ Adicionar mais respostas', removeReply: 'Remover', removeConfirm: 'Remover esta resposta?',
      moveUp: 'Subir', moveDown: 'Descer',
      dataHeading: 'Cópia de segurança',
      dataHelp: 'A configuração é guardada apenas neste navegador. Exporta-a para um ficheiro JSON para teres uma cópia de segurança ou a levares para outro computador.',
      exportBtn: '⬇ Exportar JSON', importBtn: '⬆ Importar JSON',
      exported: '⬇ Configuração exportada.', imported: '⬆ Configuração importada com sucesso.',
      importError: '✖ Esse ficheiro não é uma configuração válida de Respostas rápidas.',
      resetConfirm: 'Restaurar os modelos predefinidos?\n\nTODAS as tuas respostas, títulos, ícones e o modo selecionado serão eliminados definitivamente. Esta ação não pode ser anulada.\n\nSugestão: exporta primeiro a tua configuração se quiseres uma cópia de segurança.',
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
      titlePh: 'Kurzer Titel für die Schaltfläche', textPh: 'Antworttext…',
      emojiPick: 'Emoji auswählen', emojiNone: 'Kein Symbol',
      emojiCats: { traffic: 'Verkehr & Karte', status: 'Status', faces: 'Gesichter', hands: 'Hände', objects: 'Objekte', misc: 'Sonstiges' },
      addReply: '+ Weitere Antworten hinzufügen', removeReply: 'Entfernen', removeConfirm: 'Diese Antwort entfernen?',
      moveUp: 'Nach oben', moveDown: 'Nach unten',
      dataHeading: 'Sicherung & Wiederherstellung',
      dataHelp: 'Die Konfiguration wird nur in diesem Browser gespeichert. Exportiere sie in eine JSON-Datei, um eine Sicherung zu behalten oder sie auf einen anderen Computer zu übertragen.',
      exportBtn: '⬇ JSON exportieren', importBtn: '⬆ JSON importieren',
      exported: '⬇ Konfiguration exportiert.', imported: '⬆ Konfiguration erfolgreich importiert.',
      importError: '✖ Diese Datei ist keine gültige Schnellantworten-Konfiguration.',
      resetConfirm: 'Standardvorlagen wiederherstellen?\n\nALLE deine Antworten, Titel, Symbole und der gewählte Modus werden endgültig gelöscht. Das kann nicht rückgängig gemacht werden.\n\nTipp: Exportiere vorher deine Konfiguration, wenn du eine Sicherung möchtest.',
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
   *  Utilidades DOM
   *  el() crea un elemento con propiedades, listeners e hijos de una vez.
   * ------------------------------------------------------------------ */
  function el(tag, opts, children) {
    const node = document.createElement(tag);
    const o = opts || {};
    if (o.cls) node.className = o.cls;
    if (o.text != null) node.textContent = o.text;
    if (o.html != null) node.innerHTML = o.html;
    if (o.title != null) node.title = o.title;
    if (o.type) node.type = o.type;
    if (o.attrs) for (const k in o.attrs) node.setAttribute(k, o.attrs[k]);
    if (o.props) for (const k in o.props) node[k] = o.props[k];
    if (o.css) Object.assign(node.style, o.css);
    if (o.on) for (const evt in o.on) node.addEventListener(evt, o.on[evt]);
    (children || []).forEach(c => { if (c) node.appendChild(c); });
    return node;
  }

  const stop = (e) => e.stopPropagation();
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // Coloca un panel flotante junto a un ancla sin salirse de la ventana.
  function place(panel, rect, fallbackW) {
    const w = panel.offsetWidth || fallbackW;
    const h = panel.offsetHeight || 300;
    let top = rect.bottom + 6;
    if (top + h > window.innerHeight - 8) top = Math.max(8, rect.top - h - 6);
    let left = rect.left;
    if (left + w > window.innerWidth - 8) left = Math.max(8, window.innerWidth - w - 8);
    panel.style.top = top + 'px';
    panel.style.left = left + 'px';
  }

  /* ------------------------------------------------------------------ *
   *  Catálogo de emojis del selector
   *  Cada entrada: [emoji, 'palabras clave multiidioma para el buscador']
   * ------------------------------------------------------------------ */
  const EMOJI_CATS = [
    ['traffic', '🚦', '🚦🚥🛑🚧🛣️🛤️🗺️📍🧭🚗🚙🚕🚌🚚🛻🏍️🛵🚲🚶🚏🅿️⛽🚨🚓🌉🚇✈️⚓'],
    ['status', '✅', '✅✔️☑️❌✖️⚠️❓❔❗‼️⏳⌛⏰🕐🔒🔓🔁🔄🆕🆗🏁🎯⭐🌟🔔🔕📈📉'],
    ['faces', '🙂', '😀😃😄😁😊🙂😉😍🤩🤔🤨😐😴😅😂🥳😎🙃😢😱🤖👤'],
    ['hands', '👍', '👍👎👌✋🤚👏🙌🙏🤝💪👋👇👆👉👈✍️🤷'],
    ['objects', '💬', '💬🗨️🗯️📝📄📋📌📎📢📣📧✉️📨📬🔍🔎💡🔧🛠️⚙️🧰📅📊🔗📷📱💻'],
    ['misc', '✨', '✨🎉❤️💙💚🧡🔥💧🌧️❄️☀️🌍🌎🌐🌳🏠🏢🏗️🚀🏆🎁📦🧩🗑️']
  ].map(c => ({ key: c[0], tab: c[1], items: Array.from(c[2].matchAll(/\p{Extended_Pictographic}(?:\uFE0F)?/gu), m => m[0]) }));

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

  const emptyReply = () => ({ icon: '💬', title: '', text: '' });

  function sanitizeReply(r, idx) {
    if (typeof r === 'string') {
      // Formato v1: sólo texto. Recuperamos icono/título predefinidos por posición.
      return {
        icon: DEFAULT_ICONS[idx] || '💬',
        title: ((DEFAULT_TITLES[LANG] || DEFAULT_TITLES.en)[idx]) || '',
        text: r
      };
    }
    if (!r || typeof r !== 'object') return emptyReply();
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
    if (!cfg.replies.length) cfg.replies = [emptyReply()];
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
      .qr-row .qr-col-icon { width: 58px; flex: none; }
      .qr-row .qr-col-title { flex: 1; }
      .qr-field { margin-bottom: 4px; }
      .qr-field label, .qr-row label { display: block; font-weight: 600; margin-bottom: 3px; font-size: 11px; color: #555; }
      .qr-settings input[type="text"] {
        width: 100%; box-sizing: border-box; padding: 5px 8px;
        border: 1px solid #c7c7c7; border-radius: 6px; font-family: inherit; font-size: 12px;
      }
      .qr-icon-btn {
        width: 100%; box-sizing: border-box; padding: 4px 6px; cursor: pointer;
        border: 1px solid #c7c7c7; border-radius: 6px; background: #fff;
        font-size: 18px; line-height: 1.4; text-align: center; font-family: inherit;
      }
      .qr-icon-btn:hover { background: #eef3ff; border-color: #1f3b7a; }
      .qr-icon-btn.qr-icon-empty { color: #aaa; font-size: 15px; }
      .qr-emoji-pop {
        position: fixed; z-index: 1000000; width: 292px;
        background: #fff; border: 1px solid #c7c7c7; border-radius: 10px;
        box-shadow: 0 6px 20px rgba(0,0,0,.22); padding: 8px; font-size: 13px;
      }
      .qr-emoji-pop .qr-emoji-head { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
      .qr-emoji-pop .qr-emoji-head strong { flex: 1; font-size: 12px; color: #333; }
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
      const title = (r.title || '').trim();
      const item = el('div', {
        cls: 'qr-item', title: r.text,
        on: { click: (ev) => { stop(ev); applyReply(r.text, targetEl); hideMenu(); } }
      }, [
        el('span', { cls: 'qr-num', text: r.icon || (idx + 1) + '.' }),
        title ? el('span', { cls: 'qr-title', text: title }) : null,
        document.createTextNode(r.text.length > 90 ? r.text.slice(0, 90) + '…' : r.text)
      ]);
      menu.appendChild(item);
    });

    if (!replies.length) menu.appendChild(el('div', { cls: 'qr-item qr-empty', text: T.empty }));

    menu.style.visibility = 'hidden';
    menu.classList.remove('qr-hidden');
    place(menu, btn.getBoundingClientRect(), 300);
    menu.style.visibility = 'visible';
  }

  document.addEventListener('click', hideMenu);
  window.addEventListener('scroll', hideMenu, true);
  window.addEventListener('resize', hideMenu);

  /* ------------------------------------------------------------------ *
   *  Colocación de los botones (auto-reparable)
   *  Estilos EN LÍNEA: pueden vivir dentro del Shadow DOM de wz-textarea.
   * ------------------------------------------------------------------ */
  const BTN_BG = '#f3f6ff';
  const BTN_BG_HOVER = '#e6ecff';

  // Botón de la barra. Estilos EN LÍNEA porque puede vivir dentro de un Shadow DOM.
  function makeBarButton(opts) {
    const btn = el('div', {
      cls: 'qr-btn', title: opts.title,
      css: {
        display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
        padding: '3px 9px', border: '1px solid #c7c7c7', borderRadius: '13px',
        background: BTN_BG, color: '#1f3b7a', cursor: 'pointer',
        fontWeight: '600', fontSize: '11px', lineHeight: '1.3', userSelect: 'none',
        fontFamily: 'inherit'
      },
      on: {
        mouseenter: () => { btn.style.background = BTN_BG_HOVER; },
        mouseleave: () => { btn.style.background = BTN_BG; },
        click: (ev) => { stop(ev); opts.onClick(btn); }
      }
    });
    if (opts.html != null) btn.innerHTML = opts.html; else btn.textContent = opts.text;
    return btn;
  }

  function makeDropdownButton(targetEl) {
    return makeBarButton({
      html: T.button + ' <span style="font-size:10px">▾</span>',
      onClick: (btn) => {
        const isOpen = qrMenu && !qrMenu.classList.contains('qr-hidden');
        hideMenu();
        if (!isOpen) openMenu(btn, targetEl);
      }
    });
  }

  function makeReplyButton(reply, idx, targetEl) {
    const icon = (reply.icon || '').trim();
    return makeBarButton({
      text: (icon ? icon + ' ' : '') + replyLabel(reply, idx),
      title: reply.text,
      onClick: () => { hideMenu(); applyReply(reply.text, targetEl); }
    });
  }

  // Registro de barras colocadas, para poder repintarlas al cambiar los ajustes.
  const bars = [];

  function renderBar(wrap, targetEl) {
    wrap.innerHTML = '';
    Object.assign(wrap.style, { display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' });
    const replies = loadConfig().mode === 'superfast' ? visibleReplies() : [];
    if (!replies.length) {
      wrap.appendChild(makeDropdownButton(targetEl));
      return;
    }
    replies.forEach((r, i) => wrap.appendChild(makeReplyButton(r, i, targetEl)));
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
  let emojiPopOff = null;

  function closeEmojiPicker() {
    if (emojiPopOff) { emojiPopOff(); emojiPopOff = null; }
    if (emojiPop && emojiPop.parentNode) emojiPop.parentNode.removeChild(emojiPop);
    emojiPop = null;
  }

  function openEmojiPicker(anchorEl, onPick) {
    closeEmojiPicker();

    const grid = el('div', { cls: 'qr-emoji-grid' });
    const tabs = el('div', { cls: 'qr-emoji-tabs' });

    function show(catIdx) {
      grid.innerHTML = '';
      EMOJI_CATS[catIdx].items.forEach((emoji) => {
        grid.appendChild(el('button', {
          cls: 'qr-emoji', type: 'button', text: emoji, title: emoji,
          on: { click: () => { onPick(emoji); closeEmojiPicker(); } }
        }));
      });
      Array.prototype.forEach.call(tabs.children, (t, i) => t.classList.toggle('qr-on', i === catIdx));
    }

    EMOJI_CATS.forEach((cat, i) => {
      tabs.appendChild(el('button', {
        cls: 'qr-emoji-tab', type: 'button', text: cat.tab,
        title: (T.emojiCats && T.emojiCats[cat.key]) || cat.key,
        on: { click: () => show(i) }
      }));
    });

    const pop = el('div', { cls: 'qr-emoji-pop', on: { click: stop, mousedown: stop } }, [
      el('div', { cls: 'qr-emoji-head' }, [
        el('strong', { text: T.emojiPick }),
        el('button', { cls: 'qr-mini', type: 'button', text: '✕', on: { click: closeEmojiPicker } })
      ]),
      tabs,
      grid,
      el('button', {
        cls: 'qr-emoji-none', type: 'button', text: '🚫 ' + T.emojiNone,
        on: { click: () => { onPick(''); closeEmojiPicker(); } }
      })
    ]);

    emojiPop = pop;
    show(0);
    document.body.appendChild(pop);
    place(pop, anchorEl.getBoundingClientRect(), 292);

    const onKey = (e) => { if (e.key === 'Escape') closeEmojiPicker(); };
    setTimeout(() => {
      document.addEventListener('click', closeEmojiPicker);
      document.addEventListener('keydown', onKey);
      window.addEventListener('resize', closeEmojiPicker);
    }, 0);
    emojiPopOff = () => {
      document.removeEventListener('click', closeEmojiPicker);
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

    const root = el('div', { cls: 'qr-settings' });
    container.appendChild(root);

    // Copia de trabajo: no se persiste hasta pulsar Guardar.
    let draft = clone(loadConfig());

    const status = el('div', { cls: 'qr-status' });
    function say(msg, kind) {
      status.className = 'qr-status' + (kind ? ' qr-' + kind : '');
      status.textContent = msg;
      clearTimeout(say._t);
      say._t = setTimeout(() => { status.textContent = ''; status.className = 'qr-status'; }, 4000);
    }

    // Guarda el borrador y repinta; devuelve la config normalizada.
    function commit(cfg, msg, kind) {
      draft = clone(saveConfig(cfg));
      build();
      say(msg, kind);
    }

    function miniBtn(glyph, title, disabled, onClick, extraCls) {
      return el('button', {
        cls: 'qr-mini' + (extraCls ? ' ' + extraCls : ''), type: 'button',
        text: glyph, title: title, props: { disabled: !!disabled }, on: { click: onClick }
      });
    }

    function replyCard(reply, i) {
      const swap = (a, b) => {
        const tmp = draft.replies[a];
        draft.replies[a] = draft.replies[b];
        draft.replies[b] = tmp;
        build();
      };

      // El icono sólo se elige desde el menú de emojis; no es editable a mano.
      const iconBtn = el('button', {
        cls: 'qr-icon-btn', type: 'button', title: T.emojiPick,
        on: { click: (ev) => {
          ev.preventDefault();
          stop(ev);
          openEmojiPicker(iconBtn, (emoji) => { reply.icon = emoji; paintIcon(); });
        } }
      });
      function paintIcon() {
        const cur = (reply.icon || '').trim();
        iconBtn.textContent = cur || '＋';
        iconBtn.classList.toggle('qr-icon-empty', !cur);
      }
      paintIcon();

      const titleInput = el('input', {
        type: 'text',
        props: { maxLength: 40, placeholder: T.titlePh, value: reply.title || '' },
        on: { input: () => { reply.title = titleInput.value; } }
      });

      const textarea = el('textarea', {
        props: { placeholder: T.textPh, value: reply.text || '' },
        on: { input: () => { reply.text = textarea.value; } }
      });

      return el('div', { cls: 'qr-card' }, [
        el('div', { cls: 'qr-card-head' }, [
          el('span', { cls: 'qr-idx', text: T.reply + ' ' + (i + 1) + ':' }),
          miniBtn('▲', T.moveUp, i === 0, () => swap(i, i - 1)),
          miniBtn('▼', T.moveDown, i === draft.replies.length - 1, () => swap(i, i + 1)),
          miniBtn('✕', T.removeReply, false, () => {
            if (!window.confirm(T.removeConfirm)) return;
            draft.replies.splice(i, 1);
            if (!draft.replies.length) draft.replies.push(emptyReply());
            build();
          }, 'qr-del')
        ]),
        el('div', { cls: 'qr-row' }, [
          el('div', { cls: 'qr-col-icon' }, [el('label', { text: T.icon }), iconBtn]),
          el('div', { cls: 'qr-col-title' }, [el('label', { text: T.title }), titleInput])
        ]),
        el('div', { cls: 'qr-field' }, [el('label', { text: T.text }), textarea])
      ]);
    }

    function modeSelector() {
      const box = el('div', { cls: 'qr-mode' });
      MODES.forEach((m) => {
        const radio = el('input', {
          type: 'radio',
          props: { name: 'qr-mode', value: m, checked: draft.mode === m },
          on: { change: () => { if (radio.checked) draft.mode = m; } }
        });
        box.appendChild(el('label', {}, [
          radio,
          document.createTextNode(m === 'normal' ? T.modeNormal : T.modeSuperFast)
        ]));
      });
      return box;
    }

    function importInput() {
      const file = el('input', {
        cls: 'qr-hidden', type: 'file', attrs: { accept: 'application/json,.json' },
        on: { change: () => {
          const f = file.files && file.files[0];
          file.value = '';
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const parsed = JSON.parse(String(reader.result));
              const ok = Array.isArray(parsed) ||
                (parsed && typeof parsed === 'object' && Array.isArray(parsed.replies));
              if (!ok) throw new Error('bad');
              commit(migrateConfig(parsed), T.imported);
            } catch (e) {
              say(T.importError, 'err');
            }
          };
          reader.onerror = () => say(T.importError, 'err');
          reader.readAsText(f);
        } }
      });
      return file;
    }

    function build() {
      root.innerHTML = '';
      const file = importInput();

      root.appendChild(el('div', { html: '<h3>' + T.heading + '</h3><p class="qr-help">' + T.help + '</p>' }));
      root.appendChild(el('h4', { text: T.modeHeading }));
      root.appendChild(modeSelector());
      root.appendChild(el('p', { cls: 'qr-help', html: T.modeHelp }));

      draft.replies.forEach((reply, i) => root.appendChild(replyCard(reply, i)));

      root.appendChild(el('button', {
        cls: 'qr-add', type: 'button', text: T.addReply,
        on: { click: () => { draft.replies.push(emptyReply()); build(); } }
      }));

      root.appendChild(el('div', { cls: 'qr-actions' }, [
        el('button', {
          cls: 'qr-save', type: 'button', text: T.save,
          on: { click: () => commit(draft, T.saved) }
        })
      ]));

      root.appendChild(el('hr', { cls: 'qr-sep' }));
      root.appendChild(el('h4', { text: T.dataHeading }));
      root.appendChild(el('p', { cls: 'qr-help', text: T.dataHelp }));

      root.appendChild(el('div', { cls: 'qr-actions' }, [
        el('button', {
          cls: 'qr-io', type: 'button', text: T.exportBtn,
          on: { click: () => { exportConfig(draft); say(T.exported); } }
        }),
        el('button', {
          cls: 'qr-io', type: 'button', text: T.importBtn,
          on: { click: () => file.click() }
        }),
        el('button', {
          cls: 'qr-reset', type: 'button', text: T.reset,
          on: { click: () => {
            if (window.confirm(T.resetConfirm)) commit(defaultConfig(), T.restored);
          } }
        }),
        file
      ]));

      root.appendChild(status);
    }

    build();
  }

  function exportConfig(cfg) {
    const data = normalizeConfig(clone(cfg));
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
