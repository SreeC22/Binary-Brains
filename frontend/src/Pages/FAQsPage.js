import React from 'react';

import { Box, Text, Button, VStack, Image, HStack,ListItem, ListIcon,List,Grid ,Divider,GridItem, useColorModeValue, Accordion,AccordionItem,AccordionButton,AccordionPanel,Link,AccordionIcon, layout} from '@chakra-ui/react';
import { Flex, Icon,Heading } from '@chakra-ui/react';
import { ChevronRightIcon  } from '@chakra-ui/icons'
import { CheckCircleIcon } from '@chakra-ui/icons';
import { ChevronDownIcon } from '@chakra-ui/icons';
import faqs from './images/faqs.jpg';
const FAQsPage = () => {
    return (
        <>
         <Box className='FAQs'
                  background={`url(${faqs}), lightgray`}
                  bgSize="contain"
                  w="full"
                  h="auto"
                  p={{ base: '6', md: '8', lg: '28' }} 
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap={{ base: '6', md: '8', lg: '20' }} 
                >
              <Flex
                  flexDirection="column"
                  alignItems="center"
                  gap={{ base: '6', md: '8', lg: '20' }} 
                  w={{ base: 'full', md: 'lg', lg: '3xl' }} 
                  px={{ base: '4', lg: '0' }} 
                >               
                 <Text
                  fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }} 
                  fontWeight="700"
                  lineHeight="120%"
                  textAlign="center"
                >FAQs</Text>
                  <Text
                      fontSize={{ base: 'md', md: 'md', lg: 'lg' }}
                      fontWeight="700"
                      lineHeight="150%"
                      textAlign="center"
                    >                    
                  Find answers to common questions about our Code Translation and Conversion Tool.
                  </Text>
                </Flex>
                <Accordion allowMultiple w="full">
                  {[
                    { question: "How does it work?", answer: "Here is how it works. Write your code in one the languages that are available to translate. Simply copy paste that code into our interactive and user friendly Code Translation Page and watch it do the Magic!" },
                    { question: "Is it free?", answer: "Yes, Our service is completely free and available to use for all. I know!! We are just simply that amazing :) " },
                    { question: "Is it secure?", answer: "Security is our top priority. Our Backend is made by our Tech superguru's: Dave Petrovikj and Vanshika Agrawal. They got it all under control" },
                    { question: "Can I trust the translations?", answer: "Our translations are highly accurate. " },
                    { question: "How can I provide feedback?", answer: "Good or Bad, Customer Feedback is extremely important to us as a team. Here is the link to our feedback page.  " },
                  ].map((faq, index) => (
                    <AccordionItem key={index}>
                      {({ isExpanded }) => (
                        <>
                          <h2>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                {faq.question}
                              </Box>
                              <AccordionIcon as={ChevronDownIcon} />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4}>
                            {faq.answer}
                          </AccordionPanel>
                          <Divider />
                        </>
                      )}
                    </AccordionItem>
                  ))}
                </Accordion>
                <Flex flexDirection="column" alignItems="center" gap="24px" w="full">
                <Text
                    fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }} 
                    fontWeight="700"
                    lineHeight="120%"
                    textAlign="center"
                  >Still have questions?</Text>
                  <Text
                    fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
                    fontWeight="400"
                    lineHeight="150%"
                    textAlign="center"
                  >                    Feel free to reach out to us.
                  </Text>
                  <Button variant="outline" borderColor="#000" colorScheme="blackAlpha">
                    Contact
                  </Button>
                </Flex>
              </Box>
        </>
    );
};

// Export the HomePage component
export default FAQsPage;
