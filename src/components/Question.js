import React, { useState } from 'react';
import { apiCall } from '../services/api';
import Answer from './Answer';
import useAuth from '../hooks/useAuth';
import './Question.css';
const Question = ({ question, initialAnswers, onDataChange }) => {
    const [answerText, setAnswerText] = useState('');
    const { user } = useAuth();

    const handlePostAnswer = async (e) => {
        e.preventDefault();
        if (!answerText.trim()) return;

        try {
            await apiCall('/api/forum/answers', 'POST', {
                questionId: question.id,
                answerText: answerText,
            });
            setAnswerText('');
            onDataChange(); // Refresh the entire forum data
        } catch (error) {
            // --- THIS IS THE FIX ---
            // Catch the error from the backend and display it in an alert.
            // This provides immediate feedback to the user.
            alert(`Error: ${error.message}`);
            console.error('Failed to post answer:', error);
        }
    };

    return (
        <div className="question-card">
            <div className="question-header">
                <span className="question-subject">{question.subject}</span>
                <span className="question-author">Asked by: {question.facultyId}</span>
                <span className="question-date">{new Date(question.date).toLocaleDateString()}</span>
            </div>
            <p className="question-text">{question.questionText}</p>

            <div className="answers-section">
                <h4>Answers</h4>
                {initialAnswers.length > 0 ? (
                    initialAnswers.map(ans => <Answer key={ans.id} answer={ans} onDataChange={onDataChange} />)
                ) : (
                    <p className="no-answers">No answers yet.</p>
                )}
            </div>
            
            {user.userType === 'STUDENT' && (
                 <form className="answer-form" onSubmit={handlePostAnswer}>
                    <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Write your answer..."
                        rows="3"
                    ></textarea>
                    <button type="submit">Post Answer</button>
                </form>
            )}
        </div>
    );
};

export default Question;