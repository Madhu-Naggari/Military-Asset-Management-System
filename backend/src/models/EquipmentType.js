import mongoose from 'mongoose';

const equipmentTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['vehicle', 'weapon', 'ammunition', 'other'],
      required: true
    },
    unitOfMeasure: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
);

const EquipmentType = mongoose.model('EquipmentType', equipmentTypeSchema);

export default EquipmentType;
