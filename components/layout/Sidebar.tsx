import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Page, NavigationStructureItem, NavItem as NavItemType, NavGroup } from '../../types';

interface NavItemProps {
    item: NavItemType;
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, currentPage, setCurrentPage }) => (
    <button
        className={`flex items-center gap-3 p-3 rounded-lg w-full text-left transition-all duration-200
            ${currentPage === item.page ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        onClick={() => setCurrentPage(item.page)}
        aria-current={currentPage === item.page ? 'page' : undefined}
    >
        {item.icon}
        <span className="hidden lg:inline">{item.label}</span>
    </button>
);

interface SidebarProps {
    navItems: NavigationStructureItem[];
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, currentPage, setCurrentPage }) => {
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        navItems.forEach(item => {
            if ('children' in item) {
                // Automatically open the group that contains the current page on initial load
                if (item.children.some(child => child.page === currentPage)) {
                    initialState[item.label] = true;
                }
            }
        });
        return initialState;
    });

    const toggleGroup = (label: string) => {
        setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <nav className="bg-gray-800 p-4 lg:w-64 flex flex-col items-center lg:items-start shadow-lg rounded-br-lg rounded-bl-lg lg:rounded-bl-none lg:rounded-tr-lg">
            <h1 className="text-3xl font-bold text-blue-400 mb-0 hidden lg:block">PromptGen</h1>
            <p className="text-sm text-gray-400 mb-6 hidden lg:block">By Sang Pandu Negeri</p>
            <div className="flex lg:flex-col flex-wrap justify-center gap-2 lg:gap-2 w-full">
                {navItems.map(item => {
                    if ('children' in item) { // This is a NavGroup
                        const group = item as NavGroup;
                        const isOpen = openGroups[group.label] || false;
                        const isActive = group.children.some(child => child.page === currentPage);
                        return (
                            <div key={group.label}>
                                <button
                                    className={`flex items-center justify-between gap-3 p-3 rounded-lg w-full text-left transition-all duration-200
                                        ${isActive ? 'text-white' : 'text-gray-300'} hover:bg-gray-700 hover:text-white`}
                                    onClick={() => toggleGroup(group.label)}
                                    aria-expanded={isOpen}
                                >
                                    <div className="flex items-center gap-3">
                                        {group.icon}
                                        <span className="hidden lg:inline">{group.label}</span>
                                    </div>
                                    <div className="hidden lg:inline">
                                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </div>
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
                                    aria-hidden={!isOpen}
                                >
                                    <div className="pt-2 pl-4 space-y-2">
                                        {group.children.map(child => (
                                            <NavItem 
                                                key={child.page}
                                                item={child}
                                                currentPage={currentPage}
                                                setCurrentPage={setCurrentPage}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    // This is a single NavItem
                    return (
                         <NavItem 
                            key={item.page}
                            item={item as NavItemType}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                        />
                    );
                })}
            </div>
        </nav>
    );
};

export default Sidebar;