import React, { useEffect, useState } from 'react';
import { Box, Text, SimpleGrid, GridItem, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FeedbackSummary = () => {
    const [aggregatedData, setAggregatedData] = useState({ averageRating: 0, totalFeedback: 0 });
    const [ratingsCount, setRatingsCount] = useState({});
    const [wordCounts, setWordCounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchFeedbackData();
    }, []);

    const fetchFeedbackData = async () => {
        const apiUrl = process.env.REACT_APP_BACKEND_URL; // Default to localhost if not set

        try {
            const response = await fetch(`${apiUrl}/feedback`);
            const data = await response.json();
            if (data.aggregatedData) {
                setAggregatedData(data.aggregatedData);
                setRatingsCount(transformRatingsCount(data.feedbackEntries));
                setWordCounts(transformWordCounts(data.feedbackEntries));
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching feedback:', error);
        }
    };

    const transformRatingsCount = (feedbackEntries) => {
        const initialCount = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
        feedbackEntries.forEach((entry) => {
            const rating = entry.rating.toString();
            initialCount[rating] = (initialCount[rating] || 0) + 1;
        });
        return initialCount;
    };

    const transformWordCounts = (feedbackEntries) => {
        const wordMap = {};
        feedbackEntries.forEach((entry) => {
            entry.message.replace(/[^\w\s]|_/g, "")
                         .replace(/\s+/g, " ")
                         .toLowerCase()
                         .split(' ')
                         .forEach((word) => {
                             if (word) wordMap[word] = (wordMap[word] || 0) + 1;
                         });
        });
        return Object.entries(wordMap).map(([word, count]) => ({ word, count }));
    };

    const chartData = {
        labels: Object.keys(ratingsCount),
        datasets: [{
            label: 'Number of Ratings',
            data: Object.values(ratingsCount),
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }]
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    };

    const wordCloudStyles = (count) => ({
        fontSize: `${Math.log(count) * 5 + 10}px`,
        margin: '0 5px',
        display: 'inline-block'
    });

    if (isLoading) {
        return <Box p={5}><Text>Loading...</Text></Box>;
    }

    return (
        <Box p={5}>
            <SimpleGrid columns={2} spacing={10}>
                <GridItem boxShadow='md' p='6' rounded='md' bg='white'>
                    <Stat>
                        <StatLabel>Average Rating</StatLabel>
                        <StatNumber>{aggregatedData.averageRating.toFixed(2)}</StatNumber>
                    </Stat>
                    <Stat>
                        <StatLabel>Total Feedback</StatLabel>
                        <StatNumber>{aggregatedData.totalFeedback}</StatNumber>
                    </Stat>
                </GridItem>
                <GridItem boxShadow='md' p='6' rounded='md' bg='white'>
                    <Bar data={chartData} options={chartOptions} />
                </GridItem>
            </SimpleGrid>
            <Box mt={10} boxShadow='md' p='6' rounded='md' bg='white'>
                <Text fontSize="2xl" mb={4}>Common Words</Text>
                {wordCounts.sort((a, b) => b.count - a.count).slice(0, 30).map(({ word, count }) => (
                    <Text key={word} style={wordCloudStyles(count)}>{word}</Text>
                ))}
            </Box>
        </Box>
    );
};

export default FeedbackSummary;
