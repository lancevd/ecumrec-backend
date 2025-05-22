import mongoose from "mongoose";

const counselorSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    role: { type: String, enum: ['staff'], default: 'staff' },
    specialization: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Counselor = mongoose.model("Counselor", counselorSchema);

export default Counselor; 