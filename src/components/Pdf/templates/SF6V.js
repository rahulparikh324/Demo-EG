export const testData = {
  body: [
    ['#Leakage Current in mA at', '', '#WAY 1A to WAY 2A', '#WAY 1B to WAY 2B', '#WAY 1C to WAY 2C'],
    ['leakageCurrent', '#kV', 'leakageResult1', 'leakageResult2', 'leakageResult3'],
    ['#Resistance in Ohms at 5 kV DC (Contacts Closed)', '#As Found', 'resistanceContactsClosedAsFound1', 'resistanceContactsClosedAsFound2', 'resistanceContactsClosedAsFound3'],
    ['', '#As Left', 'resistanceContactsClosedAsLeft1', 'resistanceContactsClosedAsLeft2', 'resistanceContactsClosedAsLeft3'],
    ['#Resistance in Ohms at 5 kV DC (Contacts Open)', '#As Found', 'resistanceContactsOpenAsFound1', 'resistanceContactsOpenAsFound2', 'resistanceContactsOpenAsFound3'],
    ['', '#As Left', 'resistanceContactsOpenAsLeft1', 'resistanceContactsOpenAsLeft2', 'resistanceContactsOpenAsLeft3'],
    ['#Contact Resistance in Micro-Ohms', '#As Found', 'contactResistanceAsFound1', 'contactResistanceAsFound2', 'contactResistanceAsFound3'],
    ['', '#As Left', 'contactResistanceAsLeft1', 'contactResistanceAsLeft2', 'contactResistanceAsLeft3'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0 && data.column.index === 0) data.cell.colSpan = 2
    //if (data.section === 'body' && data.row.index === 1 && data.column.index === 0) data.cell.colSpan = 2
    if (data.section === 'body' && [2, 4, 6].includes(data.row.index) && data.column.index === 0) data.cell.rowSpan = 2
  },
}
export const testData5 = {
  body: [
    ['', '', '#WAY 1A to WAY 2A', '#WAY 1B to WAY 2B', '#WAY 1C to WAY 2C'],
    ['#Phase Overcurrent at 150% 900A', '#As Found', 'overcurrent900AsFound1', 'overcurrent900AsFound2', 'overcurrent900AsFound3'],
    ['', '#As Left', 'overcurrent900AsLeft1', 'overcurrent900AsLeft2', 'overcurrent900AsLeft3'],
    ['#Phase Overcurrent at 150% 600A', '#As Found', 'overcurrent600AsFound1', 'overcurrent600AsFound2', 'overcurrent600AsFound3'],
    ['', '#As Left', 'overcurrent600AsLeft1', 'overcurrent600AsLeft2', 'overcurrent600AsLeft3'],
    ['', '', '#WAY 1A to WAY 3A', '#WAY 1B to WAY 3B', '#WAY 1C to WAY 3C'],
    ['#Phase Overcurrent at 150% 900A', '#As Found', 'overcurrent900AsFound4', 'overcurrent900AsFound5', 'overcurrent900AsFound6'],
    ['', '#As Left', 'overcurrent900AsLeft4', 'overcurrent900AsLeft5', 'overcurrent900AsLeft6'],
    ['#Phase Overcurrent at 150% 600A', '#As Found', 'overcurrent600AsFound4', 'overcurrent600AsFound5', 'overcurrent600AsFound6'],
    ['', '#As Left', 'overcurrent600AsLeft4', 'overcurrent600AsLeft5', 'overcurrent600AsLeft6'],
  ],
  style: data => {
    if (data.section === 'body' && [0, 5].includes(data.row.index) && data.column.index === 0) data.cell.colSpan = 2
    //if (data.section === 'body' && data.row.index === 1 && data.column.index === 0) data.cell.colSpan = 2
    if (data.section === 'body' && [1, 3, 6, 8].includes(data.row.index) && data.column.index === 0) data.cell.rowSpan = 2
  },
}
