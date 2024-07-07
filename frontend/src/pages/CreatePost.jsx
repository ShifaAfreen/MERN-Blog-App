import 'react-quill/dist/quill.snow.css';
import {useState} from 'react';
import { Navigate } from 'react-router-dom';
import Editor from '../components/Editor'



export default function CreatePost(){
    const[title, setTitle] = useState('');
    const[summary, setSummary] = useState('');
    const[content, setContent] = useState('');
    const[files, setFiles] = useState('');
    const[redirect, setRedirect] = useState(false);
    const [errorMessage, setErrorMessage] =  useState('');

    
      async function createNewPost(ev){

        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('file',files[0]);

        setErrorMessage('');
        ev.preventDefault();
        const response = await fetch('https://mern-blog-app-backend-aaqs.onrender.com/post',{
            method: 'POST',
            body: data,
            credentials: 'include',
        });

        if(response.ok){
          setRedirect(true);
        }else {
            console.error('Failed to create post');
            const errorData = await response.json();
            setErrorMessage(errorData.error);
        }
      }

      if(redirect){
        return <Navigate to={'/'}/>
      }

    return(
        <form onSubmit={createNewPost}>
          {errorMessage && <div style={{color:'red'}}>{errorMessage}</div>}
            <input type="title" 
                    placeholder={'Title'}
                    value={title}
                    onChange={ev =>setTitle(ev.target.value)} />
            <input type="summary" 
                    placeholder={'Summary'}
                    value={summary}
                    onChange={ev =>setSummary(ev.target.value)} />
            <input type="file"
                    onChange={ev=> setFiles(ev.target.files)} />
            <Editor value={content} onChange={setContent}/>
            <div className="button-container">
            <button style={{marginTop: '5px'}}> Create Post</button>
            </div>

        </form>
    );
}
