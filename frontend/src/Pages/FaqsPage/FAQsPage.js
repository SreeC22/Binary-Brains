import React, { useState } from 'react';
import {
  Box, Input, IconButton, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Text, Button, Flex, VStack, Heading, List, ListItem, SimpleGrid, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useToast, useDisclosure
} from '@chakra-ui/react';
import { MdKeyboardVoice } from 'react-icons/md';
export { initialFaqs, initialResources };

const initialFaqs = [
  { question: "How does it work?", answer: "Here is how it works: Write your code..." },
  { question: "Is it free?", answer: "Yes, our service is completely free." },
  { question: "Is it secure?", answer: "Security is our top priority." },
  { question: "Can I trust the translations?", answer: "Our translations are highly accurate." },
  { question: "How can I provide feedback?", answer: "Good or Bad, customer feedback is important to us." },
];

const initialResources = [
  {
    title: "Tutorial 1",
    description: "Learn how to get started",
    content: "This is content for Tutorial 1.",
    link: "#",
    downloadLink: "meme.png"
  },
  { title: "Article 2", description: "Best practices in code translation", content: "Content for Article 2 goes here." },
  { title: "Video 3", description: "Understanding code conversion", content: "Here's some information about Video 3." },
];

const FAQsPage = () => {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const toast = useToast();

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.start();
      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        toast({
          title: "Error occurred in recognition: " + event.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      toast({
        title: "Browser does not support speech recognition.",
        description: "Try Chrome or Firefox.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const filteredFaqs = searchTerm.length === 0 ? faqs : faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalContent, setModalContent] = useState("");

  const openModal = (content) => {
    setModalContent(content);
    onOpen();
  };

  const handleLearnMore = (content) => {
    setModalContent(content);
    onOpen();
  };


  return (
    <Box w="100%" height="100%" p={5}>
      <VStack spacing={10}>
        <Box w="100%" p={5}>
          {/* Search bar and voice search */}
          <Flex>
            <Input
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              mr={2}
              flexGrow={1}
            />
            <IconButton
              aria-label="Voice Search"
              icon={<MdKeyboardVoice />}
              onClick={startListening}
              isLoading={isListening}
              colorScheme="blue"
            />
          </Flex>
          {/* FAQs Accordion */}
          <Accordion allowMultiple mt={4}>
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index}>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      {faq.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  {faq.answer}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>

        {/* User Guides Section */}
        <Box w="full" px={5} pt={2} pb={2}>
          <Heading size="lg" mb={5}>User Guides</Heading>
          <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Heading size="md" mb={3}>Getting Started with Code Conversion</Heading>
            <List spacing={2}>
              {/* Iterate over user guides steps */}
              <ListItem>Navigate to the Code Conversion page on our platform.</ListItem>
              <ListItem>Choose the source language of your code and the desired target language for conversion.</ListItem>
              <ListItem>Input the code you wish to convert into the designated text area or upload a code file.</ListItem>
              <ListItem>Press the 'Convert' button to start the conversion process.</ListItem>
              <ListItem>Review the converted code in the output area, making any necessary adjustments.</ListItem>
              <ListItem>Use the 'Copy' or 'Download' options to save the converted code.</ListItem>
            </List>
          </Box>
          {/* Additional user guides can be similarly structured */}
        </Box>

        {/* Helpful Resources Section */}
        <Box w="full" px={5} pt={2} pb={5}>
          <Heading size="lg" mb={5}>Helpful Resources</Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={10}>
            {initialResources.map((resource, index) => (
              <Box key={index} p={5} shadow="md" borderWidth="1px" borderRadius="lg">
                <Text fontWeight="bold">{resource.title}</Text>
                <Text mt={4}>{resource.description}</Text>
                <Button mt={4} onClick={() => handleLearnMore(resource.content)} colorScheme="blue">
                  Learn More
                </Button>
                <Button mt={4} ml={2} as="a" href={resource.downloadLink} download colorScheme="teal">Download</Button>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Modal for displaying resource content */}

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Resource Information</ModalHeader>
            <ModalCloseButton data-testid="modal-close-button" />
            <ModalBody>
              <Text>{modalContent}</Text>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </VStack>
    </Box>
  );
};

export default FAQsPage;