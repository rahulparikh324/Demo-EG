import { thermalAnomalyProbableCauseOptions, thermalAnomalyRecommendationOptions, necVoilationOptions, oshaVoilationOptions, thermalClassificationOptions, thermalAnomalySubComponentOptions } from 'components/WorkOrders/onboarding/utils'

export const header = {
  type: 'header',
  title: 'NFPA 70B Standard Energized Thermography Form',
  subTitle: 'Automatic Transfer Switch (<=1000V)',
  components: [
    {
      key: 'temperature',
      label: 'Temperature',
      type: 'input',
      inputType: 'number',
      suffix: '°F',
    },
    {
      key: 'humidity',
      label: 'Humidity',
      type: 'input',
      inputType: 'number',
      suffix: '%',
    },
    {
      key: 'manufacturer',
      label: 'Manufacturer',
      type: 'input',
    },
    {
      key: 'model',
      label: 'Model #',
      type: 'input',
    },
    {
      key: 'voltage',
      label: 'Voltage',
      type: 'input',
    },
    {
      key: 'ratedAmps',
      label: 'Rated Amps',
      type: 'input',
    },
    {
      key: 'aPhaseAmps',
      label: 'A Phase Amps',
      type: 'input',
    },
    {
      key: 'bPhaseAmps',
      label: 'B Phase Amps',
      type: 'input',
    },
    {
      key: 'cPhaseAmps',
      label: 'C Phase Amps',
      type: 'input',
    },
    {
      key: 'neutralPhaseAmps',
      label: 'Neutral Phase Amps',
      type: 'input',
    },
  ],
}

export const containers = [
  {
    type: 'container',
    key: 'thermalAnamolyDetected',
    label: 'Thermal State',
    values: [
      { label: 'OK', value: 'ok' },
      { label: 'NOT OK', value: 'notOk' },
      { label: 'N/A', value: 'nA' },
    ],
    components: [
      {
        key: 'thermalClassification',
        label: 'Thermal Classification',
        type: 'select',
        show: [{ condition: 'test.value', value: 'notOk' }],
        values: thermalClassificationOptions,
      },
      {
        key: 'subComponent',
        label: "Sub Component (OCP's)",
        type: 'select',
        show: [{ condition: 'test.value', value: 'notOk' }],
        values: thermalAnomalySubComponentOptions,
      },
      {
        key: 'issueLocation',
        label: 'Issue Location',
        type: 'input',
        show: [{ condition: 'test.value', value: 'notOk' }],
      },
      {
        key: 'measuredTemp',
        label: 'Measured Temp.',
        type: 'input',
        show: [{ condition: 'test.value', value: 'notOk' }],
      },
      {
        key: 'referralTemp',
        label: 'Referral Temp.',
        type: 'input',
        show: [{ condition: 'test.value', value: 'notOk' }],
      },
      {
        key: 'measuredAmps',
        label: 'Measured Amps',
        type: 'input',
        show: [{ condition: 'test.value', value: 'notOk' }],
      },
      {
        key: 'probableCause',
        label: 'Probable Cause',
        type: 'select',
        show: [{ condition: 'test.value', value: 'notOk' }],
        values: thermalAnomalyProbableCauseOptions,
      },
      {
        key: 'recommendation',
        label: 'Recommendation',
        type: 'select',
        show: [{ condition: 'test.value', value: 'notOk' }],
        values: thermalAnomalyRecommendationOptions,
      },
      // {
      //   key: 'additonalIrPhoto',
      //   label: 'Additonal IR Photo',
      //   type: 'input',
      //   show: [{ condition: 'test.value', value: 'notOk' }],
      // },
    ],
    hasGrid: true,
  },
  {
    type: 'container',
    key: 'necViolation',
    label: 'NEC Compliance',
    values: [
      { label: 'OK', value: 'ok' },
      { label: 'NOT OK', value: 'notOk' },
      { label: 'N/A', value: 'nA' },
    ],
    components: [
      {
        key: 'violation',
        label: 'Select Code Violation',
        type: 'select',
        show: [{ condition: 'test.value', value: 'notOk' }],
        values: necVoilationOptions,
      },
    ],
  },
  {
    type: 'container',
    key: 'oshaViolation',
    label: 'OSHA Compliance',
    values: [
      { label: 'OK', value: 'ok' },
      { label: 'NOT OK', value: 'notOk' },
      { label: 'N/A', value: 'nA' },
    ],
    components: [
      {
        key: 'violation',
        label: 'Select Code Violation',
        type: 'select',
        show: [{ condition: 'test.value', value: 'notOk' }],
        values: oshaVoilationOptions,
      },
    ],
  },
]

export const clearPmOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
]

export const additonalPhotosColumns = [
  { label: 'Type', width: '40%' },
  { label: 'Caption', width: '40%' },
  { label: 'Photo', width: '12%' },
  { label: 'Action', width: '8%' },
]

export const irScanPhotosColumns = [
  { label: 'IR Photo #', width: '33%' },
  { label: 'Visual Photo #', width: '33%' },
  { label: 'Type', width: '26%' },
  { label: 'Action', width: '8%' },
]

export const additonalPhotoTypeOptions = [
  { label: 'General', value: 'general' },
  { label: 'Nameplate', value: 'nameplate' },
  { label: 'Before', value: 'before' },
  { label: 'After', value: 'after' },
  { label: 'Environment', value: 'environment' },
]
