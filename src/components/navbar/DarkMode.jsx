
import React, { useEffect, useState } from 'react';

export default function DarkMode() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Check for saved theme preference in localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setDarkMode(savedTheme === 'dark');
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        }
    }, []);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
        const newTheme = darkMode ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme); // Save theme preference
    };

    return (
        <div >
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={darkMode}
                    onChange={toggleTheme}
                    placeholder={darkMode ? 'Dark' : 'Light'}
                />
                <div className="w-5 h-3 bg-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary
                 dark:bg-gray-700 rounded-full peer dark:peer-focus:ring-secondary peer-checked:after:translate-x-full 
                 peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[2px]
                  after:bg-primary after:border-gray-300 after:border after:rounded-full after:h-2 
                after:w-2 after:transition-all dark:border-gray-600 peer-checked:bg-primary text-sm"></div>
            </label>
        </div>
    );
}
