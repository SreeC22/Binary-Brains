import { Box, Text, Image, Link, Stack, useColorModeValue, SimpleGrid } from '@chakra-ui/react';
import React from 'react';
import SreeImage from './image/Sree.jpeg';
import JesicaImage from './image/Jesica.jpeg';
import VanshikaImage from './image/Vanshika.jpeg';
import DaveImage from './image/Dave.jpeg';
import EranthaImage from './image/Erantha.jpeg';


const AboutUsPage = () => {

  const bg = useColorModeValue('white', 'gray.700');
    const color = useColorModeValue('gray.600', 'gray.400');
    const headingColor = useColorModeValue('gray.800', 'gray.200');
    const textHoverColor = useColorModeValue('gray.700', 'white');


    const teamMembers = [
        {
            name: "Sreekaree Chityala",
            role: "Project Manager",
            description:"Sreekaree, our project maestro, orchestrates our team's rhythm, turning project visions into reality with the poise of a seasoned conductor.",
            imageUrl: SreeImage,
            linkedinUrl: "https://www.linkedin.com/in/sreekaree/"
        },
        {
            name: "Jesica Rana",
            role: "Front-end Developer",
            description: "Jesica weaves the web with pixel-perfect spells, making interfaces dance to the rhythm of user experiences.",
            imageUrl: JesicaImage,
            linkedinUrl: "https://www.linkedin.com/in/jesicarana415/"
        },
        {
            name: "Vanshika Agrawal",
            role: "Back-end Developer",
            description: "Vanshika is the database whisperer, spinning up server-side scripts that are as robust as they are ingenious.",
            imageUrl:VanshikaImage,
            linkedinUrl: "https://www.linkedin.com/in/agrawal-vanshika/"
        },
        {
            name: "Dave Petroviki",
            role: "Software Engineer",
            description: "In the digital dojo, Dave is the ninja coder, silently slicing through bugs and deploying features with stealthy precision.",
            imageUrl: DaveImage,
            linkedinUrl: "https://www.linkedin.com/in/dpetrovikj/"
        },
        {
            name: "Erantha Arachchi",
            role: "Software Engineer",
            description: "Erantha is the coding alchemist, transmuting lines of code into golden functionalities that stand the test of time.",
            imageUrl: EranthaImage,
            linkedinUrl: "https://www.linkedin.com/in/erantha-arachchi-b851481b7/"
        }
    ];
    return (
        <>
          <Box
            display="flex" flexDirection="column" alignItems="center" w="full"
            p={{ base: "6", md: "8", lg: "15" }}
            gap={{ base: "6", md: "8", lg: "15" }}
            bg={useColorModeValue('gray.100', 'gray.900')}
          >
            <Text fontSize="5xl" fontWeight="bold" mb="4" textAlign="center">
              Meet Our Team
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="40px" w="80%">
              {teamMembers.map(member => (
                <Box
                  key={member.name}
                  shadow="md"
                  borderWidth="1px"
                  borderRadius="lg"
                  textAlign="center"
                  bg={bg}
                  overflow="hidden" // Makes sure the image does not bleed outside the border radius
                >
                  <Image
                    src={member.imageUrl}
                    alt={`Picture of ${member.name}`}
                    w="full" 
                    h="auto" 
                    sx={{
                      filter: 'grayscale(100%)',
                      transition: 'all 0.3s',
                      _hover: {
                        filter: 'grayscale(0%)',
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                  <Box p="4">
                    <Text fontWeight="bold" fontSize="xl" my="2">{member.name}</Text>
                    <Text fontSize="lg" color="gray.500">{member.role}</Text>
                    <Text fontSize="md" my="4" color="gray.600">
                      {member.description}
                    </Text>
                    <Link href={member.linkedinUrl} isExternal>
                      <Text color="blue.500">Connect on LinkedIn</Text>
                    </Link>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
            {/* Footer */}
            <Box as="footer" py={4} fontFamily="Roboto" textAlign="center" borderTop="1px solid" borderTopColor="gray.300">
                © 2024 Binary Brains. All rights reserved.
            </Box>
          </Box>
        </>
      );
    };
export default AboutUsPage;
