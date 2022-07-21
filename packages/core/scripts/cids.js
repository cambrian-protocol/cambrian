const ethers = require("ethers");
const CID = require("cids");
const { base58btc } = require("multiformats/bases/base58");
const Block = require("multiformats/block");
const { getBytes32FromMultihash } = require("../helpers/multihash.js");

const bytes = new Uint8Array([
  113, 18, 32, 95, 106, 228, 60, 131, 213, 192, 136, 111, 55, 67, 180, 245, 35,
  105, 244, 131, 152, 33, 31, 74, 235, 218, 107, 222, 79, 59, 30, 70, 193, 75,
  70,
]);

const cid = new CID(bytes);

const getBytes32FromMultihash = (multihash) => {
  const decoded = bs58.decode(multihash);

  return {
    digest: `0x${decoded.slice(2).toString("hex")}`,
    hashFunction: decoded[0],
    size: decoded[1],
  };
};
