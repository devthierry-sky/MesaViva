import sharp from "sharp";

function asBuffer(source: Uint8Array) {
  return Buffer.from(source.buffer, source.byteOffset, source.byteLength);
}

export async function buildPhotoAssets(source: Uint8Array, widthMeters = 0.3) {
  if (!Number.isFinite(widthMeters) || widthMeters < 0.05 || widthMeters > 2) {
    throw new Error("Photo model width must be between 0.05 and 2 meters.");
  }

  const photo = await sharp(asBuffer(source))
    .rotate()
    .resize(1024, 1024, { fit: "cover", position: "centre" })
    .jpeg({ quality: 88 })
    .toBuffer();
  const positions = new Float32Array([-widthMeters / 2, 0, -widthMeters / 2, widthMeters / 2, 0, -widthMeters / 2, widthMeters / 2, 0, widthMeters / 2, -widthMeters / 2, 0, widthMeters / 2]);
  const normals = new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
  const texcoords = new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]);
  const indices = new Uint16Array([0, 2, 1, 0, 3, 2]);
  const chunks = [asBuffer(new Uint8Array(positions.buffer)), asBuffer(new Uint8Array(normals.buffer)), asBuffer(new Uint8Array(texcoords.buffer)), asBuffer(new Uint8Array(indices.buffer))];
  const bufferViews: Array<Record<string, number>> = [];
  let offset = 0;
  for (let index = 0; index < chunks.length; index++) {
    bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: chunks[index].length, target: index === 3 ? 34963 : 34962 });
    offset += chunks[index].length;
  }
  const geometryLength = offset;
  if (offset % 4) offset += 4 - (offset % 4);
  bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: photo.length });
  chunks.push(Buffer.alloc(offset - geometryLength), photo);
  const binary = Buffer.concat(chunks);

  const document = {
    asset: { version: "2.0", generator: "MesaViva 3D photo AR" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "Foto do prato" }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, material: 0 }] }],
    materials: [{ pbrMetallicRoughness: { baseColorTexture: { index: 0 }, metallicFactor: 0, roughnessFactor: 0.9 }, alphaMode: "OPAQUE", doubleSided: true }],
    textures: [{ sampler: 0, source: 0 }],
    images: [{ bufferView: 4, mimeType: "image/jpeg" }],
    samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 33071, wrapT: 33071 }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 4, type: "VEC3", min: [-widthMeters / 2, 0, -widthMeters / 2], max: [widthMeters / 2, 0, widthMeters / 2] },
      { bufferView: 1, componentType: 5126, count: 4, type: "VEC3" },
      { bufferView: 2, componentType: 5126, count: 4, type: "VEC2" },
      { bufferView: 3, componentType: 5123, count: 6, type: "SCALAR", min: [0], max: [3] },
    ],
    bufferViews,
    buffers: [{ byteLength: binary.length }],
  };
  let json = Buffer.from(JSON.stringify(document));
  const jsonPadding = (4 - (json.length % 4)) % 4;
  if (jsonPadding) json = Buffer.concat([json, Buffer.alloc(jsonPadding, 0x20)]);
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

  return { photo, model: Buffer.concat([header, jsonHeader, json, binaryHeader, binary]) };
}
