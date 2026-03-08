const STORAGE_KEY = "smooth-stream-scroll:last-settings";

const DEFAULT_SETTINGS = {
  text:
    "I am currently extracting the key financial statement data for Nvidia from the 10-K document to build a reliable and accurate 3-statement model.",
  textWidth: 180,
  viewportHeight: 120,
  fontFamily: "",
  fontStyle: "",
  fontSize: 10,
  lineHeightPx: null,
  letterSpacingPx: 0.2,
  streamMode: "words",
  streamCount: 2,
  speedMs: 80,
  textColor: "#5E5E5E",
  setName: "",
  easing: "LINEAR"
};

const ui = String.raw`
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    :root {
      --bg: #fafafa;
      --panel: rgba(255, 255, 255, 0.9);
      --panel-strong: #ffffff;
      --text: #111111;
      --text-soft: #666666;
      --text-faint: #888888;
      --border: rgba(0, 0, 0, 0.08);
      --border-strong: rgba(0, 0, 0, 0.14);
      --focus: rgba(0, 0, 0, 0.18);
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.04);
      --shadow-md: 0 12px 32px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
      --radius-sm: 10px;
      --radius-md: 14px;
      --radius-lg: 18px;
    }

    * {
      box-sizing: border-box;
    }

    html {
      background:
        radial-gradient(circle at top, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0) 36%),
        linear-gradient(180deg, #fcfcfc 0%, #f6f6f6 100%);
    }

    body {
      font: 13px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      margin: 0;
      padding: 18px;
      color: var(--text);
      background: transparent;
      -webkit-font-smoothing: antialiased;
    }

    form {
      display: grid;
      gap: 14px;
    }

    label {
      display: grid;
      gap: 6px;
    }

    .shell {
      display: grid;
      gap: 16px;
    }

    .hero {
      display: grid;
      gap: 6px;
      padding: 2px 2px 4px;
    }

    .eyebrow {
      color: var(--text-faint);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .title {
      margin: 0;
      font-size: 21px;
      line-height: 1.1;
      font-weight: 600;
      letter-spacing: -0.03em;
      text-wrap: balance;
    }

    .subtitle {
      margin: 0;
      color: var(--text-soft);
      font-size: 12px;
      line-height: 1.5;
    }

    .section {
      display: grid;
      gap: 12px;
      padding-top: 14px;
      border-top: 1px solid var(--border);
    }

    .section:first-of-type {
      padding-top: 0;
      border-top: 0;
    }

    .section-header {
      display: grid;
      gap: 2px;
    }

    .section-title {
      margin: 0;
      font-size: 12px;
      line-height: 1.3;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .section-copy {
      margin: 0;
      color: var(--text-soft);
      font-size: 11px;
      line-height: 1.45;
    }

    .field-label {
      color: var(--text);
      font-size: 12px;
      font-weight: 500;
      letter-spacing: -0.01em;
    }

    .field-hint {
      color: var(--text-faint);
      font-size: 11px;
      line-height: 1.4;
    }

    textarea,
    input,
    select,
    button {
      font: inherit;
      border-radius: var(--radius-md);
      width: 100%;
    }

    textarea,
    input,
    select {
      min-height: 40px;
      padding: 10px 12px;
      color: var(--text);
      border: 1px solid transparent;
      background: var(--panel-strong);
      box-shadow: inset 0 0 0 1px var(--border);
      outline: none;
      transition: box-shadow 150ms ease, border-color 150ms ease, background-color 150ms ease;
    }

    textarea::placeholder,
    input::placeholder {
      color: #9b9b9b;
    }

    textarea:focus,
    input:focus,
    select:focus {
      box-shadow: inset 0 0 0 1px var(--border-strong), 0 0 0 0 1px transparent;
      border-color: var(--focus);
    }

    input[type="number"] {
      font-variant-numeric: tabular-nums;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    textarea {
      min-height: 132px;
      resize: vertical;
    }

    .source-card {
      padding: 12px;
      border-radius: 16px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 248, 248, 0.94));
      box-shadow: inset 0 0 0 1px var(--border);
      display: grid;
      gap: 7px;
    }

    .source-card[data-state="missing"] {
      background: linear-gradient(180deg, #fff8f8, #fff4f4);
      box-shadow: inset 0 0 0 1px rgba(180, 35, 24, 0.14);
    }

    .source-row {
      color: #444;
      word-break: break-word;
    }

    .source-label {
      color: var(--text-faint);
      margin-right: 6px;
    }

    button {
      border: 0;
      cursor: pointer;
      min-height: 40px;
      padding: 10px 14px;
      transition: transform 120ms ease, box-shadow 160ms ease, background-color 160ms ease, color 160ms ease;
    }

    button:active {
      transform: scale(0.985);
    }

    .button-secondary {
      color: var(--text);
      background: rgba(255, 255, 255, 0.84);
      box-shadow: inset 0 0 0 1px var(--border);
    }

    .button-secondary:hover:not([disabled]) {
      background: rgba(255, 255, 255, 0.98);
      box-shadow: inset 0 0 0 1px var(--border-strong);
    }

    .button-primary {
      color: #ffffff;
      background: linear-gradient(180deg, #171717, #0c0c0c);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14), inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    }

    .button-primary:hover:not([disabled]) {
      background: linear-gradient(180deg, #202020, #101010);
    }

    button[disabled] {
      cursor: wait;
      opacity: 0.72;
      transform: none;
    }

    .actions {
      display: grid;
      gap: 10px;
      padding-top: 14px;
      border-top: 1px solid var(--border);
    }

    .status {
      min-height: 20px;
      padding: 0 2px;
      color: var(--text-soft);
      font-size: 12px;
      line-height: 1.5;
    }

    .status[data-state="loading"] {
      color: var(--text);
    }

    .status[data-state="error"] {
      color: #b42318;
    }

    .spinner {
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-right: 8px;
      border: 2px solid rgba(0, 0, 0, 0.14);
      border-top-color: #111;
      border-radius: 999px;
      animation: spin 700ms linear infinite;
      vertical-align: -2px;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }

      to {
        transform: rotate(360deg);
      }
    }

    p {
      margin: 0;
      color: var(--text-soft);
    }

    .footer-note {
      color: var(--text-faint);
      font-size: 11px;
      line-height: 1.5;
    }

    @media (max-width: 360px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="shell">
    <div class="hero">
      <div class="eyebrow">Prototype Tools</div>
      <h1 class="title">Smooth Stream Scroll</h1>
      <p class="subtitle">Build a staged text component set from your selection, then tune typography and playback before generation.</p>
    </div>

    <form id="form">
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Source</h2>
          <p class="section-copy">Pull text and type settings from the selected frame or text layer, then edit them before generating.</p>
        </div>

        <label>
          <span class="field-label">Selected source</span>
          <div id="sourceInfo" class="source-card" data-state="missing">Select a text layer or a frame containing a text layer.</div>
        </label>

        <button id="refreshSource" class="button-secondary" type="button">Populate from selection</button>
      </section>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Content</h2>
          <p class="section-copy">This text becomes the fully rendered layout that each reveal state masks and animates.</p>
        </div>

        <label>
          <span class="field-label">Text</span>
          <textarea name="text"></textarea>
        </label>

        <div class="grid">
          <label>
            <span class="field-label">Text width</span>
            <input name="textWidth" type="number" min="1" />
          </label>
          <label>
            <span class="field-label">Max viewport height</span>
            <input name="viewportHeight" type="number" min="1" />
          </label>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Typography</h2>
          <p class="section-copy">Use available Figma fonts and styles, then adjust spacing and color for the generated set.</p>
        </div>

        <div class="grid">
          <label>
            <span class="field-label">Font family</span>
            <select name="fontFamily"></select>
          </label>
          <label>
            <span class="field-label">Font style</span>
            <select name="fontStyle"></select>
          </label>
        </div>

        <div class="grid">
          <label>
            <span class="field-label">Font size</span>
            <input name="fontSize" type="number" min="1" step="0.1" />
          </label>
          <label>
            <span class="field-label">Line height px</span>
            <input name="lineHeightPx" type="number" min="0" step="0.1" placeholder="Auto" />
          </label>
        </div>

        <div class="grid">
          <label>
            <span class="field-label">Letter spacing px</span>
            <input name="letterSpacingPx" type="number" step="0.1" />
          </label>
          <label>
            <span class="field-label">Text color</span>
            <input name="textColor" type="text" />
          </label>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Playback</h2>
          <p class="section-copy">Control how much text streams per step and how quickly each reveal transition plays.</p>
        </div>

        <div class="grid">
          <label>
            <span class="field-label">Stream</span>
            <select name="streamMode">
              <option value="words">Words</option>
              <option value="letters">Letters</option>
            </select>
          </label>
          <label>
            <span class="field-label">Easing</span>
            <select name="easing">
              <option value="LINEAR">Linear</option>
              <option value="QUICK">Quick</option>
              <option value="GENTLE">Gentle</option>
            </select>
          </label>
        </div>

        <div class="grid">
          <label>
            <span class="field-label">Every</span>
            <input name="streamCount" type="number" min="1" />
          </label>
          <label>
            <span class="field-label">Speed ms per unit</span>
            <input name="speedMs" type="number" min="1" />
          </label>
        </div>

        <label>
          <span class="field-label">Name prefix</span>
          <input name="setName" type="text" placeholder="Optional" />
        </label>
      </section>

      <div class="actions">
        <button class="button-primary" type="submit">Generate component set</button>
        <div id="status" class="status" data-state="idle"></div>
        <p class="footer-note">The plugin builds a new text component set, hugs the text until it reaches the max height, and places a starter instance on the current page.</p>
      </div>
    </form>
  </div>

  <script>
    var hasValidSource = false;
    var fontStylesByFamily = {};
    var availableFamilyNames = [];
    var pendingHydrateSettings = null;

    parent.postMessage(
      {
        pluginMessage: {
          type: "ui-ready"
        }
      },
      "*"
    );

    window.onmessage = function (event) {
      const pluginMessage = event.data && event.data.pluginMessage;
      if (!pluginMessage) {
        return;
      }

      if (pluginMessage.type === "hydrate-settings") {
        hydrateForm(pluginMessage.settings || {});
        setLoading(false, "");
        return;
      }

      if (pluginMessage.type === "available-fonts") {
        setAvailableFonts(pluginMessage.fonts || []);
        if (pendingHydrateSettings) {
          const nextSettings = pendingHydrateSettings;
          pendingHydrateSettings = null;
          hydrateForm(nextSettings);
        }
        return;
      }

      if (pluginMessage.type === "selection-source") {
        hasValidSource = Boolean(pluginMessage.source && pluginMessage.source.isValid);
        renderSource(pluginMessage.source || null);
        updateGenerateEnabled();
        return;
      }

      if (pluginMessage.type === "populate-settings") {
        if (pluginMessage.settings) {
          applyImportedSettings(pluginMessage.settings);
          setLoading(false, "");
        }
        return;
      }

      if (pluginMessage.type === "generate-error") {
        setLoading(false, pluginMessage.message || "Generation failed.");
      }
    };

    document.getElementById("refreshSource").addEventListener("click", function () {
      setLoading(true, "Reading current selection...");
      parent.postMessage(
        {
          pluginMessage: {
            type: "populate-source"
          }
        },
        "*"
      );
    });

    document.getElementById("form").addEventListener("submit", function (event) {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      setLoading(true, "Generating component set...");
      parent.postMessage(
        {
          pluginMessage: {
            type: "generate",
            settings: {
              text: String(form.get("text") || ""),
              textWidth: Number(form.get("textWidth")),
              viewportHeight: Number(form.get("viewportHeight")),
              fontFamily: String(form.get("fontFamily") || "").trim(),
              fontStyle: String(form.get("fontStyle") || "").trim(),
              fontSize: Number(form.get("fontSize")),
              lineHeightPx: parseOptionalNumber(form.get("lineHeightPx")),
              letterSpacingPx: Number(form.get("letterSpacingPx")),
              streamMode: String(form.get("streamMode") || "words"),
              streamCount: Number(form.get("streamCount")),
              speedMs: Number(form.get("speedMs")),
              textColor: String(form.get("textColor") || "").trim(),
              setName: String(form.get("setName") || "").trim(),
              easing: String(form.get("easing") || "LINEAR")
            }
          }
        },
        "*"
      );
    });

    function parseOptionalNumber(value) {
      const trimmed = String(value || "").trim();
      return trimmed ? Number(trimmed) : null;
    }

    function hydrateForm(settings) {
      pendingHydrateSettings = availableFamilyNames.length === 0 ? settings : null;
      const form = document.getElementById("form");
      setValue(form, "text", settings.text);
      setValue(form, "textWidth", settings.textWidth);
      setValue(form, "viewportHeight", settings.viewportHeight);
      setFontSelection(settings.fontFamily, settings.fontStyle);
      setValue(form, "fontSize", settings.fontSize);
      setValue(form, "lineHeightPx", settings.lineHeightPx === null ? "" : settings.lineHeightPx);
      setValue(form, "letterSpacingPx", settings.letterSpacingPx);
      setValue(form, "streamMode", settings.streamMode);
      setValue(form, "streamCount", settings.streamCount);
      setValue(form, "speedMs", settings.speedMs);
      setValue(form, "textColor", settings.textColor);
      setValue(form, "setName", settings.setName);
      setValue(form, "easing", settings.easing);
    }

    function applyImportedSettings(settings) {
      const form = document.getElementById("form");
      setValue(form, "text", settings.text);
      setValue(form, "textWidth", settings.textWidth);
      setFontSelection(settings.fontFamily, settings.fontStyle);
      setValue(form, "fontSize", settings.fontSize);
      setValue(form, "lineHeightPx", settings.lineHeightPx === null ? "" : settings.lineHeightPx);
      setValue(form, "letterSpacingPx", settings.letterSpacingPx);
      setValue(form, "textColor", settings.textColor);
    }

    function setValue(form, name, value) {
      const field = form.elements.namedItem(name);
      if (!field) {
        return;
      }

      field.value = value == null ? "" : String(value);
    }

    function setAvailableFonts(fonts) {
      const familyField = document.querySelector('select[name="fontFamily"]');
      const styleField = document.querySelector('select[name="fontStyle"]');
      fontStylesByFamily = {};

      for (let i = 0; i < fonts.length; i += 1) {
        const family = fonts[i].family;
        const style = fonts[i].style;

        if (!fontStylesByFamily[family]) {
          fontStylesByFamily[family] = [];
        }

        if (fontStylesByFamily[family].indexOf(style) === -1) {
          fontStylesByFamily[family].push(style);
        }
      }

      availableFamilyNames = Object.keys(fontStylesByFamily).sort();
      familyField.innerHTML = "";

      for (let i = 0; i < availableFamilyNames.length; i += 1) {
        familyField.add(new Option(availableFamilyNames[i], availableFamilyNames[i]));
      }

      familyField.onchange = function () {
        refreshStyleOptions(familyField.value, styleField.value);
      };

      if (availableFamilyNames.length === 0) {
        familyField.add(new Option("No fonts available", ""));
        styleField.innerHTML = "";
        styleField.add(new Option("No styles available", ""));
        return;
      }

      if (pendingHydrateSettings) {
        const nextSettings = pendingHydrateSettings;
        pendingHydrateSettings = null;
        hydrateForm(nextSettings);
        return;
      }

      refreshStyleOptions(familyField.value || availableFamilyNames[0], styleField.value);
    }

    function refreshStyleOptions(family, preferredStyle) {
      const familyField = document.querySelector('select[name="fontFamily"]');
      const styleField = document.querySelector('select[name="fontStyle"]');
      const styles = (fontStylesByFamily[family] || []).slice().sort();

      familyField.value = family;
      styleField.innerHTML = "";

      if (styles.length === 0) {
        styleField.add(new Option("No styles available", ""));
        return;
      }

      for (let i = 0; i < styles.length; i += 1) {
        styleField.add(new Option(styles[i], styles[i]));
      }

      if (styles.indexOf(preferredStyle) !== -1) {
        styleField.value = preferredStyle;
      } else if (styles.length > 0) {
        styleField.value = styles[0];
      }
    }

    function setFontSelection(family, style) {
      if (availableFamilyNames.length === 0) {
        return;
      }

      const nextFamily = fontStylesByFamily[family] ? family : availableFamilyNames[0];
      refreshStyleOptions(nextFamily, style);
    }

    function setLoading(isLoading, message) {
      const form = document.getElementById("form");
      const refreshSource = document.getElementById("refreshSource");
      const status = document.getElementById("status");
      const fields = form.querySelectorAll("input, textarea, select, button");

      for (let i = 0; i < fields.length; i += 1) {
        fields[i].disabled = isLoading;
      }

      refreshSource.disabled = isLoading;

      if (isLoading) {
        status.dataset.state = "loading";
        status.innerHTML = '<span class="spinner"></span>' + escapeHtml(message || "Generating...");
        return;
      }

      if (message) {
        status.dataset.state = "error";
        status.textContent = message;
        return;
      }

      status.dataset.state = "idle";
      status.textContent = "";
      updateGenerateEnabled();
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function renderSource(source) {
      const sourceInfo = document.getElementById("sourceInfo");

      if (!source || !source.isValid) {
        sourceInfo.dataset.state = "missing";
        sourceInfo.innerHTML = escapeHtml(
          (source && source.message) || "Select a text layer or a frame containing a text layer."
        );
        return;
      }

      sourceInfo.dataset.state = "ready";
      sourceInfo.innerHTML =
        '<div class="source-row"><span class="source-label">Selection:</span>' +
        escapeHtml(source.selectionName) +
        "</div>" +
        '<div class="source-row"><span class="source-label">Text layer:</span>' +
        escapeHtml(source.textNodeName) +
        "</div>" +
        '<div class="source-row"><span class="source-label">Width:</span>' +
        escapeHtml(String(source.textWidth)) +
        "px</div>" +
        '<div class="source-row"><span class="source-label">Style:</span>' +
        escapeHtml(source.styleDescription) +
        "</div>" +
        '<div class="source-row"><span class="source-label">Preview:</span>' +
        escapeHtml(source.previewText) +
        "</div>";
    }

    function updateGenerateEnabled() {
      const submitButton = document.querySelector('button[type="submit"]');
      const status = document.getElementById("status");
      if (!submitButton) {
        return;
      }

      const isBusy = submitButton.disabled && status.dataset.state === "loading";
      if (!isBusy) {
        submitButton.disabled = false;
      }
    }
  </script>
</body>
</html>
`;

const BLUR_IN_RADIUS = 6;

initPlugin();

async function initPlugin() {
  figma.showUI(ui, { width: 380, height: 760, title: "Smooth Stream Scroll" });

  const availableFonts = await getAvailableFontsForUi();
  const savedSettings = normalizeSettingsForAvailableFonts(await loadSavedSettings(), availableFonts);
  postSelectionSourceToUi();
  figma.on("selectionchange", postSelectionSourceToUi);

  figma.ui.onmessage = async function (msg) {
    if (!msg) {
      return;
    }

    if (msg.type === "ui-ready") {
      figma.ui.postMessage({
        type: "available-fonts",
        fonts: availableFonts
      });
      figma.ui.postMessage({
        type: "hydrate-settings",
        settings: savedSettings
      });
      postSelectionSourceToUi();
      return;
    }

    if (msg.type === "refresh-source") {
      postSelectionSourceToUi();
      return;
    }

    if (msg.type === "populate-source") {
      try {
        const importedSettings = await getPopulateSettingsFromSelection();
        figma.ui.postMessage({
          type: "populate-settings",
          settings: importedSettings
        });
        postSelectionSourceToUi();
      } catch (error) {
        figma.ui.postMessage({
          type: "generate-error",
          message: error instanceof Error ? error.message : String(error)
        });
      }
      return;
    }

    if (msg.type !== "generate") {
      return;
    }

    try {
      const settings = mergeSettings(msg.settings || {});
      await saveSettings(settings);
      await generateSmoothTextSet(settings);
    } catch (error) {
      figma.ui.postMessage({
        type: "generate-error",
        message: error instanceof Error ? error.message : String(error)
      });
      figma.notify(error instanceof Error ? error.message : String(error), {
        error: true
      });
    }
  };
}

async function generateSmoothTextSet(settings) {
  validateSettings(settings);
  const source = buildGenerationSource(settings);
  await loadFontForGeneration(source.fontName);

  const revealPlan = buildRevealPlan(source.text, settings.streamMode, settings.streamCount);
  const revealStates = revealPlan.states;
  const chunks = revealPlan.chunks;
  const heights = measureTextHeights(revealStates, source);
  const containerHeights = heights.map(function (textHeight) {
    return Math.min(textHeight, settings.viewportHeight);
  });

  const finalTextNode = createStyledTextNode(source, source.text);
  const sourceVisibleFills = clonePaints(source.fills);
  const generatedSetName = buildGeneratedSetName(settings, revealStates);

  const parent = figma.currentPage;
  const wrappers = [];
  const startPoint = {
    x: round2(figma.viewport.center.x - source.textWidth / 2),
    y: round2(figma.viewport.center.y - containerHeights[0] / 2)
  };

  for (let i = 0; i < revealStates.length; i += 1) {
    const wrapper = figma.createComponent();
    wrapper.name = "State=" + getStateValue(i);
    wrapper.layoutMode = "VERTICAL";
    wrapper.primaryAxisSizingMode = "AUTO";
    wrapper.counterAxisSizingMode = "FIXED";
    wrapper.primaryAxisAlignItems = "MIN";
    wrapper.counterAxisAlignItems = "MIN";
    wrapper.itemSpacing = 0;
    wrapper.paddingTop = 0;
    wrapper.paddingRight = 0;
    wrapper.paddingBottom = 0;
    wrapper.paddingLeft = 0;
    wrapper.clipsContent = false;
    wrapper.fills = [];
    wrapper.strokes = [];
    wrapper.resizeWithoutConstraints(source.textWidth, containerHeights[i]);
    wrapper.x = startPoint.x;
    wrapper.y = startPoint.y + i * (settings.viewportHeight + 24);

    const viewport = figma.createFrame();
    viewport.name = "Viewport";
    viewport.clipsContent = true;
    viewport.fills = [];
    viewport.strokes = [];
    viewport.resizeWithoutConstraints(source.textWidth, containerHeights[i]);

    const contentRoot = figma.createFrame();
    contentRoot.name = "Streaming content";
    contentRoot.clipsContent = false;
    contentRoot.fills = [];
    contentRoot.strokes = [];
    contentRoot.resizeWithoutConstraints(source.textWidth, finalTextNode.height);
    contentRoot.x = 0;
    contentRoot.y = round2(containerHeights[i] - heights[i]);

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
      const chunkNode = finalTextNode.clone();
      chunkNode.name = "Chunk " + String(chunkIndex + 1);
      chunkNode.x = 0;
      chunkNode.y = 0;
      applyChunkVisibility(chunkNode, chunks[chunkIndex].start, chunks[chunkIndex].end, sourceVisibleFills);

      if (chunkIndex < revealStates[i].revealedChunkCount) {
        chunkNode.opacity = 1;
        chunkNode.effects = [];
      } else if (chunkIndex === revealStates[i].revealedChunkCount) {
        chunkNode.opacity = 0;
        chunkNode.effects = makeLayerBlurEffect(BLUR_IN_RADIUS);
      } else {
        chunkNode.opacity = 0;
        chunkNode.effects = [];
      }

      contentRoot.appendChild(chunkNode);
    }

    viewport.appendChild(contentRoot);
    wrapper.appendChild(viewport);
    parent.appendChild(wrapper);
    wrappers.push(wrapper);
  }

  const smoothSet = figma.combineAsVariants(wrappers, parent);
  smoothSet.name = generatedSetName;
  smoothSet.x = startPoint.x;
  smoothSet.y = startPoint.y;

  const orderedSmoothVariants = getOrderedVariants(smoothSet, "State");
  for (let i = 0; i < orderedSmoothVariants.length - 1; i += 1) {
    const transitionDurationMs = getTransitionDurationMs(revealStates[i + 1].unitCount, settings.speedMs);
    await orderedSmoothVariants[i].setReactionsAsync([
      {
        trigger: { type: "AFTER_TIMEOUT", timeout: msToSeconds(1) },
        actions: [
          {
            type: "NODE",
            destinationId: orderedSmoothVariants[i + 1].id,
            navigation: "CHANGE_TO",
            transition: {
              type: "SMART_ANIMATE",
              easing: { type: settings.easing },
              duration: msToSeconds(transitionDurationMs)
            }
          }
        ]
      }
    ]);
  }

  const starterIndex = orderedSmoothVariants.length > 1 ? 1 : 0;
  const starterInstance = orderedSmoothVariants[starterIndex].createInstance();
  starterInstance.name = smoothSet.name + " / Preview";
  starterInstance.x = startPoint.x + smoothSet.width + 120;
  starterInstance.y = startPoint.y;
  parent.appendChild(starterInstance);

  figma.currentPage.selection = [starterInstance];
  figma.viewport.scrollAndZoomIntoView([smoothSet, starterInstance]);
  figma.closePlugin("Created " + smoothSet.name);
}

function validateSettings(settings) {
  if (!settings.text || !String(settings.text).trim()) {
    throw new Error("Enter some text.");
  }

  if (!(settings.textWidth > 0)) {
    throw new Error("Text width must be greater than 0.");
  }

  if (!(settings.viewportHeight > 0)) {
    throw new Error("Max viewport height must be greater than 0.");
  }

  if (!settings.fontFamily || !settings.fontStyle) {
    throw new Error("Enter a font family and style.");
  }

  if (!(settings.fontSize > 0)) {
    throw new Error("Font size must be greater than 0.");
  }

  if (settings.streamMode !== "words" && settings.streamMode !== "letters") {
    throw new Error('Stream must be either "words" or "letters".');
  }

  if (!(settings.streamCount > 0)) {
    throw new Error("Every must be greater than 0.");
  }

  if (!(settings.speedMs > 0)) {
    throw new Error("Speed must be greater than 0.");
  }

  if (!settings.textColor) {
    throw new Error("Enter a text color.");
  }
}

async function loadSavedSettings() {
  const saved = await figma.clientStorage.getAsync(STORAGE_KEY);
  return mergeSettings(saved || {});
}

async function saveSettings(settings) {
  await figma.clientStorage.setAsync(STORAGE_KEY, settings);
}

function mergeSettings(settings) {
  const merged = {};

  for (const key in DEFAULT_SETTINGS) {
    merged[key] = DEFAULT_SETTINGS[key];
  }

  for (const key in settings) {
    if (Object.prototype.hasOwnProperty.call(settings, key) && settings[key] !== undefined) {
      merged[key] = settings[key];
    }
  }

  return merged;
}

function buildRevealPlan(text, streamMode, streamCount) {
  const units = streamMode === "letters" ? tokenizeLetters(text) : tokenizeWords(text);
  const chunks = [];
  const revealStates = [
    {
      text: "",
      unitCount: 0,
      revealedChunkCount: 0
    }
  ];
  let current = "";

  for (let i = 0; i < units.length; i += streamCount) {
    const slice = units.slice(i, i + streamCount);
    const appendedText = slice.join("");
    const start = current.length;
    current += appendedText;
    const end = current.length;

    chunks.push({
      start: start,
      end: end,
      unitCount: slice.length
    });

    revealStates.push({
      text: current,
      unitCount: slice.length,
      revealedChunkCount: chunks.length
    });
  }

  if (revealStates.length === 1) {
    chunks.push({
      start: 0,
      end: text.length,
      unitCount: 1
    });
    revealStates.push({
      text: text,
      unitCount: 1,
      revealedChunkCount: 1
    });
  }

  return {
    states: revealStates,
    chunks: chunks
  };
}

function tokenizeWords(text) {
  const tokens = text.match(/\S+\s*/g);
  return tokens || [text];
}

function tokenizeLetters(text) {
  return Array.from(text);
}

function buildGenerationSource(settings) {
  return {
    text: settings.text,
    textWidth: settings.textWidth,
    fontName: {
      family: settings.fontFamily,
      style: settings.fontStyle
    },
    fontSize: settings.fontSize,
    lineHeight:
      settings.lineHeightPx === null
        ? { unit: "AUTO" }
        : {
            unit: "PIXELS",
            value: settings.lineHeightPx
          },
    letterSpacing: {
      unit: "PIXELS",
      value: settings.letterSpacingPx
    },
    fills: [makeSolidPaint(settings.textColor)]
  };
}

async function getAvailableFontsForUi() {
  const availableFonts = await figma.listAvailableFontsAsync();
  const fonts = [];

  for (let i = 0; i < availableFonts.length; i += 1) {
    const font = availableFonts[i].fontName ? availableFonts[i].fontName : availableFonts[i];
    fonts.push({
      family: font.family,
      style: font.style
    });
  }

  fonts.sort(function (a, b) {
    if (a.family === b.family) {
      return a.style.localeCompare(b.style);
    }

    return a.family.localeCompare(b.family);
  });

  return fonts;
}

function normalizeSettingsForAvailableFonts(settings, availableFonts) {
  const normalized = mergeSettings(settings);
  const familyToStyles = {};

  for (let i = 0; i < availableFonts.length; i += 1) {
    const font = availableFonts[i];
    if (!familyToStyles[font.family]) {
      familyToStyles[font.family] = [];
    }

    if (familyToStyles[font.family].indexOf(font.style) === -1) {
      familyToStyles[font.family].push(font.style);
    }
  }

  const families = Object.keys(familyToStyles).sort();
  if (families.length === 0) {
    return normalized;
  }

  const nextFamily = familyToStyles[normalized.fontFamily] ? normalized.fontFamily : families[0];
  const styles = familyToStyles[nextFamily].slice().sort();
  const nextStyle = styles.indexOf(normalized.fontStyle) !== -1 ? normalized.fontStyle : styles[0];

  normalized.fontFamily = nextFamily;
  normalized.fontStyle = nextStyle;
  return normalized;
}

async function loadFontForGeneration(fontName) {
  try {
    await figma.loadFontAsync(fontName);
  } catch (error) {
    throw new Error(
      'Could not load "' +
        fontName.family +
        ' / ' +
        fontName.style +
        '". Choose a different font family or style from the dropdowns.'
    );
  }
}

function createStyledTextNode(source, text) {
  const node = figma.createText();
  node.visible = true;
  node.opacity = 1;
  node.fontName = source.fontName;
  node.fontSize = source.fontSize;
  node.characters = text;
  node.textAutoResize = "HEIGHT";
  node.textAlignHorizontal = "LEFT";
  node.textAlignVertical = "TOP";
  node.letterSpacing = cloneObjectIfNeeded(source.letterSpacing);
  node.lineHeight = cloneObjectIfNeeded(source.lineHeight);
  node.fills = clonePaints(source.fills);
  node.resize(source.textWidth, Math.max(1, node.height));
  return node;
}

function measureTextHeights(revealStates, source) {
  const measuringNode = createStyledTextNode(source, " ");
  const heights = [];

  for (let i = 0; i < revealStates.length; i += 1) {
    const text = revealStates[i].text;
    if (!text) {
      heights.push(0);
      continue;
    }

    measuringNode.characters = text;
    measuringNode.resize(source.textWidth, Math.max(1, measuringNode.height));
    heights.push(measuringNode.height);
  }

  return heights;
}

function applyChunkVisibility(textNode, start, end, sourceVisibleFills) {
  const total = textNode.characters.length;
  const visibleFills = clonePaints(sourceVisibleFills);
  const hiddenFills = makeTransparentFills(clonePaints(sourceVisibleFills));
  textNode.setRangeFills(0, total, hiddenFills);
  if (end > start) {
    textNode.setRangeFills(start, end, visibleFills);
  }
}

function getUsableFills(textNode) {
  const styleFills = getLinkedTextStyleFills(textNode);
  if (styleFills) {
    return styleFills;
  }

  const segments = textNode.getStyledTextSegments(["fills"], 0, textNode.characters.length);
  for (let i = 0; i < segments.length; i += 1) {
    const fills = segments[i].fills;
    if (fills && fills !== figma.mixed) {
      return clonePaints(fills);
    }
  }

  if (textNode.fills !== figma.mixed) {
    return clonePaints(textNode.fills);
  }

  throw new Error("Could not determine text fills.");
}

function getLinkedTextStyleFills(textNode) {
  if (!textNode.textStyleId || textNode.textStyleId === figma.mixed) {
    return null;
  }

  const style = figma.getStyleById(textNode.textStyleId);
  if (!style) {
    return null;
  }

  if ("paints" in style && Array.isArray(style.paints) && style.paints.length > 0) {
    return clonePaints(style.paints);
  }

  if ("fills" in style && Array.isArray(style.fills) && style.fills.length > 0) {
    return clonePaints(style.fills);
  }

  return null;
}

function getOrderedVariants(componentSet, propertyName) {
  const variants = componentSet.children.slice();
  return variants.sort(function (a, b) {
    const aValue = (a.variantProperties && a.variantProperties[propertyName]) || a.name;
    const bValue = (b.variantProperties && b.variantProperties[propertyName]) || b.name;
    return compareVariantValues(aValue, bValue);
  });
}

function compareVariantValues(a, b) {
  const parsedA = parseVariantValue(a);
  const parsedB = parseVariantValue(b);

  if (parsedA.rank !== parsedB.rank) {
    return parsedA.rank - parsedB.rank;
  }

  if (parsedA.number !== null && parsedB.number !== null) {
    return parsedA.number - parsedB.number;
  }

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base"
  });
}

function parseVariantValue(value) {
  const raw = String(value).trim();

  if (/^empty$/i.test(raw)) {
    return { rank: 0, number: -1 };
  }

  if (!Number.isNaN(Number(raw))) {
    return { rank: 1, number: Number(raw) };
  }

  const match = raw.match(/-?\d+(\.\d+)?/);
  if (match) {
    return { rank: 2, number: Number(match[0]) };
  }

  return { rank: 3, number: null };
}

function getStateValue(index) {
  return String(index + 1);
}

function clonePaints(paints) {
  return paints.map(function (paint) {
    const clone = copyObject(paint);
    if ("color" in paint && paint.color) {
      clone.color = copyObject(paint.color);
    }
    if ("gradientStops" in paint && paint.gradientStops) {
      clone.gradientStops = paint.gradientStops.map(function (stop) {
        return {
          position: stop.position,
          color: copyObject(stop.color)
        };
      });
    }
    if ("imageTransform" in paint && paint.imageTransform) {
      clone.imageTransform = paint.imageTransform.map(function (row) {
        return row.slice();
      });
    }
    if ("gradientTransform" in paint && paint.gradientTransform) {
      clone.gradientTransform = paint.gradientTransform.map(function (row) {
        return row.slice();
      });
    }
    return clone;
  });
}

function makeTransparentFills(fills) {
  return fills.map(function (paint) {
    const nextPaint = copyObject(paint);
    nextPaint.opacity = 0;

    return nextPaint;
  });
}

function copyObject(source) {
  const target = {};
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }
  return target;
}

function makeSolidPaint(hex) {
  const rgba = hexToRgba(hex);
  return {
    type: "SOLID",
    color: {
      r: rgba.r / 255,
      g: rgba.g / 255,
      b: rgba.b / 255
    },
    opacity: rgba.a
  };
}

function postSelectionSourceToUi() {
  figma.ui.postMessage({
    type: "selection-source",
    source: getSelectionSourceSummary()
  });
}

async function getSelectedTextSource() {
  const selection = figma.currentPage.selection[0];
  if (!selection) {
    throw new Error("Select a text layer or a frame containing one text layer.");
  }

  const textNode = findPrimaryTextNode(selection);
  await loadFontsForTextNode(textNode);
  const styleSnapshot = getTextStyleSnapshot(textNode);

  return {
    selectionName: selection.name,
    text: textNode.characters,
    textWidth: round2(textNode.width),
    fontName: styleSnapshot.fontName,
    fontSize: styleSnapshot.fontSize,
    lineHeight: styleSnapshot.lineHeight,
    letterSpacing: styleSnapshot.letterSpacing,
    fills: styleSnapshot.fills,
    textStyleId: textNode.textStyleId !== figma.mixed ? textNode.textStyleId || "" : "",
    opacity: typeof textNode.opacity === "number" ? textNode.opacity : 1
  };
}

async function getPopulateSettingsFromSelection() {
  const source = await getSelectedTextSource();

  return {
    text: source.text,
    textWidth: source.textWidth,
    fontFamily: source.fontName.family,
    fontStyle: source.fontName.style,
    fontSize: source.fontSize,
    lineHeightPx: getLineHeightPx(source.lineHeight, source.fontSize),
    letterSpacingPx: getLetterSpacingPx(source.letterSpacing, source.fontSize),
    textColor: fillsToEditableColor(source.fills, source.opacity)
  };
}

function getSelectionSourceSummary() {
  try {
    const selection = figma.currentPage.selection[0];
    if (!selection) {
      return {
        isValid: false,
        message: "Select a text layer or a frame containing a text layer."
      };
    }

    const textNode = findPrimaryTextNode(selection);
    const styleDescription = getStyleDescription(textNode);
    return {
      isValid: true,
      selectionName: selection.name,
      textNodeName: textNode.name,
      textWidth: round2(textNode.width),
      styleDescription: styleDescription,
      previewText: truncateText(textNode.characters, 120)
    };
  } catch (error) {
    return {
      isValid: false,
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

function findPrimaryTextNode(node) {
  const textNodes = [];
  collectTextNodes(node, textNodes);

  if (textNodes.length === 0) {
    throw new Error('The current selection does not contain a text layer.');
  }

  textNodes.sort(function (a, b) {
    const charDiff = b.characters.length - a.characters.length;
    if (charDiff !== 0) {
      return charDiff;
    }

    return b.width * b.height - a.width * a.height;
  });

  return textNodes[0];
}

function collectTextNodes(node, textNodes) {
  if (node.type === "TEXT") {
    textNodes.push(node);
    return;
  }

  if (!("children" in node)) {
    return;
  }

  for (let i = 0; i < node.children.length; i += 1) {
    collectTextNodes(node.children[i], textNodes);
  }
}

async function loadFontsForTextNode(textNode) {
  const length = textNode.characters.length;
  if (length === 0) {
    return;
  }

  const fonts = textNode.getRangeAllFontNames(0, length);
  const seen = {};

  for (let i = 0; i < fonts.length; i += 1) {
    const key = fonts[i].family + "::" + fonts[i].style;
    if (seen[key]) {
      continue;
    }

    seen[key] = true;
    await figma.loadFontAsync(fonts[i]);
  }
}

function getResolvedFontName(textNode) {
  if (textNode.fontName !== figma.mixed) {
    return textNode.fontName;
  }

  return getFirstTextStyleSegment(textNode).fontName;
}

function getTextStyleSnapshot(textNode) {
  const segment = getFirstTextStyleSegment(textNode);

  return {
    fontName: textNode.fontName !== figma.mixed ? textNode.fontName : segment.fontName,
    fontSize: textNode.fontSize !== figma.mixed ? textNode.fontSize : segment.fontSize,
    lineHeight: textNode.lineHeight !== figma.mixed ? cloneObjectIfNeeded(textNode.lineHeight) : cloneObjectIfNeeded(segment.lineHeight),
    letterSpacing:
      textNode.letterSpacing !== figma.mixed
        ? cloneObjectIfNeeded(textNode.letterSpacing)
        : cloneObjectIfNeeded(segment.letterSpacing),
    fills: getUsableFills(textNode)
  };
}

function getFirstTextStyleSegment(textNode) {
  const length = Math.max(1, textNode.characters.length);
  const segments = textNode.getStyledTextSegments(
    ["fontName", "fontSize", "lineHeight", "letterSpacing"],
    0,
    length
  );

  if (!segments || segments.length === 0) {
    throw new Error("Could not resolve text styles from the selected text layer.");
  }

  return segments[0];
}

function cloneObjectIfNeeded(value) {
  if (value == null || typeof value !== "object") {
    return value;
  }

  return copyObject(value);
}

function getStyleDescription(textNode) {
  if (textNode.textStyleId && textNode.textStyleId !== figma.mixed) {
    const style = figma.getStyleById(textNode.textStyleId);
    if (style) {
      return "Text style: " + style.name;
    }
  }

  const fontName = getResolvedFontName(textNode);
  return "Unlinked: " + fontName.family + " / " + fontName.style;
}

function truncateText(text, maxLength) {
  const normalized = String(text).replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return normalized.slice(0, maxLength - 1) + "\u2026";
}

function getLineHeightPx(lineHeight, fontSize) {
  if (!lineHeight || lineHeight.unit === "AUTO") {
    return null;
  }

  if (lineHeight.unit === "PIXELS") {
    return lineHeight.value;
  }

  if (lineHeight.unit === "PERCENT") {
    return round2((fontSize * lineHeight.value) / 100);
  }

  return null;
}

function getLetterSpacingPx(letterSpacing, fontSize) {
  if (!letterSpacing) {
    return 0;
  }

  if (letterSpacing.unit === "PIXELS") {
    return letterSpacing.value;
  }

  if (letterSpacing.unit === "PERCENT") {
    return round2((fontSize * letterSpacing.value) / 100);
  }

  return 0;
}

function fillsToEditableColor(fills, nodeOpacity) {
  if (!fills || fills.length === 0) {
    return DEFAULT_SETTINGS.textColor;
  }

  for (let i = 0; i < fills.length; i += 1) {
    if (fills[i].type === "SOLID" && fills[i].color) {
      return rgbaToHex(fills[i].color, getEffectivePaintOpacity(fills[i], nodeOpacity));
    }
  }

  return DEFAULT_SETTINGS.textColor;
}

function rgbToHex(color) {
  const r = toHexChannel(color.r);
  const g = toHexChannel(color.g);
  const b = toHexChannel(color.b);
  return "#" + r + g + b;
}

function rgbaToHex(color, opacity) {
  const base = rgbToHex(color);
  const normalizedOpacity = clamp01(opacity);

  if (Math.abs(normalizedOpacity - 1) < 0.0001) {
    return base;
  }

  return base + toHexByte(normalizedOpacity);
}

function toHexChannel(value) {
  const channel = Math.max(0, Math.min(255, Math.round(Number(value) * 255)));
  const hex = channel.toString(16).toUpperCase();
  return hex.length === 1 ? "0" + hex : hex;
}

function toHexByte(value) {
  const channel = Math.max(0, Math.min(255, Math.round(Number(value) * 255)));
  const hex = channel.toString(16).toUpperCase();
  return hex.length === 1 ? "0" + hex : hex;
}

function hexToRgba(hex) {
  const normalized = String(hex).trim().replace(/^#/, "");
  const expanded =
    normalized.length === 3
      ? normalized.charAt(0) +
        normalized.charAt(0) +
        normalized.charAt(1) +
        normalized.charAt(1) +
        normalized.charAt(2) +
        normalized.charAt(2)
      : normalized.length === 4
        ? normalized.charAt(0) +
          normalized.charAt(0) +
          normalized.charAt(1) +
          normalized.charAt(1) +
          normalized.charAt(2) +
          normalized.charAt(2) +
          normalized.charAt(3) +
          normalized.charAt(3)
      : normalized;

  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(expanded)) {
    throw new Error("Text color must be a 3, 4, 6, or 8-digit hex value.");
  }

  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
    a: expanded.length === 8 ? parseInt(expanded.slice(6, 8), 16) / 255 : 1
  };
}

function getEffectivePaintOpacity(paint, nodeOpacity) {
  const paintOpacity = typeof paint.opacity === "number" ? paint.opacity : 1;
  const layerOpacity = typeof nodeOpacity === "number" ? nodeOpacity : 1;
  return clamp01(paintOpacity * layerOpacity);
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value)));
}

function makeLayerBlurEffect(radius) {
  return [
    {
      type: "LAYER_BLUR",
      radius: radius,
      visible: true
    }
  ];
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function msToSeconds(value) {
  return Number(value) / 1000;
}

function getTransitionDurationMs(unitCount, speedMs) {
  return Math.max(1, Number(unitCount) * Number(speedMs));
}

function buildGeneratedSetName(settings, revealStates) {
  const totalMs = getTotalAnimationMs(revealStates, settings.speedMs);
  const unitLabel = settings.streamMode === "letters" ? "Letters" : "Words";
  const mainName =
    "[" +
    String(totalMs) +
    "ms] - " +
    String(settings.streamCount) +
    unitLabel +
    " - " +
    String(settings.speedMs) +
    "ms";

  if (!settings.setName) {
    return mainName;
  }

  return String(settings.setName).trim() + " - " + mainName;
}

function getTotalAnimationMs(revealStates, speedMs) {
  let totalMs = 0;

  for (let i = 1; i < revealStates.length; i += 1) {
    totalMs += 1;
    totalMs += getTransitionDurationMs(revealStates[i].unitCount, speedMs);
  }

  return totalMs;
}
