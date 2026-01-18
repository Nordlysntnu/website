import { remark } from "remark";
import html from "remark-html";
import breaks from "remark-breaks";

export async function MarkdownToHtml(markdown) {
  if (!markdown || !markdown.trim()) {
    return "";
  }
  const result = await remark().use(breaks).use(html).process(markdown);
  return result.toString();
}