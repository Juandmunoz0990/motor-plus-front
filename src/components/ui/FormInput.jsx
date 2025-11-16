const FormInput = ({ label, name, type = 'text', value, onChange, error, required = false, ...props }) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="label">
        {label} {required && <span className="text-accent-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        className={`input ${error ? 'border-accent-500 focus:ring-accent-500' : ''}`}
        required={required}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-accent-600">{error}</p>}
    </div>
  );
};

export default FormInput;

