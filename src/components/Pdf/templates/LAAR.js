export const acLeakageTest = {
  body: [
    ['#Step', '#kV', '#A', '#B', '#C'],
    ['#1', 'step1Kv', 'step1PhaseA', 'step1PhaseB', 'step1PhaseC'],
    ['#2', 'step2Kv', 'step2PhaseA', 'step2PhaseB', 'step2PhaseC'],
    ['#3', 'step3Kv', 'step3PhaseA', 'step3PhaseB', 'step3PhaseC'],
    ['#4', 'step4Kv', 'step4PhaseA', 'step4PhaseB', 'step4PhaseC'],
    ['#5', 'step5Kv', 'step5PhaseA', 'step5PhaseB', 'step5PhaseC'],
  ],
  style: data => {
    if ((data.section === 'body' && data.column.index === 0) || (data.section === 'body' && data.row.index === 0)) {
      data.cell.styles.fillColor = [206, 212, 218]
    }
  },
}
