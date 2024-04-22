import { Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { Box, Button, FormControl, FormLabel, Input, useToast,Tag,Container,Heading,Divider,VStack } from '@chakra-ui/react';

const ReleaseNotesTags = ({ tags }) => (
  <Box display="flex" gap="2" flexWrap="wrap">
    {tags.map((tag, index) => (
      <Tag size="md" variant="solid" colorScheme="teal" key={index}>{tag}</Tag>
    ))}
  </Box>
);

const DocumentationPage = () => {
    return (
        <>
        <Container maxW={'7xl'} p="12">
      <Heading as="h1">Release Notes</Heading>
      <Divider marginTop="5" />

      <VStack spacing="5" alignItems="flex-start" marginTop="5">
        <Heading as="h2">Version 1.0.1</Heading>
        <Text as="p" fontSize="lg">
          Released on April 20, 2024
        </Text>

        <Heading as="h3" size="md">New Features</Heading>
        <Text as="p" fontSize="md">
        <ul>
        <ol> - New dashboard with enhanced features. </ol>
        <ol> - Real time code translations through our new and enhanced Translate page </ol>
        <ol> - Receive your translated Code in less than a second. </ol> 
        <ol> - Languages available to translate include Java, Python, Rust, C++, Ruby, TypeScript, C#, Perl, Swift, Matlab. </ol> 
        <ol> - Password Reset and Remember Me feature available with Login/Authentication.</ol> 
        <ol> - Personalized Username / Translation history feature for logged in user. </ol>  
        <ol> - Account Deletion/Password Change feature. </ol>  
        <ol> - Night mode for users.</ol>  
        <ol> - User Interactive Feedback page for users to leave feedback based on their experience. </ol> 
        <ol> - Contact Us / About Us page to learn more about the team and get connected.</ol> 
        </ul>
        </Text>
        <ReleaseNotesTags tags={['Dashboard', 'Synchronization']} marginTop={2} />

        <Heading as="h3" size="md">Improvements</Heading>
        <Text as="p" fontSize="md">
        <ul>
        <ol> - Preprocessing of code to recieve the most accurate translation with least amount of turn around time. </ol> 
        <ol> - Upload code Snippet / Download translated code feature on translate code page. </ol> 
        <ol> - Enhanced navbar so that it doesnt break other peoples code. ;)</ol> 
        <ol> - Add, delete, Modify operations on translation History. </ol> 
        <ol> - Enhanced security protocols for user data protection.</ol> 
        <ol> - Error handling for API requests rate limit / overall usability. </ol> 
        <ol> - Microphone enabled help section queries.</ol>  
        <ol> - Interactive user guide on help section. </ol> 
        </ul>
        </Text>
        <ReleaseNotesTags tags={['Performance', 'Security']} marginTop={2} />

        <Heading as="h3" size="md">Bug Fixes</Heading>
        <Text as="p" fontSize="md">
        <ol> - Fixed a bug in the email notification system.</ol>
        <ol> - Resolved display issues on the frontend page.</ol> 
        </Text>
        <ReleaseNotesTags tags={['Email', 'UI']} marginTop={2} />

        <Heading as="h3" size="md">Deprecated</Heading>
        <Text as="p" fontSize="md">
          - The Code conversion page was removed to ensure efficient user interaction.
        </Text>
        <ReleaseNotesTags tags={['Profiles']} marginTop={2} />
      </VStack>
    </Container>
        </>
    );
};

export default DocumentationPage;
