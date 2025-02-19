export const dcHipotReferenceTables = {
  body: Array(26)
    .fill('')
    .map(x => Array(5).fill('')),
  style: data => {
    if (data.section === 'body' && data.column.index === 0 && data.row.index === 0) {
      data.cell.colSpan = 5
      data.cell.rowSpan = 9
    }
    if (data.section === 'body' && data.column.index === 0 && data.row.index === 9) {
      data.cell.colSpan = 5
      data.cell.rowSpan = 9
    }
    if (data.section === 'body' && data.column.index === 0 && data.row.index === 18) {
      data.cell.colSpan = 5
      data.cell.rowSpan = 8
    }
  },
  draw: (data, doc, images, obj) => {
    if (data.section === 'body' && data.column.index === 0 && data.row.index === 0) {
      const aspectRatio = 3.104
      if (images[0]) doc.addImage(images[0], 'JPEG', data.cell.x, data.cell.y, data.cell.width, data.cell.width / aspectRatio)
    }
    if (data.section === 'body' && data.column.index === 0 && data.row.index === 9) {
      const aspectRatio = 3.097
      if (images[1]) doc.addImage(images[1], 'JPEG', data.cell.x, data.cell.y, data.cell.width, data.cell.width / aspectRatio)
    }
    if (data.section === 'body' && data.column.index === 0 && data.row.index === 18) {
      const aspectRatio = 3.766
      if (images[2]) doc.addImage(images[2], 'JPEG', data.cell.x, data.cell.y, data.cell.width, data.cell.width / aspectRatio)
    }
  },
}

export const vlfReferenceTable = {
  body: Array(26)
    .fill('')
    .map(x => Array(5).fill('')),
  style: data => {
    if (data.section === 'body' && data.column.index === 0 && data.row.index === 0) {
      data.cell.colSpan = 5
      data.cell.rowSpan = 21
    }
    if (data.section === 'body' && data.column.index === 0 && data.row.index === 21) {
      data.cell.colSpan = 5
      data.cell.rowSpan = 5
    }
  },
  draw: (data, doc, images, obj) => {
    if (data.section === 'body' && data.column.index === 0 && data.row.index === 0) {
      const aspectRatio = 1.236
      if (images[3]) doc.addImage(images[3], 'JPEG', data.cell.x, data.cell.y, data.cell.width, data.cell.width / aspectRatio)
    }
    if (data.section === 'body' && data.column.index === 0 && data.row.index === 21) {
      const aspectRatio = 5.675
      if (images[4]) doc.addImage(images[4], 'JPEG', data.cell.x, data.cell.y, data.cell.width, data.cell.width / aspectRatio)
    }
  },
}

export const vlgTanDeltaAPhase = {
  body: [
    ['#Step', '#RMS Voltage', '#Tan Delta Mean (E-3)', '#Tan Delta St. Dev. (E-3)', '#RMS Current (mA)', '#Capacitance (nF)', '#Duration (min)'],
    ['#1', 'rmsVoltage', 'tanDeltaMean1', 'tanDeltaStDev', 'rmsCurrentMA', 'capacitanceNF', 'durationMin'],
    ['#2', 'rmsVoltage1', 'tanDeltaMean2', 'tanDeltaStDev1', 'rmsCurrentMA1', 'capacitanceNF1', 'durationMin1'],
    ['#3', 'rmsVoltage2', 'tanDeltaMean3', 'tanDeltaStDev2', 'rmsCurrentMA2', 'capacitanceNF2', 'durationMin2'],
    ['#4', 'rmsVoltage3', 'tanDeltaMean4', 'tanDeltaStDev3', 'rmsCurrentMA3', 'capacitanceNF3', 'durationMin3'],
    ['#VERDICT', '', '', 'bVerdictB', '', '', ''],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && data.row.index === data.table.body.length - 1) {
      if (data.column.index === 0) data.cell.colSpan = 3
      if (data.column.index === 3) data.cell.colSpan = 4
    }
  },
}

export const vlfWithstand = {
  body: [
    ['#Step', '#RMS Voltage', '#Leakage Current (mA)', '#Duration (min)'],
    ['#1', 'rmsVoltage', 'leakageCurrent', 'duration'],
    ['#2', 'rmsVoltage1', 'leakageCurrent1', 'duration1'],
    ['#3', 'rmsVoltage2', 'leakageCurrent2', 'duration2'],
    ['#4', 'rmsVoltage3', 'leakageCurrent3', 'duration3'],
    ['#VERDICT', '', 'bVerdictB', ''],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && data.row.index === data.table.body.length - 1) {
      if (data.column.index === 0) data.cell.colSpan = 2
      if (data.column.index === 2) data.cell.colSpan = 2
    }
  },
}

export const insulationResistance = {
  body: [['#Time - Minutes', `#Voltage (kV)`, `#A PHASE`, `#B PHASE`, '#C PHASE']],
  hasGrid: true,
  gridRow: ['timeMinutes', 'voltageKV', 'aPhase', 'bPhase', 'cPhase'],
  hasDataAfterGrid: true,
  afterGridBody: [
    ['#POLARIZATION INDEX (10/1)', '', `#A PHASE`, `#B PHASE`, '#C PHASE'],
    ['', '', 'aPhase', 'aPhase1', 'aPhase2'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && data.row.index === data.table.body.length - 2) {
      if (data.column.index === 0) {
        data.cell.colSpan = 2
        data.cell.rowSpan = 2
      }
    }
  },
}
