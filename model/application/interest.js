import mongoose from "mongoose";

const interestSchema = mongoose.Schema({
    title: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, required: true, unique: true }
},{
    timestamps: ture
})

export default interestSchema;