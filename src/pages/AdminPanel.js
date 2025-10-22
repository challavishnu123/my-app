import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import './AdminPanel.css';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate(); // Add this line

    const fetchStudents = async () => {
        try {
            const data = await apiCall('/faculty/students');
            setStudents(data.students);
            setFilteredStudents(data.students);
        } catch (error) {
            console.error("Failed to fetch students:", error);
            alert("Could not load student data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredStudents(students);
        } else {
            const filtered = students.filter(student =>
                student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredStudents(filtered);
        }
    }, [searchQuery, students]);

    const handleDeleteStudent = async (rollNumber) => {
        if (!window.confirm(`Are you sure you want to delete the student: ${rollNumber}? This action cannot be undone.`)) {
            return;
        }

        try {
            await apiCall('/student/delete', 'DELETE', { rollNumber });
            alert(`Student ${rollNumber} has been deleted successfully.`);
            // Refresh the list after deletion
            fetchStudents();
        } catch (error) {
            alert(`Failed to delete student: ${error.message}`);
        }
    };

    const handleRegisterClick = () => {
        console.log("Register button clicked, navigating...");
        navigate('/admin/register');
    };

    if (loading) return <div className="loading-spinner">Loading student data...</div>;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div className="admin-header-left">
                    <h1>Admin Panel - Manage Students</h1>
                    <div className="admin-stats">
                        <div className="stat-card">
                            <span className="stat-number">{students.length}</span>
                            <span className="stat-label">Total Students</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{filteredStudents.length}</span>
                            <span className="stat-label">Filtered Results</span>
                        </div>
                    </div>
                </div>
                
                <div className="admin-header-actions">
                    <button
                        type="button"
                        className="admin-action-btn"
                        onClick={handleRegisterClick}
                        title="Register new student"
                    >
                        Register Student
                    </button>
                </div>
            </div>
            
            <div className="search-bar-container">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search students by roll number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="student-search-input"
                    />
                    {searchQuery && (
                        <button 
                            className="clear-search-btn"
                            onClick={() => setSearchQuery('')}
                            title="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="user-list-table">
                <table>
                    <thead>
                        <tr>
                            <th>Roll Number / ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <tr key={student.rollNumber}>
                                    <td>{student.rollNumber}</td>
                                    <td>
                                        <button 
                                            className="delete-button"
                                            onClick={() => handleDeleteStudent(student.rollNumber)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" className="no-results">
                                    {searchQuery ? `No students found matching "${searchQuery}"` : 'No students found'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;