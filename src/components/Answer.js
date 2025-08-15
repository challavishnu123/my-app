import React from 'react';
import { apiCall } from '../services/api';
import './Answer.css';
const Answer = ({ answer, onDataChange }) => {
    
    const handleVote = async (isUpvote) => {
        try {
            await apiCall(`/api/forum/answers/${answer.id}/vote`, 'POST', { isUpvote });
            onDataChange(); // Refresh data to show new vote counts
        } catch (error) {
            console.error("Voting failed:", error);
        }
    };
    
    return (
        <div className="answer-card">
            <p className="answer-text">{answer.answerText}</p>
            <div className="answer-footer">
                <span className="answer-author">Answered by: {answer.studentId}</span>
                <div className="vote-controls">
                    <button onClick={() => handleVote(true)}>👍 {answer.upvotes}</button>
                    <button onClick={() => handleVote(false)}>👎 {answer.downvotes}</button>
                </div>
            </div>
        </div>
    );
};

export default Answer;