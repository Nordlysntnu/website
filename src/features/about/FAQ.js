import Content from "@shared/components/Content"

export default function FAQSection({ htmlContent }) {
    return (
        <Content dark={false}>
            <div dangerouslySetInnerHTML={{ __html: htmlContent}} />
        </Content>
    );
}