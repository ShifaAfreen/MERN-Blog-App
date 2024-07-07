import 'react-quill/dist/quill.snow.css';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Editor from '../components/Editor';

export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Utility function to get cookie value
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    // Extract token from cookies
    const token = getCookie('token');

    async function createNewPost(ev) {
        ev.preventDefault();

        // Create a FormData object to send the data
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('file', files[0]);

        if (!token) {
            setErrorMessage('No token found');
            return;
        }

        setErrorMessage('');

        try {
            // Send a POST request to the backend
            const response = await fetch('https://mern-blog-app-backend-aaqs.onrender.com/post', {
                method: 'POST',
                body: data,
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`  // Include the token in the Authorization header
                },
            });

            if (response.ok) {
                setRedirect(true);
            } else {
                console.error('Failed to create post');
                const errorData = await response.json();
                setErrorMessage(errorData.error || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            setErrorMessage('An error occurred while creating the post.');
        }
    }

    if (redirect) {
        return <Navigate to={'/'} />;
    }

    return (
        <form onSubmit={createNewPost}>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
            <input
                type="text"
                placeholder={'Title'}
                value={title}
                onChange={ev => setTitle(ev.target.value)}
            />
            <input
                type="text"
                placeholder={'Summary'}
                value={summary}
                onChange={ev => setSummary(ev.target.value)}
            />
            <input
                type="file"
                onChange={ev => setFiles(ev.target.files)}
            />
            <Editor value={content} onChange={setContent} />
            <div className="button-container">
                <button style={{ marginTop: '5px' }}>Create Post</button>
            </div>
        </form>
    );
}
