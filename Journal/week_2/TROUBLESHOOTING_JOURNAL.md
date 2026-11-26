# Week 2 - Canvas Edge Cases

## Canvas sizes differ between players

**Status: Hypothetical diagnostic; normalized coordinates are used in the current drawing flow.**

Sending raw screen pixels can place a stroke in the wrong position when players use different canvas sizes. Convert pointer positions to a `0..1` range using the visible canvas bounds:

```js
const bounds = canvas.getBoundingClientRect();
const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
```

The server expects normalized points and clamps them before broadcasting. If strokes appear at an edge, check that the client sends normalized coordinates rather than canvas pixels.

This is a preventive edge-case check. The current flow uses normalized coordinates, but if a future change sends raw pixels, the server will clamp them to `0..1` and broadcast them, which may place strokes at the wrong position on other clients.
