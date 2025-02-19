export const renderTable = ({ doc, startY, body, header }) => {
  doc.autoTable({
    startY,
    tableLineWidth: 0.2,
    tableLineColor: [206, 212, 218],
    body,
    head: [
      [
        {
          content: header,
          colSpan: body[0].length,
          styles: {
            halign: 'left',
            lineColor: [206, 212, 218],
            border: { top: 0, right: 0, bottom: 0.2, left: 0 },
            lineWidth: 0.2,
            cellPadding: { top: 2, right: 0, bottom: 2, left: 2 },
            fillColor: [247, 247, 247],
            font: 'Manrope-Medium',
            textColor: [119, 136, 153],
          },
        },
      ],
    ],
    bodyStyles: { cellPadding: { top: 2, right: 2, bottom: 2, left: 2 }, border: { top: 0.5, right: 0, bottom: 0, left: 0 }, lineWidth: 0.2, textColor: [12, 12, 12], fillColor: [255, 255, 255], fontSize: 9, font: 'Manrope-Regular', lineColor: [206, 212, 218] },
    columnStyles: {},
    theme: 'plain',
    pageBreak: 'avoid',
    rowPageBreak: 'avoid',
    didParseCell: data => {
      if (data.section === 'body' && data.column.index % 2 === 0) data.cell.styles.textColor = [119, 136, 153]
    },
  })
}

export const renderHeader = ({ doc, startY, title, pageWidth, left }) => {
  doc.setFontSize(10)
  doc.setFillColor(247, 247, 247)
  doc.rect(left, startY, pageWidth - 2 * left, 8, 'FD')
  doc.setTextColor(119, 136, 153)
  doc.text(title, left + 2, startY + 5)
  doc.setFontSize(9)
}
