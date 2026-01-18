import fs from "fs";
import path from "path";
import { MarkdownToHtml } from "@shared/utils/MarkdownToHtml";

export async function MarkdownGroupParser(relativePath, imageMap) {

  const fullPath = path.join(process.cwd(), relativePath);
  const content = fs.readFileSync(fullPath, "utf8");

  const lines = content.split(/\r?\n/);

  const groups = {};
  let currentGroup = null;
  let currentRole = null;
  let buffer = [];

  //TODO: seperate processAsHtml so it can work for other md pages (about)

  async function flushBuffer() {
  
    const text = buffer.join("\n").trim();
    buffer = [];
    
    if (!text) {
      return "";
    }
    return await MarkdownToHtml(text);
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
        groups[currentGroup][currentRole].text = await flushBuffer();
      } else if (currentGroup && buffer.length > 0) {
        groups[currentGroup].description = await flushBuffer();
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
        groups[currentGroup][currentRole].text = await flushBuffer();
      } else if (currentGroup && buffer.length > 0) {
        groups[currentGroup].description = await flushBuffer();
      }

      const name = line.replace("##", "").trim();
      const key = name.toLowerCase().replace(/\s+/g, "-");
      groups[currentGroup][key] = { name, text: "" };
      currentRole = key;
      buffer = [];
      continue;
    }

    buffer.push(line);
  }

  if (currentRole && buffer.length > 0) {
    groups[currentGroup][currentRole].text = await flushBuffer();
  } else if (currentGroup && buffer.length > 0) {
    groups[currentGroup].description = await flushBuffer();
  }

  return groups;
}
