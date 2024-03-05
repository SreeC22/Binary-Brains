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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from './AuthContext'; // Adjust this path as necessary
import './navbar.css'; // Ensure this path is correct

const NavBar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth(); // Destructure logout function from useAuth
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Invoke the logout function
    navigate('/login'); // Optionally redirect to login page after logout
  };

  const toggleIcon = colorMode === 'light' ? <FaMoon /> : <FaSun />;

  const bg = useColorModeValue('gray.100', 'gray.700'); // Example color values
  const menuButtonBg = useColorModeValue('white', 'gray.700');

  return (
    <Flex as="nav" align="center" justify="space-between" wrap="wrap" padding="1.5rem" bg={bg} color="black">
      <Box>
        <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Binary Brains
        </RouterLink>
      </Box>
      <Box display="flex" alignItems="center">
        <RouterLink to="/translate" style={{ marginRight: '20px' }}>Translate Code</RouterLink>
        <RouterLink to="/code-conversion" style={{ marginRight: '20px' }}>Code Conversion</RouterLink>
        <RouterLink to="/feedback" style={{ marginRight: '20px' }}>Feedback</RouterLink>

        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg={menuButtonBg}>
            More
          </MenuButton>
          <MenuList>
            <MenuItem as={RouterLink} to="/documentation">Documentation</MenuItem>
            <MenuItem as={RouterLink} to="/tutorial">Tutorial</MenuItem>
            <MenuItem as={RouterLink} to="/faqs">FAQ's</MenuItem>
            <MenuItem as={RouterLink} to="/contactus">Contact Us</MenuItem>
          </MenuList>
        </Menu>
      </Box>
      <Box display="flex" alignItems="center">
        {user ? (
          <>
            <Button onClick={handleLogout} size="sm" mr="4">
              Logout
            </Button>
            <span>Hi, {user.name || user.email}</span>
          </>
        ) : (
          <RouterLink to="/login">
            <Button size="sm">Login</Button>
          </RouterLink>
        )}
        <IconButton
          onClick={toggleColorMode}
          icon={toggleIcon}
          aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          variant="ghost"
          ml="4"
        />
      </Box>
    </Flex>
  );
};

export default NavBar;
