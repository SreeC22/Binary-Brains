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
    useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import { ChevronDownIcon } from '@chakra-ui/icons';
import './navbar.css'; // Ensure this path is correct

const NavBar = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const toggleIcon = colorMode === 'light' ? <FaMoon color="black" /> : <FaSun color="white" />;

    // Correct use of useColorModeValue for bg and menuButtonBg
    const bg = useColorModeValue('yourLightModeColor', 'yourDarkModeColor'); // Replace with your actual color values
    const menuButtonBg = useColorModeValue('white', 'gray.700');

    return (
        <Flex as="nav" className="Content" bg={bg}>
            <Box className="Logo">
                <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    Binary Brains
                </RouterLink>
            </Box>
            <Flex className="NavLinks" align="center">
                {/* Correct use of RouterLink */}
                <RouterLink to="/translate" className="NavItem">Translate Code</RouterLink>
                <RouterLink to="/code-conversion" className="NavItem">Code Conversion</RouterLink>
                <RouterLink to="/feedback" className="NavItem">Feedback</RouterLink>

                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg={menuButtonBg}>
                        More
                    </MenuButton>
                    <MenuList>
                        {/* Wrap MenuItem content with RouterLink */}
                        <MenuItem as={RouterLink} to="/documentation">Documentation</MenuItem>
                        <MenuItem as={RouterLink} to="/tutorial">Tutorial</MenuItem>
                        <MenuItem as={RouterLink} to="/faqs">FAQ's</MenuItem>
                    </MenuList>
                </Menu>
            </Flex>
            <Flex className="Actions" align="center">
                <RouterLink to="/login" className="NavItem">
                    <Button>Login</Button>
                </RouterLink>
            </Flex>

            <IconButton
                onClick={toggleColorMode}
                icon={toggleIcon}
                aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                variant="ghost"
            />
        </Flex>
    );
};

export default NavBar;
