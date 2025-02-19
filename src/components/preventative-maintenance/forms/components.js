export const Header = ({ title, subtitle, children }) => (
  <div>
    <div className='text-bold' style={{ fontSize: '32px' }}>
      {title}
    </div>
    {subtitle && (
      <div className='mb-2' style={{ fontSize: '20px' }}>
        {subtitle}
      </div>
    )}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>{children}</div>
  </div>
)

export const ImageEmptyState = ({ label = 'No data found !' }) => (
  <div className='text-bold p-3' style={{ width: '100%', textAlign: 'center', background: '#a6a6a6', opacity: '0.7', borderRadius: '4px' }}>
    {label}
  </div>
)
