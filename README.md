# iframe-free embed blueprint

A minimal, dependency-free distillation of the architecture described in
_Encapsulation Without Exile: Why Your Embed Doesn't Need an Iframe_.
No framework, no build step, no dependencies — four files.

**▶ [Try it live](https://iframe-free-embed.vercel.app)** — flip the host page hostile and watch the boundary hold.

## The premise

Every third-party embed signs the same contract: styles that don't collide,
globals that don't clash, and a host it doesn't break. The industry's reflex is
to satisfy that contract with an `<iframe>` — a second document, a sealed room,
your widget exiled from the page it's meant to belong to.

A Custom Element backed by Shadow DOM satisfies the same contract by **scoping**
instead of banishing. This repo is the smallest honest proof of that.

## The files

| File               | What it is                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `define-element.js` | The factory: custom-element lifecycle + shadow root + scoped styles + attribute-driven re-render, with idempotent registration.    |
| `review-card.js`   | One embed built on it, exposing a CSS-variable theming contract (`--embed-bg`, `--embed-text`, `--embed-accent`, `--embed-radius`). |
| `index.html`       | A deliberately hostile host page that fails to break it.                                                                            |
| `frame-card.html`  | The same element, sealed in an iframe — the control group.                                                                          |

## Run it

```sh
python3 -m http.server
# open http://localhost:8000
```

(A server is needed because browsers block ES module imports over `file://`.)

## What the three plates prove

**01 — The boundary holds.** Two cards, same render function, same class names.
One renders into the page, one into a shadow root. A switch arms the host's
global stylesheet — `.card { display: none !important }` and friends. It hits
exactly one of them. Not because the widget out-specified it, but because the
host's selectors never match inside a shadow root at all. No specificity war.

**02 — Theme crosses on purpose.** The honest comparison: the same
`<review-card>` element, registered by the same `review-card.js`, rendered twice
— once in this document and once inside a real `<iframe>`. Turn the knobs. The
first follows; the second can't, because CSS custom properties don't cross
documents. Encapsulation is the default; theming is opt-in. That's the exact
inverse of the iframe, where isolation is total and theming is impossible.

Note the iframe's hardcoded `height="176"`. It has no intrinsic relationship to
its content — a production embed measures its own scroll height, `postMessage`s
it out, and resizes from the host on every reflow. The card beside it is just an
element in normal flow.

**03 — Attributes are the API.** The entire public surface is a tag and its
observed attributes. `setAttribute` → `attributeChangedCallback` → re-render. No
message bus, no handshake. Plus a live idempotency check: the page registers the
same tag name twice on load, and the guard makes the second call a no-op instead
of a `NotSupportedError` that would take the whole bundle down.

## The caveat that matters

A shadow root is an **encapsulation** boundary, not a **security** boundary.
`mode: "open"` is reachable via `element.shadowRoot`, and `closed` only obscures
the reference. It isolates style and DOM scope, not origin.

If you must execute **untrusted third-party code** — a user-authored plugin, an
ad from a network you don't control — the iframe's `sandbox` and origin
isolation remain the correct, irreplaceable tool. Use one.

If you're rendering your own trusted UI over your own sanitized data, as the
overwhelming majority of embeds do, the iframe is charging you for a guarantee
you don't need with costs you do.
