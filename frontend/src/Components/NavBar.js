// NavBar.js
import React, { useState } from 'react';
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
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun, FaSearch } from 'react-icons/fa';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from './AuthContext'; // Adjust this path as necessary
import './navbar.css'; // Ensure this path is correct

const NavBar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('#fbf2e3', 'gray.700');
  const darkerShade = useColorModeValue('#e0ccb0', 'gray.600');
  const buttonTextColor = useColorModeValue('black', 'white');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleIcon = colorMode === 'light' ? <FaMoon /> : <FaSun />;

  const handleSearch = () => {
    // Implement your search logic here
    console.log('Search Term:', searchTerm);
    onClose();
  };

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1.5rem"
      bg={bg}
      color={buttonTextColor}
    >
      {/* Left side - Branding */}
      <Box>
        <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Binary Brains
        </RouterLink>
      </Box>

      {/* Center - Navigation Links */}
      <Box display="flex" alignItems="center">        
      <RouterLink to="/translate" style={{ marginRight: '20px', color: 'inherit' }}>Translate Code</RouterLink>
      <RouterLink to="/feedback" style={{ marginRight: '20px', color: 'inherit' }}>Feedback</RouterLink>

        {/* More Dropdown */}
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg={darkerShade}>
            More
          </MenuButton>
          <MenuList>
            <MenuItem as={RouterLink} to="/documentation">Documentation</MenuItem>
            <MenuItem as={RouterLink} to="/faqs">FAQ's</MenuItem>
            <MenuItem as={RouterLink} to="/contactus">Contact Us</MenuItem>
          </MenuList>
        </Menu>
      </Box>

      {/* Right side - Authentication & Theme Toggle */}
      <Box display="flex" alignItems="center">
        {/* Authentication */}
        {user ? (
          <>
            <Button onClick={handleLogout} size="sm" mr="4" bg={darkerShade} color={buttonTextColor}>
              Logout
            </Button>
            <span>Hi, {user.name || user.email}</span>
          </>
        ) : (
          <RouterLink to="/login">
            <Button size="sm" bg={darkerShade} color={buttonTextColor}>Login/Register</Button>
          </RouterLink>
        )}

        {/* Theme Toggle */}
        <IconButton
          onClick={toggleColorMode}
          icon={toggleIcon}
          aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          variant="ghost"
          ml="4"
        />

        {/* Search Button */}
        <IconButton
          onClick={onOpen}
          icon={<FaSearch />}
          aria-label="Search"
          variant="ghost"
          ml="4"
        />
      </Box>

      {/* Search Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Search for anything</ModalHeader>
          <ModalCloseButton />
          <Input
            placeholder="Type here..."
            my={4}
            mx={3}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={event => {
              if (event.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <Button onClick={handleSearch} colorScheme="blue" my={4} mx={4}>
            Search
          </Button>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default NavBar;


