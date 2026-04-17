import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import client from "../api/client.js";
import DataTable from "../components/DataTable.jsx";
import FilterBar from "../components/FilterBar.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const getToday = () => new Date().toISOString().slice(0, 10);
const getMonthStart = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
};

const AssignmentsPage = () => {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [filters, setFilters] = useState({
    startDate: getMonthStart(),
    endDate: getToday(),
    baseId: user.assignedBase?._id || "",
    equipmentTypeId: "",
  });
  const [assignmentForm, setAssignmentForm] = useState({
    base: user.assignedBase?._id || "",
    equipmentType: "",
    quantity: "",
    assigneeName: "",
    assigneeIdentifier: "",
    assignedAt: getToday(),
    purpose: "",
    remarks: "",
  });
  const [expenditureForm, setExpenditureForm] = useState({
    base: user.assignedBase?._id || "",
    equipmentType: "",
    quantity: "",
    expendedAt: getToday(),
    reason: "",
    operationReference: "",
    remarks: "",
  });

  const canSwitchBase = user.role === "admin";

  const queryParams = useMemo(
    () => ({
      startDate: filters.startDate,
      endDate: filters.endDate,
      baseId: filters.baseId || undefined,
      equipmentTypeId: filters.equipmentTypeId || undefined,
    }),
    [filters],
  );

  const fetchLookups = async () => {
    try {
      const [baseResponse, equipmentResponse] = await Promise.all([
        client.get("/lookups/bases"),
        client.get("/lookups/equipment-types"),
      ]);

      setBases(baseResponse.data.data);
      setEquipmentTypes(equipmentResponse.data.data);
    } catch (_error) {
      toast.error("Failed to load assignment lookups.");
    }
  };

  const fetchRecords = async () => {
    try {
      const [assignmentResponse, expenditureResponse] = await Promise.all([
        client.get("/assignments", { params: queryParams }),
        client.get("/expenditures", { params: queryParams }),
      ]);

      setAssignments(assignmentResponse.data.data);
      setExpenditures(expenditureResponse.data.data);
    } catch (_error) {
      toast.error("Failed to load assignments or expenditures.");
    }
  };

  useEffect(() => {
    fetchLookups();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [queryParams]);

  const submitAssignment = async (event) => {
    event.preventDefault();

    try {
      await client.post("/assignments", {
        ...assignmentForm,
        quantity: Number(assignmentForm.quantity),
      });
      toast.success("Assignment recorded successfully.");
      setAssignmentForm((current) => ({
        ...current,
        equipmentType: "",
        quantity: "",
        assigneeName: "",
        assigneeIdentifier: "",
        purpose: "",
        remarks: "",
      }));
      fetchRecords();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save assignment.",
      );
    }
  };

  const submitExpenditure = async (event) => {
    event.preventDefault();

    try {
      await client.post("/expenditures", {
        ...expenditureForm,
        quantity: Number(expenditureForm.quantity),
      });
      toast.success("Expenditure recorded successfully.");
      setExpenditureForm((current) => ({
        ...current,
        equipmentType: "",
        quantity: "",
        reason: "",
        operationReference: "",
        remarks: "",
      }));
      fetchRecords();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save expenditure.",
      );
    }
  };

  return (
    <div className="page-section">
      <PageHeader
        eyebrow="Field Accountability"
        title="Assignments and expenditure control"
        description="Issue assets to personnel, record expended items, and preserve a clear operational history for each base."
      />

      <FilterBar
        filters={filters}
        onChange={(field, value) =>
          setFilters((current) => ({ ...current, [field]: value }))
        }
        bases={bases}
        equipmentTypes={equipmentTypes}
        allowBaseSelect={canSwitchBase}
      />

      <div className="double-grid">
        <form className="form-card" onSubmit={submitAssignment}>
          <h3>Assign Asset</h3>
          <div className="form-grid">
            <label>
              <span>Base</span>
              <select
                value={assignmentForm.base}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    base: event.target.value,
                  }))
                }
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
                value={assignmentForm.equipmentType}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    equipmentType: event.target.value,
                  }))
                }
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
                value={assignmentForm.quantity}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    quantity: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label>
              <span>Assignee Name</span>
              <input
                type="text"
                value={assignmentForm.assigneeName}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    assigneeName: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label>
              <span>Service Identifier</span>
              <input
                type="text"
                value={assignmentForm.assigneeIdentifier}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    assigneeIdentifier: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              <span>Assigned Date</span>
              <input
                type="date"
                value={assignmentForm.assignedAt}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    assignedAt: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label>
              <span>Purpose</span>
              <input
                type="text"
                value={assignmentForm.purpose}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    purpose: event.target.value,
                  }))
                }
              />
            </label>

            <label className="full-width">
              <span>Remarks</span>
              <textarea
                rows="3"
                value={assignmentForm.remarks}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    remarks: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <button type="submit" className="primary-button">
            Save Assignment
          </button>
        </form>

        <form className="form-card" onSubmit={submitExpenditure}>
          <h3>Record Expenditure</h3>
          <div className="form-grid">
            <label>
              <span>Base</span>
              <select
                value={expenditureForm.base}
                onChange={(event) =>
                  setExpenditureForm((current) => ({
                    ...current,
                    base: event.target.value,
                  }))
                }
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
                value={expenditureForm.equipmentType}
                onChange={(event) =>
                  setExpenditureForm((current) => ({
                    ...current,
                    equipmentType: event.target.value,
                  }))
                }
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
                value={expenditureForm.quantity}
                onChange={(event) =>
                  setExpenditureForm((current) => ({
                    ...current,
                    quantity: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label>
              <span>Expenditure Date</span>
              <input
                type="date"
                value={expenditureForm.expendedAt}
                onChange={(event) =>
                  setExpenditureForm((current) => ({
                    ...current,
                    expendedAt: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label>
              <span>Reason</span>
              <input
                type="text"
                value={expenditureForm.reason}
                onChange={(event) =>
                  setExpenditureForm((current) => ({
                    ...current,
                    reason: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label>
              <span>Operation Ref.</span>
              <input
                type="text"
                value={expenditureForm.operationReference}
                onChange={(event) =>
                  setExpenditureForm((current) => ({
                    ...current,
                    operationReference: event.target.value,
                  }))
                }
              />
            </label>

            <label className="full-width">
              <span>Remarks</span>
              <textarea
                rows="3"
                value={expenditureForm.remarks}
                onChange={(event) =>
                  setExpenditureForm((current) => ({
                    ...current,
                    remarks: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <button type="submit" className="primary-button">
            Save Expenditure
          </button>
        </form>
      </div>

      <div className="double-grid">
        <div className="panel-card">
          <h3>Assignment History</h3>
          <DataTable
            columns={[
              {
                key: "assignedAt",
                header: "Date",
                render: (row) => new Date(row.assignedAt).toLocaleDateString(),
              },
              { key: "base", header: "Base", render: (row) => row.base?.name },
              {
                key: "equipmentType",
                header: "Equipment",
                render: (row) => row.equipmentType?.name,
              },
              { key: "quantity", header: "Qty" },
              { key: "assigneeName", header: "Assignee" },
              { key: "purpose", header: "Purpose" },
            ]}
            rows={assignments}
          />
        </div>

        <div className="panel-card">
          <h3>Expenditure History</h3>
          <DataTable
            columns={[
              {
                key: "expendedAt",
                header: "Date",
                render: (row) => new Date(row.expendedAt).toLocaleDateString(),
              },
              { key: "base", header: "Base", render: (row) => row.base?.name },
              {
                key: "equipmentType",
                header: "Equipment",
                render: (row) => row.equipmentType?.name,
              },
              { key: "quantity", header: "Qty" },
              { key: "reason", header: "Reason" },
              { key: "operationReference", header: "Operation Ref." },
            ]}
            rows={expenditures}
          />
        </div>
      </div>
    </div>
  );
};

export default AssignmentsPage;
