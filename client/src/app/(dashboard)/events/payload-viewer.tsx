"use client"

import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('json', json);

interface PayloadViewerProps {
    data: any
}

export function PayloadViewer({ data }: PayloadViewerProps) {
    const jsonString = JSON.stringify(data, null, 2)

    return (
        <div className="rounded-md overflow-hidden border text-sm">
            <SyntaxHighlighter
                language="json"
                style={vs2015}
                customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e' }}
                wrapLongLines={true}
            >
                {jsonString}
            </SyntaxHighlighter>
        </div>
    )
}
