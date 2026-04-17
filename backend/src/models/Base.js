import mongoose from 'mongoose';

const baseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

const Base = mongoose.model('Base', baseSchema);

export default Base;
