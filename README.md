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

**03 — Attributes are the API, and the registry is global.** The entire public
surface is a tag and its observed attributes. `setAttribute` →
`attributeChangedCallback` → re-render. No message bus, no handshake.

Then the plate turns on itself. `customElements.define` claims a name in a
**global registry** — the one namespace a custom element cannot scope away. The
page makes a real second registration under the same tag with a *different*
renderer, and the `customElements.get` guard swallows it without a word. That
silence is correct when it's your own script loading twice, and wrong when it's
another vendor who got there first: their element renders under your tag.
[Scoped registries](https://developer.chrome.com/blog/scoped-registries) close
the hole — Chrome and Edge 146, partially Safari 26, not Firefox. The fix exists
and you can't rely on it yet.

## The caveats that matter

**It is not a security boundary.** A shadow root is an **encapsulation**
boundary. `mode: "open"` is reachable via `element.shadowRoot`, and `closed`
only obscures the reference. It isolates style and DOM scope, not origin.

And the iframe isn't only protecting a host from code that *means* harm — it
protects the host from code that's merely *wrong*. A bug behind an origin
boundary stays in the frame; the same bug in the host's document has their DOM,
their cart, and their customer's session. Pasting a vendor's `<script>` means
accepting their CDN, their dependencies, and every version they push after
today. When a security team mandates iframes for third-party embeds, that's
usually why — not that they think the vendor is hostile, but that they know the
vendor can be compromised.

**Proximity cuts both ways.** One layout flow means the element can reflow the
host's page; one accessibility tree means it can pollute theirs; one event loop
means its slow render is their slow render. The iframe in plate 02 carries
`loading="lazy"` — deferred loading as one attribute, where a same-document
embed earns it with an `IntersectionObserver` it writes itself. Being in the
page is the whole benefit and the whole risk.

So: if you must execute **untrusted third-party code**, or the host's security
review won't accept your supply chain inside their document, the iframe's
`sandbox` and origin isolation remain the correct, irreplaceable tool. Use one.

If you're rendering your own trusted UI over your own sanitized data into a page
whose owner agreed to that, as the overwhelming majority of embeds do, the
iframe is charging you for a guarantee you don't need with costs you do.
