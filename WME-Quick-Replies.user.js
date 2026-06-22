// ==UserScript==
// @name         WME Quick Replies
// @name:es      WME Respuestas rápidas
// @namespace    https://github.com/danialonso/wme-quick-replies
// @version      1.8.1
// @description  Quick reply templates for Update Requests in Waze Map Editor. Auto-detects EN/ES/FR/PT/DE and inserts the actual UR problem type.
// @description:es Plantillas de respuestas rápidas para las Solicitudes de actualización (UR) del Waze Map Editor. Detecta el idioma (EN/ES/FR/PT/DE) e inserta el tipo de problema real de la UR.
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
      help: 'Set up to 5 templates. They appear in the "Quick replies" dropdown next to the comment field of Update Requests. Leave a box empty to hide it.<br><br>The token <code>**problem type**</code> is automatically replaced with the request type (e.g. <em>Turn not allowed</em>) when you insert a reply.',
      reply: 'Reply', save: 'Save', reset: 'Restore defaults',
      saved: '✔ Replies saved successfully.', restored: '↺ Default templates restored.'
    },
    es: {
      tab: '💬 Respuestas rápidas', tabTitle: 'Respuestas rápidas', button: '💬 Respuestas rápidas',
      empty: 'No hay respuestas configuradas. Edítalas en la pestaña Scripts.',
      heading: '💬 Respuestas rápidas',
      help: "Configura hasta 5 plantillas. Aparecerán en el desplegable « Respuestas rápidas » junto al campo de comentario de las Solicitudes de actualización. Deja una casilla vacía para ocultarla.<br><br>El token <code>**tipo problema**</code> se sustituye automáticamente por el tipo de la solicitud (ej. <em>Giro incorrecto</em>) al insertar la respuesta.",
      reply: 'Respuesta', save: 'Guardar', reset: 'Restaurar predefinidas',
      saved: '✔ Respuestas guardadas correctamente.', restored: '↺ Plantillas predefinidas restauradas.'
    },
    fr: {
      tab: '💬 Réponses rapides', tabTitle: 'Réponses rapides', button: '💬 Réponses rapides',
      empty: "Aucune réponse configurée. Modifiez-les dans l'onglet Scripts.",
      heading: '💬 Réponses rapides',
      help: "Configurez jusqu'à 5 modèles. Ils apparaissent dans le menu « Réponses rapides » à côté du champ de commentaire des demandes de mise à jour. Laissez une case vide pour la masquer.<br><br>Le jeton <code>**type de problème**</code> est automatiquement remplacé par le type de la demande (ex. <em>Virage interdit</em>) lors de l'insertion d'une réponse.",
      reply: 'Réponse', save: 'Enregistrer', reset: 'Restaurer les valeurs par défaut',
      saved: '✔ Réponses enregistrées avec succès.', restored: '↺ Modèles par défaut restaurés.'
    },
    pt: {
      tab: '💬 Respostas rápidas', tabTitle: 'Respostas rápidas', button: '💬 Respostas rápidas',
      empty: 'Não há respostas configuradas. Edita-as no separador Scripts.',
      heading: '💬 Respostas rápidas',
      help: "Configura até 5 modelos. Aparecem no menu « Respostas rápidas » junto ao campo de comentário dos Pedidos de atualização. Deixa uma caixa vazia para a ocultar.<br><br>O token <code>**tipo de problema**</code> é substituído automaticamente pelo tipo do pedido (ex. <em>Curva proibida</em>) ao inserir uma resposta.",
      reply: 'Resposta', save: 'Guardar', reset: 'Restaurar predefinições',
      saved: '✔ Respostas guardadas com sucesso.', restored: '↺ Modelos predefinidos restaurados.'
    },
    de: {
      tab: '💬 Schnellantworten', tabTitle: 'Schnellantworten', button: '💬 Schnellantworten',
      empty: 'Keine Antworten konfiguriert. Bearbeite sie im Tab Scripts.',
      heading: '💬 Schnellantworten',
      help: "Richte bis zu 5 Vorlagen ein. Sie erscheinen im Menü « Schnellantworten » neben dem Kommentarfeld der Update-Anfragen. Lass ein Feld leer, um es auszublenden.<br><br>Der Platzhalter <code>**Problemtyp**</code> wird beim Einfügen automatisch durch den Anfragetyp ersetzt (z. B. <em>Abbiegen verboten</em>).",
      reply: 'Antwort', save: 'Speichern', reset: 'Standard wiederherstellen',
      saved: '✔ Antworten erfolgreich gespeichert.', restored: '↺ Standardvorlagen wiederhergestellt.'
    }
  };
  const T = I18N[LANG] || I18N.en;

  /* ------------------------------------------------------------------ *
   *  Configuración y almacenamiento
   * ------------------------------------------------------------------ */
  const STORAGE_KEY = 'WME_QuickReplies_v1';
  const MAX_REPLIES = 5;

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
  const DEFAULT_REPLIES = DEFAULTS[LANG] || DEFAULTS.en;

  function loadReplies() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_REPLIES.slice();
      const arr = JSON.parse(raw);
      const out = [];
      for (let i = 0; i < MAX_REPLIES; i++) out.push(typeof arr[i] === 'string' ? arr[i] : '');
      return out;
    } catch (e) {
      return DEFAULT_REPLIES.slice();
    }
  }

  function saveReplies(arr) {
    const clean = [];
    for (let i = 0; i < MAX_REPLIES; i++) clean.push(typeof arr[i] === 'string' ? arr[i] : '');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  }

  /* ------------------------------------------------------------------ *
   *  Estilos
   * ------------------------------------------------------------------ */
  function injectStyles() {
    if (document.getElementById('qr-styles')) return;
    const css = `
      .qr-wrap { margin: 6px 0 4px 0; }
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
      .qr-empty { color: #999; font-style: italic; cursor: default; }
      .qr-empty:hover { background: transparent; }
      .qr-hidden { display: none !important; }

      .qr-settings { padding: 8px 4px; font-size: 13px; }
      .qr-settings h3 { margin: 0 0 6px 0; font-size: 15px; }
      .qr-settings p.qr-help { color: #555; margin: 0 0 12px 0; font-size: 12px; }
      .qr-settings code { background:#eef; padding:1px 4px; border-radius:3px; }
      .qr-field { margin-bottom: 12px; }
      .qr-field label { display: block; font-weight: 600; margin-bottom: 4px; }
      .qr-field textarea {
        width: 100%; box-sizing: border-box; min-height: 70px; resize: vertical;
        padding: 6px 8px; border: 1px solid #c7c7c7; border-radius: 6px;
        font-family: inherit; font-size: 12px; line-height: 1.4;
      }
      .qr-actions { display: flex; gap: 8px; margin-top: 6px; }
      .qr-save, .qr-reset {
        padding: 6px 14px; border-radius: 6px; cursor: pointer; font-weight: 600;
        border: 1px solid transparent;
      }
      .qr-save { background: #1f3b7a; color: #fff; }
      .qr-save:hover { background: #16306a; }
      .qr-reset { background: #f1f1f1; color: #333; border-color: #c7c7c7; }
      .qr-reset:hover { background: #e6e6e6; }
      .qr-status { margin-top: 8px; color: #1a7a1a; font-size: 12px; min-height: 16px; }
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

  /* ------------------------------------------------------------------ *
   *  Menú único compartido (anclado a <body>)
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
    const replies = loadReplies();
    let any = false;
    replies.forEach((text, idx) => {
      if (!text || !text.trim()) return;
      any = true;
      const item = document.createElement('div');
      item.className = 'qr-item';
      const preview = text.length > 90 ? text.slice(0, 90) + '…' : text;
      item.innerHTML = '<span class="qr-num">' + (idx + 1) + '.</span>';
      item.appendChild(document.createTextNode(preview));
      item.title = text;
      item.addEventListener('click', (ev) => {
        ev.stopPropagation();
        setFieldValue(targetEl, expandPlaceholders(text, targetEl));
        hideMenu();
      });
      menu.appendChild(item);
    });
    if (!any) {
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
   *  Colocación del botón (auto-reparable)
   *  Estilos EN LÍNEA: el botón puede vivir dentro del Shadow DOM de wz-textarea.
   * ------------------------------------------------------------------ */
  function styleButton(btn) {
    Object.assign(btn.style, {
      display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
      padding: '3px 9px', border: '1px solid #c7c7c7', borderRadius: '13px',
      background: '#f3f6ff', color: '#1f3b7a', cursor: 'pointer',
      fontWeight: '600', fontSize: '11px', lineHeight: '1.3', userSelect: 'none',
      fontFamily: 'inherit'
    });
  }

  function makeButton(targetEl) {
    const btn = document.createElement('div');
    btn.className = 'qr-btn';
    btn.innerHTML = T.button + ' <span style="font-size:10px">▾</span>';
    styleButton(btn);
    btn.addEventListener('mouseenter', () => { btn.style.background = '#e6ecff'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = '#f3f6ff'; });
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const isOpen = qrMenu && !qrMenu.classList.contains('qr-hidden');
      hideMenu();
      if (!isOpen) openMenu(btn, targetEl);
    });
    return btn;
  }

  function ensureInStatusContainer(container, targetEl) {
    let btn = container.querySelector(':scope > .qr-btn');
    if (btn) return btn;
    const cs = window.getComputedStyle(container);
    if (cs.display.indexOf('flex') === -1) {
      container.style.display = 'flex';
      container.style.alignItems = 'center';
    }
    btn = makeButton(targetEl);
    btn.style.marginRight = 'auto'; // empuja el contador (.length-text) a la derecha
    container.insertBefore(btn, container.firstChild);
    return btn;
  }

  function ensureAfterField(targetEl) {
    const next = targetEl.nextElementSibling;
    if (next && next.classList && next.classList.contains('qr-wrap') && next.isConnected) {
      return next.querySelector('.qr-btn');
    }
    const wrap = document.createElement('div');
    wrap.className = 'qr-wrap';
    const btn = makeButton(targetEl);
    wrap.appendChild(btn);
    targetEl.insertAdjacentElement('afterend', wrap);
    return btn;
  }

  function isUrCommentField(el) {
    if (el.closest && el.closest('.qr-settings')) return false;
    const attrs = [
      el.getAttribute('placeholder'),
      el.getAttribute('aria-label'),
      el.getAttribute('data-placeholder')
    ].join(' ').toLowerCase();
    if (/coment|comment|kommentar|commentaire|conversa/.test(attrs)) return true;
    if (el.tagName === 'TEXTAREA') {
      const ml = el.maxLength;
      if (typeof ml === 'number' && ml >= 200 && ml <= 5000) return true;
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

  // Botón cacheado: mientras siga conectado al DOM, scan() no hace nada caro.
  let placedBtn = null;

  function scan() {
    if (placedBtn && placedBtn.isConnected) return; // camino rápido O(1)
    placedBtn = null;

    eachRoot((root) => {
      if (!root.querySelectorAll) return;
      let containers;
      try { containers = root.querySelectorAll('.status-text-container'); } catch (e) { return; }
      for (const container of containers) {
        if (container.closest && container.closest('.qr-settings')) continue;
        const ta = findTextareaFor(container);
        if (!ta) continue;
        placedBtn = ensureInStatusContainer(container, ta);
      }
      return placedBtn ? true : undefined;
    });

    if (!placedBtn) {
      eachRoot((root) => {
        if (!root.querySelectorAll) return;
        let found = null;
        root.querySelectorAll('textarea, [contenteditable="true"]').forEach((el) => {
          if (!found && isUrCommentField(el)) found = el;
        });
        if (!found && root.querySelector) found = root.querySelector('#wz-textarea-0');
        if (found) { placedBtn = ensureAfterField(found); return true; }
      });
    }
  }

  let scanTimer = null;
  function scheduleScan() {
    if (scanTimer) return;
    scanTimer = setTimeout(() => { scanTimer = null; scan(); }, 400);
  }

  function startInjection() {
    injectStyles();
    scan();
    new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true });
    setInterval(scan, 2000);
    console.log('[WME Quick Replies] cargado ✔ (v1.8.1 — idioma: ' + LANG + ')');
  }

  /* ------------------------------------------------------------------ *
   *  Panel de ajustes en la pestaña Scripts
   * ------------------------------------------------------------------ */
  function renderSettings(container) {
    injectStyles();
    container.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'qr-settings';
    root.innerHTML = '<h3>' + T.heading + '</h3>' + '<p class="qr-help">' + T.help + '</p>';

    const fields = [];
    const replies = loadReplies();
    for (let i = 0; i < MAX_REPLIES; i++) {
      const field = document.createElement('div');
      field.className = 'qr-field';
      const label = document.createElement('label');
      label.textContent = T.reply + ' ' + (i + 1);
      const textarea = document.createElement('textarea');
      textarea.value = replies[i] || '';
      field.appendChild(label);
      field.appendChild(textarea);
      root.appendChild(field);
      fields.push(textarea);
    }

    const actions = document.createElement('div');
    actions.className = 'qr-actions';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'qr-save';
    saveBtn.textContent = T.save;
    const resetBtn = document.createElement('button');
    resetBtn.className = 'qr-reset';
    resetBtn.textContent = T.reset;
    actions.appendChild(saveBtn);
    actions.appendChild(resetBtn);
    root.appendChild(actions);

    const status = document.createElement('div');
    status.className = 'qr-status';
    root.appendChild(status);

    saveBtn.addEventListener('click', () => {
      saveReplies(fields.map(f => f.value));
      status.textContent = T.saved;
      setTimeout(() => { status.textContent = ''; }, 3000);
    });
    resetBtn.addEventListener('click', () => {
      DEFAULT_REPLIES.forEach((t, i) => { if (fields[i]) fields[i].value = t; });
      saveReplies(DEFAULT_REPLIES);
      status.textContent = T.restored;
      setTimeout(() => { status.textContent = ''; }, 3000);
    });

    container.appendChild(root);
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
