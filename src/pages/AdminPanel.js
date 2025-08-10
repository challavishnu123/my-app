import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';

const AdminPanel = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStudents = async () => {
        try {
            const data = await apiCall('/faculty/students');
            setStudents(data.students);
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

    if (loading) return <div>Loading student data...</div>;

    return (
        <div className="admin-container">
            <h1>Admin Panel - Manage Students</h1>
            <div className="user-list-table">
                <table>
                    <thead>
                        <tr>
                            <th>Roll Number / ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;