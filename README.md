# Smooth Stream Scroll

Figma plugin for generating streaming-text component sets that prototype more like a real UI.

## Inspiration

This plugin was inspired in part by Cole Derochie’s Figma community plugin, [`streaming`](https://www.figma.com/community/plugin/1606576021413823224).

That plugin has a convenient workflow for generating streaming text states, and it helped validate the usefulness of this kind of prototyping tool.

The `streaming` plugin’s approach relies on bottom justification, which is enough for most use cases and is computationally simpler than this plugin’s approach, but for the cases where a polished visual is required, the lack of line change animation is a real visual disconnect. More on that below.

## What Problem This Solves

A common Figma workaround for streaming text is:

- put the text in a fixed-height parent
- bottom-align the content
- achieve auto-scrolling as lines automatically move up due to the bottom justification
- Clip the text contents in a constrained frame if needed.

That can achieve clipping, but it does not behave like real front-end scrolling. The text appears to be pushed around by layout rules instead of moving as a stable rendered block.

This plugin uses a different approach.

## Core Design Idea

The plugin:

- renders the full final text layout once
- keeps that layout stable across all generated states
- reveals text progressively by chunk
- clips the text inside a viewport
- moves the full text block upward only when the wrapped text height actually increases

This produces a prototype that feels closer to real scrolling content.

## How Smooth Scrolling Is Achieved

The plugin does **not** rely on bottom justification or animated bottom padding.

It generates each variant like this:

1. Build the full final wrapped text block using the chosen text, width, and typography.
2. Split the text into streaming chunks:
   - by words
   - or by letters
3. Create reveal states from those chunks.
4. Measure the wrapped text height for every reveal state.
5. Create a clipped viewport for each variant.
6. Position the full text block inside that viewport using:
   - `y = containerHeight - measuredTextHeight`
7. Only move that text block upward when a newly revealed chunk causes the text to wrap onto a new line.

The result is:

- no vertical motion while text fills the current line
- a scroll jump only when a new line opens
- smart animate interpolates that jump between variants

## Why This Works Better In Figma

Figma Smart Animate works best when layers persist between states and only a few properties change.

This plugin preserves that:

- the text layout is structurally consistent
- the viewport is clipped
- the text block keeps the same width and typography
- the animated change is mostly:
  - chunk opacity
  - chunk blur
  - text block Y offset

That is much more reliable than asking Figma auto-layout to simulate scrolling with bottom alignment rules.

## Reveal Model

Each generated state contains chunk layers derived from the final text:

- already revealed chunks are visible
- the incoming chunk starts hidden and blurred
- later chunks remain hidden

On change-to transitions:

- the next chunk fades in
- the blur is removed
- if the measured height increased, the whole text block moves upward

This gives the effect of streamed text arriving into a clipped scrolling viewport.

## Viewport Behavior

The container is not fixed to max height immediately.

Instead:

- the component hugs the text while content is short
- height grows with the text
- once it reaches the configured max viewport height, it stops growing
- after that point, additional lines are revealed through scrolling inside the clipped viewport

This matches typical chat / assistant streaming behavior more closely than starting with a permanently tall empty viewport.

## Timing Model

The plugin supports:

- streaming by words or letters
- `Every N` units per step
- `Speed ms per unit`

Per transition duration is:

- `units in step * speedMs`

The generated component name (contention borrowed from "Streaming") includes the computed total duration:

- `[totalMs] - 2Words - 80ms`

This makes it easier to line up surrounding frame-to-frame prototype timing.

## Input Model

The plugin can populate from the current Figma selection, but generation is still form-driven.

That means:

- select a text layer or frame
- populate from selection
- tweak text, width, typography, color, and playback settings
- generate a new component set

This keeps the workflow editable and avoids tightly coupling generation to one source node.

## Key Implementation Details

- Uses Figma available fonts to populate font family and style dropdowns.
- Loads the selected generation font before creating text nodes.
- Uses measured wrapped text heights instead of estimating scroll positions.
- Uses a clipped viewport plus Y-positioned content root instead of bottom alignment tricks.
- Stores last-used settings in `figma.clientStorage`.
- Preserves semi-transparent text color input by supporting hex alpha.

## Current Tradeoffs

- The generated set is built for the width and viewport settings used at generation time.
- If width changes later, wrapping changes, so scroll behavior may no longer line up.
- Figma prototype timing can still have some practical variance compared with external frame chaining.

## Files

- [manifest.json](c:/Users/Eric/figma-smooth-scrolling-text/manifest.json)
- [code.js](c:/Users/Eric/figma-smooth-scrolling-text/code.js)
