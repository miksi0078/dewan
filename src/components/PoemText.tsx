'use client';

import { useState } from 'react';
import CopyButton from './CopyButton';

export type Version = { lang: 'ps' | 'pr' | 'en'; label: string; text: string };

/** Shows a poem with tabs for each available script/translation, plus a one-click copy button. */
export default function PoemText({
  versions,
  initial,
  heading,
  copyLabel,
  copiedLabel,
}: {
  versions: Version[];
  initial: 'ps' | 'pr' | 'en';
  heading: string; // "Title — Poet" added to the copied text
  copyLabel: string;
  copiedLabel: string;
}) {
  const start = versions.find((v) => v.lang === initial) ? initial : versions[0]?.lang;
  const [active, setActive] = useState(start);
  const current = versions.find((v) => v.lang === active) ?? versions[0];
  if (!current) return null;

  const rtl = current.lang === 'ps';
  const stanzas = current.text
    .replace(/\r\n/g, '\n')
    .trim()
    .split(/\n\s*\n/)
    .map((s) => s.split('\n').map((l) => l.trim()).filter(Boolean));

  const copyText = `${current.text.trim()}\n\n— ${heading}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {versions.length > 1 ? (
          <div className="inline-flex rounded-full border border-brand-200 bg-white p-0.5 text-sm" role="tablist" dir="ltr">
            {versions.map((v) => (
              <button
                key={v.lang}
                role="tab"
                aria-selected={v.lang === current.lang}
                onClick={() => setActive(v.lang)}
                className={`rounded-full px-3 py-1 font-medium ${v.lang === 'ps' ? 'font-naskh' : ''} ${
                  v.lang === current.lang ? 'bg-brand-600 text-white' : 'text-brand-700 hover:bg-brand-50'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <CopyButton text={copyText} label={copyLabel} copiedLabel={copiedLabel} />
      </div>

      <div dir={rtl ? 'rtl' : 'ltr'} lang={rtl ? 'ps' : current.lang === 'pr' ? 'ps-Latn' : 'en'} className="py-4">
        {stanzas.map((lines, i) => (
          <div key={i} className="poem-stanza">
            {lines.map((line, j) => (
              <span key={j} className={`poem-line ${rtl ? 'rtl' : ''}`}>
                {line}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
