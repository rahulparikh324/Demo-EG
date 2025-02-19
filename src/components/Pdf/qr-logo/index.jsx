import React, { useState, useRef } from 'react'
import useFetchData from 'hooks/fetch-data'
import getBarcodes from 'Services/Asset/get-barcodes'

import createQRPDF from './create-pdf'
import { LOGO } from './logo'
import XLSX from 'xlsx'

const QRCodeList = () => {
  const assetList = [...new Array(6)].map((d, i) => `cvsck-${i + 1}`)
  const URL = 'https://s3-us-east-2.amazonaws.com//conduit-dev-assetimages/638385823192490072.png'
  // const { data } = useFetchData({ fetch: getBarcodes, payload: { assetList }, formatter: d => d.data, externalLoader: true })
  const [images, setImages] = useState([])
  const imageRef = useRef(null)
  const generateImages = () => {
    const width = imageRef.current.width
    const height = imageRef.current.height
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const image = new Image()
    image.onload = async function () {
      // swap height & width when aspect-ratio not 1:1
      canvas.width = height
      canvas.height = width
      ctx.translate(canvas.width, 0) // add translation based on rotation
      ctx.rotate(Math.PI / 2)
      ctx.drawImage(this, 0, 0, width, height)
      canvas.toBlob(blob => {
        console.log('blob', blob)
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = 'rotated'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
    }
    image.crossOrigin = 'anonymous'
    image.src = imageRef.current.src + '?not-from-cache-please'
  }
  const showImage = () => {
    const images = document.querySelectorAll('canvas')
    images.forEach((d, i) => {
      const a = document.createElement('a')
      a.href = d.toDataURL()
      a.download = `QR-${i + 1}.png`
      a.click()
    })
  }

  const generateExcel = () => {
    const wb = XLSX.utils.book_new()
    wb.SheetNames.push('QR Codes')
    const wsData = [[images[0]]]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    wb.Sheets['QR Codes'] = ws
    XLSX.writeFile(wb, 'out.xlsx')
  }
  return (
    <div id='QRD'>
      <button onClick={generateImages}>GENERATE</button>
      <button onClick={showImage}>CREATE</button>
      <img id='IMG' ref={imageRef} src={URL}></img>
    </div>
  )
}

export default QRCodeList
