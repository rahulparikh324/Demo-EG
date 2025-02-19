export const windingInsulationTestsM400 = {
  body: [
    ['#Energize', '#Ground', '#Guard', '#UST', '#TEST kV', '#METER READINGS (mA)', '#METER READINGS (WATTS)', '#% POWER FACTOR', '#MEASURED'],
    ['#High', '#Low', '', '', 'testKv1', 'ma1', 'watts1', 'powerFactor1', ''],
    ['#High', '', '#Low', '', 'testKv2', 'ma2', 'watts2', 'powerFactor2', ''],
    ['#High', '', '', '#Low', 'testKv3', 'ma3', 'watts3', 'powerFactor3', ''],
    ['#Low', '#High', '', '', 'testKv4', 'ma4', 'watts4', 'powerFactor4', ''],
    ['#Low', '', '#High', '', 'testKv5', 'ma5', 'watts5', 'powerFactor5', ''],
    ['#Low', '', '', '#High', 'testKv6', 'ma6', 'watts6', 'powerFactor6', ''],
    ['#Winding Insulation Test Equipment Number', '', '', '', '', '', '', 'testEquipmentNumber', ''],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && data.row.index === 7 && data.column.index === 0) data.cell.colSpan = 7
    if (data.section === 'body' && data.row.index === 7 && data.column.index === 7) data.cell.colSpan = 2
  },
  draw: (data, doc, images) => {
    if (data.section === 'body' && data.column.index === 8 && data.row.index > 0 && data.row.index < 7) {
      const img = images[data.row.index - 1]
      if (img) doc.addImage(img, 'JPEG', data.cell.x + 4, data.cell.y + 2, data.cell.width / 1.5, data.cell.height / 2)
    }
  },
}

export const excitingCurrentM4000 = {
  body: [
    ['#Tap Position', '#Test kV', `#Energize - H1`, `#Energize - H2`, `#Energize - H3`],
    ['', '', `#UST - H2`, `#UST - H3`, `#UST - H1`],
    ['', '', `#Ground - H3`, `#Ground - H1`, `#Ground - H2`],
    ['', '', `#mVA`, `#mVA`, `#mVA`],
    ['tapPositionEc', 'testKvEc', `condition1resultsEc`, `condition2resultsEc`, `condition3resultsEc`],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index < 4) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && data.row.index === 0 && data.column.index < 2) data.cell.rowSpan = 4
  },
}

export const meuTest = {
  body: [
    ['#WINDING INSULATION TESTS', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['#Test Connections', '', '', '', '#Test kV', '#Meter Readings', '', '', '', '', '', '#Results', ''],
    ['#Test', '#Energize', '#Ground', '#Guard', '', '#mVA', '#Multiplier', '#Result', '#mW', '#Multiplier', '#Result', '#% PF', '#Measured'],
    ['#1', '#High', '#Low', '#N/A', 'testKV1', 'meterReadingsMVa1', 'multiplierMVa1', 'resultMVa1', 'meterReadingsMW1', 'multiplierMW1', 'resultMW1', '', ''],
    ['#2', '#High', '#N/A', '#Low', 'testKV2', 'meterReadingsMVa2', 'multiplierMVa2', 'resultMVa2', 'meterReadingsMW2', 'multiplierMW2', 'resultMW2', 'percentPowerFactor2', ''],
    ['#4', '#Low', '#N/A', '#High', 'testKV4', 'meterReadingsMVa4', 'multiplierMVa4', 'resultMVa4', 'meterReadingsMW4', 'multiplierMW4', 'resultMW4', '', ''],
    ['#5', '#Low', '#High', '#N/A', 'testKV5', 'meterReadingsMVa5', 'multiplierMVa5', 'resultMVa5', 'meterReadingsMW5', 'multiplierMW5', 'resultMW5', 'percentPowerFactor5', ''],
    ['#1-2 (Test 1 Minus Test 2)', '', '', '', '', '', 'multiplierMVa6', 'resultMVa6', 'resultMW6', '', '', '', ''],
    ['#4-5 (Test 4 Minus Test 5)', '', '', '', '', '', 'multiplierMVa7', 'resultMVa7', 'resultMW7', '', '', '', ''],
    ['#3', '#High', '#UST TEST', '', 'testKV3', 'meterReadingsMVa3', 'multiplierMVa3', 'resultMVa3', 'meterReadingsMW3', 'multiplierMW3', 'resultMW3', 'percentPowerFactor3', ''],
    ['#EXCITING CURRENT TEST', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['#Tap Position', '', '#Test kV', '', `#Energize - H1`, '', '', `#Energize - H2`, '', '', `#Energize - H3`, '', ''],
    ['', '', '', '', `#UST - H2`, '', '', `#UST - H3`, '', '', `#UST - H1`, '', ''],
    ['', '', '', '', `#Ground - H3`, '', '', `#Ground - H1`, '', '', `#Ground - H2`, '', ''],
    ['', '', '', '', '#mVA', '#Multiplier', '#Result', '#mVA', '#Multiplier', '#Result', '#mVA', '#Multiplier', '#Result'],
    ['tapPositionMeu', '', `testKvMeu`, ``, 'condition1MvaMeu', 'condition1MultMeu', 'condition1ResultMeu', 'condition2MvaMeu', 'condition2MultMeu', 'condition2ResultMeu', 'condition3MvaMeu', 'condition3MultMeu', 'condition3ResultMeu'],
    // ['#Test Equipment #', '', ``, ``, '', '', 'testEquipmentNumber1', '', '', '', '', '', ''],
  ],
  style: data => {
    if (data.section === 'body' && [0, 10].includes(data.row.index) && data.column.index === 0) {
      data.cell.colSpan = 13
      data.cell.styles.fillColor = [206, 212, 218]
    }
    if (data.section === 'body' && data.row.index === 1) {
      if (data.column.index === 0) data.cell.colSpan = 4
      if (data.column.index === 4) data.cell.rowSpan = 2
      if (data.column.index === 5) data.cell.colSpan = 6
      if (data.column.index === 11) data.cell.colSpan = 2
    }
    if (data.section === 'body' && [7, 8].includes(data.row.index)) {
      if (data.column.index === 0) data.cell.colSpan = 4
    }
    if (data.section === 'body' && data.row.index === 9 && data.column.index === 2) data.cell.colSpan = 2
    if (data.section === 'body' && data.row.index === 11 && [0, 2].includes(data.column.index)) {
      data.cell.colSpan = 2
      data.cell.rowSpan = 4
    }
    if (data.section === 'body' && [11, 12, 13].includes(data.row.index) && [4, 7, 10].includes(data.column.index)) data.cell.colSpan = 3
    if (data.section === 'body' && data.row.index === 16) {
      if (data.column.index === 0) data.cell.colSpan = 6
      if (data.column.index === 6) data.cell.colSpan = 7
    }
  },
  draw: (data, doc, images) => {
    if (data.section === 'body' && data.column.index === 12 && data.row.index > 2 && data.row.index < 10) {
      const img = images[data.row.index - 3]
      if (img) doc.addImage(img, 'JPEG', data.cell.x + 4, data.cell.y + 2, data.cell.width / 1.5, data.cell.height / 2)
    }
  },
}

export const primaryWindingTest$DFTR = {
  body: [
    ['#Winding Resistance Readings in', '', '', '', 'windingResistanceReadings'],
    ['#Test Equipment Number:', '', '', '', 'testEquipmentNumber'],
    ['#TAP', '#H1 TO H3', `#H2 TO H1`, `#H3 TO H2`, `#Winding Resistance Test Equipment Number`],
  ],
  hasGrid: true,
  gridRow: ['tap', 'h1ToH3', 'h2ToH1', 'h3ToH2', 'testEquipmentNumber'],
  style: data => {
    if (data.section === 'body' && data.row.index < 2 && data.column.index === 0) data.cell.colSpan = 4
    if (data.section === 'body' && data.row.index === 2) data.cell.styles.fillColor = [206, 212, 218]
  },
}
export const secondaryWindingTest$DFTR = {
  body: [
    ['#Winding Resistance Readings in', '', 'windingResistanceReadings'],
    ['#X1 TO X0', '#X2 TO X0', `#X3 TO X0`],
  ],
  hasGrid: true,
  gridRow: ['x1ToX0', 'x2ToX0', 'x3ToX0'],
  style: data => {
    if (data.section === 'body' && [0].includes(data.row.index) && data.column.index === 0) data.cell.colSpan = 2
    if (data.section === 'body' && data.row.index === 1) data.cell.styles.fillColor = [206, 212, 218]
  },
}
export const transformerTurnsRatioTest = {
  body: [['#TAP', '#CALCULATED', '#H1-H3 to X1-X0', '#H2-H1 to X2-X0', `#H3-H2 to X3-X0`]],
  hasGrid: true,
  gridRow: ['tap', 'calculated', 'h1H3ToX1X0', 'h2H1ToX2X0', 'h3H2ToX3X0'],
  hasDataAfterGrid: true,
  afterGridBody: [['#Test Equipment #', '', '', 'testEquipment', ``]],
  style: data => {
    if (data.section === 'body' && data.row.index === 0) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && data.row.index === data.table.body.length - 1) {
      if (data.column.index === 0) data.cell.colSpan = 3
      if (data.column.index === 3) data.cell.colSpan = 2
    }
  },
}
export const transformerDcInsulationResistance = {
  body: [
    ['#ESTABLISH TEST CONDITIONS', `primaryToGroundSecondaryGuarded`, `primaryToGroundSecondaryGuarded1`, `primaryToGroundSecondaryGuarded2`],
    ['#Time in Minutes ', '#Primary to Ground, Secondary Guarded', '#Secondary to Ground, Primary Guarded', '#Primary to Secondary, Ground Guarded'],
  ],
  hasGrid: true,
  gridRow: ['timeInMinutes', 'insulationResistance1', 'insulationResistance2', 'insulationResistance3'],
  hasDataAfterGrid: true,
  afterGridBody: [
    ['#(1/0.5) POLARIZATION RATIO', 'primaryToGroundSecondaryGuarded3', 'primaryToGroundSecondaryGuarded4', 'primaryToGroundSecondaryGuarded5'],
    ['#(10/1) POLARIZATION INDEX', 'polarization10over1_1', 'polarization10over1_2', 'polarization10over1_3'],
    ['#Test Equipment #', '', 'testEquipmentNumber', ''],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 1) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && data.row.index === data.table.body.length - 1) {
      if (data.column.index === 0) data.cell.colSpan = 2
      if (data.column.index === 2) data.cell.colSpan = 2
    }
  },
}
