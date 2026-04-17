import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    module: {
      type: String,
      required: true,
      trim: true
    },
    resourceId: {
      type: String,
      required: true
    },
    metadata: {
      type: Object,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

auditLogSchema.index({ module: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
