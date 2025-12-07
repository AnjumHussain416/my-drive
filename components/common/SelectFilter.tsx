type SimpleOption = string | number;
type RichOption = { label: string; value: string | number };

interface SelectFilterProps {
  label: string;
  value: string | number | null;
  // Accept simple options (string/number) or rich options ({label, value}).
  options: (SimpleOption | RichOption)[];
  placeholder: string;
  onChange: (val: string) => void;
}

export const SelectFilter: React.FC<SelectFilterProps> = ({
  label,
  value,
  options,
  placeholder,
  onChange,
}) => (
  <div className="grid gap-1">
    <label className="text-sm font-medium text-black">{label}</label>
    <select
      className="w-full border border-gray-500 rounded-lg px-3 py-3 bg-white ring-0 focus:outline-none focus:ring-2 focus:ring-gray-600 text-gray-800 text-base"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => {
        if (typeof opt === "object" && "label" in opt) {
          return (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          );
        }
        return (
          <option key={String(opt)} value={String(opt)}>
            {String(opt)}
          </option>
        );
      })}
    </select>
  </div>
);
