import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

async function generate() {
  const svgBuffer = readFileSync('public/favicon-light.svg')

  // Generate PNGs at different resolutions
  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer()
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer()
  const png48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer()
  const png180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer()
  const png192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer()
  const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer()

  writeFileSync('public/favicon-16x16.png', png16)
  writeFileSync('public/favicon-32x32.png', png32)
  writeFileSync('public/favicon-48x48.png', png48)
  writeFileSync('public/apple-touch-icon.png', png180)
  writeFileSync('public/android-chrome-192x192.png', png192)
  writeFileSync('public/android-chrome-512x512.png', png512)

  // Construct ICO buffer with 16, 32, 48 PNG frames
  const images = [
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
  ]

  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // Reserved
  header.writeUInt16LE(1, 2) // Type 1 = ICO
  header.writeUInt16LE(images.length, 4) // Number of images

  let offset = 6 + images.length * 16
  const dirEntries = []
  const dataBuffers = []

  for (const img of images) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(img.width === 256 ? 0 : img.width, 0)
    entry.writeUInt8(img.height === 256 ? 0 : img.height, 1)
    entry.writeUInt8(0, 2) // Color palette
    entry.writeUInt8(0, 3) // Reserved
    entry.writeUInt16LE(1, 4) // Color planes
    entry.writeUInt16LE(32, 6) // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8) // Size of image data
    entry.writeUInt32LE(offset, 12) // Offset of image data

    dirEntries.push(entry)
    dataBuffers.push(img.buffer)
    offset += img.buffer.length
  }

  const icoBuffer = Buffer.concat([header, ...dirEntries, ...dataBuffers])
  writeFileSync('public/favicon.ico', icoBuffer)

  // Also copy to official-website repository
  const websitePublic = 'G:/Code/Other/yfy/public'
  writeFileSync(`${websitePublic}/favicon-16x16.png`, png16)
  writeFileSync(`${websitePublic}/favicon-32x32.png`, png32)
  writeFileSync(`${websitePublic}/apple-touch-icon.png`, png180)
  writeFileSync(`${websitePublic}/favicon.ico`, icoBuffer)

  console.log('✅ Successfully generated all brand favicon PNG/ICO assets!')
}

generate().catch((err) => {
  console.error(err)
  process.exit(1)
})
