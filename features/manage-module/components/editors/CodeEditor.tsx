// features/manage-module/components/editors/CodeEditor.tsx
'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from 'next-themes'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Dynamic import untuk Monaco Editor
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[300px]" />,
})

interface CodeEditorProps {
  content: string
  language: string
  onChange: (content: string) => void
  onLanguageChange: (language: string) => void
  maxLength?: number
  className?: string
}

// Daftar bahasa pemrograman yang didukung
const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
]

export function CodeEditor({
  content,
  language,
  onChange,
  onLanguageChange,
  maxLength = 2000,
  className,
}: CodeEditorProps) {
  const { theme } = useTheme()
  const [charCount, setCharCount] = useState(content.length)

  // Perbarui jumlah karakter saat konten berubah
  useEffect(() => {
    setCharCount(content.length)
  }, [content])

  // Handler untuk perubahan konten
  const handleEditorChange = (value: string = '') => {
    if (value.length <= maxLength) {
      onChange(value)
      setCharCount(value.length)
    }
  }

  return (
    <div className={`code-editor ${className || ''}`}>
      <div className="mb-2">
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Pilih bahasa" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md overflow-hidden">
        <MonacoEditor
          height="300px"
          language={language}
          value={content}
          onChange={handleEditorChange}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>

      <div className="text-xs text-muted-foreground mt-1 text-right">
        {charCount}/{maxLength} karakter
      </div>
    </div>
  )
}
