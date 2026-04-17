const FilterBar = ({
  filters,
  onChange,
  bases = [],
  equipmentTypes = [],
  allowBaseSelect = true,
  showEquipment = true
}) => (
  <div className="filter-bar">
    <label>
      <span>Start Date</span>
      <input
        type="date"
        value={filters.startDate}
        onChange={(event) => onChange('startDate', event.target.value)}
      />
    </label>

    <label>
      <span>End Date</span>
      <input type="date" value={filters.endDate} onChange={(event) => onChange('endDate', event.target.value)} />
    </label>

    {allowBaseSelect && (
      <label>
        <span>Base</span>
        <select value={filters.baseId} onChange={(event) => onChange('baseId', event.target.value)}>
          <option value="">All Bases</option>
          {bases.map((base) => (
            <option key={base._id} value={base._id}>
              {base.name}
            </option>
          ))}
        </select>
      </label>
    )}

    {showEquipment && (
      <label>
        <span>Equipment Type</span>
        <select
          value={filters.equipmentTypeId}
          onChange={(event) => onChange('equipmentTypeId', event.target.value)}
        >
          <option value="">All Equipment</option>
          {equipmentTypes.map((equipment) => (
            <option key={equipment._id} value={equipment._id}>
              {equipment.name}
            </option>
          ))}
        </select>
      </label>
    )}
  </div>
);

export default FilterBar;
