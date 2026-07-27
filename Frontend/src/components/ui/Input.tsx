type InputProps = {
  label: string;
  placeholder?: string;
};

function Input({ label, placeholder }: InputProps) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full border px-3 py-2 rounded"
      />
    </div>
  );
}

export default Input;