export const groundFaultRelaySettings$FSGR = {
  body: [
    ['#Element', 'bElementB', '#AS FOUND', '#AS LEFT'],
    ['#Pick Up in Amperes', '', 'asFoundinAmperes', 'asLeftInAmperes'],
    ['#Time Delay in Seconds', '', 'asFoundInSeconds', 'asLeftInSeconds'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index > 0 && [0].includes(data.column.index)) data.cell.colSpan = 2
  },
}
export const electricalTests$FSGR = {
  body: [
    ['', '#AS FOUND', '#AS LEFT'],
    ['#Neutral-Ground Isolation in Ohms', 'asFoundInOhms', 'asLeftInOhms'],
    ['#Primary Injection Pick-Up in Amps', 'asFoundInAmps', 'asLeftInAmps'],
  ],
  style: data => {},
}
export const pickupTests$FSGR = {
  body: [
    ['#CONDITIONS', '', `#MANUFACTURER'S CURVE`, ''],
    ['#Long Time Pick-Up in seconds at', 'percentPickUp', '#Minimum', 'curveMin'],
    ['#Equal to', 'equalToAmps', '#Maximum', 'curveMax'],
    ['#AS FOUND', 'asFound', '#AS LEFT', 'asLeft'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0 && [0, 2].includes(data.column.index)) data.cell.colSpan = 2
  },
}
