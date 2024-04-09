import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import tutorialGif from './tutorial1.gif'; // Make sure this path is correct

const Tutorial1 = () => {

const navigate = useNavigate(); // Hook for navigation

      // Function to handle navigation back to FAQs page
  const goBackToFaq = () => {
    navigate('/faqs'); // Replace '/faqs' with your actual FAQs page path
  };

    // Style for the back button with an arrow
    const backButtonStyle = {
        cursor: 'pointer',
        padding: '10px 20px',
        fontSize: '1rem',
        margin: '20px 0',
        alignSelf: 'flex-start', // Align the button to the left
        border: 'none', // Remove border if you don't need it
        background: 'transparent', // Remove background for a text-only button
        textDecoration: 'none', // Remove underline from text
      };

  // Styles for the container that holds the video/GIF and the glow
  const videoContainerStyle = {
    position: 'relative',
    width: '70%', // The width of the video/GIF
    display: 'flex', // To center the video/GIF
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '2rem',
  };

  // Styles for the glowing effect
  const glowStyle = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(135deg, rgba(255,0,0,1) 0%, rgba(255,154,0,1) 10%, rgba(208,222,33,1) 20%, rgba(79,220,74,1) 30%, rgba(63,218,216,1) 40%, rgba(47,201,226,1) 50%, rgba(28,127,238,1) 60%, rgba(95,21,242,1) 70%, rgba(186,12,248,1) 80%, rgba(251,7,217,1) 90%, rgba(255,0,0,1) 100%)',
    borderRadius: '25px',
    filter: 'blur(10px)',
    zIndex: -1, // Behind the content
  };

  // Style for the steps list
  const stepsStyle = {
    textAlign: 'center',
    maxWidth: '600px', // Adjust as necessary
    marginBottom: '4rem',
    marginTop : '1rem',
  };

  const boldHeadingStyle = {
    fontWeight: 'bold', // Makes text bold
    fontSize: '2rem', // You can adjust the font size as needed
    margin: '20px 0', // Add some margin if needed
    textAlign: 'center', // Center align the heading
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        {/* Button to go back to the FAQs page, positioned at the top */}
      {/* Arrow button to go back to the FAQs page */}
      <button onClick={goBackToFaq} style={backButtonStyle}>
        ← Back to FAQs
      </button>


      {/* Steps for using the code conversion tool */}
      <div style={stepsStyle}>
      <h1 style={boldHeadingStyle}>How to Use the Code Converter</h1>
        <ol>
          <li>Select the source language of your code.</li>
          <li>Select the target language for the conversion.</li>
          <li>Paste your source code into the input field.</li>
          <li>Click on 'Convert' to get your code conversion.</li>
          <li>Use the 'Copy', 'Upload', and 'Download' features as needed.</li>
        </ol>
      </div>

      {/* Video/GIF container with glow */}
      <div style={videoContainerStyle}>
        <div style={glowStyle} /> {/* The glowing effect */}
        <img src={tutorialGif} alt="Code Conversion Tutorial" style={{ width: '100%', height: 'auto', borderRadius: '25px' }} />
      </div>

     {/* Button to go back to the FAQs page, positioned at the bottom */}
      {/* Uncomment if you prefer the button at the bottom
      <button onClick={goBackToFaq} style={{ padding: '10px 20px', fontSize: '1rem', marginTop: '20px', alignSelf: 'center' }}>
        Back to FAQs
      </button>

      {/* Other content
      <h1>Binary Brains</h1>
      <button style={{ padding: '10px 20px', fontSize: '1rem' }}>Convert</button> */}
      
    </div>
  );
};

export default Tutorial1;