import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import './feedback.css';
import badEmoji from './bad.png';
import excellentEmoji from './excellent.png';
import goodEmoji from './good.png';
import okayEmoji from './okay.png';
import poorEmoji from './poor.png';
import thinkingEmoji from './thinking-face.png';
import spongeBobThankYouMeme from './spongebob-thank-you.png.gif'; // Make sure this path is correct

const FeedbackPage = () => {
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const emojis = {
        0: thinkingEmoji,
        1: poorEmoji,
        2: badEmoji,
        3: okayEmoji,
        4: goodEmoji,
        5: excellentEmoji,
    };

    const handleRating = (ratingValue) => {
        setRating(ratingValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Collect feedback data from the form fields
        const feedbackData = {
            firstName: e.target.elements.firstName.value,
            lastName: e.target.elements.lastName.value,
            email: e.target.elements.email.value,
            phoneNumber: e.target.elements.phoneNumber.value,
            message: e.target.elements.message.value,
            rating: rating,
        };

        // Send feedback data to the backend using fetch API
        try {
            const response = await fetch('http://localhost:8080/submit_feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
            });
            

            if (response.ok) {
                // If the response is successful, trigger the confetti and update the submitted state
                triggerConfetti();
                setSubmitted(true);
            } else {
                // If the response is not successful, log the error or display an error message
                console.error('Failed to submit feedback');
            }
        } catch (error) {
            // Catch any errors here and log them or display an error message
            console.error('There was an error submitting the feedback:', error);
        }
    };

    // Ensure your form elements have `name` attributes corresponding to these values


    const triggerConfetti = () => {
        confetti({
            zIndex: 999,
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
        });
    };

    // Render only the submission message with the meme if submitted
    if (submitted) {
        return (
            <div className="feedback-layout">
                <div className="submission-message">
                    <img src={spongeBobThankYouMeme} alt="Thank You" />
                </div>
            </div>
        );
    }

    // Render the feedback form if not submitted
    return (
        <div className="feedback-layout">
            <h1>Tell us your experience</h1>
            <p>We value your feedback. Please share your experience with us.</p>
            <img src={emojis[rating]} alt="Feedback Emoji" className="feedback-emoji" />
            <div className="star-rating">
                {[...Array(5)].map((star, index) => (
                    <span key={index} onClick={() => handleRating(index + 1)} className={`star ${rating > index ? 'filled' : ''}`}>
                        &#9733;
                    </span>
                ))}
            </div>
            <form className="contact-form" onSubmit={handleSubmit}>
                <input type="text" name="firstName" placeholder="First Name" />
                <input type="text" name="lastName" placeholder="Last Name" />
                <input type="email" name="email" placeholder="Email" />
                <input type="tel" name="phoneNumber" placeholder="Phone Number" />
                <textarea name="message" placeholder="Your Message"></textarea>
                <button type="submit">Send Feedback</button>
            </form>

        </div>
    );
};

export default FeedbackPage;