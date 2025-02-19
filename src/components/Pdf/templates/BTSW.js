export const voltageDrop = {
  body: [
    ['', '', '', '#POLE #1', '#POLE #2', '#POLE #3'],
    ['#Voltage Drop in (mV) at 300%', '#NORMAL', '#As Found', 'normalAsFound1', 'normalAsFound2', 'normalAsFound3'],
    ['', '', '#As Left', 'normalAsLeft1', 'normalAsLeft2', 'normalAsLeft3'],
    ['#Voltage Drop in (mV) at 300%', '#EMERGENCY', '#As Found', 'emergencyAsFound1', 'emergencyAsFound2', 'emergencyAsFound3'],
    ['', '', '#As Left', 'emergencyAsLeft1', 'emergencyAsLeft2', 'emergencyAsLeft3'],
    ['#Voltage Drop in (mV) at 300%', '#BYPASS NORMAL', '#As Found', 'bypassNormalAsFound1', 'bypassNormalAsFound2', 'bypassNormalAsFound3'],
    ['', '', '#As Left', 'bypassNormalAsLeft1', 'bypassNormalAsLeft2', 'bypassNormalAsLeft3'],
    ['#Voltage Drop in (mV) at 300%', '#BYPASS EMERGENCY', '#As Found', 'bypassEmergencyAsFound1', 'bypassEmergencyAsFound2', 'bypassEmergencyAsFound3'],
    ['', '', '#As Left', 'bypassEmergencyAsLeft1', 'bypassEmergencyAsLeft2', 'bypassEmergencyAsLeft3'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0 && data.column.index === 0) data.cell.colSpan = 3
    if (data.section === 'body' && data.row.index % 2 === 1 && [0, 1].includes(data.column.index)) data.cell.rowSpan = 2
  },
}

export const insulationContactResistanceTestData = {
  body: [
    ['', '', '', '#POLE #1', '#POLE #2', '#POLE #3', '#NEUTRAL'],
    ['#Insulation Resistance Pole-to-Pole in Ohms at 1kV DC with Contacts Closed', '#NORMAL', '#As Found', 'normalAsFound1', 'normalAsFound2', 'normalAsFound3', 'normalAsFound4'],
    ['', '', '#As Left', 'normalAsLeft1', 'normalAsLeft2', 'normalAsLeft3', 'normalAsLeft4'],
    ['#Insulation Resistance Pole-to-Pole in Ohms at 1kV DC with Contacts Closed', '#EMERGENCY', '#As Found', 'emergencyAsFound1', 'emergencyAsFound2', 'emergencyAsFound3', 'emergencyAsFound4'],
    ['', '', '#As Left', 'emergencyAsLeft1', 'emergencyAsLeft2', 'emergencyAsLeft3', 'emergencyAsLeft4'],
    ['#Insulation Resistance Across Pole in Ohms at 1kV DC with Contacts Opened', '#NORMAL', '#As Found', 'bypassNormalAsFound1', 'bypassNormalAsFound2', 'bypassNormalAsFound3', 'bypassNormalAsFound4'],
    ['', '', '#As Left', 'bypassNormalAsLeft1', 'bypassNormalAsLeft2', 'bypassNormalAsLeft3', 'bypassNormalAsLeft4'],
    ['#Insulation Resistance Across Pole in Ohms at 1kV DC with Contacts Opened', '#EMERGENCY', '#As Found', 'bypassEmergencyAsFound1', 'bypassEmergencyAsFound2', 'bypassEmergencyAsFound3', 'bypassEmergencyAsFound4'],
    ['', '', '#As Left', 'bypassEmergencyAsLeft1', 'bypassEmergencyAsLeft2', 'bypassEmergencyAsLeft3', 'bypassEmergencyAsLeft4'],

    ['#Contact Resistance in Micro-Ohms', '#NORMAL', '#As Found', 'contactResistanceNormalAsFound1', 'contactResistanceNormalAsFound2', 'contactResistanceNormalAsFound3', 'contactResistanceNormalAsFound4'],
    ['', '', '#As Left', 'contactResistanceNormalAsLeft1', 'contactResistanceNormalAsLeft2', 'contactResistanceNormalAsLeft3', 'contactResistanceNormalAsLeft4'],

    ['#Contact Resistance in Micro-Ohms', '#EMERGENCY', '#As Found', 'contactResistanceEmergencyAsFound1', 'contactResistanceEmergencyAsFound2', 'contactResistanceEmergencyAsFound3', 'contactResistanceEmergencyAsFound4'],
    ['', '', '#As Left', 'contactResistanceEmergencyAsLeft1', 'contactResistanceEmergencyAsLeft2', 'contactResistanceEmergencyAsLeft3', 'contactResistanceEmergencyAsLeft4'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0 && data.column.index === 0) data.cell.colSpan = 3
    if (data.section === 'body' && data.row.index % 2 === 1 && [0, 1].includes(data.column.index)) data.cell.rowSpan = 2
  },
}
