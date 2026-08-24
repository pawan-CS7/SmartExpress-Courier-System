import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
  sublabel?: string;
}

export type OptionItem = SelectOption | string | number;

interface SearchableSelectProps {
  options: OptionItem[];
  value: string | number | null | undefined;
  onChange: (value: any) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  label,
  disabled = false,
  required = false,
  loading = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "object" && opt !== null && "label" in opt
      ? opt
      : { label: String(opt), value: String(opt) }
  );

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  const filteredOptions = normalizedOptions.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={`w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium flex items-center justify-between cursor-pointer transition ${
          disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "hover:border-red-400 focus:ring-2 focus:ring-red-500"
        } ${isOpen ? "ring-2 ring-red-500 border-red-500 bg-white" : ""}`}
      >
        <span className={selectedOption ? "text-gray-900 font-semibold" : "text-gray-400 font-normal"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-red-500" : ""}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-fade-in">
          <div className="p-2 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search..."
              className="w-full bg-transparent text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="p-3 text-center text-xs text-gray-500">Loading options...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-400 font-medium">
                No matching results found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`px-3.5 py-2.5 text-xs font-medium cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? "bg-red-50 text-red-700 font-bold"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div>
                      <div>{opt.label}</div>
                      {opt.sublabel && <div className="text-[10px] text-gray-400 font-normal">{opt.sublabel}</div>}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-red-600 flex-shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default SearchableSelect;
