/**
 * Generate placeholder PNG icons for PWA manifest.
 * Run: npx tsx scripts/generate-icons.ts
 *
 * Creates minimal valid amber-colored PNG files.
 * Replace with properly designed icons before launch.
 */

import fs from "fs"
import path from "path"

const iconsDir = path.join(process.cwd(), "public", "icons")

// CRC32 table for PNG chunks
const crcTable: number[] = []
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xEDB88320 ^ (c >>> 1)
    else c = c >>> 1
  }
  crcTable.push(c)
}

function crc(buf: Buffer): number {
  let c = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]!) & 0xFF]! ^ (c >>> 8)
  }
  return (c ^ 0xFFFFFFFF) | 0
}

function deflateStored(data: Buffer): Buffer {
  const maxBlock = 65535
  const blocks: Buffer[] = [Buffer.from([0x78, 0x01])]

  let offset = 0
  while (offset < data.length) {
    const remaining = data.length - offset
    const blockSize = Math.min(remaining, maxBlock)
    const isLast = offset + blockSize >= data.length

    const header = Buffer.alloc(5)
    header.writeUInt8(isLast ? 1 : 0, 0)
    header.writeUInt16LE(blockSize, 1)
    header.writeUInt16LE(blockSize ^ 0xFFFF, 3)
    blocks.push(header)
    blocks.push(data.subarray(offset, offset + blockSize))
    offset += blockSize
  }

  let a = 1
  let b = 0
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]!) % 65521
    b = (b + a) % 65521
  }
  const adler = Buffer.alloc(4)
  const adlerVal = ((b & 0xFFFF) << 16) | (a & 0xFFFF)
  adler.writeUInt32BE(adlerVal >>> 0)
  blocks.push(adler)

  return Buffer.concat(blocks)
}

function createPng(width: number, height: number): Buffer {
  const chunks: Buffer[] = []

  // PNG signature
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))

  // IHDR
  const ihdr = Buffer.alloc(25)
  ihdr.writeUInt32BE(13, 0)
  ihdr.write("IHDR", 4)
  ihdr.writeUInt32BE(width, 8)
  ihdr.writeUInt32BE(height, 12)
  ihdr.writeUInt8(8, 16)  // bit depth
  ihdr.writeUInt8(2, 17)  // RGB
  ihdr.writeUInt8(0, 18)
  ihdr.writeUInt8(0, 19)
  ihdr.writeUInt8(0, 20)
  const ihdrCrc = crc(ihdr.subarray(4, 21))
  ihdr.writeInt32BE(ihdrCrc, 21)
  chunks.push(ihdr)

  // Pixel data — amber (#F59E0B) solid fill
  const rowBytes = 1 + width * 3
  const rawData = Buffer.alloc(rowBytes * height)
  for (let y = 0; y < height; y++) {
    rawData[y * rowBytes] = 0
    for (let x = 0; x < width; x++) {
      const offset = y * rowBytes + 1 + x * 3
      rawData[offset] = 0xF5
      rawData[offset + 1] = 0x9E
      rawData[offset + 2] = 0x0B
    }
  }

  const zlib = deflateStored(rawData)
  const idatLen = Buffer.alloc(4)
  idatLen.writeUInt32BE(zlib.length)
  const idatType = Buffer.from("IDAT")
  const idatCrc = crc(Buffer.concat([idatType, zlib]))
  const idatCrcBuf = Buffer.alloc(4)
  idatCrcBuf.writeInt32BE(idatCrc)
  chunks.push(idatLen, idatType, zlib, idatCrcBuf)

  // IEND
  chunks.push(Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 0xAE, 0x42, 0x60, 0x82]))

  return Buffer.concat(chunks)
}

// Generate icons (small placeholder size — 8x8 amber squares)
const icons = [
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-192.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png",
]

for (const name of icons) {
  const png = createPng(8, 8)
  fs.writeFileSync(path.join(iconsDir, name), png)
  console.log("  ok " + name)
}

// favicon
fs.copyFileSync(
  path.join(iconsDir, "icon-192.png"),
  path.join(process.cwd(), "public", "favicon.ico")
)
console.log("  ok favicon.ico")
console.log("\nPlaceholder icons created. Replace with designed icons before launch.")
