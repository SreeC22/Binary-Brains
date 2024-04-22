import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Textarea, Image, Text, useToast, Icon, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import confetti from 'canvas-confetti';

// Emoji imports
import badEmoji from './bad.png';
import excellentEmoji from './excellent.png';
import goodEmoji from './good.png';
import okayEmoji from './okay.png';
import poorEmoji from './poor.png';
import thinkingEmoji from './thinking-face.png';
import spongeBobThankYouMeme from './spongebob-thank-you.png.gif';

const FeedbackPage = () => {
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [aggregatedData, setAggregatedData] = useState({ averageRating: 0, totalFeedback: 0 });
    const toast = useToast();
    const emojis = [thinkingEmoji, poorEmoji, badEmoji, okayEmoji, goodEmoji, excellentEmoji];

    const handleRating = (index) => {
        setRating(index);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const feedbackData = new FormData(event.currentTarget);
        const apiUrl = process.env.REACT_APP_BACKEND_URL; // Default to localhost if not set

        try {
            const response = await fetch(`${apiUrl}/submit_feedback`, {
                 method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: feedbackData.get('firstName'),
                    lastName: feedbackData.get('lastName'),
                    email: feedbackData.get('email'),
                    phoneNumber: feedbackData.get('phoneNumber'),
                    message: feedbackData.get('message'),
                    rating: rating,
                }),
            });

            if (response.ok) {
                triggerConfetti();
                setSubmitted(true);
                toast({
                    title: "Feedback Submitted",
                    description: "Thank you for your feedback!",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            } else {
                toast({
                    title: "Submission Failed",
                    description: "Please try again later.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while submitting your feedback.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const triggerConfetti = () => {
        confetti({
            zIndex: 999,
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
        });
    };

    if (submitted) {
        return (
            <Box textAlign="center" p={10}>
                <Image src={spongeBobThankYouMeme} alt="Thank You" mx="auto" />
            </Box>
        );
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            p={5}
            boxShadow="md"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            bg="#fbf2e3"
            w="100%"
            minH="100vh"
            gap={3}
        >
            <Text fontSize="2xl">Tell us your experience</Text>
            <Text>We value your feedback. Please share your experience with us.</Text>
            <Image src={emojis[rating]} w="100px" my={5} />
            <Box display="flex" gap={2}>
                {[...Array(5)].map((_, index) => (
                    <StarIcon
                        key={index}
                        onClick={() => handleRating(index + 1)}
                        color={rating > index ? 'yellow.400' : 'gray.300'}
                        w={6}
                        h={6}
                        cursor="pointer"
                        _hover={{ transform: "scale(1.1)" }}
                    />
                ))}
            </Box>
            <Box as="form" onSubmit={handleSubmit} w="full" maxW="400px" display="flex" flexDirection="column" gap={3}>
                <FormControl isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input name="firstName" placeholder="First Name" required bg="white" />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Last Name</FormLabel>
                    <Input name="lastName" placeholder="Last Name" required bg="white"/>
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input name="email" type="email" placeholder="Email" required bg="white"/>
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Phone Number</FormLabel>
                    <Input name="phoneNumber" type="tel" placeholder="Phone Number" required bg="white"/>
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Your Message</FormLabel>
                    <Textarea name="message" placeholder="Your Message" required bg="white" />
                </FormControl>
                <Button type="submit" colorScheme="blue">Send Feedback</Button>
            </Box>
        </Box>
    );
};

export default FeedbackPage;