type ReportSection = {
  heading: string
  rows: Record<string, string | number | boolean | null | undefined>
}

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, char => {
    const replacements: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return replacements[char]
  })
}

export function openPrintableReport(title: string, sections: ReportSection[]) {
  const generatedAt = new Date().toLocaleString()
  const body = sections.map(section => `
    <section>
      <h2>${escapeHtml(section.heading)}</h2>
      <table>
        <tbody>
          ${Object.entries(section.rows).map(([key, value]) => `
            <tr>
              <th>${escapeHtml(key)}</th>
              <td>${escapeHtml(value)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `).join('')

  const reportWindow = window.open('', '_blank', 'noopener,noreferrer')
  if (!reportWindow) return false

  reportWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #172033; margin: 32px; }
          h1 { font-size: 22px; margin: 0 0 4px; }
          .meta { color: #607085; font-size: 12px; margin-bottom: 24px; }
          section { margin-top: 22px; break-inside: avoid; }
          h2 { font-size: 15px; border-bottom: 1px solid #d7e4df; padding-bottom: 6px; }
          table { border-collapse: collapse; width: 100%; margin-top: 10px; }
          th, td { border: 1px solid #d7e4df; padding: 8px 10px; font-size: 12px; text-align: left; }
          th { width: 34%; background: #f2faf7; color: #31524b; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <div class="meta">Generated ${escapeHtml(generatedAt)}</div>
        ${body}
      </body>
    </html>
  `)
  reportWindow.document.close()
  reportWindow.focus()
  reportWindow.print()
  return true
}
