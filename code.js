const STORAGE_KEY = "smooth-stream-scroll:last-settings";

const DEFAULT_SETTINGS = {
  viewportHeight: 120,
  streamMode: "words",
  streamCount: 2,
  speedMs: 80,
  setName: "",
  easing: "LINEAR"
};

const ui = String.raw`
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {
      font: 12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      margin: 16px;
      color: #222;
    }

    form {
      display: grid;
      gap: 12px;
    }

    label {
      display: grid;
      gap: 6px;
    }

    input,
    select,
    button {
      font: inherit;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid #d0d0d0;
      background: #fff;
      box-sizing: border-box;
      width: 100%;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .source-card {
      padding: 12px;
      border: 1px solid #d0d0d0;
      border-radius: 10px;
      background: #fafafa;
      display: grid;
      gap: 6px;
    }

    .source-card[data-state="missing"] {
      border-color: #f0c2c2;
      background: #fff6f6;
    }

    .source-row {
      color: #444;
      word-break: break-word;
    }

    .source-label {
      color: #666;
      margin-right: 6px;
    }

    button {
      background: #111;
      color: #fff;
      border: 0;
      cursor: pointer;
    }

    button[disabled] {
      cursor: wait;
      opacity: 0.7;
    }

    .status {
      min-height: 18px;
      color: #666;
    }

    .status[data-state="loading"] {
      color: #222;
    }

    .status[data-state="error"] {
      color: #b42318;
    }

    .spinner {
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-right: 8px;
      border: 2px solid rgba(0, 0, 0, 0.18);
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
      color: #666;
    }
  </style>
</head>
<body>
  <form id="form">
    <label>Selected source
      <div id="sourceInfo" class="source-card" data-state="missing">Select a text layer or a frame containing a text layer.</div>
    </label>

    <button id="refreshSource" type="button">Use current selection</button>

    <div class="grid">
      <label>Max viewport height
        <input name="viewportHeight" type="number" min="1" />
      </label>
      <label>Stream
        <select name="streamMode">
          <option value="words">Words</option>
          <option value="letters">Letters</option>
        </select>
      </label>
    </div>

    <div class="grid">
      <label>Every
        <input name="streamCount" type="number" min="1" />
      </label>
      <label>Speed ms per unit
        <input name="speedMs" type="number" min="1" />
      </label>
    </div>

    <div class="grid">
      <label>Name prefix
        <input name="setName" type="text" placeholder="Optional" />
      </label>
    </div>

    <label>Easing
      <select name="easing">
        <option value="LINEAR">Linear</option>
        <option value="QUICK">Quick</option>
        <option value="GENTLE">Gentle</option>
      </select>
    </label>

    <button type="submit">Generate component set</button>
    <div id="status" class="status" data-state="idle"></div>
    <p>The plugin builds a new text component set, hugs the text until it reaches the max height, and places a starter instance on the current page.</p>
  </form>

  <script>
    var hasValidSource = false;

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

      if (pluginMessage.type === "selection-source") {
        hasValidSource = Boolean(pluginMessage.source && pluginMessage.source.isValid);
        renderSource(pluginMessage.source || null);
        updateGenerateEnabled();
        return;
      }

      if (pluginMessage.type === "generate-error") {
        setLoading(false, pluginMessage.message || "Generation failed.");
      }
    };

    document.getElementById("refreshSource").addEventListener("click", function () {
      parent.postMessage(
        {
          pluginMessage: {
            type: "refresh-source"
          }
        },
        "*"
      );
    });

    document.getElementById("form").addEventListener("submit", function (event) {
      event.preventDefault();
      if (!hasValidSource) {
        setLoading(false, "Select a text layer or a frame with text first.");
        return;
      }
      const form = new FormData(event.currentTarget);
      setLoading(true, "Generating component set...");
      parent.postMessage(
        {
          pluginMessage: {
            type: "generate",
            settings: {
              viewportHeight: Number(form.get("viewportHeight")),
              streamMode: String(form.get("streamMode") || "words"),
              streamCount: Number(form.get("streamCount")),
              speedMs: Number(form.get("speedMs")),
              setName: String(form.get("setName") || "").trim(),
              easing: String(form.get("easing") || "LINEAR")
            }
          }
        },
        "*"
      );
    });

    function hydrateForm(settings) {
      const form = document.getElementById("form");
      setValue(form, "viewportHeight", settings.viewportHeight);
      setValue(form, "streamMode", settings.streamMode);
      setValue(form, "streamCount", settings.streamCount);
      setValue(form, "speedMs", settings.speedMs);
      setValue(form, "setName", settings.setName);
      setValue(form, "easing", settings.easing);
    }

    function setValue(form, name, value) {
      const field = form.elements.namedItem(name);
      if (!field) {
        return;
      }

      field.value = value == null ? "" : String(value);
    }

    function setLoading(isLoading, message) {
      const form = document.getElementById("form");
      const refreshSource = document.getElementById("refreshSource");
      const status = document.getElementById("status");
      const fields = form.querySelectorAll("input, select, button");

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
        submitButton.disabled = !hasValidSource;
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

  const savedSettings = await loadSavedSettings();
  postSelectionSourceToUi();
  figma.on("selectionchange", postSelectionSourceToUi);

  figma.ui.onmessage = async function (msg) {
    if (!msg) {
      return;
    }

    if (msg.type === "ui-ready") {
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
  const source = await getSelectedTextSource();

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
  if (!(settings.viewportHeight > 0)) {
    throw new Error("Max viewport height must be greater than 0.");
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
  if (textNode.fills !== figma.mixed) {
    return clonePaints(textNode.fills);
  }

  const segments = textNode.getStyledTextSegments(["fills"], 0, textNode.characters.length);
  for (let i = 0; i < segments.length; i += 1) {
    const fills = segments[i].fills;
    if (fills && fills !== figma.mixed) {
      return clonePaints(fills);
    }
  }

  throw new Error("Could not determine text fills.");
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
    textStyleId: textNode.textStyleId !== figma.mixed ? textNode.textStyleId || "" : ""
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
