const article = document.querySelector("article");

if (article) {
  const text = article.textContent;
  const regex = /[^\s\+]/g;
  const words = text.matchAll(regex);

  const count = [...words].length;
  const readingTime = Math.round(count / 200);
  const badge = document.createElement("p");

  badge.classList.add("color-secondary-text", "type--caption");
  badge.textContent = `⏰ ${readingTime} min read`;
  badge.style.fontSize = "12px";

  const heading = article.querySelector("h1");

  const date = article.querySelector("time")?.parentNode;

  (date ?? heading).appendChild(badge);
}
