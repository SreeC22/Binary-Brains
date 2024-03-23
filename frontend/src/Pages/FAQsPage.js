import React, { useState } from 'react';
import {
  Box, Input, IconButton, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Text, Button, Flex, Divider, Grid, SimpleGrid, useToast
} from '@chakra-ui/react';
import { MdKeyboardVoice } from 'react-icons/md';

const initialFaqs = [
  { question: "How does it work?", answer: "Here is how it works: Write your code..." },
  { question: "Is it free?", answer: "Yes, our service is completely free." },
  { question: "Is it secure?", answer: "Security is our top priority." },
  { question: "Can I trust the translations?", answer: "Our translations are highly accurate." },
  { question: "How can I provide feedback?", answer: "Good or Bad, customer feedback is important to us." },
];

const initialResources = [
  { title: "Tutorial 1", description: "Learn how to get started", link: "#" },
  { title: "Article 2", description: "Best practices in code translation", link: "#" },
  { title: "Video 3", description: "Understanding code conversion", link: "#" },
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

  return (
    <>
      <Box my={4}>
        <Flex>
          <Input
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            mr={2}
          />
          <IconButton
            aria-label="Voice Search"
            icon={<MdKeyboardVoice />}
            onClick={startListening}
            isLoading={isListening}
            colorScheme="blue"
          />
        </Flex>
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
      {/* User Guides Sidebar Navigation Placeholder */}
      <Box>
        <Text fontSize="2xl" mb={4}>User Guides</Text>
        {/* Implement sidebar navigation here */}
      </Box>
      {/* Helpful Resources Section */}
      <Box mt={8}>
        <Text fontSize="2xl" mb={4}>Helpful Resources</Text>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {initialResources.map((resource, index) => (
            <Box key={index} p={5} shadow="md" borderWidth="1px">
              <Text fontWeight="bold">{resource.title}</Text>
              <Text mt={4}>{resource.description}</Text>
              <Button mt={4} as="a" href={resource.link} colorScheme="blue">Learn More</Button>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </>
  );
};

export default FAQsPage;
