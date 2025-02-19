export const tapChangerTemplate = {
  body: [
    ['#Tap Position', '#Voltage', '', '', ''],
    ['tapPosition1', 'voltage1', '', '', ''],
    ['tapPosition2', 'voltage2', '', '', ''],
    ['tapPosition3', 'voltage3', '', '', ''],
    ['tapPosition4', 'voltage4', '', '', ''],
    ['tapPosition5', 'voltage5', '', '', ''],
    ['tapPosition6', 'voltage6', '', '', ''],
    ['tapPosition7', 'voltage7', '', '', ''],
    ['#Tap Position as Found', 'tapPositionAsFound', '', '', ''],
    ['#Tap Position as Left', 'tapPositionAsLeft', '', '', ''],
  ],
  columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 30 } },
  style: data => {
    if (data.section === 'body' && data.column.index > 1) {
      data.cell.colSpan = 3
      data.cell.rowSpan = 10
      //data.cell.styles.fillColor = [206, 212, 218]
    }
  },
  draw: (data, doc, images, obj) => {
    if (data.section === 'body' && data.column.index === 2 && data.row.index === 0) {
      const key = obj.sampleType
      const image = images[key]
      const aspectRatio = 2.054
      if (image) doc.addImage(image, 'JPEG', data.cell.x, data.cell.y, data.cell.width, data.cell.width / aspectRatio)
    }
  },
}

export const windingInsulationTests = {
  body: [
    ['#Oil Temperature', '', '', '', '', 'oilTemperature', '', '', '', ''],
    ['#Energize', '#Ground', '#Guard', '#UST', '#TEST kV', '#METER READINGS (mA)', '#METER READINGS (WATTS)', '#% POWER FACTOR', '#% PF 20°C', '#MEASURED'],
    ['#High', '#Low', '', '', 'testKv1', 'ma1', 'watts1', 'powerFactor1', 'powerFactorAtTwenty1', ''],
    ['#High', '', '#Low', '', 'testKv2', 'ma2', 'watts2', 'powerFactor2', 'powerFactorAtTwenty2', ''],
    ['#High', '', '', '#Low', 'testKv3', 'ma3', 'watts3', 'powerFactor3', 'powerFactorAtTwenty3', ''],
    ['#Low', '#High', '', '', 'testKv4', 'ma4', 'watts4', 'powerFactor4', 'powerFactorAtTwenty4', ''],
    ['#Low', '', '#High', '', 'testKv5', 'ma5', 'watts5', 'powerFactor5', 'powerFactorAtTwenty5', ''],
    ['#Low', '', '', '#High', 'testKv6', 'ma6', 'watts6', 'powerFactor6', 'powerFactorAtTwenty6', ''],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0 && [0, 5].includes(data.column.index)) data.cell.colSpan = 5
    if (data.section === 'body' && data.row.index === 1) data.cell.styles.fillColor = [206, 212, 218]
  },
  draw: (data, doc, images) => {
    if (data.section === 'body' && data.column.index === 9 && data.row.index > 1) {
      const img = images[data.row.index - 2]
      if (img) doc.addImage(img, 'JPEG', data.cell.x + 4, data.cell.y + 2, data.cell.width / 1.5, data.cell.height / 2)
    }
  },
}

export const excitingCurrent = {
  body: [
    ['#Tap Position', '#Test kV', `#Energize - H1`, `#Energize - H2`, `#Energize - H3`],
    ['', '', `#UST - H2`, `#UST - H3`, `#UST - H1`],
    ['', '', `#Ground - H3`, `#Ground - H1`, `#Ground - H2`],
    ['', '', `#mVA`, `#mVA`, `#mVA`],
    ['tapPosition', 'excitingCurrentTestKv1', `results1`, `results2`, `results3`],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index < 4) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && data.row.index === 0 && data.column.index < 2) data.cell.rowSpan = 4
  },
}

export const physicalAndChemicalTests = {
  body: [['#Date', '', '#PPM Measurements', '', '#Interfacial Tension', '', '#Numbers', '']],
  hasGrid: true,
  isNestedGrid: true,
  gridRow: [
    ['#Sample Drawn', 'sampleDrawn', '#PCB in PPM', 'pcbInPpm1', '#IFT in dynes/cm', 'interfacialTension1', '#Acid Number', 'acidNumber1'],
    ['#By', 'sampleDrawnBy', '#Moisture in Oil PPM', 'moistureInOilPpm1', '', '', '#Color Number', 'colorNumber1'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && data.row.index % 2 === 1 && [4, 5].includes(data.column.index)) data.cell.rowSpan = 2
  },
}
export const dissolvedGasAnalysis = {
  body: [['#Date', '', '#Combustible Gases in PPM', '', '#Non-Combustible Gases in PPM', '', '#Figures', '']],
  hasGrid: true,
  isNestedGrid: true,
  gridRow: [
    ['#Sample Drawn', 'sampleDrawn', '#Hydrogen', 'hydrogen', '#Carbon Dioxide', 'carbonDioxide', '#CO : CO2', 'ratio1'],
    ['#By', 'sampleDrawnBy', '#Methane', 'methane', '#Nitrogen', 'nitrogen', '#TCG', 'tcg1'],
    ['', '', '#Ethane', 'ethane', '#Oxygen', 'oxygen', '#TCG %', 'tcgPercentage1'],
    ['', '', '#Ethylene', 'ethylene', '', '', '', ''],
    ['', '', '#Acetylene', 'acetylene', '', '', '', ''],
    ['', '', '#Carbon Monoxide', 'carbonMonoxide', '', '', '', ''],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && (data.row.index - 2) % 6 === 0 && [0, 1].includes(data.column.index)) data.cell.rowSpan = 5
    if (data.section === 'body' && (data.row.index - 3) % 6 === 0 && [4, 5, 6, 7].includes(data.column.index)) data.cell.rowSpan = 4
  },
}
export const primaryWindingTest = {
  body: [
    ['#Winding Resistance Readings in', '', '', 'windingResistanceReadings'],
    ['#TAP', '#H1 TO H3', `#H2 TO H1`, `#H3 TO H2`],
  ],
  hasGrid: true,
  gridRow: ['tap', 'h1ToH3', 'h2ToH1', 'h3ToH2'],
  style: data => {
    if (data.section === 'body' && data.row.index === 0 && data.column.index === 0) data.cell.colSpan = 3
    if (data.section === 'body' && data.row.index === 1) data.cell.styles.fillColor = [206, 212, 218]
  },
}
export const secondaryWindingTest = {
  body: [
    ['#Winding Resistance Readings in', '', 'windingResistanceReadings'],
    ['#Winding Resistance Test Equipment #', '', 'testEquipment'],
    ['#X1 TO X0', '#X2 TO X0', `#X3 TO X0`],
  ],
  hasGrid: true,
  gridRow: ['x1ToX0', 'x2ToX0', 'x3ToX0'],
  style: data => {
    if (data.section === 'body' && [0, 1].includes(data.row.index) && data.column.index === 0) data.cell.colSpan = 2
    if (data.section === 'body' && data.row.index === 2) data.cell.styles.fillColor = [206, 212, 218]
  },
}
