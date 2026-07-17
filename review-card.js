import { defineEmbedElement } from "./define-element.js";

// Theming contract: colors are RGB channel triplets so any shade can be
// derived with an alpha. Hosts theme by setting --embed-* variables; the
// fallbacks below are the library defaults.
export const styles = `
  .card {
    box-sizing: border-box;
    background: rgb(var(--embed-bg, 255, 255, 255));
    color: rgb(var(--embed-text, 15, 23, 42));
    border: 1px solid rgba(var(--embed-text, 15, 23, 42), 0.15);
    border-radius: var(--embed-radius, 12px);
    font: 15px/1.5 system-ui, sans-serif;
    padding: 18px;
    width: 100%;
    max-width: 320px;
  }
  .stars {
    color: rgb(var(--embed-accent, 59, 130, 246));
    letter-spacing: 3px;
  }
  .author {
    opacity: 0.65;
    font-size: 13px;
  }
`;

export const renderCard = (attrs) => {
  const rating = Math.max(0, Math.min(5, Number(attrs.rating) || 0));

  const card = document.createElement("div");
  card.className = "card";

  const stars = document.createElement("div");
  stars.className = "stars";
  stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);

  const quote = document.createElement("p");
  quote.textContent = attrs.quote ?? "";

  const author = document.createElement("div");
  author.className = "author";
  author.textContent = attrs.author ? `— ${attrs.author}` : "";

  card.append(stars, quote, author);
  return card;
};

export const observed = ["author", "rating", "quote"];

defineEmbedElement("review-card", observed, styles, renderCard);
