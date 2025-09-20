import React from 'react';

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
    <div className="mb-6">
        <h4 className="text-lg font-semibold text-blue-300 mb-3 border-b border-blue-300/20 pb-2">{title}</h4>
        <div className="space-y-4">{children}</div>
    </div>
);

export default Section;
