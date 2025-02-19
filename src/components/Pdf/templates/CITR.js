export const insulationResistance$CITR = {
  body: [
    ['', '', '#POLE #1', '#POLE #2', '#POLE #3'],
    ['#PRIMARY TO GROUND', 'primaryToGround', 'primaryToGroundPole1', 'primaryToGroundPole2', 'primaryToGroundPole3'],
    ['#PRIMARY TO SECONDARY', 'primaryToSecondary', 'primaryToSecondaryPole1', 'primaryToSecondaryPole2', 'primaryToSecondaryPole3'],
    ['#SECONDARY TO GROUND', 'secondaryToGround', 'secondaryToGroundPole1', 'secondaryToGroundPole2', 'secondaryToGroundPole3'],
  ],
  style: data => {
    if (data.section === 'body' && data.row.index === 0 && data.column.index === 0) data.cell.colSpan = 2
  },
}
