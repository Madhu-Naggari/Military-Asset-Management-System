import mongoose from 'mongoose';

const expenditureSchema = new mongoose.Schema(
  {
    base: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Base',
      required: true
    },
    equipmentType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EquipmentType',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    operationReference: {
      type: String,
      trim: true,
      default: ''
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    },
    expendedAt: {
      type: Date,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

expenditureSchema.index({ base: 1, equipmentType: 1, expendedAt: -1 });

const Expenditure = mongoose.model('Expenditure', expenditureSchema);

export default Expenditure;
