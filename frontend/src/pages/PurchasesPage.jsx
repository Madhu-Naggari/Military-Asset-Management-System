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

const PurchasesPage = () => {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [filters, setFilters] = useState({
    startDate: getMonthStart(),
    endDate: getToday(),
    baseId: user.assignedBase?._id || '',
    equipmentTypeId: ''
  });
  const [form, setForm] = useState({
    base: user.assignedBase?._id || '',
    equipmentType: '',
    quantity: '',
    unitCost: '',
    vendor: '',
    referenceNo: '',
    purchasedAt: getToday(),
    remarks: ''
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
      toast.error('Failed to load purchase lookups.');
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await client.get('/purchases', { params: queryParams });
      setPurchases(response.data.data);
    } catch (_error) {
      toast.error('Failed to load purchase history.');
    }
  };

  useEffect(() => {
    fetchLookups();
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [queryParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await client.post('/purchases', {
        ...form,
        quantity: Number(form.quantity),
        unitCost: Number(form.unitCost || 0)
      });
      toast.success('Purchase recorded successfully.');
      setForm((current) => ({
        ...current,
        equipmentType: '',
        quantity: '',
        unitCost: '',
        vendor: '',
        referenceNo: '',
        remarks: ''
      }));
      fetchPurchases();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save purchase.');
    }
  };

  return (
    <div className="page-section">
      <PageHeader
        eyebrow="Procurement"
        title="Record incoming acquisitions"
        description="Capture new asset purchases for each base and review purchase history with date and equipment filters."
      />

      <div className="content-grid">
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>New Purchase Entry</h3>
          <div className="form-grid">
            <label>
              <span>Base</span>
              <select
                value={form.base}
                onChange={(event) => setForm((current) => ({ ...current, base: event.target.value }))}
                disabled={!canSwitchBase}
                required
              >
                <option value="">Select base</option>
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
              <span>Unit Cost</span>
              <input
                type="number"
                min="0"
                value={form.unitCost}
                onChange={(event) => setForm((current) => ({ ...current, unitCost: event.target.value }))}
              />
            </label>

            <label>
              <span>Vendor</span>
              <input
                type="text"
                value={form.vendor}
                onChange={(event) => setForm((current) => ({ ...current, vendor: event.target.value }))}
              />
            </label>

            <label>
              <span>Reference No.</span>
              <input
                type="text"
                value={form.referenceNo}
                onChange={(event) => setForm((current) => ({ ...current, referenceNo: event.target.value }))}
              />
            </label>

            <label>
              <span>Purchase Date</span>
              <input
                type="date"
                value={form.purchasedAt}
                onChange={(event) => setForm((current) => ({ ...current, purchasedAt: event.target.value }))}
                required
              />
            </label>

            <label className="full-width">
              <span>Remarks</span>
              <textarea
                rows="3"
                value={form.remarks}
                onChange={(event) => setForm((current) => ({ ...current, remarks: event.target.value }))}
              />
            </label>
          </div>

          <button type="submit" className="primary-button">
            Save Purchase
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
              { key: 'purchasedAt', header: 'Date', render: (row) => new Date(row.purchasedAt).toLocaleDateString() },
              { key: 'base', header: 'Base', render: (row) => row.base?.name },
              { key: 'equipmentType', header: 'Equipment', render: (row) => row.equipmentType?.name },
              { key: 'quantity', header: 'Qty' },
              { key: 'vendor', header: 'Vendor' },
              { key: 'referenceNo', header: 'Reference' }
            ]}
            rows={purchases}
          />
        </div>
      </div>
    </div>
  );
};

export default PurchasesPage;
