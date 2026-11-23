import fs from "node:fs/promises";
import sharp from "sharp";

const [, , inputPath, outputPath, widthArg] = process.argv;
if (!inputPath || !outputPath) {
  throw new Error("Usage: node scripts/build-ar-photo.mjs <image> <output.glb> [width-in-meters]");
}

const width = Number(widthArg ?? 0.3);
if (!Number.isFinite(width) || width < 0.05 || width > 2) throw new Error("Width must be between 0.05 and 2 meters.");
const image = await sharp(inputPath).resize(1024, 1024, { fit: "cover", position: "centre" }).jpeg({ quality: 90 }).toBuffer();

const positions = new Float32Array([-width / 2, 0, -width / 2, width / 2, 0, -width / 2, width / 2, 0, width / 2, -width / 2, 0, width / 2]);
const normals = new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
const texcoords = new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]);
const indices = new Uint16Array([0, 2, 1, 0, 3, 2]);
const chunks = [Buffer.from(positions.buffer), Buffer.from(normals.buffer), Buffer.from(texcoords.buffer), Buffer.from(indices.buffer)];
const viewDescriptors = [];
let offset = 0;
for (let i = 0; i < chunks.length; i++) {
  viewDescriptors.push({ buffer: 0, byteOffset: offset, byteLength: chunks[i].length, ...(i === 3 ? { target: 34963 } : { target: 34962 }) });
  offset += chunks[i].length;
}
if (offset % 4) offset += 4 - (offset % 4);
viewDescriptors.push({ buffer: 0, byteOffset: offset, byteLength: image.length });
chunks.push(Buffer.alloc(offset - chunks.slice(0, 4).reduce((sum, chunk) => sum + chunk.length, 0)), image);
const binaryLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
const document = {
  asset: { version: "2.0", generator: "MesaViva 3D photo AR" },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [{ mesh: 0, name: "Food photo" }],
  meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, material: 0 }] }],
  materials: [{ pbrMetallicRoughness: { baseColorTexture: { index: 0 }, metallicFactor: 0, roughnessFactor: 0.9 }, alphaMode: "OPAQUE", doubleSided: true }],
  textures: [{ sampler: 0, source: 0 }],
  images: [{ bufferView: 4, mimeType: "image/jpeg" }],
  samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 33071, wrapT: 33071 }],
  accessors: [
    { bufferView: 0, componentType: 5126, count: 4, type: "VEC3", min: [-width / 2, 0, -width / 2], max: [width / 2, 0, width / 2] },
    { bufferView: 1, componentType: 5126, count: 4, type: "VEC3" },
    { bufferView: 2, componentType: 5126, count: 4, type: "VEC2" },
    { bufferView: 3, componentType: 5123, count: 6, type: "SCALAR", min: [0], max: [3] },
  ],
  bufferViews: viewDescriptors,
  buffers: [{ byteLength: binaryLength }],
};
let json = Buffer.from(JSON.stringify(document));
const jsonPadding = (4 - (json.length % 4)) % 4;
if (jsonPadding) json = Buffer.concat([json, Buffer.alloc(jsonPadding, 0x20)]);
const binary = Buffer.concat(chunks);
const glbLength = 12 + 8 + json.length + 8 + binary.length;
const header = Buffer.alloc(12);
header.write("glTF", 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(glbLength, 8);
const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(json.length, 0);
jsonHeader.writeUInt32LE(0x4e4f534a, 4);
const binaryHeader = Buffer.alloc(8);
binaryHeader.writeUInt32LE(binary.length, 0);
binaryHeader.writeUInt32LE(0x004e4942, 4);
await fs.writeFile(outputPath, Buffer.concat([header, jsonHeader, json, binaryHeader, binary]));
console.log(`Created ${outputPath} (${width}m photo plane)`);
