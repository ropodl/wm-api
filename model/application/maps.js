import mongoose from "mongoose";

const recyclingCenterSchema = mongoose.Schema(
  {
    name: { type: String, trim: true, required: true }, // Center name
    slug: { type: String, trim: true, required: true, unique: true }, // Unique identifier
    address: { type: String, trim: true, required: true }, // Center address
    location: {
      type: { type: String, enum: ["Point"], default: "Point" }, // GeoJSON for geospatial data
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    contact: { type: String, trim: true, required: true }, // Contact details
    type: {
      type: [String],
      enum: ["Plastic", "Glass", "Paper", "Metal", "Electronics"],
      required: true,
    }, // Types of waste accepted
    details: { type: String, trim: true }, // Extra details about the center
    status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive"],
      default: "Active",
    }, // Center status
    schedules: [
      {
        day: { type: String, required: true },
        time: { type: String, required: true },
      },
    ], // Collection schedules
  },
  {
    name: "recyclingCenter", // Optional schema name
    timestamps: true, // Add createdAt and updatedAt fields
  }
);

// Create a 2dsphere index for geospatial queries
//RecyclingCenterSchema.index({ location: "2dsphere" });

export default recyclingCenterSchema;
