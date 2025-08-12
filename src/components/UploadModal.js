import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8080';

const UploadModal = ({ onClose, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !description.trim()) {
            setError('Please select a file and provide a description.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description);

        try {
            const token = sessionStorage.getItem('jwtToken');
            const response = await fetch(`${API_BASE_URL}/api/feed/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Upload failed');
            }

            onUploadSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Create New Post</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Image</label>
                        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Upload</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadModal;