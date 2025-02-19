export const insulationResistance$BUDC = {
  body: [
    ['#Energized Phase', '', '#A', '#B', '#C'],
    ['#Guarded Phase', '', '#None', '#None', '#None'],
    ['#Grounded Phase', '', '#B,C', '#A,C ', '#A,B'],
    ['#Test Voltage', 'xCHECKBOX-testVoltage', 'phaseATestVoltage', 'phaseBTestVoltage', 'phaseCTestVoltage'],
    ['#Time / Minutes', '', '#RESISTANCE IN OHMS', '#RESISTANCE IN OHMS ', '#RESISTANCE IN OHMS'],
    ['#15 seconds', '  ', 'phaseAResistance1', 'phaseBResistance1', 'phaseCResistance1'],
    ['#30 seconds', '  ', 'phaseAResistance2', 'phaseBResistance2', 'phaseCResistance2'],
    ['#45 seconds', '  ', 'phaseAResistance3', 'phaseBResistance3', 'phaseCResistance3'],
    ['#1 Minute', '  ', 'phaseAResistance4', 'phaseBResistance4', 'phaseCResistance4'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index !== 3 && data.column.index === 0) data.cell.colSpan = 2
  },
}
export const leakageCurrent$BUDC = {
  body: [
    ['#Energized Phase', '', '#A', '#B', '#C'],
    ['#Grounded Phase', '', '#B,C', '#A,C ', '#A,B'],
    ['#Test Voltage', 'xCHECKBOX-testVoltage', 'phaseATestVoltage', 'phaseBTestVoltage', 'phaseCTestVoltage'],
    ['#Leakage in mA', '  ', 'phaseALeakage', 'phaseBLeakage', 'phaseCLeakage'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index !== 2 && data.column.index === 0) data.cell.colSpan = 2
  },
}
