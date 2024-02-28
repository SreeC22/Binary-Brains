import React from 'react';
import {
    Flex,
    Box,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button,
    useColorMode,
    useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import { ChevronDownIcon } from '@chakra-ui/icons';
import './navbar.css'; // Make sure the path to your CSS file is correct

const NavBar = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const icon = useColorModeValue(<FaSun />, <FaMoon />);
    const label = useColorModeValue('Switch to light mode', 'Switch to dark mode');
    const bg = useColorModeValue('yourLightModeColor', 'yourDarkModeColor');
    const menuButtonBg = useColorModeValue('white', 'gray.700'); // Background color for the 'More' button
    const toggleIcon = colorMode === 'light' ? <FaMoon color="black" /> : <FaSun color="white" />;

    return (
        <Flex as="nav" className="Content" bg={bg}>
            <Box className="Logo">
                Binary Brains
            </Box>
            <Flex className="NavLinks" align="center">
                <RouterLink to="/TranslatePage.js" className="NavItem">Translate Code</RouterLink>
                <RouterLink to="/CodeConvertPage.js" className="NavItem">Code Conversion</RouterLink>
                <RouterLink to="/Feedback.js" className="NavItem">Feedback</RouterLink>

                {/* Dropdown Menu for More */}
                <Menu>
                    <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        className="NavItem"
                        bg={menuButtonBg}
                        hover={{ bg: useColorModeValue('gray.200', 'gray.600') }} // Change the background color on hover
                    >
                        More
                    </MenuButton>
                    <MenuList>
                        {/* Add additional MenuItems as needed */}
                        <MenuItem as={RouterLink} to="/Documentation.js">Documentation</MenuItem>
                        <MenuItem as={RouterLink} to="/Tutorial.js">Tutorial</MenuItem>
                        <MenuItem as={RouterLink} to="/faqs.js">FAQ's</MenuItem>
                        {/* ... */}
                    </MenuList>
                </Menu>
            </Flex>
            <Flex className="Actions" align="center">
                <RouterLink to="/LoginPage.js" className="NavItem">
                    <Button>
                        Login
                    </Button>
                </RouterLink>
            </Flex>

            <IconButton
                onClick={toggleColorMode}
                icon={toggleIcon}
                aria-label="Toggle color mode"
                variant="ghost"
            />
        </Flex>
    );
};

export default NavBar;
