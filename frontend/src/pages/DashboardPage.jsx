import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import client from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import FilterBar from '../components/FilterBar.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const getToday = () => new Date().toISOString().slice(0, 10);
const getMonthStart = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    startDate: getMonthStart(),
    endDate: getToday(),
    baseId: user.assignedBase?._id || '',
    equipmentTypeId: ''
  });
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [netMovementDetails, setNetMovementDetails] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [baseResponse, equipmentResponse] = await Promise.all([
          client.get('/lookups/bases'),
          client.get('/lookups/equipment-types')
        ]);

        setBases(baseResponse.data.data);
        setEquipmentTypes(equipmentResponse.data.data);
      } catch (_error) {
        toast.error('Failed to load filter options.');
      }
    };

    fetchLookups();
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);

      try {
        const response = await client.get('/dashboard/summary', { params: queryParams });
        setSummary(response.data.data.summary);
      } catch (_error) {
        toast.error('Unable to load dashboard summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [queryParams]);

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const openNetMovementDetails = async () => {
    try {
      const response = await client.get('/dashboard/net-movement-details', { params: queryParams });
      setNetMovementDetails(response.data.data);
    } catch (_error) {
      toast.error('Failed to load net movement details.');
    }
  };

  return (
    <div className="page-section">
      <PageHeader
        eyebrow="Operational Overview"
        title="Asset visibility across commands"
        description="Track balances, movements, assignments and expenditures from a single operational dashboard."
      />

      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        bases={bases}
        equipmentTypes={equipmentTypes}
        allowBaseSelect={canSwitchBase}
      />

      {loading ? (
        <div className="empty-state">Loading summary metrics...</div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              label="Opening Balance"
              value={summary?.openingBalance}
              helperText="Opening stock before selected period"
            />
            <StatCard
              label="Closing Balance"
              value={summary?.closingBalance}
              helperText="Available stock after all movements"
              accent="success"
            />
            <StatCard
              label="Net Movement"
              value={summary?.netMovement}
              helperText="Click to view purchases, transfers in and transfers out"
              accent="interactive"
              onClick={openNetMovementDetails}
            />
            <StatCard
              label="Assigned"
              value={summary?.assigned}
              helperText="Assets issued to personnel during period"
            />
            <StatCard
              label="Expended"
              value={summary?.expended}
              helperText="Consumables or assets used during period"
            />
          </div>

          {netMovementDetails && (
            <div className="modal-backdrop" onClick={() => setNetMovementDetails(null)} role="presentation">
              <div className="modal-card" onClick={(event) => event.stopPropagation()} role="presentation">
                <div className="modal-header">
                  <div>
                    <span className="page-eyebrow">Net Movement Breakdown</span>
                    <h3>Purchases, transfers in and transfers out</h3>
                  </div>
                  <button type="button" className="secondary-button" onClick={() => setNetMovementDetails(null)}>
                    Close
                  </button>
                </div>

                <div className="modal-grid">
                  <section>
                    <h4>Purchases</h4>
                    <DataTable
                      columns={[
                        { key: 'purchasedAt', header: 'Date', render: (row) => new Date(row.purchasedAt).toLocaleDateString() },
                        { key: 'base', header: 'Base', render: (row) => row.base?.name },
                        { key: 'equipmentType', header: 'Equipment', render: (row) => row.equipmentType?.name },
                        { key: 'quantity', header: 'Qty' }
                      ]}
                      rows={netMovementDetails.purchases}
                    />
                  </section>

                  <section>
                    <h4>Transfer In</h4>
                    <DataTable
                      columns={[
                        { key: 'transferredAt', header: 'Date', render: (row) => new Date(row.transferredAt).toLocaleDateString() },
                        { key: 'fromBase', header: 'From', render: (row) => row.fromBase?.name },
                        { key: 'equipmentType', header: 'Equipment', render: (row) => row.equipmentType?.name },
                        { key: 'quantity', header: 'Qty' }
                      ]}
                      rows={netMovementDetails.transferIn}
                    />
                  </section>

                  <section>
                    <h4>Transfer Out</h4>
                    <DataTable
                      columns={[
                        { key: 'transferredAt', header: 'Date', render: (row) => new Date(row.transferredAt).toLocaleDateString() },
                        { key: 'toBase', header: 'To', render: (row) => row.toBase?.name },
                        { key: 'equipmentType', header: 'Equipment', render: (row) => row.equipmentType?.name },
                        { key: 'quantity', header: 'Qty' }
                      ]}
                      rows={netMovementDetails.transferOut}
                    />
                  </section>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
