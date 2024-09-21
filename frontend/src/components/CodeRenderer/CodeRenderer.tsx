import React from 'react';
import Editor from "@monaco-editor/react";
import { FileIcon } from 'lucide-react';

interface CodeProps {
    code: string;
    fileName?: string;
}

const CodeRenderer = ({ code, fileName = "Vulnerability Scan" }: CodeProps) => {
    return (
        <div className="flex flex-col h-screen rounded-lg overflow-hidden shadow-lg bg-[#1e1e1e]">
            <div className="flex items-center bg-[#252526] text-white px-4 py-4 rounded-t-lg">
                <FileIcon size={16} className="mr-2 text-slate-300" />
                <span className="text-sm font-medium text-slate-300">{fileName}</span>
            </div>
            <div className="flex-grow">
                <Editor
                    height="100%"
                    width="100%"
                    language="python"
                    theme="vs-dark"
                    defaultValue={code}
                    options={{
                        fontSize: 13,
                        minimap: {
                            enabled: false
                        },
                        contextmenu: false,
                        scrollbar: {
                            vertical: 'hidden',
                            horizontal: 'hidden'
                        },
                        overviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,
                        overviewRulerBorder: false,
                        readOnly: true  // Make the editor read-only
                    }}
                />
            </div>
        </div>
    )
}

export default CodeRenderer;