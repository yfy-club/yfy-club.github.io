import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

async function generate() {
  const svgLight = readFileSync('public/favicon-light.svg')
  const svgDark = readFileSync('public/favicon-dark.svg')

  // Super-sampling high DPI rasterizer options
  const render = (svgBuf, size) =>
    sharp(svgBuf, { density: 1200 })
      .resize(size, size, { kernel: 'lanczos3' })
      .sharpen({ sigma: 0.5, m1: 0.5, m2: 2 })
      .png()
      .toBuffer()

  const png16 = await render(svgLight, 16)
  const png32 = await render(svgLight, 32)
  const png48 = await render(svgLight, 48)
  const png96 = await render(svgLight, 96)
  const png180 = await render(svgLight, 180)
  const png192 = await render(svgLight, 192)
  const png512 = await render(svgLight, 512)

  writeFileSync('public/favicon-16x16.png', png16)
  writeFileSync('public/favicon-32x32.png', png32)
  writeFileSync('public/favicon-48x48.png', png48)
  writeFileSync('public/favicon-96x96.png', png96)
  writeFileSync('public/apple-touch-icon.png', png180)
  writeFileSync('public/android-chrome-192x192.png', png192)
  writeFileSync('public/android-chrome-512x512.png', png512)

  // Construct ICO buffer with 16, 32, 48, 64 PNG frames
  const png64 = await render(svgLight, 64)
  const images = [
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
    { width: 64, height: 64, buffer: png64 },
  ]

  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)

  let offset = 6 + images.length * 16
  const dirEntries = []
  const dataBuffers = []

  for (const img of images) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(img.width === 256 ? 0 : img.width, 0)
    entry.writeUInt8(img.height === 256 ? 0 : img.height, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(img.buffer.length, 8)
    entry.writeUInt32LE(offset, 12)

    dirEntries.push(entry)
    dataBuffers.push(img.buffer)
    offset += img.buffer.length
  }

  const icoBuffer = Buffer.concat([header, ...dirEntries, ...dataBuffers])
  writeFileSync('public/favicon.ico', icoBuffer)

  // Sync to official-website
  const websitePublic = 'G:/Code/Other/yfy/public'
  writeFileSync(`${websitePublic}/favicon-16x16.png`, png16)
  writeFileSync(`${websitePublic}/favicon-32x32.png`, png32)
  writeFileSync(`${websitePublic}/favicon-48x48.png`, png48)
  writeFileSync(`${websitePublic}/favicon-96x96.png`, png96)
  writeFileSync(`${websitePublic}/apple-touch-icon.png`, png180)
  writeFileSync(`${websitePublic}/favicon.ico`, icoBuffer)

  console.log('✅ Successfully generated supersampled high-clarity brand favicon assets!')
}

generate().catch((err) => {
  console.error(err)
  process.exit(1)
})
