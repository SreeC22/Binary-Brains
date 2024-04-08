import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react';

const AboutUsPage = () => {
    return (
        <>
           <Box
            display="flex" flexDirection="column" alignItems="center" w="full" p={{ base: "6", md: "8", lg: "28" }} gap={{ base: "6", md: "8", lg: "20" }} bg={useColorModeValue('gray.100', 'gray.900')} 
          >
            <Text fontSize="5xl" fontWeight="bold" mb="4">
              ABOUT US PAGE 
            </Text>

            <Text textAlign="center" mb="8">
                ABOUT US PAGE 
            </Text>
            </Box>
        </>
    );
};

export default AboutUsPage;
