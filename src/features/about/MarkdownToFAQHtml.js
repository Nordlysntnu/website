import { MarkdownToHtml } from "../../shared/utils/MarkdownToHtml";

export async function MarkdownToFAQHtml(markdown) {
    if (!markdown || !markdown.trim()) return [];

    const sections = markdown.split("\n## ").filter(Boolean);

    const faq = await Promise.all(
        sections.map(async (section, index) => {
            const lines = section.split("\n");
            const question = (index === 0 ? lines[0].replace("## ", "") : lines[0]).trim();

            const answerMd = lines.slice(1).join("\n");
            const answerHtml = await MarkdownToHtml(answerMd);

            return {
                question, answerHtml
            };
        })
    );

    return faq;
}