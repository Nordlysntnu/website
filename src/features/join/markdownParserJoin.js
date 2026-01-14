import fs from "fs";
import path from "path";
import { remark } from "remark";
import html from "remark-html";
import breaks from "remark-breaks";

export async function markdownParserJoin(relativePath, imageMap) {

  const fullPath = path.join(process.cwd(), relativePath);
  const content = fs.readFileSync(fullPath, "utf8");

  const lines = content.split(/\r?\n/);

  const groups = {};
  let currentGroup = null;
  let currentRole = null;
  let buffer = [];

  //TODO: seperate processAsHtml so it can work for other md pages (about)

  async function processAsHtml() {
    const text = buffer.join("\n").trim();
    buffer = [];
    if (!text) return "";

    const result = await remark().use(breaks).use(html).process(text);
    return result.toString();
  }

  for (let line of lines) {
    line = line.trim();
    if (!line) {
      buffer.push("");
      continue;
    }

    // Group (#)
    if (line.startsWith("# ") && !line.startsWith("##")) {
      if (currentRole && buffer.length > 0) {
        groups[currentGroup][currentRole].text = await processAsHtml();
      } else if (currentGroup && buffer.length > 0) {
        groups[currentGroup].description = await processAsHtml();
      }

      const name = line.replace("#", "").trim();
      const key = name.toLowerCase().replace(/\s+/g, "-");

      groups[key] = { name, image: imageMap[key], description: "" };
      currentGroup = key;
      currentRole = null;
      buffer = [];
      continue;
    }

    // Role (##)
    if (line.startsWith("## ")) {
      if (currentRole && buffer.length > 0) {
        groups[currentGroup][currentRole].text = await processAsHtml();
      } else if (currentGroup && buffer.length > 0) {
        groups[currentGroup].description = await processAsHtml();
      }

      const name = line.replace("## ", "").trim();
      const key = name.toLowerCase().replace(/\s+/g, "-");
      groups[currentGroup][key] = { name, text: "" };
      currentRole = key;
      buffer = [];
      continue;
    }

    // Description or text
    if (line.startsWith("description:")) {
      const text = line.replace("description:", "").trim();
      groups[currentGroup].description = await remark().use(breaks).use(html).processSync(text).toString();
      continue;
    }

    if (line.startsWith("text:")) {
        buffer.push(line.replace("text:", "").trim());
      continue;
    }

    buffer.push(line);
  }

  if (currentRole && buffer.length > 0) {
    groups[currentGroup][currentRole].text = await processAsHtml();
  } else if (currentGroup && buffer.length > 0) {
    groups[currentGroup].description = await processAsHtml();
  }

  return groups;
}
