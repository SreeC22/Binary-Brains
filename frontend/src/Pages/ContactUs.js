import { Box, Text, Input, Textarea, Button, useColorModeValue, FormControl, FormLabel, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const toast = useToast(); // Hook for using toast

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(formData); // This is a placeholder for actual backend integration

        // Use toast to provide feedback
        toast({
            title: "Submission Successful",
            description: "Thank you for contacting us! We will get back to you soon.",
            status: "success",
            duration: 9000,
            isClosable: true,
            position: "top", // Can be bottom, top, etc.
        });
    };

    return (
        <Box
            display="flex" flexDirection="column" alignItems="center" w="full" p={{ base: "6", md: "8", lg: "28" }} gap={{ base: "6", md: "8", lg: "20" }} bg={useColorModeValue("#fbf2e3", "#2D3748")}
        >
            <Text fontSize="5xl" fontWeight="bold" mb="4">
                Contact Our Amazing Team
            </Text>
            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px' }}>
                <FormControl isRequired mb="6">
                    <FormLabel>Name</FormLabel>
                    <Input name="name" value={formData.name} onChange={handleChange} placeholder="Your name" />
                </FormControl>
                
                <FormControl isRequired mb="6">
                    <FormLabel>Email</FormLabel>
                    <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your email" />
                </FormControl>

                <FormControl isRequired mb="8">
                    <FormLabel>Message</FormLabel>
                    <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Your message" />
                </FormControl>

                <Button type="submit" colorScheme="blue" size="lg">Send Message</Button>
            </form>
        </Box>
    );
};

export default ContactUs;
