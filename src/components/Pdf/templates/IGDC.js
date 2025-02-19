export const powerFactorTipUpTest = {
  body: [
    ['##', '#MODE', '#ENRGZD', '#GRND', '#UST', '#Insulation Measured', '#Measured, mA', '#Measured, W', '#Power Factor'],
    ['#1', '#2.4 / GST', '#A', '#B,C', '#', '#A+(A-B+A-C)', 'ma1', 'w1', 'powerFactor1'],
    ['#2', '#2.7 / GST', '#', '#', '#', '#', 'ma2', 'w2', 'powerFactor2'],
    ['#3', '#2.4 / UST', '#A', '#C', '#B', '#A-B', 'ma3', 'w3', 'powerFactor3'],
    ['#4', '#2.7 / UST', '#', '#', '#', '#', 'ma4', 'w4', 'powerFactor4'],
    ['#5', '#2.4 / GST', '#B', '#C,A', '#', '#B+(B-C+B-A)', 'ma5', 'w5', 'powerFactor5'],
    ['#6', '#2.7 / GST', '#', '#', '#', '#', 'ma6', 'w6', 'powerFactor6'],
    ['#7', '#2.4 / UST', '#B', '#A', '#C', '#B-C', 'ma7', 'w7', 'powerFactor7'],
    ['#8', '#2.7 / UST', '#', '#', '#', '#', 'ma8', 'w8', 'powerFactor8'],
    ['#9', '#2.4 / GST', '#C', '#A, B', '#', '#C+(C-A+C-B)', 'ma9', 'w9', 'powerFactor9'],
    ['#10', '#2.7 / GST', '#', '#', '#', '#', 'ma10', 'w10', 'powerFactor10'],
    ['#11', '#2.4 / UST', '#C', '#B', '#A', '#C-A', 'ma11', 'w11', 'powerFactor11'],
    ['#12', '#2.7 / UST', '#', '#', '#', '#', 'ma12', 'w12', 'powerFactor12'],
    ['#13*', '#2.4 / GST', '#A, B, C', '#', '#', '#A+B+C', 'ma13', 'w13', 'powerFactor13'],
    ['#14*', '#2.7 / GST', '#', '#', '#', '#', 'ma14', 'w14', 'powerFactor14'],
    ['#*Note: This test is used when the windings cannot be isolated from each other. Do not perform if isolation can be performed', '', '', '', '', '', '', '', '', ''],
    ['', '#The line and neutral terminals of each winding should be short circuited', '', '', '', '', '', '', ''],
    ['', '#Interphase (UST) power factors are generally higher than those for phase-to- ground insulation.', '', '', '', '', '', '', ''],
    ['', '#Test voltage is normally 2kV and also at operating line-to-ground voltage. Additional steps in between, an at 10% to 25% above line to ground voltage, are also desirable.', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && data.row.index === 15 && data.column.index === 0) data.cell.colSpan = 9
    if (data.section === 'body' && [16, 17, 18].includes(data.row.index) && data.column.index === 1) data.cell.colSpan = 8
    if (data.section === 'body' && [15, 16, 17, 18, 19].includes(data.row.index)) data.cell.styles.lineColor = [255, 255, 255]
    if (data.section === 'body' && data.row.index === 19 && data.column.index === 0) {
      data.cell.colSpan = 9
      data.cell.rowSpan = 11
    }
  },
  draw: (data, doc, images) => {
    if (data.section === 'body' && data.column.index === 0 && data.row.index === 19) {
      const img = images['0']
      if (img) doc.addImage(img, 'JPEG', data.cell.width / 2 - data.cell.width / 4.4, data.cell.y, data.cell.width / 2.2, data.cell.width / (1.136 * 2.2))
    }
  },
}

export const dcInsulationResistance = {
  body: [['#Time in Minutes ', '']],
  hasGrid: true,
  gridRow: ['timeInMinutes', 'insulationResistance1'],
  hasDataAfterGrid: true,
  afterGridBody: [
    ['#(1/0.5) POLARIZATION RATIO', 'primaryToGroundSecondaryGuarded3'],
    ['#(10/1) POLARIZATION INDEX', 'polarization10over1_1'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0) data.cell.styles.fillColor = [206, 212, 218]
  },
}
