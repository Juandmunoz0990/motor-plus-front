const FormSelect = ({ label, name, value, onChange, error, required = false, options = [], placeholder, ...props }) => {
  // Si la primera opción tiene value vacío, usarla como placeholder
  const hasEmptyOption = options.length > 0 && options[0].value === '';
  const displayOptions = hasEmptyOption ? options : [{ value: '', label: placeholder || 'Seleccionar...' }, ...options];
  
  return (
    <div className="mb-4">
      <label htmlFor={name} className="label">
        {label} {required && <span className="text-accent-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        className={`input ${error ? 'border-accent-500 focus:ring-accent-500' : ''}`}
        required={required}
        {...props}
      >
        {displayOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-accent-600">{error}</p>}
    </div>
  );
};

export default FormSelect;

