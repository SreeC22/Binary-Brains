import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react';

const DocumentationPage = () => {
    return (
        <>
        <Box
            display="flex" flexDirection="column" alignItems="center" w="full" p={{ base: "6", md: "8", lg: "28" }} gap={{ base: "6", md: "8", lg: "20" }} bg={useColorModeValue('gray.100', 'gray.900')} 
          >
            <Text fontSize="5xl" fontWeight="bold" mb="4">
              Documentation Page
            </Text>

            <Text textAlign="center" mb="8">
              Find detailed information and guides on how to use our Code Translation and Conversion Tool effectively.
            </Text>
            </Box>
        </>
    );
};

export default DocumentationPage;
