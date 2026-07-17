export function defineEmbedElement(tagName, observedAttributes, styles, renderFn) {
  if (customElements.get(tagName)) return; // idempotent: embed scripts get included twice more often than you'd think

  customElements.define(
    tagName,
    class extends HTMLElement {
      static observedAttributes = observedAttributes;
      #mount = null;

      connectedCallback() {
        if (!this.#mount) {
          const shadow = this.attachShadow({ mode: "open" });
          const style = document.createElement("style");
          style.textContent = styles; // scoped to this shadow root only
          this.#mount = document.createElement("div");
          shadow.append(style, this.#mount);
        }
        this.#render();
      }

      attributeChangedCallback() {
        this.#render();
      }

      disconnectedCallback() {
        this.#mount?.replaceChildren();
      }

      #render() {
        if (!this.#mount) return;
        const attrs = {};
        for (const name of observedAttributes) {
          const value = this.getAttribute(name);
          if (value != null) attrs[name] = value;
        }
        this.#mount.replaceChildren(renderFn(attrs));
      }
    },
  );
}
