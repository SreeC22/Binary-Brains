import React from 'react';
import { Flex, Box, Link, IconButton, useColorMode } from '@chakra-ui/react';
import { FaMoon, FaSun } from 'react-icons/fa';

const NavBar = () => {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Flex as="nav" align="center" justify="space-between" wrap="wrap" padding="1.5rem" bg="blue.500" color="white">
            {/* Logo and Brand Name */}
            <Box w="200px" color="white" fontWeight="bold">
                <Link href="/" _hover={{ textDecoration: 'none' }}>
                    Binary Brains
                </Link>
            </Box>

            {/* Navigation Links */}
            <Box display="flex" width="auto" alignItems="center">
                <Link href="/translate" mr="5" _hover={{ color: 'gray.200' }}>
                    Translate Code
                </Link>
                <Link href="/convert" mr="5" _hover={{ color: 'gray.200' }}>
                    Code Conversion
                </Link>
                <Link href="/feedback" mr="5" _hover={{ color: 'gray.200' }}>
                    Feedback
                </Link>
                {/* More links can be added here */}
            </Box>

            {/* Light/Dark Mode Toggle Button */}
            <IconButton
                icon={colorMode === 'dark' ? <FaSun /> : <FaMoon />}
                onClick={toggleColorMode}
                variant="ghost"
                aria-label={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}
            />
        </Flex>
    );
};

export default NavBar;
