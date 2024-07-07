import { Navigate, useParams } from 'react-router-dom';
import Editor from '../components/Editor';
import { useEffect, useState } from 'react';

export default function EditPost() {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState(null); // Use null initially
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:4000/post/${id}`)
            .then(response => response.json())
            .then(postInfo => {
                setTitle(postInfo.title);
                setContent(postInfo.content);
                setSummary(postInfo.summary);
            });
    }, [id]);

    async function updatePost(ev) {
        ev.preventDefault();
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('id', id);

        if (files && files.length > 0) {
            data.set('file', files[0]);
        }

        const response = await fetch('https://mern-blog-app-backend-aaqs.onrender.com/post', {
            method: 'PUT',
            body: data,
            credentials: 'include',
        });

        if (response.ok) {
            setRedirect(true);
        } else {
            console.error('Failed to update post');
            
        }
    }

    async function deletePost() {
        const response = await fetch(`https://mern-blog-app-backend-aaqs.onrender.com/post/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (response.ok) {
            setRedirect(true);
        } else {
            console.error('Failed to delete post');
        }
    }

    if (redirect) {
        return <Navigate to="/" />;
    }

    return (
        <form onSubmit={updatePost}>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={ev => setTitle(ev.target.value)}
            />
            <input
                type="text"
                placeholder="Summary"
                value={summary}
                onChange={ev => setSummary(ev.target.value)}
            />
            <input
                type="file"
                onChange={ev => setFiles(ev.target.files)}
            />
            <Editor onChange={setContent} value={content} />
            <div className="button-container">
            <button style={{ marginTop: '5px' }}>Update Post</button>
            <button onClick={deletePost} style={{ marginTop: '5px', marginLeft: '5px' }}>Delete Post</button>
            </div>
            
        </form>
    );
}
