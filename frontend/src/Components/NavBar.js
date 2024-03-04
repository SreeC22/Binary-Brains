import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import './navbar.css'; // Ensure this is the correct path to your CSS file

const NavBar = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Initialize dark mode state from local storage or system preference
        const savedMode = localStorage.getItem('darkMode');
        return savedMode === 'true' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        // Update body class and local storage when dark mode state changes
        document.body.classList.toggle('dark-mode', isDarkMode);
        localStorage.setItem('darkMode', isDarkMode);
    }, [isDarkMode]);

    const toggleColorMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <div className="Content">
            <div className="Logo">
                <NavLink to="/" className="BBLogo">Binary Brains</NavLink>
            </div>
            <div className="NavLinks">
                <NavLink to="/translate" className="NavbarLink" activeClassName="NavbarLinkActive">Translate Code</NavLink>
                <NavLink to="/code-conversion" className="NavbarLink" activeClassName="NavbarLinkActive">Code Conversion</NavLink>
                <NavLink to="/feedback" className="NavbarLink" activeClassName="NavbarLinkActive">Feedback</NavLink>
                {/* Dropdown Menu Trigger */}
                <div className="Dropdown">
                    <button className="NavbarLink DropdownButton">Menu</button>
                    <div className="DropdownContent">
                        <NavLink to="/documentation" className="DropdownItem">Documentation</NavLink>
                        <NavLink to="/faq" className="DropdownItem">FAQ's</NavLink>
                        <NavLink to="/tutorial" className="DropdownItem">Tutorial</NavLink>
                    </div>
                </div>
            </div>
            <div className="Actions">
                <NavLink to="/login" className="Button">Login</NavLink>
                <button onClick={toggleColorMode} className="ToggleModeButton">
                    {isDarkMode ? <FaSun className="icon" /> : <FaMoon className="icon" />}
                </button>
            </div>
        </div>
    );
};

export default NavBar;
