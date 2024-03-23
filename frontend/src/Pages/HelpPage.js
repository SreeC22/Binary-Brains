import React, { useState } from 'react';
import {
    Box,
    Input,
    IconButton,
    useToast,
    Flex,
    Spacer
} from '@chakra-ui/react';
import { FaSearch, FaMicrophone } from 'react-icons/fa';
import FAQsPage from './FAQsPage';

const HelpSection = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const toast = useToast();

    const startVoiceRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.start();

            recognition.onresult = (event) => {
                const voiceQuery = event.results[0][0].transcript;
                setSearchQuery(voiceQuery);
                toast({
                    title: "Voice Search",
                    description: `Searching for: ${voiceQuery}`,
                    status: "info",
                    duration: 5000,
                    isClosable: true,
                });
            };

            recognition.onerror = (event) => {
                toast({
                    title: "Voice Search Error",
                    description: "An error occurred during voice recognition.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            };
        } else {
            toast({
                title: "Browser Incompatibility",
                description: "Your browser does not support voice recognition.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Flex align="center" mb="2">
            {isSearchVisible && (
                <Input
                    placeholder="Search Help"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="md"
                    mr="2"
                />
            )}
            <IconButton
                aria-label="Search"
                icon={<FaSearch />}
                onClick={() => setIsSearchVisible(!isSearchVisible)}
            />
            <IconButton
                aria-label="Voice Search"
                icon={<FaMicrophone />}
                onClick={startVoiceRecognition}
                ml="2"
            />
            <Spacer />
            {/* Insert other header or navigation components here */}
        </Flex>
    );
};

export default HelpSection;