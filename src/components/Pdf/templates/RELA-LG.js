export const relaySettings$RELA = {
  body: [
    ['#Phase Rotation', 'phaseRotation', '#PT Configuration', 'ptConfiguration'],
    ['#Nominal Voltage', 'nominalVoltage', '#Nominal Current', 'nominalCurrent'],
    ['#Phase CT Ratio', 'phaseCtRatio', '#VT Ratio', 'vtRatio'],
    ['#Ground CT Ratio', 'groundCtRatio', '#VS Ratio', 'vsRatio'],
  ],
  style: data => {},
}

export const _21$RELA = {
  body: [],
  hasGrid: true,
  isNestedGrid: true,
  gridRow: [
    ['#Element No', 'textField', '', '#Element Identification', 'elementIdentification', ''],
    ['#Setting', '', '', '', '', ''],
    ['#Reach', 'reach', '#Delay (cyc)', 'delayCyc', '#MTA', 'mta'],
    ['#Test Results', '', '', '', '', ''],
    ['#', '#Mfg Curve', '#3 Phase', '#A-B Phase', '#B-C Phase', '#A-C Phase'],
    ['#Reach', 'mfgCurveReach', '3phaseReach', 'aBPhaseReach', 'bCPhaseReach', 'aCPhaseReach'],
    ['#Delay at 100% of PU (cyc)', 'mfgCurveDelay', '3phaseDelay', 'aBPhaseDelay', 'bCPhaseDelay', 'aCPhaseDelay'],
    ['#MTA', 'mfgCurveMTA', '', '', '', ''],
  ],
  style: (data, metaData) => {
    const length = metaData.body.length + metaData.gridRow.length
    if (data.section === 'body' && data.row.index % length === 0 && [1, 4].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [1, 3].includes(data.row.index % length)) data.cell.styles.fillColor = [206, 212, 218]
  },
}

export const _24$RELA = {
  body: [
    ['#Element Identification', 'elementIdentification', '', ''],
    ['#Setting', '', '', ''],
    ['#Pick Up', 'pickUp', '#Delay (cyc)', 'delayCyc'],
    ['#Test Results', '', '', ''],
    ['#', '', '#Mfg Curve', '#Result'],
    ['#Reach', '', 'mfgCruveReach', 'resultReach'],
    ['#Delay at 110% (cyc)', '', 'mfgCruveDelay', 'resultDelay'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0 && [1].includes(data.column.index)) data.cell.colSpan = 3
    if (data.section === 'body' && data.row.index === 1 && [0].includes(data.column.index)) data.cell.colSpan = 4
    if (data.section === 'body' && data.row.index === 3 && [0].includes(data.column.index)) data.cell.colSpan = 4
    if (data.section === 'body' && [4, 5, 6].includes(data.row.index) && [0].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [1, 3].includes(data.row.index)) data.cell.styles.fillColor = [206, 212, 218]
  },
}

export const _25$RELA = {
  body: [
    ['#Element Identification', 'elementIdentification', '', ''],
    ['#Setting', '', '', ''],
    ['#Voltage Difference', 'voltageDifference', '#Phase Angle', 'phaseAngle'],
    ['#Under Voltage Block', 'underVoltageBlock', '#Over Voltage Block', 'overVoltageBlock'],
    ['#Test Results', '', '', ''],
    ['#', '', '#Mfg Curve', '#Result'],
    ['#Voltage Difference', '', 'mfgCurveVoltageDifference', 'resultVoltageDifference'],
    ['#Phase Angle', '', 'mfgCurvePhaseAngle', 'resultVoltagePhaseAngle'],
    ['#Under Voltage Block', '', 'mfgCurveUnderVoltageBlock', 'resultVoltageUnderVoltageBlock'],
    ['#Over Voltage Block', '', 'mfgCurveOverVoltageBlock', 'resultVoltageOverVoltageBlock'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0 && [1].includes(data.column.index)) data.cell.colSpan = 3
    if (data.section === 'body' && data.row.index === 1 && [0].includes(data.column.index)) data.cell.colSpan = 4
    if (data.section === 'body' && data.row.index === 4 && [0].includes(data.column.index)) data.cell.colSpan = 4
    if (data.section === 'body' && [5, 6, 7, 8, 9].includes(data.row.index) && [0].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [1, 4].includes(data.row.index)) data.cell.styles.fillColor = [206, 212, 218]
  },
}

export const _27$RELA = {
  body: [['#Element Identification', 'elementIdentification', '', '', '']],
  hasGrid: true,
  isNestedGrid: true,
  gridRow: [
    ['#Element No', 'textField', '', '', ''],
    ['#Setting', '', '', '', ''],
    ['#Pick Up', 'pickUp', '#Time Delay', 'timeDelay', ''],
    ['#Test Results', '', '', '', ''],
    ['#', '#Mfg Curve', '#A Phase', '#B Phase', '#C Phase'],
    ['#Pickup', 'mfgCurvePickup', 'aPhasePickup', 'bPhasePickup', 'cPhasePickup'],
    ['#Time Delay', 'mfgCurveTimeDelay', 'aPhaseTimeDelay', 'bPhasePickupTimeDelay', 'cPhaseTimeDelay'],
  ],
  style: (data, metaData) => {
    const length = metaData.gridRow.length
    if (data.section === 'body' && [1].includes(data.row.index % length) && [1].includes(data.column.index)) data.cell.colSpan = 4
    if (data.section === 'body' && [2, 4].includes(data.row.index % length) && [0].includes(data.column.index)) data.cell.colSpan = 5
    if (data.section === 'body' && data.row.index % length === 3 && [3].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [2, 4].includes(data.row.index % length)) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && [0].includes(data.row.index) && [1].includes(data.column.index)) data.cell.colSpan = 4
  },
}

export const _32$RELA = {
  body: [['#Element Identification', '', '', 'elementIdentification', '', '']],
  hasGrid: true,
  isNestedGrid: true,
  gridRow: [
    ['#Element No', '', '', 'textField', '', ''],
    ['#Setting', '', '', '', '', ''],
    ['#Pickup', 'pickup', '#Unit', 'unit', '#Delay (cyc)', 'delayCyc'],
    ['#Test Results', '', '', '', '', ''],
    ['#', '', '#Mfg Curve', '', '#Result', ''],
    ['#Pickup', '', 'mfgCurvePickup', '', 'resultPickup', ''],
    ['#Delay at 100% (cyc)', '', 'mfgCurveDelay', '', 'resultDelay', ''],
  ],
  style: (data, metaData) => {
    const length = metaData.gridRow.length
    if (data.section === 'body' && [1].includes(data.row.index % length) && [0, 3].includes(data.column.index)) data.cell.colSpan = 3
    if (data.section === 'body' && [2, 4].includes(data.row.index % length) && [0].includes(data.column.index)) data.cell.colSpan = 6
    if (data.section === 'body' && [5, 6, 0].includes(data.row.index % length) && [0, 2, 4].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [2, 4].includes(data.row.index % length)) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && [0].includes(data.row.index) && [0, 3].includes(data.column.index)) data.cell.colSpan = 3
  },
}

export const _40$RELA = {
  body: [['#Element Identification', '', '', 'elementIdentification', '', '']],
  hasGrid: true,
  isNestedGrid: true,
  gridRow: [
    ['#Element No', '', '', 'textField', '', ''],
    ['#Setting', '', '', '', '', ''],
    ['#Circle Diameter (Ohms)', 'pickUp', '#Time Delay', 'timeDelay', '#Offset (Ohms)', 'Offset'],
    ['#Test Results', '', '', '', '', ''],
    ['#', '', '#Mfg Curve', '', '#Result', ''],
    ['#Maximum Reach', '', 'mfgCurvePickup', '', 'resultPickup', ''],
    ['#Delay', '', 'mfgCurveDelay', '', 'resultDelay', ''],
  ],
  style: (data, metaData) => {
    const length = metaData.gridRow.length
    if (data.section === 'body' && [1].includes(data.row.index % length) && [0, 3].includes(data.column.index)) data.cell.colSpan = 3
    if (data.section === 'body' && [2, 4].includes(data.row.index % length) && [0].includes(data.column.index)) data.cell.colSpan = 6
    if (data.section === 'body' && [5, 6, 0].includes(data.row.index % length) && [0, 2, 4].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [2, 4].includes(data.row.index % length)) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && [0].includes(data.row.index) && [0, 3].includes(data.column.index)) data.cell.colSpan = 3
  },
}

export const _46$RELA = {
  body: [
    ['#Element Identification', 'elementIdentification', '', ''],
    ['#Setting', '', '', ''],
    ['#Pick Up', 'pickup', '#Delay', 'delay'],
    ['#Test Results', '', '', ''],
    ['#', '', '#Mfg Curve', '#Result'],
    ['#Pickup', '', 'mfgCurvePickup', 'resultPickup'],
    ['#Time Delay at 200%', '', 'mfgCurveTimeDelay200', 'resultTimeDelay200'],
    ['#Time Delay at 300%', '', 'mfgCurveTimeDelay300', 'resultTimeDelay300'],
    ['#Time Delay at 500%', '', 'mfgCurveTimeDelay500', 'resultTimeDelay500'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0 && [1].includes(data.column.index)) data.cell.colSpan = 3
    if (data.section === 'body' && [1, 3].includes(data.row.index) && [0].includes(data.column.index)) data.cell.colSpan = 4
    if (data.section === 'body' && [4, 5, 6, 7, 8].includes(data.row.index) && [0].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [1, 3].includes(data.row.index)) data.cell.styles.fillColor = [206, 212, 218]
  },
}

export const _50$RELA = {
  body: [],
  hasGrid: true,
  isNestedGrid: true,
  gridRow: [
    ['#Element Identification', '', 'elementIdentification', ''],
    ['#Element No', '', 'textField', ''],
    ['#Setting', '', '', ''],
    ['#Pick Up', 'pickUp', '#Time Delay', 'timeDelay'],
    ['#Test Results', '', '', ''],
    ['#', '', '#Mfg Curve', '#Result'],
    ['#Pickup', '', 'mfgCurvePickup', 'resultPickup'],
    ['#Time Delay @ 300%', '', 'mfgCurveDelay', 'resultDelay'],
  ],
  style: (data, metaData) => {
    const length = metaData.body.length + metaData.gridRow.length
    if (data.section === 'body' && [0, 1].includes(data.row.index % length) && [0, 2].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [2, 4].includes(data.row.index % length) && [0].includes(data.column.index)) data.cell.colSpan = 4
    if (data.section === 'body' && [5, 6, 7].includes(data.row.index % length) && [0].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [2, 4].includes(data.row.index % length)) data.cell.styles.fillColor = [206, 212, 218]
  },
}

export const _51$RELA = {
  body: [],
  hasGrid: true,
  isNestedGrid: true,
  gridRow: [
    ['#Element Identification', '', '', 'elementIdentification', ''],
    ['#Element No', '', '', 'textField', ''],
    ['#Setting', '', '', '', ''],
    ['#Pickup', 'pickup', '#Time Dial', 'timeDial', ''],
    ['#Curve', 'curve', '#EM Reset', 'emReset', ''],
    ['#Test Results', '', '', '', ''],
    ['#', '#Mfg Curve', '#A Phase', '#B Phase', '#C Phase'],
    ['#Pickup', 'mfgCurvePickUp', 'aPhasePickup', 'bPhasePickup', 'cPhasePickup'],
    ['#Time Delay at 200%', 'mfgCurveDelay200', 'aPhaseDelay1', 'bPhaseDelay200', 'cPhaseDelay200'],
    ['#Time Delay at 300%', 'mfgCurveDelay300', 'aPhasedelay300', 'bPhaseDelay300', 'cPhaseDelay300'],
    ['#Time Delay at 500%', 'mfgCurveDelay500', 'aPhasedelay500', 'bPhaseDelay500', 'cPhaseDelay500'],
  ],
  style: (data, metaData) => {
    const length = metaData.body.length + metaData.gridRow.length
    if (data.section === 'body' && [0, 1].includes(data.row.index % length) && [0].includes(data.column.index)) data.cell.colSpan = 3
    if (data.section === 'body' && [0, 1, 3, 4].includes(data.row.index % length) && [3].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [2, 5].includes(data.row.index % length) && [0].includes(data.column.index)) data.cell.colSpan = 5
    if (data.section === 'body' && [2, 5].includes(data.row.index % length)) data.cell.styles.fillColor = [206, 212, 218]
  },
}

export const _59$RELA = {
  body: [],
  hasGrid: true,
  isNestedGrid: true,
  gridRow: [
    ['#Element Identification', '', '', 'elementIdentification', ''],
    ['#Element No', '', '', 'textField', ''],
    ['#Setting', '', '', '', ''],
    ['#Pickup', 'pickUp', '#Time Delay', 'timeDelay', ''],
    ['#Test Results', '', '', '', ''],
    ['#', '#Mfg Curve', '#A Phase', '#B Phase', '#C Phase'],
    ['#Pickup', 'mfgCurvePickUp', 'aPhasePickUp', 'bPhasePickUp', 'cPhasePickup'],
    ['#Time Delay', 'mfgCurveTimeDelay', 'aPhaseTimeDelay', 'bPhaseTimeDelay', 'cPhaseTimeDelay'],
  ],
  style: (data, metaData) => {
    const length = metaData.body.length + metaData.gridRow.length
    if (data.section === 'body' && [0, 1].includes(data.row.index % length) && [0].includes(data.column.index)) data.cell.colSpan = 3
    if (data.section === 'body' && [0, 1, 3].includes(data.row.index % length) && [3].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [2, 4].includes(data.row.index % length) && [0].includes(data.column.index)) data.cell.colSpan = 5
    if (data.section === 'body' && [2, 4].includes(data.row.index % length)) data.cell.styles.fillColor = [206, 212, 218]
  },
}

export const _67$RELA = {
  body: [],
  hasGrid: true,
  isNestedGrid: true,
  gridRow: [
    ['#Element Identification', '', '', 'elementIdentification', ''],
    ['#Element No', '', '', 'textField', ''],
    ['#Setting', '', '', '', ''],
    ['#Pickup', 'pickup', '#Time Delay', 'timeDelay', ''],
    ['#Forward Angle', 'forwardAngle', '#Reverse Angle', 'reverseAngle', ''],
    ['#Test Results', '', '', '', ''],
    ['#', '#Mfg Curve', '#A Phase', '#B Phase', '#C Phase'],
    ['#Pickup', 'mfgCurvePickUp', 'aPhasePickup', 'bPhasePickup', 'cPhasePickup'],
    ['#Delay (cyc)', 'mfgCurveDelay', 'aPhaseDelay', 'bPhaseDelay', 'cPhaseDelay'],
    ['#Forward Angle', 'mfgCurveForwardAngle', 'aPhaseForwardAngle', 'bPhaseForwardAngle', 'cPhaseForwardAngle'],
    ['#Reverse Angle', 'mfgCurveReverseAngle', 'aPhaseReverseAngle', 'bPhaseReverseAngle', 'cPhaseReverseAngle'],
  ],
  style: (data, metaData) => {
    const length = metaData.body.length + metaData.gridRow.length
    if (data.section === 'body' && [0, 1].includes(data.row.index % length) && [0].includes(data.column.index)) data.cell.colSpan = 3
    if (data.section === 'body' && [0, 1, 3, 4].includes(data.row.index % length) && [3].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [2, 5].includes(data.row.index % length) && [0].includes(data.column.index)) data.cell.colSpan = 5
    if (data.section === 'body' && [2, 5].includes(data.row.index % length)) data.cell.styles.fillColor = [206, 212, 218]
  },
}

export const _81$RELA = {
  body: [],
  hasGrid: true,
  isNestedGrid: true,
  gridRow: [
    ['#Element Identification', '', 'elementIdentification', ''],
    ['#Element No', '', 'textField', ''],
    ['#Setting', '', '', ''],
    ['#Pick Up', 'pickUp', '#Time Delay', 'timeDelay'],
    ['#Test Results', '', '', ''],
    ['#', '', '#Mfg Curve', '#Result'],
    ['#Pickup', '', 'mfgCurvePickup', 'resultPickup'],
    ['#Time Delay', '', 'mfgCurveTimeDelay', 'resultTimeDelay'],
  ],
  style: (data, metaData) => {
    const length = metaData.body.length + metaData.gridRow.length
    if (data.section === 'body' && [0, 1].includes(data.row.index % length) && [0, 2].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [2, 4].includes(data.row.index % length) && [0].includes(data.column.index)) data.cell.colSpan = 4
    if (data.section === 'body' && [5, 6, 7].includes(data.row.index % length) && [0].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [2, 4].includes(data.row.index % length)) data.cell.styles.fillColor = [206, 212, 218]
  },
}

export const _87$RELA = {
  body: [
    ['#Element Identification', '', 'elementIdentification', '', ''],
    ['#Setting', '', '', '', ''],
    ['#Operating Current Pickup', 'operatingCurrentPickup', '#Restraint Slope 1', 'restraintSlope1', ''],
    ['#Restraint Slope 2', 'restraintSlope2', '#Slope 1 Limit', 'slope1Limit', ''],
    ['#Unrestrained Pickup', 'unrestrainedPickup', '#Second-Harmonic Blocking Percent', 'secondHarmonicBlockingPercent', ''],
    ['#Fourth-Harmonic Blocking Percent', 'fourthHarmonicBlockingPercent', '#Fifth-Harmonic Blocking Percent', 'fifthHarmonicBlockingPercent', ''],
    ['#Test Results', '', '', '', ''],
    ['#', '#Mfg Curve', '#A Phase', '#B Phase', '#C Phase'],
    ['#Unrestrained Pickup', 'mfgCurveUnrestrained', 'aPhaseUnrestrained', 'bPhaseUnrestrained', 'cPhaseUnrestrained'],
    ['#Winding 1 Restrained Pickup', 'mfgCurveWinding1', 'aPhaseWinding1', 'bPhaseWinding1', 'cPhaseWinding1'],
    ['#Winding 2 Restrained Pickup', 'mfgCurveWinding2', 'aPhaseWinding2', 'bPhaseWinding2', 'cPhaseWinding2'],
    ['#', '#Mfg Curve', '', '#Pickup', ''],
    ['#Slope 1', 'mfgCurveSlope', '', 'pickupSlope', ''],
    ['#', '', '#Fundamental Applied (Amps)', '#Mfg Cruve', '#Pickup'],
    ['#2nd Harmonic Block', '', 'fundamentalApplied2ndHarmonic', 'mfgCurve2ndHarmonic', 'pickup2ndHarmonic'],
    ['#4th Harmonic Block', '', 'fundamentalApplied4thHarmonic', 'mfgCurve4thHarmonic', 'pickup4thHarmonic'],
  ],
  style: (data, metaData) => {
    const length = metaData.body.length
    if (data.section === 'body' && [0, 13, 14, 15].includes(data.row.index % length) && [0].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [0].includes(data.row.index % length) && [2].includes(data.column.index)) data.cell.colSpan = 3
    if (data.section === 'body' && [1, 6].includes(data.row.index % length) && [0].includes(data.column.index)) data.cell.colSpan = 5
    if (data.section === 'body' && [2, 3, 4, 5].includes(data.row.index % length) && [3].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [11, 12].includes(data.row.index % length) && [1, 3].includes(data.column.index)) data.cell.colSpan = 2
    if (data.section === 'body' && [1, 6].includes(data.row.index % length)) data.cell.styles.fillColor = [206, 212, 218]
  },
}
