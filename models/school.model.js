import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema({
    schoolName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    type: { type: String, required: true }, //secondary, primary, tertiary
    password: { type: String, required: true },
    website: { type: String, required: false },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },

});

const School = mongoose.model("School", schoolSchema);

export default School;
