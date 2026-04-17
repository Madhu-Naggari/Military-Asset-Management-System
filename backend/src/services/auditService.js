import AuditLog from '../models/AuditLog.js';

export const createAuditLog = async ({ req, actorId, action, module, resourceId, metadata = {} }) => {
  await AuditLog.create({
    actor: actorId,
    action,
    module,
    resourceId: String(resourceId),
    metadata,
    ipAddress: req.ip,
    userAgent: req.get('user-agent') || ''
  });
};
