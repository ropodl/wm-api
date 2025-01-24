const WasteCollection = require('../model/WasteCollection');

// Controller to fetch waste collection data
exports.getWasteCollection = async (req, res) => {
  try {
    const wasteData = await WasteCollection.findOne(); // Fetching waste collection data
    if (!wasteData) {
      return res.status(404).json({ message: "Waste collection data not found" });
    }
    res.json({ total: wasteData.total }); // Respond with waste collection data
  } catch (error) {
    console.error("Error fetching waste data:", error);
    res.status(500).json({ error: "Unable to fetch waste data" });
  }
};
