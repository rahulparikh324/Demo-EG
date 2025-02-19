import { tapChangerTemplate, windingInsulationTests, excitingCurrent, physicalAndChemicalTests, dissolvedGasAnalysis, primaryWindingTest, secondaryWindingTest } from './OFTR'
import { acLeakageTest } from './LAAR'
import { dischargeTime } from './HVCB'
import { testData, testData5 } from './SF6V'
import { windingInsulationTestsM400, excitingCurrentM4000, meuTest, secondaryWindingTest$DFTR, transformerTurnsRatioTest, transformerDcInsulationResistance, primaryWindingTest$DFTR } from './DFTR'
import { tripUnitInformation, tripUnitSettings, insulationResistancePoleToPole, longtimeElements, instantaneousElements } from './LVCB'
import { powerFactorTipUpTest, dcInsulationResistance } from './IGDC'
import { relaySettings, electricalTests } from './MFOR'
import { dcHipotReferenceTables, vlfReferenceTable, vlgTanDeltaAPhase, vlfWithstand, insulationResistance } from './HVCS'
import { voltageDrop, insulationContactResistanceTestData } from './BTSW'
import { insulationResistance$BUDC, leakageCurrent$BUDC } from './BUDC'
import { relaySettings$RELA, _21$RELA, _24$RELA, _25$RELA, _27$RELA, _32$RELA, _40$RELA, _46$RELA, _50$RELA, _51$RELA, _59$RELA, _67$RELA, _81$RELA, _87$RELA } from './RELA-LG'
import { groundFaultRelaySettings$FSGR, electricalTests$FSGR, pickupTests$FSGR } from './FSGR'
import { insulationResistanceContactsOpenAndClosed, leakageInMilliamps } from './ARSW'
import { insulationResistance$CITR } from './CITR'
//
const templates = {
  tapChanger: 'tap_changer',
  windingInsulationTests: 'winding_insulation_tests',
  windingInsulationTestsM400: 'winding_insulation_tests_m_4000',
  excitingCurrent: 'exciting_current',
  excitingCurrentM4000: 'exciting_current_m_4000',
  acLeakageTest: 'ac_leakage_test',
  dischargeTime: 'discharge_time',
  testData1: 'test_data_1',
  testData2: 'test_data_2',
  testData3: 'test_data_3',
  testData4: 'test_data_4',
  testData5: 'test_data_5',
  tripUnitInformation: 'trip_unit_information',
  tripUnitSettings: 'trip_unit_settings',
  powerFactorTipUpTest: 'power_factor_tip_up_test',
  insulationResistancePoleToPole: 'insulation_resistance_pole_to_pole',
  insulationResistanceAcrossPole: 'insulation_resistance_across_pole',
  relaySettings: 'relay_settings',
  electricalTests: 'electrical_tests',
  longtimeElements: 'longtime_elements',
  shorttimeElements: 'shorttime_elements',
  groundFaultElements: 'ground_fault_elements',
  instantaneousElements: 'instantaneous_elements',
  meuTest: 'meu',
  primaryWindingTest: 'primary_winding_test',
  primaryWindingTest$DFTR: 'primary_winding_test$DFTR',
  secondaryWindingTest: 'secondary_winding_test',
  secondaryWindingTest$DFTR: 'secondary_winding_test$DFTR',
  transformerTurnsRatioTest: 'transformer_turns_ratio_test',
  transformerTurnsRatioTests: 'transformer_turns_ratio_tests',
  nameplateInformation$LVCB: 'nameplate_information$LVCB',
  dcHipotReferenceTables: 'dc_hipot_reference_tables',
  vlfReferenceTable: 'vlf_reference_table',
  transformerDcInsulationResistance: 'transformer_dc_insulation_resistance',
  dcInsulationResistance: 'dc_insulation_resistance',
  physicalAndChemicalTests: 'physical_and_chemical_tests',
  dissolvedGasAnalysis: 'dissolved_gas_analysis',
  vlgTanDeltaAPhase: 'vlf_tan_delta_a_phase',
  vlgTanDeltaBPhase: 'vlf_tan_delta_b_phase',
  vlgTanDeltaCPhase: 'vlf_tan_delta_c_phase',
  vlfWithstand: 'vlf_withstand',
  insulationResistance: 'insulation_resistance',
  voltageDrop: 'voltage_drop',
  insulationContactResistanceTestData: 'insulation_contact_resistance_test_data',
  insulationResistance$BUDC: 'insulation_resistance$BUDC',
  leakageCurrent$BUDC: 'leakage_current$BUDC',
  relaySettings$RELA: 'relay_settings$RELA',
  _21$RELA: '21$RELA',
  _24$RELA: '24$RELA',
  _25$RELA: '25$RELA',
  _27$RELA: '27$RELA',
  _32$RELA: '32$RELA',
  _40$RELA: '40$RELA',
  _46$RELA: '46$RELA',
  _50$RELA: '50$RELA',
  _51$RELA: '51$RELA',
  _59$RELA: '59$RELA',
  _67$RELA: '67$RELA',
  _81$RELA: '81$RELA',
  _87$RELA: '87$RELA',
  groundFaultRelaySettings$FSGR: 'ground_fault_relay_settings$FSGR',
  electricalTests$FSGR: 'electrical_tests$FSGR',
  pickupTests$FSGR: 'pickup_tests$FSGR',
  timingTests$FSGR: 'timing_tests$FSGR',
  //ARSW
  insulationResistanceContactsOpen: 'insulation_resistance_contacts_open',
  insulationResistanceContactsClosed: 'insulation_resistance_contacts_closed',
  leakageInMilliamps: 'leakage_in_milliamps',
  //
  insulationResistance$CITR: 'insulation_resistance$CITR',
}
//
export const findTemplate = key => {
  switch (key) {
    case templates.tapChanger:
      return tapChangerTemplate
    case templates.windingInsulationTests:
      return windingInsulationTests
    case templates.windingInsulationTestsM400:
      return windingInsulationTestsM400
    case templates.excitingCurrent:
      return excitingCurrent
    case templates.excitingCurrentM4000:
      return excitingCurrentM4000
    case templates.acLeakageTest:
      return acLeakageTest
    case templates.dischargeTime:
      return dischargeTime
    case templates.testData1:
      return testData
    case templates.testData2:
      return testData
    case templates.testData3:
      return testData
    case templates.testData4:
      return testData
    case templates.testData5:
      return testData5
    case templates.tripUnitInformation:
      return tripUnitInformation
    case templates.tripUnitSettings:
      return tripUnitSettings
    case templates.powerFactorTipUpTest:
      return powerFactorTipUpTest
    case templates.insulationResistancePoleToPole:
      return insulationResistancePoleToPole
    case templates.insulationResistanceAcrossPole:
      return insulationResistancePoleToPole
    case templates.relaySettings:
      return relaySettings
    case templates.electricalTests:
      return electricalTests
    case templates.longtimeElements:
      return longtimeElements
    case templates.shorttimeElements:
      return longtimeElements
    case templates.groundFaultElements:
      return longtimeElements
    case templates.instantaneousElements:
      return instantaneousElements
    case templates.meuTest:
      return meuTest
    case templates.primaryWindingTest:
      return primaryWindingTest
    case templates.primaryWindingTest$DFTR:
      return primaryWindingTest$DFTR
    case templates.secondaryWindingTest:
      return secondaryWindingTest
    case templates.secondaryWindingTest$DFTR:
      return secondaryWindingTest$DFTR
    case templates.transformerTurnsRatioTest:
      return transformerTurnsRatioTest
    case templates.transformerTurnsRatioTests:
      return transformerTurnsRatioTest
    case templates.dcHipotReferenceTables:
      return dcHipotReferenceTables
    case templates.vlfReferenceTable:
      return vlfReferenceTable
    case templates.transformerDcInsulationResistance:
      return transformerDcInsulationResistance
    case templates.dcInsulationResistance:
      return dcInsulationResistance
    case templates.physicalAndChemicalTests:
      return physicalAndChemicalTests
    case templates.dissolvedGasAnalysis:
      return dissolvedGasAnalysis
    case templates.vlgTanDeltaAPhase:
      return vlgTanDeltaAPhase
    case templates.vlgTanDeltaBPhase:
      return vlgTanDeltaAPhase
    case templates.vlgTanDeltaCPhase:
      return vlgTanDeltaAPhase
    case templates.vlfWithstand:
      return vlfWithstand
    case templates.insulationResistance:
      return insulationResistance
    case templates.voltageDrop:
      return voltageDrop
    case templates.insulationContactResistanceTestData:
      return insulationContactResistanceTestData
    case templates.insulationResistance$BUDC:
      return insulationResistance$BUDC
    case templates.leakageCurrent$BUDC:
      return leakageCurrent$BUDC

    //rela-lg form
    case templates.relaySettings$RELA:
      return relaySettings$RELA
    case templates._21$RELA:
      return _21$RELA
    case templates._24$RELA:
      return _24$RELA
    case templates._25$RELA:
      return _25$RELA
    case templates._27$RELA:
      return _27$RELA
    case templates._32$RELA:
      return _32$RELA
    case templates._40$RELA:
      return _40$RELA
    case templates._46$RELA:
      return _46$RELA
    case templates._50$RELA:
      return _50$RELA
    case templates._51$RELA:
      return _51$RELA
    case templates._59$RELA:
      return _59$RELA
    case templates._67$RELA:
      return _67$RELA
    case templates._81$RELA:
      return _81$RELA
    case templates._87$RELA:
      return _87$RELA

    case templates.groundFaultRelaySettings$FSGR:
      return groundFaultRelaySettings$FSGR
    case templates.electricalTests$FSGR:
      return electricalTests$FSGR
    case templates.pickupTests$FSGR:
      return pickupTests$FSGR
    case templates.timingTests$FSGR:
      return pickupTests$FSGR
    //ARSW
    case templates.insulationResistanceContactsClosed:
      return insulationResistanceContactsOpenAndClosed
    case templates.insulationResistanceContactsOpen:
      return insulationResistanceContactsOpenAndClosed
    case templates.leakageInMilliamps:
      return leakageInMilliamps
    //
    case templates.insulationResistance$CITR:
      return insulationResistance$CITR

    default:
      return null
  }
}
