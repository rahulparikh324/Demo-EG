import { jsPDF } from 'jspdf'
import '../Manrope-Regular-normal'
import '../Manrope-Medium-normal'
//import { BG_IMAGE } from './bg'
import { LOGO } from './logo'
import { chunk } from 'lodash'
//

const createQRPDF = async ({ data, images }) => {
  const dataChunks = chunk(data, 10)
  const imageChunks = chunk(images, 10)
  const doc = new jsPDF({ orientation: 'potrait', format: 'A4' })
  //const bg = BG_IMAGE
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth()
  //const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight()
  //doc.addImage(bg, 'JPEG', 0, 0, pageWidth, pageHeight)
  const yMap = { 0: 0, 1: 0, 2: 1, 3: 1, 4: 2, 5: 2, 6: 3, 7: 3, 8: 4, 9: 4 }
  const renderQR = async (data, index) => {
    const top = 22.5 + yMap[index] * 22.5 * 2.2
    const left = index % 2 === 0 ? 10 : pageWidth / 2 + 10
    doc.addImage(LOGO, 'JPEG', left + 32 + 3, top + 1, 32, 16)
    doc.setFont('Manrope-Medium', 'normal')
    doc.setFontSize(9)
    doc.text(data.internal_asset_id, left + 32 + 4, top + 27)
    doc.text('CVS Caremark | ©eGalvanic 2023', left + 32 + 4, top + 31)
    doc.addImage(data.image, 'JPEG', left, top, 32, 32)
  }
  dataChunks.forEach((d, i) => {
    const imChunk = imageChunks[i]
    d.forEach((x, i) => {
      x.image = imChunk[i]
      renderQR(x, i)
    })
    if (i < dataChunks.length - 1) doc.addPage()
  })
  //doc.save('test.pdf')
  window.open(doc.output('bloburl'))
}

export default createQRPDF
