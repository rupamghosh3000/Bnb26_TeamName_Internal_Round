import React from 'react';

interface FormattedAIMessageProps {
  content: string;
}

export const FormattedAIMessage: React.FC<FormattedAIMessageProps> = ({ content }) => {
  if (!content) return null;

  // Split lines
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let tableRows: string[] = [];

  const renderInline = (text: string) => {
    // Replace **bold** with <strong> and `code` with <code>
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        const inner = token.slice(2, -2);
        parts.push(
          <strong key={match.index} className="font-bold text-slate-900">
            {inner}
          </strong>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        const inner = token.slice(1, -1);
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-200/70 text-brand-deep font-mono text-[10.5px]"
          >
            {inner}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const flushTable = (keyIndex: number) => {
    if (tableRows.length === 0) return null;
    const currentRows = [...tableRows];
    tableRows = [];

    // Filter out separator rows like | :--- | :--- |
    const cleanRows = currentRows.filter((r) => !r.match(/^\|?\s*[-:]+[-|\s:]*\|?$/));
    if (cleanRows.length === 0) return null;

    const headers = cleanRows[0]
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    const bodyRows = cleanRows.slice(1).map((r) =>
      r
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean)
    );

    return (
      <div key={`table-${keyIndex}`} className="my-2.5 overflow-x-auto rounded-xl border border-slate-200 bg-white/80">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200">
              {headers.map((h, hi) => (
                <th key={hi} className="p-2 font-bold text-slate-700">
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bodyRows.map((cols, ri) => (
              <tr key={ri} className="hover:bg-slate-50/60 transition-colors">
                {cols.map((col, ci) => (
                  <td key={ci} className="p-2 text-slate-700">
                    {renderInline(col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if line is part of a Markdown table
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      tableRows.push(trimmed);
      i++;
      continue;
    } else if (tableRows.length > 0) {
      const tableElem = flushTable(i);
      if (tableElem) elements.push(tableElem);
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="text-xs font-bold text-brand-deep mt-2.5 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
          {renderInline(trimmed.replace('### ', ''))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-slate-900 mt-3 mb-1.5">
          {renderInline(trimmed.replace('## ', ''))}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.replace(/^[-•*]\s+/, '');
      elements.push(
        <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 my-0.5 leading-relaxed">
          <span className="text-brand-primary font-bold mt-0.5">•</span>
          <div className="flex-1">{renderInline(itemText)}</div>
        </div>
      );
    } else if (trimmed === '') {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(
        <p key={i} className="text-xs text-slate-700 leading-relaxed my-0.5">
          {renderInline(trimmed)}
        </p>
      );
    }
    i++;
  }

  if (tableRows.length > 0) {
    const tableElem = flushTable(lines.length);
    if (tableElem) elements.push(tableElem);
  }

  return <div className="space-y-0.5">{elements}</div>;
};
