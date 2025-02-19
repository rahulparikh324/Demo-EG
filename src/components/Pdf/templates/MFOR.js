export const relaySettings = {
  body: [
    ['#Phase Rotation', 'phaseRotation', '#Phase CT Ratio', 'phaseCtRatio', '#Ground CT Ratio', 'groundCtRatio'],
    ['#FUNCTION "50P" PHASE DEFINITE TIME', '', '#Pickup (A)', '*function50PSettings.phasePickup', '#Time Delay (cyc)', '*function50PSettings1.phaseTimeDelay'],
    ['#FUNCTION "50N" NEUTRAL DEFINITE TIME', '', '#Pickup (A)', '*function50NSettings.neutralPickup', '#Time Delay (cyc)', '*function50NSettings1.neutralTimeDelay'],
    ['#FUNCTION "51P" TIME OVERCURRENT', '', '#Pickup (Amps)', '*function51PSettings.pickup', '#Time Dial', '*function51PSettings1.timeDial'],
    ['', '', '#Curve Type', '*function51PSettings.curveType', '#ElectroMechanical Reset', '*function51PSettings1.electroMechanicalReset'],
    ['#FUNCTION "51N" NEUTRAL OVERCURRENT', '', '#Pickup (Amps)', '*function51NSettings.pickup', '#Time Dial', '*function51NSettings1.timeDial'],
    ['', '', '#Curve Type', '*function51NSettings.curveType', '#ElectroMechanical Reset', '*function51NSettings1.electroMechanicalReset'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index > 0 && data.column.index === 0) data.cell.colSpan = 2
    if (data.section === 'body' && [3, 5].includes(data.row.index) && data.column.index === 0) data.cell.rowSpan = 2
  },
}

export const electricalTests = {
  body: [
    ['#FUNCTION "50" INSTANTANEOUS OVERCURRENT', '', '', '', ''],
    ['', `#MANUFACTURER'S CURVE`, '#A', '#B', '#C'],
    ['#Pickup (A)', '~function50InstantaneousOvercurrentTests.mfgCurvePickup|function50InstantaneousOvercurrentTests.overwritePickup', '*function50InstantaneousOvercurrentTests.aPhasePickup', '*function50InstantaneousOvercurrentTests.bPhasePickup', '*function50InstantaneousOvercurrentTests.cPhasePickup'],
    ['#Time Delay (cyc)', '~function50InstantaneousOvercurrentTests.timeDelay|function50InstantaneousOvercurrentTests.overwriteDelay', '*function50InstantaneousOvercurrentTests.aPhaseDelay', '*function50InstantaneousOvercurrentTests.bPhaseDelay', '*function50InstantaneousOvercurrentTests.cPhaseDelay'],

    ['#FUNCTION "51P" PHASE OVERCURRENT', '', '', '', ''],
    ['', `#MANUFACTURER'S CURVE`, '#A', '#B', '#C'],
    ['#Pickup (Amps)', '~function51PhaseOvercurrentTests.mfgCurvePickup|function51PhaseOvercurrentTests.overwritePickup', '*function51PhaseOvercurrentTests.aPhasePickup', '*function51PhaseOvercurrentTests.bPhasePickup', '*function51PhaseOvercurrentTests.cPhasePickup'],
    ['#Delay at 200% PU', '~function51PhaseOvercurrentTests.mfgCurveDelay200|function51PhaseOvercurrentTests.overwriteDelay', '*function51PhaseOvercurrentTests.aPhaseDelay200', '*function51PhaseOvercurrentTests.bPhaseDelay200', '*function51PhaseOvercurrentTests.cPhaseDelay200'],
    ['#Delay at 300% PU', '~function51PhaseOvercurrentTests.mfgCurveDelay300|function51PhaseOvercurrentTests.overwriteDelay2', '*function51PhaseOvercurrentTests.aPhaseDelay300', '*function51PhaseOvercurrentTests.bPhaseDelay300', '*function51PhaseOvercurrentTests.cPhaseDelay300'],
    ['#Delay at 500% PU', '~function51PhaseOvercurrentTests.mfgCurveDelay500|function51PhaseOvercurrentTests.overwriteDelay4', '*function51PhaseOvercurrentTests.aPhaseDelay500', '*function51PhaseOvercurrentTests.bPhaseDelay500', '*function51PhaseOvercurrentTests.cPhaseDelay500'],

    ['#FUNCTION "50N" INSTANTANEOUS NEUTRAL OVERCURRENT', '', '', '', ''],
    ['', `#MANUFACTURER'S CURVE`, '#A', '#B', '#C'],
    ['#Pickup (A)', '~function50NInstantaneousNeutralOvercurrentTests.mfgCurvePickup|function50NInstantaneousNeutralOvercurrentTests.overwritePickup', '*function50NInstantaneousNeutralOvercurrentTests.aPhasePickup', '*function50NInstantaneousNeutralOvercurrentTests.bPhasePickup', '*function50NInstantaneousNeutralOvercurrentTests.cPhasePickup'],
    ['#Time Delay (cyc)', '~function50NInstantaneousNeutralOvercurrentTests.timeDelay|function50NInstantaneousNeutralOvercurrentTests.overwriteDelay', '*function50NInstantaneousNeutralOvercurrentTests.aPhaseDelay', '*function50NInstantaneousNeutralOvercurrentTests.bPhaseDelay', '*function50NInstantaneousNeutralOvercurrentTests.cPhaseDelay'],

    ['#FUNCTION "51N" NEUTRAL OVERCURRENT', '', '', '', ''],
    ['', `#MANUFACTURER'S CURVE`, '#A', '#B', '#C'],
    ['#Pickup (Amps)', '~function51NNeutralOvercurrentTests.mfgCurvePickup|function51NNeutralOvercurrentTests.overwritePickup', '*function51NNeutralOvercurrentTests.aPhasePickup', '*function51NNeutralOvercurrentTests.bPhasePickup', '*function51NNeutralOvercurrentTests.cPhasePickup'],
    ['#Delay at 200% PU', '~function51NNeutralOvercurrentTests.mfgCurveDelay200|function51NNeutralOvercurrentTests.overwriteDelay', '*function51NNeutralOvercurrentTests.aPhaseDelay200', '*function51NNeutralOvercurrentTests.bPhaseDelay200', '*function51NNeutralOvercurrentTests.cPhaseDelay200'],
    ['#Delay at 300% PU', '~function51NNeutralOvercurrentTests.mfgCurveDelay300|function51NNeutralOvercurrentTests.overwriteDelay2', '*function51NNeutralOvercurrentTests.aPhaseDelay300', '*function51NNeutralOvercurrentTests.bPhaseDelay300', '*function51NNeutralOvercurrentTests.cPhaseDelay300'],
    ['#Delay at 500% PU', '~function51NNeutralOvercurrentTests.mfgCurveDelay500|function51NNeutralOvercurrentTests.overwriteDelay4', '*function51NNeutralOvercurrentTests.aPhaseDelay500', '*function51NNeutralOvercurrentTests.bPhaseDelay500', '*function51NNeutralOvercurrentTests.cPhaseDelay500'],
  ],
  style: data => {
    if (data.section === 'body' && data.column.index === 0) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && [0, 4, 10, 14].includes(data.row.index)) data.cell.styles.fillColor = [206, 212, 218]
  },
}
