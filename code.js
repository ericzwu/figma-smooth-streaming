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

    textarea,
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

    textarea {
      min-height: 120px;
      resize: vertical;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    button {
      background: #111;
      color: #fff;
      border: 0;
      cursor: pointer;
    }

    p {
      margin: 0;
      color: #666;
    }
  </style>
</head>
<body>
  <form id="form">
    <label>Text
      <textarea name="text">I am currently extracting the key financial statement data for Nvidia from the 10-K document to build a reliable and accurate 3-statement model.</textarea>
    </label>

    <div class="grid">
      <label>Text width
        <input name="textWidth" type="number" min="1" value="180" />
      </label>
      <label>Viewport height
        <input name="viewportHeight" type="number" min="1" value="120" />
      </label>
    </div>

    <div class="grid">
      <label>Font family
        <input name="fontFamily" type="text" value="Geist" />
      </label>
      <label>Font style
        <input name="fontStyle" type="text" value="Regular" />
      </label>
    </div>

    <div class="grid">
      <label>Font size
        <input name="fontSize" type="number" min="1" step="0.1" value="10" />
      </label>
      <label>Line height px
        <input name="lineHeightPx" type="number" min="0" step="0.1" placeholder="Auto" />
      </label>
    </div>

    <div class="grid">
      <label>Letter spacing px
        <input name="letterSpacingPx" type="number" step="0.1" value="0.2" />
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
        <input name="streamCount" type="number" min="1" value="2" />
      </label>
      <label>Speed ms per unit
        <input name="speedMs" type="number" min="1" value="80" />
      </label>
    </div>

    <div class="grid">
      <label>Text color
        <input name="textColor" type="text" value="#5E5E5E" />
      </label>
      <label>Component set name
        <input name="setName" type="text" value="Smooth streaming scroll" />
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
    <p>The plugin builds a new text component set and places a starter instance on the current page.</p>
  </form>

  <script>
    document.getElementById("form").addEventListener("submit", function (event) {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
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
  </script>
</body>
</html>
`;

figma.showUI(ui, { width: 380, height: 760, title: "Smooth Stream Scroll" });

figma.ui.onmessage = async function (msg) {
  if (!msg || msg.type !== "generate") {
    return;
  }

  try {
    await generateSmoothTextSet(msg.settings);
  } catch (error) {
    figma.notify(error instanceof Error ? error.message : String(error), {
      error: true
    });
  }
};

async function generateSmoothTextSet(settings) {
  validateSettings(settings);

  const fontName = {
    family: settings.fontFamily,
    style: settings.fontStyle
  };

  await figma.loadFontAsync(fontName);

  const revealStates = buildRevealStates(settings.text, settings.streamMode, settings.streamCount);
  const heights = [];

  for (let i = 0; i < revealStates.length; i += 1) {
    heights.push(measureTextHeight(revealStates[i].text, settings, fontName));
  }

  const finalTextNode = createStyledTextNode(settings.text, settings, fontName);

  const parent = figma.currentPage;
  const wrappers = [];
  const startPoint = {
    x: round2(figma.viewport.center.x - settings.textWidth / 2),
    y: round2(figma.viewport.center.y - settings.viewportHeight / 2)
  };

  for (let i = 0; i < revealStates.length; i += 1) {
    const wrapper = figma.createComponent();
    wrapper.name = "State=" + getStateValue(i);
    wrapper.clipsContent = true;
    wrapper.fills = [];
    wrapper.strokes = [];
    wrapper.resizeWithoutConstraints(settings.textWidth, settings.viewportHeight);
    wrapper.x = startPoint.x;
    wrapper.y = startPoint.y + i * (settings.viewportHeight + 24);

    const contentRoot = figma.createFrame();
    contentRoot.name = "Streaming content";
    contentRoot.clipsContent = false;
    contentRoot.fills = [];
    contentRoot.strokes = [];
    contentRoot.resizeWithoutConstraints(settings.textWidth, finalTextNode.height);
    contentRoot.x = 0;
    contentRoot.y = round2(settings.viewportHeight - heights[i]);

    const stateTextNode = finalTextNode.clone();
    stateTextNode.x = 0;
    stateTextNode.y = 0;
    applyRevealState(stateTextNode, revealStates[i].visibleCount);

    contentRoot.appendChild(stateTextNode);
    wrapper.appendChild(contentRoot);
    parent.appendChild(wrapper);
    wrappers.push(wrapper);
  }

  const smoothSet = figma.combineAsVariants(wrappers, parent);
  smoothSet.name = settings.setName;
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

  if (!settings.fontFamily || !settings.fontStyle) {
    throw new Error("Enter a font family and style.");
  }

  if (!(settings.textWidth > 0) || !(settings.viewportHeight > 0)) {
    throw new Error("Text width and viewport height must be greater than 0.");
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
}

function buildRevealStates(text, streamMode, streamCount) {
  const units = streamMode === "letters" ? tokenizeLetters(text) : tokenizeWords(text);
  const revealStates = [];
  let current = "";

  for (let i = 0; i < units.length; i += streamCount) {
    const slice = units.slice(i, i + streamCount);
    const appendedText = slice.join("");
    current += appendedText;
    revealStates.push({
      text: current,
      visibleCount: current.length,
      unitCount: slice.length
    });
  }

  if (revealStates.length === 0) {
    revealStates.push({
      text: text,
      visibleCount: text.length,
      unitCount: 1
    });
  } else if (revealStates[revealStates.length - 1].text !== text) {
    revealStates.push({
      text: text,
      visibleCount: text.length,
      unitCount: units.length % streamCount || streamCount
    });
  }

  return revealStates;
}

function tokenizeWords(text) {
  const tokens = text.match(/\S+\s*/g);
  return tokens || [text];
}

function tokenizeLetters(text) {
  return Array.from(text);
}

function createStyledTextNode(text, settings, fontName) {
  const node = figma.createText();
  node.fontName = fontName;
  node.fontSize = settings.fontSize;
  node.characters = text;
  node.textAutoResize = "HEIGHT";
  node.textAlignHorizontal = "LEFT";
  node.textAlignVertical = "TOP";
  node.fills = [makeSolidPaint(settings.textColor)];
  node.letterSpacing = {
    unit: "PIXELS",
    value: settings.letterSpacingPx
  };
  node.lineHeight =
    settings.lineHeightPx === null
      ? { unit: "AUTO" }
      : {
          unit: "PIXELS",
          value: settings.lineHeightPx
        };
  node.resize(settings.textWidth, Math.max(1, node.height));
  return node;
}

function measureTextHeight(text, settings, fontName) {
  if (!text) {
    return 0;
  }

  const tempNode = createStyledTextNode(text, settings, fontName);
  const height = tempNode.height;
  return height;
}

function applyRevealState(textNode, visibleCount) {
  const total = textNode.characters.length;
  if (visibleCount >= total) {
    return;
  }

  const hiddenFills = makeTransparentFills(getUsableFills(textNode));
  textNode.setRangeFills(visibleCount, total, hiddenFills);
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

function makeSolidPaint(hex) {
  const rgb = hexToRgb(hex);
  return {
    type: "SOLID",
    color: {
      r: rgb.r / 255,
      g: rgb.g / 255,
      b: rgb.b / 255
    },
    opacity: 1
  };
}

function hexToRgb(hex) {
  const normalized = String(hex).trim().replace(/^#/, "");
  const expanded =
    normalized.length === 3
      ? normalized.charAt(0) +
        normalized.charAt(0) +
        normalized.charAt(1) +
        normalized.charAt(1) +
        normalized.charAt(2) +
        normalized.charAt(2)
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    throw new Error("Text color must be a 3-digit or 6-digit hex value.");
  }

  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16)
  };
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

function round2(value) {
  return Math.round(value * 100) / 100;
}

function msToSeconds(value) {
  return Number(value) / 1000;
}

function getTransitionDurationMs(unitCount, speedMs) {
  return Math.max(1, Number(unitCount) * Number(speedMs));
}
