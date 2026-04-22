import { remark } from "remark";
import html from "remark-html";
import breaks from "remark-breaks";
import { MarkdownToHtml } from "@shared/utils/MarkdownToHtml";

export async function MarkdownToCompetitions(markdown) {
  if (!markdown || !markdown.trim()) {
    return { intro: "", competitions: [] };
  }

  const parts = markdown.split('---').map(p => p.trim()).filter(Boolean);

  const introPart = parts[0];

  const introLines = introPart.split('\n');
  const introContent = introLines.join('\n'); 

  const introHtml = await MarkdownToHtml(introContent);

  const competitionParts = parts.slice(1);

  const competitions = await Promise.all(
    competitionParts.map(async (section) => {
      const lines = section.split('\n').map(l => l.trim());

      const imageLine = lines.find(l => l.startsWith('image:'));
      const image = imageLine ? imageLine.replace('image:', '').trim() : null;

      const bodyLines = lines.filter(
        l =>
          !l.startsWith('image:')
      );

      const bodyMarkdown = bodyLines.join('\n');
      const bodyHtml = await MarkdownToHtml(bodyMarkdown);

      return {
        image,
        bodyHtml,
      };
    })
  );

  return {
    introHtml,
    competitions,
  };
}