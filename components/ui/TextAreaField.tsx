import React from 'react';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    name: string;
    tooltip?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, name, required, rows = 3, className = "", tooltip, ...props }) => (
    <div className={`relative group ${className}`}>
        <label htmlFor={name} className="block text-gray-300 text-sm font-medium mb-1">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        <textarea
            id={name}
            name={name}
            required={required}
            rows={rows}
            className={`w-full p-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y`}
            {...props}
        ></textarea>
        {tooltip && (
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">
                {tooltip}
            </span>
        )}
    </div>
);

export default TextAreaField;