import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import Question from '../components/Question';
import AskQuestionModal from '../components/AskQuestionModal';
import useAuth from '../hooks/useAuth';

const Forum = () => {
    // --- THIS IS THE FIX ---
    // The state now expects an array (List) instead of an object (Map)
    const [qnaList, setQnaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const { user } = useAuth();
    
    const fetchForumData = async () => {
        try {
            // The data from the API is now a clean array
            const data = await apiCall('/api/forum/questions');
            setQnaList(data);
        } catch (error) {
            console.error("Failed to fetch forum data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForumData();
    }, []);

    if (loading) return <div className="loading-spinner">Loading...</div>;

    return (
        <div className="forum-container">
            <header className="forum-header">
                <h1>Q&A Forum</h1>
                {user.userType === 'FACULTY' && (
                    <button onClick={() => setShowModal(true)}>Ask a Question</button>
                )}
            </header>
            
            <div className="question-feed">
                {/* --- THIS IS THE FIX --- */}
                {/* We now map over the qnaList array directly. No more JSON.parse()! */}
                {qnaList.length > 0 ? (
                    qnaList.map(item => (
                       <Question 
                            key={item.question.id} 
                            question={item.question} 
                            initialAnswers={item.answers}
                            onDataChange={fetchForumData}
                        />
                    ))
                ) : (
                    <p>No questions have been asked yet.</p>
                )}
            </div>

            {showModal && (
                <AskQuestionModal 
                    onClose={() => setShowModal(false)}
                    onQuestionPosted={fetchForumData}
                />
            )}
        </div>
    );
};

export default Forum;