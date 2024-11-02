const nodeGeocoder = require("node-geocoder")

const opstions = {
    provider : process.env.GEOCODER_PROVIDER,
    httpAdater : "https",
    apikey : process.env.GEOCODER_API_KEY,
    formatter : null
}

const geoCoder = nodeGeocoder(opstions);

module.exports = geoCoder