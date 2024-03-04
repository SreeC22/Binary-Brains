import React from 'react';
import { Box, Text, Button, VStack, Image, HStack,ListItem, ListIcon,List,Grid ,Divider,GridItem, useColorModeValue, Accordion,AccordionItem,AccordionButton,AccordionPanel,Link,AccordionIcon, layout} from '@chakra-ui/react';

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
