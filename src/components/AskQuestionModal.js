import React, { useState } from 'react';
import { apiCall } from '../services/api';

const AskQuestionModal = ({ onClose, onQuestionPosted }) => {
    const [subject, setSubject] = useState('');
    const [questionText, setQuestionText] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !questionText.trim()) {
            setError('Subject and question text are required.');
            return;
        }

        try {
            await apiCall('/api/forum/questions', 'POST', { subject, questionText });
            onQuestionPosted();
            onClose();
        } catch (err) {
            setError('Failed to post question. Please try again.');
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Ask a New Question</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="subject">Subject</label>
                        <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="questionText">Question</label>
                        <textarea
                            id="questionText"
                            rows="5"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                        ></textarea>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Post Question</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AskQuestionModal;