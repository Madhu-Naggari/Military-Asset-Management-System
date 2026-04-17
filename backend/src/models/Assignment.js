import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
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
    assigneeName: {
      type: String,
      required: true,
      trim: true
    },
    assigneeIdentifier: {
      type: String,
      trim: true,
      default: ''
    },
    purpose: {
      type: String,
      trim: true,
      default: ''
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    },
    assignedAt: {
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

assignmentSchema.index({ base: 1, equipmentType: 1, assignedAt: -1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
