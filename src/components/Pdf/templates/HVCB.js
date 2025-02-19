export const dischargeTime = {
  body: [
    ['#Discharge Time Down To', '', '', '', 'dischargeTimeDownTo', '#kV in Seconds'],
    ['#Phase A', 'phaseA', '#Phase B', 'phaseB', '#Phase C', 'phaseC'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0 && data.column.index === 0) {
      data.cell.colSpan = 4
    }
  },
}
