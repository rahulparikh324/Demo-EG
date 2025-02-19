import React, { useState, useEffect } from 'react'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import Input from '@material-ui/core/Input'
import { useTheme } from '@material-ui/core/styles'

const SearchComponent = ({ setSearchString, searchString = '', placeholder = 'Search', postSearch = () => {}, postClear = () => {} }) => {
  const theme = useTheme()
  const primaryColor = theme.palette.primary.main
  const [searchStringValue, setSearchStringValue] = useState(searchString)
  const handleSearchOnKeyDown = () => {
    setSearchString(searchStringValue)
    postSearch(searchStringValue)
  }
  const clearSearch = () => {
    setSearchString('')
    setSearchStringValue('')
    postClear()
  }
  useEffect(() => {
    if (!searchString.length) {
      setSearchStringValue('')
    }
  }, [searchString])

  return (
    <Input
      placeholder={placeholder}
      startAdornment={
        <InputAdornment position='start'>
          <SearchOutlined style={{ color: primaryColor }} />
        </InputAdornment>
      }
      endAdornment={
        <InputAdornment className='pointerCursor' position='end' onClick={clearSearch}>
          {searchStringValue ? <CloseOutlinedIcon fontSize='small' style={{ color: primaryColor }} /> : ''}
        </InputAdornment>
      }
      value={searchStringValue}
      onChange={e => setSearchStringValue(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && handleSearchOnKeyDown()}
    />
  )
}

export default SearchComponent
