"use client"

import Editor, { OnMount } from "@monaco-editor/react"
import { useTheme } from "next-themes"

interface JQEditorProps {
    value: string
    onChange: (value: string) => void
}

export function JQEditor({ value, onChange }: JQEditorProps) {
    const { theme } = useTheme()

    const handleEditorDidMount: OnMount = (editor, monaco) => {
    }

    return (
        <div className="h-50 border rounded-md overflow-hidden pt-2 bg-[#1e1e1e]">
            <Editor
                height="100%"
                defaultLanguage="shell" // 'shell' is close enough for JQ syntax highlighting
                value={value}
                theme={theme === "dark" ? "vs-dark" : "light"} // Or force "vs-dark" for consistency
                onChange={(val) => onChange(val || "")}
                options={{
                    minimap: { enabled: false },
                    lineNumbers: "off",
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    padding: { top: 10 },
                    fontFamily: "monospace",
                }}
                onMount={handleEditorDidMount}
            />
        </div>
    )
}
