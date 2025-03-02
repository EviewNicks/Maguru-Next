// features/module/components/ModuleContent.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface ModuleContentProps {
  title: string;
  content: string;
  media?: string;
}

const ModuleContent: React.FC<ModuleContentProps> = ({
  title,
  content,
  media,
}) => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        
        {media && (
          <div className="mb-6">
            <img 
              src={media} 
              alt={title} 
              className="w-full h-auto rounded-md object-cover max-h-[300px]" 
            />
          </div>
        )}
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleContent;
