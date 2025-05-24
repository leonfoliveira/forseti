import Markdown from "react-markdown";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import React from "react";

type Props = {
  markdown?: string;
};

export function MarkdownDisplay(props: Props) {
  return (
    <div className="prose prose-neutral max-w-none">
      <Markdown
        remarkPlugins={[remarkMath, remarkBreaks]}
        rehypePlugins={[rehypeKatex]}
      >
        {props.markdown}
      </Markdown>
    </div>
  );
}
