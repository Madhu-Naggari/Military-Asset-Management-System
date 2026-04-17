import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema(
  {
    fromBase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Base',
      required: true
    },
    toBase: {
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
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['completed'],
      default: 'completed'
    },
    transferredAt: {
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

transferSchema.index({ fromBase: 1, toBase: 1, equipmentType: 1, transferredAt: -1 });

const Transfer = mongoose.model('Transfer', transferSchema);

export default Transfer;
