import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import client from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import FilterBar from '../components/FilterBar.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const getToday = () => new Date().toISOString().slice(0, 10);
const getMonthStart = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
};

const TransfersPage = () => {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [filters, setFilters] = useState({
    startDate: getMonthStart(),
    endDate: getToday(),
    baseId: user.assignedBase?._id || '',
    equipmentTypeId: ''
  });
  const [form, setForm] = useState({
    fromBase: user.assignedBase?._id || '',
    toBase: '',
    equipmentType: '',
    quantity: '',
    transferredAt: getToday(),
    reason: ''
  });

  const canSwitchBase = user.role === 'admin';

  const queryParams = useMemo(
    () => ({
      startDate: filters.startDate,
      endDate: filters.endDate,
      baseId: filters.baseId || undefined,
      equipmentTypeId: filters.equipmentTypeId || undefined
    }),
    [filters]
  );

  const fetchLookups = async () => {
    try {
      const [baseResponse, equipmentResponse] = await Promise.all([
        client.get('/lookups/bases'),
        client.get('/lookups/equipment-types')
      ]);

      setBases(baseResponse.data.data);
      setEquipmentTypes(equipmentResponse.data.data);
    } catch (_error) {
      toast.error('Failed to load transfer lookups.');
    }
  };

  const fetchTransfers = async () => {
    try {
      const response = await client.get('/transfers', { params: queryParams });
      setTransfers(response.data.data);
    } catch (_error) {
      toast.error('Failed to load transfer history.');
    }
  };

  useEffect(() => {
    fetchLookups();
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [queryParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await client.post('/transfers', {
        ...form,
        quantity: Number(form.quantity)
      });
      toast.success('Transfer recorded successfully.');
      setForm((current) => ({
        ...current,
        toBase: '',
        equipmentType: '',
        quantity: '',
        reason: ''
      }));
      fetchTransfers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save transfer.');
    }
  };

  return (
    <div className="page-section">
      <PageHeader
        eyebrow="Inter-Base Movement"
        title="Transfer assets with traceable history"
        description="Manage transfers between bases with timestamps, source and destination details, and asset categories."
      />

      <div className="content-grid">
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>New Transfer Request</h3>
          <div className="form-grid">
            <label>
              <span>From Base</span>
              <select
                value={form.fromBase}
                onChange={(event) => setForm((current) => ({ ...current, fromBase: event.target.value }))}
                disabled={!canSwitchBase}
                required
              >
                <option value="">Select source base</option>
                {bases.map((base) => (
                  <option key={base._id} value={base._id}>
                    {base.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>To Base</span>
              <select
                value={form.toBase}
                onChange={(event) => setForm((current) => ({ ...current, toBase: event.target.value }))}
                required
              >
                <option value="">Select destination base</option>
                {bases.map((base) => (
                  <option key={base._id} value={base._id}>
                    {base.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Equipment Type</span>
              <select
                value={form.equipmentType}
                onChange={(event) => setForm((current) => ({ ...current, equipmentType: event.target.value }))}
                required
              >
                <option value="">Select equipment</option>
                {equipmentTypes.map((equipment) => (
                  <option key={equipment._id} value={equipment._id}>
                    {equipment.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Quantity</span>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                required
              />
            </label>

            <label>
              <span>Transfer Date</span>
              <input
                type="date"
                value={form.transferredAt}
                onChange={(event) => setForm((current) => ({ ...current, transferredAt: event.target.value }))}
                required
              />
            </label>

            <label className="full-width">
              <span>Reason</span>
              <textarea
                rows="3"
                value={form.reason}
                onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
              />
            </label>
          </div>

          <button type="submit" className="primary-button">
            Save Transfer
          </button>
        </form>

        <div className="panel-card">
          <FilterBar
            filters={filters}
            onChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))}
            bases={bases}
            equipmentTypes={equipmentTypes}
            allowBaseSelect={canSwitchBase}
          />

          <DataTable
            columns={[
              { key: 'transferredAt', header: 'Date', render: (row) => new Date(row.transferredAt).toLocaleDateString() },
              { key: 'fromBase', header: 'From', render: (row) => row.fromBase?.name },
              { key: 'toBase', header: 'To', render: (row) => row.toBase?.name },
              { key: 'equipmentType', header: 'Equipment', render: (row) => row.equipmentType?.name },
              { key: 'quantity', header: 'Qty' },
              { key: 'reason', header: 'Reason' }
            ]}
            rows={transfers}
          />
        </div>
      </div>
    </div>
  );
};

export default TransfersPage;
