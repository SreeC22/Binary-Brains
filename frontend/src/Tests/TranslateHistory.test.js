// TranslateHistory.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
import TranslateHistory from '../Pages/TranslateHistory';
import { AuthProvider } from '../Components/AuthContext';
import { BrowserRouter } from 'react-router-dom';

fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.resetMocks();
});

const mockTranslationData = [
  {
    _id: '507f1f77bcf86cd799439011',
    email: 'sree@test.com',
    source_code: "def is_prime(n):\r\n    if n <= 1:\r\n        return False\r\n    # logic omitted for brevity\r\n",
    translated_code: "\nfunction isPrime(n) {\r\n  if (n <= 1) {\r\n    return false;\r\n  }\r\n  // logic omitted for brevity\r\n}",
    source_language: 'python',
    target_language: 'cpp',
    created_at: '2024-04-19T19:23:53Z',
  },
  {
    _id: '507f1f77bcf86cd799439012',
    email: 'sree@test.com',
    source_code: "def is_prime(n):\r\n    if n <= 1:\r\n        return False\r\n    # logic omitted for brevity\r\n",
    translated_code: "\n#include <iostream>\n#include <vector>\nint main() {\n  // logic omitted for brevity\n  return 0;\n}",
    source_language: 'python',
    target_language: 'typescript',
    created_at: '2024-04-19T19:23:54Z',
  },
  // More translations can be added if needed
];

describe('TranslateHistory Component', () => {
  it('displays loading state correctly', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockTranslationData));

    render(
      <BrowserRouter>
        <AuthProvider>
          <TranslateHistory />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument());
  });

  it('deletes individual translation entry correctly', async () => {
    fetchMock.mockResponses(
      [JSON.stringify(mockTranslationData), { status: 200 }],
      [JSON.stringify({}), { status: 200 }]
    );

    render(
      <BrowserRouter>
        <AuthProvider>
          <TranslateHistory />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(new RegExp(mockTranslationData[0].source_code))).toBeInTheDocument());
    const deleteButtons = screen.getAllByLabelText(/delete translation history entry/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => expect(screen.queryByText(new RegExp(mockTranslationData[0].source_code))).not.toBeInTheDocument());
  });

  it('clears entire translation history correctly', async () => {
    fetchMock.mockResponses(
      [JSON.stringify(mockTranslationData), { status: 200 }],
      [JSON.stringify({}), { status: 200 }]
    );

    render(
      <BrowserRouter>
        <AuthProvider>
          <TranslateHistory />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(new RegExp(mockTranslationData[0].source_code))).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Clear/i));

    await waitFor(() => expect(screen.queryByText(new RegExp(mockTranslationData[0].source_code))).not.toBeInTheDocument());
  });

  it('displays an error message on fetch failure', async () => {
    fetchMock.mockReject(new Error('API failure'));

    render(
      <BrowserRouter>
        <AuthProvider>
          <TranslateHistory />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(/Failed to load translation history/i)).toBeInTheDocument());
  });
});



// // Ensure you import everything needed, including fireEvent for interactions
// import React from 'react';
// import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import fetchMock from 'jest-fetch-mock';
// import TranslateHistory from '../Pages/TranslateHistory';
// import { AuthProvider } from '../Components/AuthContext';
// import { BrowserRouter } from 'react-router-dom';

// fetchMock.enableMocks();

// beforeEach(() => {
//   fetch.resetMocks();
//   jest.mock('../Components/AuthContext', () => ({
//     useAuth: () => ({ user: { email: 'test@example.com' } }),
//   }));
// });

// describe('TranslateHistory Component', () => {
//   it('displays loading state correctly', async () => {
//     fetchMock.mockResponseOnce(JSON.stringify([])); // Mock an empty response
  
//     render(
//       <BrowserRouter>
//         <AuthProvider>
//           <TranslateHistory />
//         </AuthProvider>
//       </BrowserRouter>
//     );
  
//     // Check for the "Loading..." text
//     expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  
//     // Await for the fetch call to resolve and the loading state to disappear
//     await waitFor(() => expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument());
//   });
  

//     it('filters data correctly', async () => {
//         fetch.mockResponseOnce(JSON.stringify([]));
      
//         render(
//           <BrowserRouter>
//             <AuthProvider>
//               <TranslateHistory />
//             </AuthProvider>
//           </BrowserRouter>
//         );
//     });

//     it('displays an error message on fetch failure', async () => {
//         fetch.mockReject(new Error('API failure'));

//         render(
//           <BrowserRouter>
//             <AuthProvider>
//               <TranslateHistory />
//             </AuthProvider>
//           </BrowserRouter>
//         );

//         await waitFor(() => {
//           expect(screen.getByText(/Failed to load translation history/)).toBeInTheDocument();
//         });
//     });

//     it('sorts data correctly', async () => {
//       // Assuming your fetch setup is correct and the component renders the mock data
    
//       render(
//         <BrowserRouter>
//           <AuthProvider>
//             <TranslateHistory />
//           </AuthProvider>
//         </BrowserRouter>
//       );
  
//     });

//     it('deletes individual history entry correctly', async () => {
//       // Mock the initial data load
//       fetch.mockResponseOnce(JSON.stringify([/* your initial mock data */]));
    
//       // Mock the delete response
//       fetch.mockResponseOnce(JSON.stringify({}), { status: 200 });
    
//       render(
//         <BrowserRouter>
//           <AuthProvider>
//             <TranslateHistory />
//           </AuthProvider>
//         </BrowserRouter>
//       );
    
//       // Wait for the mock data to be displayed
//       await waitFor(() => expect(screen.getByText(/* data from initial load */)).toBeInTheDocument());
    
//       // Simulate the deletion action (clicking the delete button)
//       fireEvent.click(screen.getByLabelText(/Delete Translation History Entry/));
    
//       // Wait for the data to update
//       await waitFor(() => expect(screen.queryByText(/* data from initial load */)).not.toBeInTheDocument());
//     });
    
//     it('clears entire history correctly', async () => {
//       // Mock the initial data load
//       fetch.mockResponseOnce(JSON.stringify([/* your initial mock data */]));
    
//       // Mock the delete response for clearing history
//       fetch.mockResponseOnce(JSON.stringify({}), { status: 200 });
    
//       render(
//         <BrowserRouter>
//           <AuthProvider>
//             <TranslateHistory />
//           </AuthProvider>
//         </BrowserRouter>
//       );
    
//       // Wait for the mock data to be displayed
//       await waitFor(() => expect(screen.getByText(/* data from initial load */)).toBeInTheDocument());
    
//       // Simulate the clear action (clicking the clear button)
//       fireEvent.click(screen.getByText(/Clear/));
    
//       // Wait for the data to update
//       await waitFor(() => expect(screen.queryByText(/No translation history found/)).toBeInTheDocument());
//     });
    
    
    
    
// });





// import React from 'react';
// import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import fetchMock from 'jest-fetch-mock';
// import TranslateHistory from '../Pages/TranslateHistory'; // Update the import path as necessary
// import { AuthProvider } from '../Components/AuthContext';
// import { BrowserRouter } from 'react-router-dom';

// fetchMock.enableMocks();

// beforeEach(() => {
//     fetch.resetMocks();
//     jest.mock('../Components/AuthContext', () => ({
//       useAuth: () => ({ user: { email: 'test@example.com' } }),
//     }));
// });

// describe('TranslateHistory Component', () => {
//     it('handles successful data fetch', async () => {
//         // Mock the fetch response with your test data
//         fetch.mockResponseOnce(JSON.stringify([
//           {
//             source_language: "Python",
//             target_language: "Java",
//             source_code: "print('Hello, world!')",
//             translated_code: "System.out.println('Hello, world!');",
//             created_at: { $date: { $numberLong: "1615122000000" } }, // Example timestamp
//             // Add any other fields your component expects
//           },
//           // Add more items if necessary
//         ]));
      
//         // Render your component within the test environment
//         render(
//           <BrowserRouter>
//             <AuthProvider>
//               <TranslateHistory />
//             </AuthProvider>
//           </BrowserRouter>
//         );
      
//         // Directly wait for the data to be displayed instead of focusing on the loading state
//         await waitFor(() => {
//           // Adjust this to match an actual piece of text from your mocked response
//           // For example, checking for a piece of text from the translated code
//           expect(screen.getByText(/System.out.println\('Hello, world!'\);/)).toBeInTheDocument();
//         });
//       });
  
//     it('displays an error on fetch failure', async () => {
//       // Mock a fetch failure
//       fetch.mockReject(new Error('API failure'));
  
//       render(
//         <BrowserRouter>
//           <AuthProvider>
//             <TranslateHistory />
//           </AuthProvider>
//         </BrowserRouter>
//       );
  
//       // Wait for the error message to be displayed
//       await waitFor(() => {
//         expect(screen.getByText(/Failed to load translation history/)).toBeInTheDocument();
//       });
//     });
//   });



// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import TranslateHistory from '../Pages/TranslateHistory'; // Adjust the import path according to your file structure
// import fetchMock from 'jest-fetch-mock';
// import { AuthProvider } from '../Components/AuthContext';

// fetchMock.enableMocks();

// describe('TranslateHistory Component', () => {
//   beforeEach(() => {
//     fetch.resetMocks();
//   });

//   it('displays a loading message and then the content', async () => {
//     fetch.mockResponseOnce(JSON.stringify([
//       // Mock your translation history data here
//     ]));

//     render(<TranslateHistory />);
//     expect(screen.getByText('Loading...')).toBeInTheDocument();

//     await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
//     // After loading, check for a component that only appears when the data is loaded
//     expect(screen.getByTestId('translation-history-list')).toBeInTheDocument();
//   });

//   it('displays an error message if the fetch fails', async () => {
//     fetch.mockReject(new Error('API failure'));

//     render(<TranslateHistory />);
//     await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
//     expect(screen.getByText(/Failed to load translation history/)).toBeInTheDocument();
//   });

//   it('filters translation history by source language', async () => {
//     fetch.mockResponseOnce(JSON.stringify([
//       // Your mock data that includes various source languages
//     ]));

//     render(<TranslateHistory />);
//     await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

//     fireEvent.change(screen.getByRole('combobox', { name: /Filter by Source Language/ }), {
//       target: { value: 'python' },
//     });

//     await waitFor(() => {
//       // Instead of checking for specific texts which might not be directly queryable,
//       // you can verify the existence of a certain number of expected elements that match the filter criteria.
//       // For example, if each translation history entry has a 'data-testid="translation-entry"', and you expect 2 entries for Python:
//       expect(screen.getAllByTestId('translation-entry')).toHaveLength(2);
//     });
//   });

//   it('sorts translation history by date', async () => {
//     fetch.mockResponseOnce(JSON.stringify([
//       // Mock data with different dates
//     ]));

//     render(<TranslateHistory />);
//     await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

//     // Assuming you have an icon button for sorting, you might not have text to click on.
//     // In that case, you can use getByTestId or getByRole to select the button.
//     fireEvent.click(screen.getByTestId('sort-button'));

//     await waitFor(() => {
//       // Verify the sort order by checking the order of elements based on their content or data attributes
//       const entries = screen.getAllByTestId('translation-entry-date');
//       expect(new Date(entries[0].textContent)).toBeGreaterThan(new Date(entries[1].textContent));
//     });
//   });

//   test('Sorts history based on date', async () => {
//     render(<TranslateHistory />);
//     await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
//     // This test needs a specific assertion based on the sorting behavior. 
//     // For simplicity, let's assume it's checking the order of items.
//     // You should replace the following line with a relevant check for your implementation.
//     expect(true).toBe(true);
//   });
// });

// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import TranslateHistory from '../Pages/TranslateHistory';
// import fetchMock from 'jest-fetch-mock';
// import { useAuth } from '../Components/AuthContext';

// fetchMock.enableMocks();

// jest.mock('../Components/AuthContext', () => ({
//   useAuth: jest.fn(),
// }));

// describe('TranslateHistory Component Tests', () => {
//   beforeEach(() => {
//     const mockData = [
//       {
//         email: 'test@example.com',
//         source_code: "console.log('Hi there!')",
//         translated_code: "print('Hi there!')",
//         source_language: 'JavaScript',
//         target_language: 'Python',
//         created_at: { $date: { $numberLong: '1612225000000' }},
//       },
//       {
//         email: 'test@example.com',
//         source_code: "print('Hello, World!')",
//         translated_code: 'console.log("Hello, World!")',
//         source_language: 'Python',
//         target_language: 'JavaScript',
//         created_at: { $date: { $numberLong: '1612125000000' }},
//       }
//     ];

//     fetch.mockResponseOnce(JSON.stringify(mockData));
//     useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
//   });

//     // A test for filtering by source language, for example:
//     test('Filters history by source language correctly', async () => {
//         render(<TranslateHistory />);
      
//         // Wait for the component to finish loading data
//         await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
      
//         // Interact with the UI elements
//         const sourceLanguageSelect = await screen.findByPlaceholderText('Filter by Source Language');
//         fireEvent.change(sourceLanguageSelect, { target: { value: 'python' } });
      
//         // Wait for the UI to update based on the filter
//         await waitFor(() => {
//           const filteredText = screen.getByText(/Python/); // Adjust based on your actual UI and expected outcome
//           expect(filteredText).toBeInTheDocument();
//         });
//       });

//   test('Component renders and displays translation history correctly', async () => {
//     render(<TranslateHistory />);
    
//     // Verify loading state disappears
//     await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

//     // Verify translation history is displayed
//     expect(await screen.findAllByText(/Source Code:/)).toHaveLength(2);
//     expect(screen.getByText("console.log('Hi there!')")).toBeInTheDocument();
//     expect(screen.getByText("print('Hello, World!')")).toBeInTheDocument();
//   });


//   test('Filters history by source language correctly', async () => {
//     render(<TranslateHistory />);

//     // Wait for data to load
//     await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

//     // Perform filtering by source language
//     fireEvent.change(screen.getByPlaceholderText('Filter by Source Language'), { target: { value: 'python' } });

//     // Verify filter effect
//     await waitFor(() => expect(screen.getByText("print('Hello, World!')")).toBeInTheDocument());
//     expect(screen.queryByText("console.log('Hi there!')")).not.toBeInTheDocument();
//   });

//   test('Filters history by target language correctly', async () => {
//     render(<TranslateHistory />);

//     // Wait for data to load
//     await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

//     // Perform filtering by target language
//     fireEvent.change(screen.getByPlaceholderText('Filter by Target Language'), { target: { value: 'javascript' } });

//     // Verify filter effect
//     await waitFor(() => expect(screen.getByText('console.log("Hello, World!")')).toBeInTheDocument());
//     expect(screen.queryByText("print('Hi there!')")).not.toBeInTheDocument();
//   });


//   test('Sorts history based on date', async () => {
//     render(<TranslateHistory />);
//     await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
//   });
// });
