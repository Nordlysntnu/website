import fs from "fs";
import path from "path";

/**
 * Parse Markdown into the object shape JoinForm expects
 * @param {string} relativePath Path to Markdown file
 * @param {object} imageMap Mapping of group keys to image src
 */
export function parseGroupsMarkdownSimple(relativePath, imageMap) {
  const fullPath = path.join(process.cwd(), relativePath);
  const content = fs.readFileSync(fullPath, "utf8");

  const lines = content.split(/\r?\n/);

  const groups = {};
  let currentGroup = null;
  let currentRole = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // GROUP (#)
    if (line.startsWith("# ") && !line.startsWith("##")) {
      const name = line.replace("# ", "").trim();
      const key = name.toLowerCase().replace(/\s+/g, "-");
      groups[key] = {
        name,
        image: imageMap[key],
        description: "",
      };
      currentGroup = key;
      currentRole = null;
      continue;
    }

    // ROLE (##)
    if (line.startsWith("## ")) {
      const name = line.replace("## ", "").trim();
      const key = name.toLowerCase().replace(/\s+/g, "-");
      groups[currentGroup][key] = {
        name,
        text: "",
      };
      currentRole = key;
      continue;
    }

    // DESCRIPTION OR TEXT
    if (line.startsWith("description:")) {
      groups[currentGroup].description = line.replace("description:", "").trim();
      continue;
    }

    if (line.startsWith("text:")) {
      groups[currentGroup][currentRole].text = line.replace("text:", "").trim();
      continue;
    }

    // Append multi-line content
    if (currentRole) {
      groups[currentGroup][currentRole].text += "\n\n" + line;
    } else if (currentGroup) {
      groups[currentGroup].description += "\n\n" + line;
    }
  }

  return groups;
}
