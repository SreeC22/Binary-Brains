// Import React and any necessary hooks or components
import React from 'react';
import bbimage from './images/Code Translation.png';
import homepageimage from './images/Homepage.jpg';
import Page2 from './images/Layout18.jpg';
import faqs from './images/faqs.jpg';
import image3 from './images/image 10.png';
import image6 from './images/image 6.png';
import image1 from './images/layou240.png';
import Layout4 from './images/layout4plcholder.webp';
import logo from './images/logo.jpg';
import ace from 'ace-builds/src-noconflict/ace'; // this isnt used but it needs to be here for it to work. idk why.

import { CheckCircleIcon, ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Divider, Flex, Grid, GridItem, HStack, Heading, Image, List, ListIcon, ListItem, Text, VStack } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import logos1 from './images/logos1.png';
import logos2 from './images/logos2.png';


const HomePage = () => {
  let navigate = useNavigate();
  const goToPage = (path) => {
    navigate(path);
  };
  return (
    <>
      <Box className='HOMEPAGE'
        w="full"
        h="100vh"
        minH="100vh"
        overflow="auto"
      >
        <Box className='Transform Your Code with Ease'
          display="flex"
          w={{ base: "100%" }}
          h={{ base: "auto", lg: "900px" }}
          px={{ base: "4", md: "16", lg: "64px" }}
          alignItems="center"
          flexShrink={0}
          bgImage={`url(${homepageimage})`}
          bgSize="cover"
          bgPos="center"
          loading="lazy"
        >
          <VStack
            alignItems={{ base: "center", md: "flex-start" }}
            spacing={6}
            w={{ base: "100%", md: "560px" }}
            textAlign={{ base: "center", md: "right" }}
          >
            <Text
              fontSize={{ base: "3xl", md: "4xl", lg: "65px" }}
              fontWeight="400"
              lineHeight="120%"
            >
              Transform Your Code with Ease and Efficiency
            </Text>
            <Text
              fontSize={{ base: "md", lg: "18px" }}
              fontWeight="400"
              lineHeight="150%"
            >
              Welcome to our Code Translation and Conversion Tool. Simplify the process of converting code between different languages and improve your development workflow.
            </Text>
            <Box display="flex" w="full" justifyContent={{ base: "center", md: "flex-end" }} pt="4">
              <Button bg="black" color="white" border="1px" borderColor="black" mr="2" onClick={() => goToPage('/translate')}>
                Get Started
              </Button>
              <Button variant="outline" borderColor="black"
                onClick={() => goToPage('/documentation')}
              >
                Learn More
              </Button>
            </Box>
          </VStack>
        </Box>
        <Divider orientation="horizontal" borderColor="black" borderWidth="1px" width="full" />


        <Box className='page 2'
          display="flex"
          w="full"
          p={{ base: "56px 32px", md: "112px 64px" }}
          flexDir="column"
          alignItems="flex-start"
          gap={{ base: "40px", md: "80px" }}
          bgImage={`url(${Page2})`}
          bgSize="contain"
          loading="lazy"
        >
          <Box
            display="flex"
            flexDirection={{ base: "column", md: "row" }}
            alignItems="center"
            gap={{ base: "40px", md: "80px" }}
            alignSelf="stretch"
          >
            <VStack
              alignItems="flex-start"
              spacing={{ base: "16px", md: "24px" }}
              flex="1"
              maxW={{ base: "full", md: "50%" }}
            >
              <Heading
                color="#000"
                fontFamily="Roboto"
                fontSize={{ base: "24px", md: "40px" }}
                fontWeight="700"
                lineHeight="120%"
              >
                Experience seamless code translation with our user-friendly interface.
              </Heading>
              <Text
                color="#000"
                fontFamily="Roboto"
                fontSize={{ base: "18px", md: "20px" }}
                fontWeight="500"
                lineHeight="150%"
              >
                Our tool provides a simple and intuitive interface for easy code submission and translation output.
              </Text>
            </VStack>
            <Box
              flex={{ base: "1", md: "1" }}
              w={{ base: "full", md: "50%" }}
              h="auto"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Image
                h={{ base: "320px", md: "640px" }}
                src={bbimage}
                objectFit="contain"
                maxW="100%"
                maxH="100%"
              />
            </Box>
          </Box>
        </Box>
        <Divider orientation="horizontal" borderColor="black" borderWidth="1px" width="full" />

        <Flex className='Get Started with Our Code Translation '
          direction="column"
          alignItems="flex-start"
          w="full"
          h={{ base: "auto", md: "864px" }}
          p={{ base: "56px 32px", md: "112px 64px" }}
          gap={{ base: "40px", md: "80px" }}
          flexShrink={0}
          bgImage="url('/path/to/images/Layout4image.jpg')"
          bgSize="cover"
          borderRadius="8px"
          loading="lazy"
        >
          <Flex alignItems="center" gap={{ base: "20px", md: "69px" }} w="full">
            <Image
              src={Layout4}
              flex="1"
              h={{ base: "320px", md: "640px" }}
              borderRadius="83px"
              objectFit="cover"
            />
            <VStack alignItems="flex-start" spacing={{ base: "12px", md: "24px" }} flex="1">
              <VStack alignItems="flex-start" spacing="16px" w="full">
                <Text fontSize="16px" fontWeight="600" lineHeight="150%">
                  Simplified
                </Text>
                <VStack alignItems="flex-start" spacing="4px">
                  <Heading fontSize="48px" fontWeight="700" lineHeight="120%">
                    Get Started with Our Code Translation Tool
                  </Heading>
                  <Text fontSize="18px" fontWeight="400" lineHeight="150%">
                    Our quick start guide will help you efficiently use our code translation tool. Simply follow these steps:
                  </Text>
                </VStack>
              </VStack>
              <VStack alignItems="flex-start" spacing="24px" w="full">
                <VStack alignItems="flex-start" spacing="16px" w="full">
                  <Text fontSize="20px" fontWeight="700" lineHeight="140%">
                    Step 1
                  </Text>
                  <Text fontSize="18px" fontWeight="400" lineHeight="150%">
                    Submit your code in the desired programming language.
                  </Text>
                </VStack>
                <VStack alignItems="flex-start" spacing="16px" w="full">
                  <Text fontSize="20px" fontWeight="700" lineHeight="140%">
                    Step 2
                  </Text>
                  <Text fontSize="18px" fontWeight="400" lineHeight="150%">
                    Receive the translated code with enhanced readability features.
                  </Text>
                </VStack>
              </VStack>
              <HStack padding="12px 24px" justifyContent="center" alignItems="center" gap="20px">
                <Button variant="outline" borderColor="black" rightIcon={<ChevronRightIcon />} onClick={() => goToPage('/AboutUs')}>
                  Learn More About our Team
                </Button>
                <Button variant="solid" bg="black" color="white" onClick={() => goToPage('/login')}>
                  Sign Up
                </Button>
              </HStack>
            </VStack>
          </Flex>
        </Flex>
        <Divider orientation="horizontal" borderColor="black" borderWidth="1px" width="full" />

        <Box className='Save time and improve accuracy'
          display="flex"
          flexDirection={{ base: 'column', md: 'row-reverse' }}
          alignItems="flex-start"
          w={{ base: "full" }}
          h={{ base: "auto", lg: "888px" }}
          p={{ base: "56px 32px", md: "112px 64px" }}
          gap="20"
          bgImage="url('/path/to/images/Layout18.webp')"
          bgSize="cover"
          bgPos="center"
          bgRepeat="no-repeat"
          bg="lightgray"
          loading="lazy"
        >
          <Box
            display="flex"
            alignItems="center"
            gap="20"
            flex={{ base: "none", md: "1" }}
          >
            <Image
              flexShrink={0}
              h={{ base: "320px", md: "640px" }}
              borderRadius="83px"
              src={image6}
            />
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              gap="8"
              flex="1"
            >
              <Heading
                mb="4"
                color="black"
                fontSize={{ base: "24px", md: "40px" }}
                fontWeight="700"
                lineHeight="120%"
              >
                Save time and improve accuracy with our powerful code translation and conversion tool
              </Heading>
              <Text
                mb="8"
                color="black"
                fontSize={{ base: "16px", md: "18px" }}
                fontWeight="400"
                lineHeight="150%"
              >
                Our tool simplifies the process of translating and converting code, making it faster and more precise. Say goodbye to manual conversions and hello to efficiency.
              </Text>
              <List spacing="6">
                <ListItem display="flex" alignItems="center" gap="4">
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text color="black" fontSize="16px" fontWeight="400" lineHeight="150%">
                    Streamline your coding workflow with automated translations
                  </Text>
                </ListItem>
                <ListItem display="flex" alignItems="center" gap="4">
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text color="black" fontSize="16px" fontWeight="400" lineHeight="150%">
                    Ensure code accuracy with our reliable conversion tool
                  </Text>
                </ListItem>
                <ListItem display="flex" alignItems="center" gap="4">
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text color="black" fontSize="16px" fontWeight="400" lineHeight="150%">
                    Effortlessly convert code between different programming languages
                  </Text>
                </ListItem>
              </List>
            </Box>
          </Box>
        </Box>
        <Divider orientation="horizontal" borderColor="black" borderWidth="1px" width="full" />

        <Box className='Support for multiple programming'
          bg="#fbf2e3"
          p={{ base: "56px 32px", md: "112px 64px" }}
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={{ base: "40px", md: "80px" }}
          w="full"
          mx="auto"
        >
          <Heading
            textAlign="center"
            fontSize={{ base: "24px", md: "40px" }}
            fontWeight="700"
            lineHeight="120%"
            w={{ base: "full", md: "768px" }}
          >
            Support for multiple programming languages and frameworks
          </Heading>
          <Grid
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
            gap={6}
            w="full"
            alignItems="start"
          >
            {[logos1, image1, logos2].map((src, index) => (
              <GridItem key={index}>
                <VStack spacing={4} align="stretch">
                  <Box h="240px" overflow="hidden">
                    <Image
                      src={src}
                      w="full"
                      h="100%"
                      objectFit="cover"
                    />
                  </Box>
                  <Box textAlign="center" mt="32px">
                    <Heading
                      fontSize="24px"
                      fontWeight="700"
                      lineHeight="140%"
                      mb="4"
                    >
                      {index === 0 && 'Efficient code conversion and translation capabilities'}
                      {index === 1 && 'Seamless integration with popular development tools and platforms'}
                      {index === 2 && 'Advanced readability features for translated code'}
                    </Heading>
                    <Text
                      fontSize="16px"
                      fontWeight="400"
                      lineHeight="150%"
                    >
                      {index === 0 && 'Check out our Translate Code Page to check the differnt languages available to translate'}
                      {index === 1 && 'Integrate our tool into your existing workflow effortlessly'}
                      {index === 2 && 'Ensure your translated code is easy to understand and maintain'}
                    </Text>
                  </Box>
                  <Flex justifyContent="center" alignItems="center" mt="24px">
                    <Link to={index === 0 ? "/translate" : index === 1 ? "/login" : "/documentation"} style={{ textDecoration: 'none' }}>
                      <Button rightIcon={<ChevronRightIcon />} variant="link">
                        {index === 0 && 'Code Translate Page'}
                        {index === 1 && 'Sign Up'}
                        {index === 2 && 'Get Started'}
                      </Button>
                    </Link>
                  </Flex>
                </VStack>
              </GridItem>
            ))}
          </Grid>
        </Box>
        <Divider orientation="horizontal" borderColor="black" borderWidth="1px" width="full" />


        <Box className='FeedBack'
          padding={{ base: "56px 32px", md: "112px 64px" }}
          width="full"
          display="flex"
          flexDirection={{ base: 'column', md: 'row' }}
          alignItems="center"
          gap={{ base: "40px", md: "80px" }}
          background={`url(${image3}), lightgray`}
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          backgroundSize="cover"
          backdropFilter="blur(5px)"
        >
          <Box
            flex={{ base: "none", md: "1" }}
            display="flex"
            flexDirection="column"
            gap="24px"
            alignItems="flex-start"
          >
            <Heading
              color="black"
              fontFamily="Roboto"
              fontSize={{ base: "32px", md: "64px" }}
              fontWeight="700"
              lineHeight="120%"
              textStroke="1px"
              textStrokeColor="black"
            >
              We are a FeedBack friendly Company
            </Heading>
            <Text
              color="black"
              fontFamily="Roboto"
              fontSize={{ base: "16px", md: "18px" }}
              fontWeight="700"
              lineHeight="150%"
            >
              Your feedback is the compass that guides our journey towards excellence. Share your thoughts with us and help shape a better experience for everyone.                   </Text>
            <Flex gap="8px">
              <Button
                bg="black"
                color="white"
                border="1px"
                borderColor="black"
                padding={{ base: "8px 16px", md: "12px 24px" }} onClick={() => goToPage('/feedback')}
              >
                FeedBack Page
              </Button>

            </Flex>
          </Box>
          <Image
            src={image3}
            height={{ base: "200px", md: "400px" }}
            objectFit="cover"
            flexShrink={0}
            borderRadius="md"
          />
        </Box>
        <Divider orientation="horizontal" borderColor="black" borderWidth="1px" width="full" />

        <Box className='FAQs'
          // bg="#e2e8f0"
          background={`url(${faqs}), lightgray`}
          backdropFilter="blur(5px)"

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
              fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
              fontWeight="400"
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
              { question: "Is it secure?", answer: "Security is our top priority. Our Backend is made by our Tech supergurus. They got it all under control" },
              { question: "Can I trust the translations?", answer: "Our translations are highly accurate. " },
              { question: "How can I provide feedback?", answer: "Good or Bad, Customer Feedback is extremely important to us as a team. Here is the link to our feedback page.  " },
            ].map((faq, index) => (
              <AccordionItem key={index}>
                {({ isExpanded }) => (
                  <>
                    <h2>
                      <AccordionButton fontSize="lg">
                        <Box flex="1" textAlign="left">
                          {faq.question}
                        </Box>
                        <AccordionIcon as={ChevronDownIcon} />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4} fontSize="lg">
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
            <Button variant="outline" borderColor="#000" colorScheme="blackAlpha" onClick={() => goToPage('/ContactUs')}>
              Contact
            </Button>
          </Flex>
        </Box>
        <Divider orientation="horizontal" borderColor="black" borderWidth="1px" width="full" />

        <Box className='Footer'
          width="full"
          minH="617px"
          py={{ base: "10", md: "20" }}
          px={{ base: "4", md: "8", lg: "16" }}
          bg="#e2e8f0"
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap="80px"
        >
          <Flex
            alignSelf="stretch"
            flexDirection={{ base: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems="flex-start"
            gap="64px"
          >
            <Flex
              flexDirection="column"
              alignItems="flex-start"
              gap="32px"
              flex={{ base: "1", lg: "none" }}
            >
              <Box width="63px" height="27px" position="relative">
                <Image src={logo} alt="Logo" mt="-25" />
              </Box>
              <Flex alignSelf="stretch" height="185px" flexDirection="column" alignItems="flex-start" gap="24px">
                <Flex alignSelf="stretch" height="46px" flexDirection="column" alignItems="flex-start" gap="4px">
                  <Text fontSize="14px" fontWeight="600" lineHeight="21px">Address:</Text>
                  <Text fontSize="14px" fontWeight="400" lineHeight="21px">University Heights Newark, NJ</Text>
                </Flex>
                <Flex alignSelf="stretch" height="67px" flexDirection="column" alignItems="flex-start" gap="4px">
                  <Text fontSize="14px" fontWeight="600" lineHeight="21px">Contact:</Text>
                  <Flex alignSelf="stretch" height="42px" flexDirection="column" alignItems="flex-start">
                    <Link href="tel:18001234567" isExternal fontSize="14px" fontWeight="400" textDecoration="underline" lineHeight="21px">1800 123 4567</Link>
                    <Link href="mailto:info@binarybrains.io" isExternal fontSize="14px" fontWeight="400" textDecoration="underline" lineHeight="21px">info@binarybrains.io</Link>
                  </Flex>
                </Flex>
                <Flex justifyContent="flex-start" alignItems="flex-start" gap="12px">
                  <Box width="24px" height="24px"></Box>
                </Flex>
              </Flex>
            </Flex>
            <Flex flex="1" height="168px" justifyContent="flex-start" alignItems="flex-start" gap="24px" flexDirection="column">
              <Flex flex="1" flexDirection="column" justifyContent="flex-start" alignItems="flex-start" gap="12px">
                <Link to="/AboutUs" style={{ textDecoration: 'none' }}>
                  <Text fontSize="16px" fontWeight="600" lineHeight="24px">About Us</Text>
                </Link>
                <Link to="/ContactUs" style={{ textDecoration: 'none' }}>
                  <Text fontSize="16px" fontWeight="600" lineHeight="24px">Contact Us</Text>
                </Link>
                <Link to="/faqs" style={{ textDecoration: 'none' }}>
                  <Text fontSize="16px" fontWeight="600" lineHeight="24px">FAQs</Text>
                </Link>
              </Flex>
            </Flex>
          </Flex>
          <Flex alignSelf="stretch" height="54px" flexDirection="column" alignItems="flex-start" gap="32px">
            <Box height="1px" bg="black" alignSelf="stretch"></Box>
            <Flex justifyContent="space-between" alignItems="flex-start" gap="24px" alignSelf="stretch">
              <Text fontSize="14px" fontWeight="400" lineHeight="21px">© 2024 Binary Brains. All rights reserved.</Text>
              <Flex justifyContent="flex-start" alignItems="flex-start" gap="24px">
                <Link href="#" textDecoration="underline" fontSize="14px" fontWeight="400" lineHeight="21px">Privacy Policy</Link>
                <Link href="#" textDecoration="underline" fontSize="14px" fontWeight="400" lineHeight="21px">Terms of Service</Link>
                <Link href="#" textDecoration="underline" fontSize="14px" fontWeight="400" lineHeight="21px">Cookies Settings</Link>
              </Flex>
            </Flex>
          </Flex>
        </Box>
      </Box>

    </>
  );
};

export default HomePage;
