interface InputFilterProps {
  label: string;
  value: string | number | null;
  placeholder: string;
  onChange: (val: string) => void;
}

export const InputFilter: React.FC<InputFilterProps> = ({
  label,
  value,
  placeholder,
  onChange,
}) => (
  <div className="grid gap-1">
    <label className="text-sm font-medium text-black">{label}</label>
    <input
      type="number"
      className="w-full border border-gray-500 px-4 py-3 bg-white rounded-lg ring-0 focus:outline-none  focus:ring-none text-gray-800 text-base placeholder:text-gray-200"
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
