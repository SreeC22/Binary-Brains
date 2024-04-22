import { Box, Text, Input, Textarea, Button, useColorModeValue, FormControl, FormLabel, Link, useToast, Flex, Image } from '@chakra-ui/react';
import React, { useState } from 'react';
import BBimage from './image/BB.png'

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const toast = useToast();

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        toast({
            title: "Submission Successful",
            description: "Thank you for contacting us! We will get back to you soon.",
            status: "success",
            duration: 9000,
            isClosable: true,
            position: "top",
        });
    };

    // Use encodeURI to encode the address for the URL
    const mapsQuery = encodeURI("University Heights Newark, NJ");

    return (
        <Flex
            direction="column"
            minHeight="100vh"
            bg={useColorModeValue("#fbf2e3", "#2D3748")}
        >
        <Flex justifyContent="center" alignItems="center" mt={8}> {/* or any other value that suits your design */}
            <Text fontSize="4xl" fontWeight="bold" mb="4" textAlign="center">
                Contact Our Amazing Team
            </Text>
        </Flex>


            <Flex flexGrow={1} p={{ base: "6", md: "8", lg: "20" }} direction={{ base: "column", md: "row" }} justify="center" align="center">
                <Box flex="1" maxWidth={{ md: "50%" }} mb={{ base: "6", md: "0" }}>
                    {/* Logo Image */}
                    <Image src={BBimage} alt="Binary Brains Logo" maxWidth="120px" mb="4" />

                    <Text fontSize="2xl" fontWeight="bold" mb="4">
                        Address:
                    </Text>
                    {/* Link to Google Maps */}
                    <Link href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} isExternal mb="4">
                        University Heights Newark, NJ
                    </Link>
                    <Text fontSize="2xl" fontWeight="bold" mb="4">
                        Contact:
                    </Text>
                    <Link href="tel:18001234567" isExternal mb="2">
                        1800 123 4567
                    </Link>
                    <br />
                    <Link href="mailto:info@binarybrains.io" isExternal>
                        info@binarybrains.io
                    </Link>
                </Box>
                <Box flex="1" maxWidth={{ md: "50%" }}>
                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <FormControl isRequired mb="6">
                            <FormLabel>Name</FormLabel>
                            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Your name" bg="white"/>
                        </FormControl>
                        
                        <FormControl isRequired mb="6">
                            <FormLabel>Email</FormLabel>
                            <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your email" bg="white" />
                        </FormControl>

                        <FormControl isRequired mb="8">
                            <FormLabel>Message</FormLabel>
                            <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Your message" bg="white"/>
                        </FormControl>

                        <Button type="submit" colorScheme="blue" size="lg">Send Message</Button>
                    </form>
                </Box>
            </Flex>

            {/* Footer */}
            <Box as="footer" py={4} fontFamily="Roboto" textAlign="center" borderTop="1px solid" borderTopColor="gray.300">
                © 2024 Binary Brains. All rights reserved.
            </Box>
        </Flex>
    );
};

export default ContactUs;