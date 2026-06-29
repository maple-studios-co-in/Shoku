import sanitizeHtml from "sanitize-html";

// Markdown-friendly allowlist: permits the tags `marked` emits (headings, lists,
// tables, code, links, images) while stripping <script>/<iframe>/<style>, inline
// event handlers, and unsafe URL schemes. Defense-in-depth — even trusted content
// files shouldn't be able to inject script via dangerouslySetInnerHTML.
const OPTIONS = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "ul", "ol", "li", "blockquote",
    "hr", "br", "strong", "em", "b", "i", "del", "code", "pre", "img",
    "table", "thead", "tbody", "tr", "th", "td", "span", "div",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title"],
    code: ["class"],
    span: ["class"],
    div: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

export function safeMarkdownHtml(html) {
  return sanitizeHtml(html || "", OPTIONS);
}
