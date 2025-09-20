import React from 'react';
import { SelectOptions } from '../../types';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    name: string;
    options: SelectOptions;
    defaultOption?: string;
    tooltip?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, name, options = [], defaultOption = "Pilih...", required, className = "", tooltip, ...props }) => (
    <div className="relative group">
        <label htmlFor={name} className="block text-gray-300 text-sm font-medium mb-1">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        <select
            id={name}
            name={name}
            required={required}
            className={`w-full p-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
            {...props}
        >
            <option value="">{defaultOption}</option>
            {options.map(option => {
                if ('options' in option) { // Check if it's an OptionGroup
                    return (
                        <optgroup key={option.label} label={`--- ${option.label} ---`}>
                            {option.options.map(subOption => (
                                <option key={subOption.value} value={subOption.value}>
                                    {subOption.label}
                                </option>
                            ))}
                        </optgroup>
                    );
                }
                // It's a regular Option
                return (
                    <option key={option.value} value={option.value}>{option.label}</option>
                );
            })}
        </select>
        {tooltip && (
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">
                {tooltip}
            </span>
        )}
    </div>
);

export default SelectField;