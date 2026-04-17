import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import connectDatabase from '../config/database.js';
import Assignment from '../models/Assignment.js';
import AuditLog from '../models/AuditLog.js';
import Base from '../models/Base.js';
import EquipmentType from '../models/EquipmentType.js';
import Expenditure from '../models/Expenditure.js';
import Purchase from '../models/Purchase.js';
import Transfer from '../models/Transfer.js';
import User from '../models/User.js';

dotenv.config();

const seed = async () => {
  await connectDatabase();

  await Promise.all([
    Assignment.deleteMany({}),
    AuditLog.deleteMany({}),
    Expenditure.deleteMany({}),
    Purchase.deleteMany({}),
    Transfer.deleteMany({}),
    User.deleteMany({}),
    Base.deleteMany({}),
    EquipmentType.deleteMany({})
  ]);

  const [alphaBase, bravoBase, charlieBase] = await Base.create([
    { name: 'Alpha Base', code: 'ALP', location: 'Northern Command' },
    { name: 'Bravo Base', code: 'BRV', location: 'Eastern Command' },
    { name: 'Charlie Base', code: 'CHR', location: 'Southern Command' }
  ]);

  const [armoredVehicle, assaultRifle, ammunition] = await EquipmentType.create([
    {
      name: 'Armored Vehicle',
      category: 'vehicle',
      unitOfMeasure: 'units',
      description: 'Protected mobility vehicle'
    },
    {
      name: 'Assault Rifle',
      category: 'weapon',
      unitOfMeasure: 'units',
      description: 'Standard infantry rifle'
    },
    {
      name: '5.56mm Ammunition',
      category: 'ammunition',
      unitOfMeasure: 'rounds',
      description: 'Small arms ammunition'
    }
  ]);

  const passwordHashes = await Promise.all([
    bcrypt.hash('Admin@123', 10),
    bcrypt.hash('Commander@123', 10),
    bcrypt.hash('Logistics@123', 10)
  ]);

  const [adminUser, commanderUser, logisticsUser] = await User.create([
    {
      name: 'System Administrator',
      email: 'admin@milassets.local',
      passwordHash: passwordHashes[0],
      role: 'admin'
    },
    {
      name: 'Commander Arjun Singh',
      email: 'commander.alpha@milassets.local',
      passwordHash: passwordHashes[1],
      role: 'base_commander',
      assignedBase: alphaBase._id
    },
    {
      name: 'Logistics Officer Priya Nair',
      email: 'logistics.alpha@milassets.local',
      passwordHash: passwordHashes[2],
      role: 'logistics_officer',
      assignedBase: alphaBase._id
    }
  ]);

  await Purchase.create([
    {
      base: alphaBase._id,
      equipmentType: armoredVehicle._id,
      quantity: 12,
      unitCost: 210000,
      vendor: 'Defense Motors',
      referenceNo: 'PO-2026-001',
      purchasedAt: new Date(),
      createdBy: adminUser._id
    },
    {
      base: alphaBase._id,
      equipmentType: ammunition._id,
      quantity: 5000,
      unitCost: 2.3,
      vendor: 'Aegis Ordnance',
      referenceNo: 'PO-2026-002',
      purchasedAt: new Date(),
      createdBy: logisticsUser._id
    }
  ]);

  await Transfer.create({
    fromBase: alphaBase._id,
    toBase: bravoBase._id,
    equipmentType: assaultRifle._id,
    quantity: 25,
    reason: 'Force rebalancing',
    transferredAt: new Date(),
    createdBy: logisticsUser._id
  });

  await Expenditure.create({
    base: alphaBase._id,
    equipmentType: ammunition._id,
    quantity: 450,
    reason: 'Live fire training',
    operationReference: 'TRAIN-ALPHA-01',
    expendedAt: new Date(),
    createdBy: commanderUser._id
  });

  console.log('Database seeded successfully.');
  console.log('Login credentials:');
  console.log('Admin: admin@milassets.local / Admin@123');
  console.log('Base Commander: commander.alpha@milassets.local / Commander@123');
  console.log('Logistics Officer: logistics.alpha@milassets.local / Logistics@123');
  process.exit(0);
};

seed().catch((error) => {
  console.error('Seeding failed', error);
  process.exit(1);
});
