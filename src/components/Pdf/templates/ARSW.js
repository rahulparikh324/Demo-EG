export const insulationResistanceContactsOpenAndClosed = {
  body: [
    ['#Insulation Resistance at', '', '#POLE 1', '#POLE 2', '#POLE 3'],
    ['testVoltage', '#AS FOUND', 'p1AsFound', 'p2AsFound', 'p3AsFound'],
    ['', '#AS LEFT', 'p1AsLeft', 'p2AsLeft', 'p3AsLeft'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 1 && data.column.index === 0) data.cell.rowSpan = 2
  },
}

export const leakageInMilliamps = {
  body: [
    ['#Leakage in Milliamps at', '', 'leakageInMilliampsAt'],
    ['#POLE 1', '#POLE 2', '#POLE 3'],
    ['pole1', 'pole2', 'pole3'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0 && data.column.index === 0) data.cell.colSpan = 2
  },
}
