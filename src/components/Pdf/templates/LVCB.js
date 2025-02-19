export const tripUnitInformation = {
  body: [
    ['#Trip Unit Manufacturer', 'tripManufacturer', '#Trip Module Ampere Rating', 'tripModuleAmpereRating'],
    ['#Trip Unit Catalog Number', 'tripCatalogNumber', '#Trip Unit Model', 'tripModel'],
    ['#Sensor (CT) Ampere Rating', 'tripSensorCtAmpereRating', '#Plug Ampere Rating', 'tripPlugAmpereRating'],
  ],
  style: data => {
    if (data.section === 'body' && [0, 2].includes(data.column.index)) {
      data.cell.styles.textColor = [119, 136, 153]
    }
  },
}

export const tripUnitSettings = {
  body: [
    ['#LONG TIME Element', '#Ranges', '#As Found', '#As Left', '#As Tested'],
    ['#PICK-UP', 'longtimePickUpRanges', 'longtimePickUpAsFound', 'longtimePickUpAsLeft', 'longtimePickUpAsTested'],
    ['#DELAY', 'longtimeDelayRanges', 'longtimeDelayAsFound', 'longtimeDelayAsLeft', 'longtimeDelayAsTested'],
    ['#SHORT TIME Element', '#Ranges', '#As Found', '#As Left', '#As Tested'],
    ['#PICK-UP', 'shorttimePickUpRanges', 'shorttimePickUpAsFound', 'shorttimePickUpAsLeft', 'shorttimePickUpAsTested'],
    ['#DELAY', 'shorttimeDelayRanges', 'shorttimeDelayAsFound', 'shorttimeDelayAsLeft', 'shorttimeDelayAsTested'],
    ['#I²T', 'shorttimeI2tRanges', 'shorttimeI2tAsFound', 'shorttimeI2tAsLeft', 'shorttimeI2tAsTested'],
    ['#GROUND FAULT Element', '#Ranges', '#As Found', '#As Left', '#As Tested'],
    ['#PICK-UP', 'groundFaultPickUpRanges', 'groundFaultPickUpAsFound', 'groundFaultPickUpAsLeft', 'groundFaultPickUpAsTested'],
    ['#DELAY', 'groundFaultDelayRanges', 'groundFaultDelayAsFound', 'groundFaultDelayAsLeft', 'groundFaultDelayAsTested'],
    ['#I²T', 'groundFaultI2tRanges', 'groundFaultI2tAsFound', 'groundFaultI2tAsLeft', 'groundFaultI2tAsTested'],
    ['#INSTANTANEOUS Element', '#Ranges', '#As Found', '#As Left', '#As Tested'],
    ['#PICK-UP', 'instantaneousPickUpRanges', 'instantaneousPickUpAsFound', 'instantaneousPickUpAsLeft', 'instantaneousPickUpAsTested'],
  ],
  style: data => {
    if (data.section === 'body' && data.column.index === 0) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && [0, 3, 7, 11].includes(data.row.index)) data.cell.styles.fillColor = [206, 212, 218]
  },
}

export const insulationResistancePoleToPole = {
  body: [
    ['', '', '', '#POLE 1', '#POLE 2', '#POLE 3'],
    ['testVoltage', '', '#AS FOUND', 'p1AsFound', 'p2AsFound', 'p3AsFound'],
    ['', '', '#AS LEFT', 'p1AsLeft', 'p2AsLeft', 'p3AsLeft'],
  ],
  style: data => {
    if (data.section === 'body' && data.column.index === 0 && data.row.index === 0) data.cell.colSpan = 3
    if (data.section === 'body' && data.column.index === 0 && data.row.index === 1) data.cell.colSpan = 2
    if (data.section === 'body' && data.column.index === 0 && data.row.index === 2) data.cell.colSpan = 2
  },
}

export const longtimeElements = {
  body: [
    ['#Delay in seconds at:', '', '', 'percentPickUp'],
    ['#Delay Equal to:', '', '', 'equalToAmps'],
    [`#Manufacturer's curve minimum`, '', '', 'curveMin'],
    [`#Manufacturer's curve maximum`, '', '', 'curveMax'],
    [`#`, '#POLE 1', '#POLE 2', '#POLE 3'],
    [`#AS FOUND`, 'pole1', 'pole2', 'pole3'],
    [`#AS LEFT`, 'pole1Left', 'pole2Left', 'pole3Left'],
  ],
  style: data => {
    if (data.section === 'body' && data.column.index === 0 && data.row.index < 4) data.cell.colSpan = 3
    if (data.section === 'body' && data.column.index === 0 && data.row.index > 3) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && data.row.index === 4) data.cell.styles.fillColor = [206, 212, 218]
  },
}

export const instantaneousElements = {
  body: [
    [`#Manufacturer's curve minimum`, '', '', 'curveMinIe'],
    [`#Manufacturer's curve maximum`, '', '', 'curveMaxIe'],
    [`#`, '#POLE 1', '#POLE 2', '#POLE 3'],
    [`#AS FOUND`, 'pole1', 'pole2', 'pole3'],
    [`#AS LEFT`, 'pole1Left', 'pole2Left', 'pole3Left'],
  ],
  style: data => {
    if (data.section === 'body' && data.column.index === 0 && data.row.index < 2) data.cell.colSpan = 3
    if (data.section === 'body' && data.column.index === 0 && data.row.index > 1) data.cell.styles.fillColor = [206, 212, 218]
    if (data.section === 'body' && data.row.index === 2) data.cell.styles.fillColor = [206, 212, 218]
  },
}

export const nameplateInformation$LVCB = {
  body: [
    [`#Manufacturer`, 'manufacturer', '#Type', 'type'],
    [`#Model`, 'model', '#Serial Number', 'serialNumber'],
    [`#Catalog Number`, 'catalogNumber', '#Voltage Rating', 'voltageRating'],
    [`#Frame Ampere Rating`, 'frameAmpereRating', '#Interrupting kA Rating', 'interruptingKaRating'],
    [`#Tripping Voltage`, 'trippingVoltage', '#Charging Voltage', 'chargingVoltage'],
    [`#Closing Voltage`, 'closingVoltage', '#Shunt Trip Voltage Rating', 'shuntTripVoltageRating'],
  ],
  style: data => {
    if (data.section === 'body' && [0, 2].includes(data.column.index)) data.cell.styles.textColor = [119, 136, 153]
  },
}
