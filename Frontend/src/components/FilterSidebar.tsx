import React from 'react';

import { X, Search, Filter } from 'lucide-react';

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterState {
    search: string;
    statuses: string[];
    startDate: string;
    endDate: string;
    branchId: string; // for backward compatibility or simple view
    originBranchId: string;
    destinationBranchId: string;
}

interface FilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    statusOptions: FilterOption[];
    showBranchFilter?: boolean;
    branches?: { id: number; name: string }[];
    title?: string;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
    isOpen,
    onClose,
    filters,
    setFilters,
    statusOptions,
    showBranchFilter = false,
    branches = [],
    title = "Advanced Search"
}) => {
    const [localFilters, setLocalFilters] = React.useState<FilterState>(filters);

    React.useEffect(() => {
        if (isOpen) {
            setLocalFilters(filters);
        }
    }, [isOpen]); // Only sync when opened

    if (!isOpen) return null;

    const handleStatusToggle = (value: string) => {
        setLocalFilters(prev => ({
            ...prev,
            statuses: prev.statuses.includes(value)
                ? prev.statuses.filter(s => s !== value)
                : [...prev.statuses, value]
        }));
    };

    const handleClear = () => {
        const cleared = {
            search: '',
            statuses: [],
            startDate: '',
            endDate: '',
            branchId: '',
            originBranchId: '',
            destinationBranchId: ''
        };
        setLocalFilters(cleared);
        setFilters(cleared);
        onClose();
    };

    const handleSearch = () => {
        setFilters(localFilters);
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Filter className="w-5 h-5 text-indigo-600" />
                        {title}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Search Field */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Keyword / ID</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input 
                                type="text"
                                value={localFilters.search}
                                onChange={e => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                                placeholder="Search..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>

                    {showBranchFilter && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Origin Branch</label>
                                <select 
                                    value={localFilters.originBranchId}
                                    onChange={e => setLocalFilters(prev => ({ ...prev, originBranchId: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Destination Branch</label>
                                <select 
                                    value={localFilters.destinationBranchId}
                                    onChange={e => setLocalFilters(prev => ({ ...prev, destinationBranchId: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Status Filter */}
                    {statusOptions.length > 0 && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 border border-gray-100 rounded-lg p-2 bg-slate-50">
                                {statusOptions.map(opt => (
                                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1.5 rounded transition">
                                        <input 
                                            type="checkbox"
                                            checked={localFilters.statuses.includes(opt.value)}
                                            onChange={() => handleStatusToggle(opt.value)}
                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Date Range Filter */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date Range</label>
                        <div className="space-y-2">
                            <input 
                                type="date"
                                value={localFilters.startDate}
                                onChange={e => setLocalFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-700"
                            />
                            <div className="text-center text-xs text-gray-400">to</div>
                            <input 
                                type="date"
                                value={localFilters.endDate}
                                onChange={e => setLocalFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-2">
                    <button 
                        onClick={handleSearch}
                        className="w-full px-4 py-2 bg-indigo-600 border border-transparent text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm shadow-sm"
                    >
                        Search
                    </button>
                    <button 
                        onClick={handleClear}
                        className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm shadow-sm"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
        </>
    );
};

export default FilterSidebar;
