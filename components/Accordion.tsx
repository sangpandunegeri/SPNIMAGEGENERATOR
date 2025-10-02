import React, { useState, ReactNode } from 'react';
import { ChevronRightIcon } from './icons';

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="py-6 first:pt-0 last:pb-0">
      <h3 className="text-xl font-bold text-gray-800">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center text-left"
          aria-expanded={isOpen}
        >
          <span>{title}</span>
          <ChevronRightIcon className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
        </button>
      </h3>
      <div 
        className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
            <div className="mt-6">
             {children}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Accordion;