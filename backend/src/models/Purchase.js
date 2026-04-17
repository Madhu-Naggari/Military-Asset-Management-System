import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
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
    unitCost: {
      type: Number,
      default: 0,
      min: 0
    },
    vendor: {
      type: String,
      trim: true,
      default: ''
    },
    referenceNo: {
      type: String,
      trim: true,
      default: ''
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    },
    purchasedAt: {
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

purchaseSchema.index({ base: 1, equipmentType: 1, purchasedAt: -1 });

const Purchase = mongoose.model('Purchase', purchaseSchema);

export default Purchase;
