# Week 5 - Dark-Theme Readability

## Dark text on dark cards

**Status: Recorded and fixed on 2026-11-26.**

Some child elements retained the light-theme foreground (`var(--ink)`) after their card background changed to a dark surface. For example, chat author names used:

```css
.chat-author {
  color: var(--ink);
}
```

The dark-theme override makes authors and player names light, while waiting-room labels use the muted theme color:

```css
.waiting-details span {
  color: var(--dark-muted);
}

.chat-author,
.waiting-details strong,
.game-player-item,
.player-name {
  color: #f5f3fa;
}
```

Both regular and spoiler-hidden chat rows use `.chat-author`, so the same override covers both. Future dark cards should be checked for readable labels, values, names, and message text.
