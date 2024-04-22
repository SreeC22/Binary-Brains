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
              display="flex" flexDirection="column" alignItems="center" w="full" p={{ base: "6", md: "8", lg: "28" }} gap={{ base: "6", md: "8", lg: "20" }} bg={useColorModeValue('gray.100', 'gray.900')}
          >
              <Text fontSize="5xl" fontWeight="bold" mb="4" textAlign="center">
                  Meet Our Team
              </Text>

              <Text textAlign="center" mb="8">
                  We're a cocktail of creativity and code – a kaleidoscope of coders, designers, and dreamers.
              </Text>

              <SimpleGrid columns={[1, 2, 3]} spacing="40px" w="full">
                  {teamMembers.map(member => (
                      <Box key={member.name} p="4" shadow="md" borderWidth="1px" borderRadius="lg" textAlign="center" bg={bg}>
                          <Image
                              borderRadius="full"
                              boxSize="150px"
                              src={member.imageUrl}
                              alt={`Picture of ${member.name}`}
                              mx="auto"
                              my="4"
                              sx={{
                                  filter: 'grayscale(100%)',
                                  transition: 'filter 0.3s',
                                  _hover: {
                                      filter: 'grayscale(0%)'
                                  }
                              }}
                          />
                          <Text fontWeight="bold" fontSize="xl" my="2">{member.name}</Text>
                          <Text fontSize="lg" color={color}>{member.role}</Text>
                          <Text fontSize="md" px="6" my="4" color={headingColor}>
                              {member.description}
                          </Text>
                          <Link href={member.linkedinUrl} isExternal>
                              <Text color="blue.500">Connect on LinkedIn</Text>
                          </Link>
                      </Box>
                  ))}
              </SimpleGrid>
          </Box>
      </>
  );

};

export default AboutUsPage;
