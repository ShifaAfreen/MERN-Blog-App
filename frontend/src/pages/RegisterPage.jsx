import { useState } from "react";
import { Navigate } from "react-router-dom";

export default function RegisterPage(){

    const [username, setUsername] = useState('');
    const [useremail, setUseremail] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);

    async function register(ev){
        ev.preventDefault();
        const response = await fetch('https://mern-blog-app-backend-aaqs.onrender.com/register',{
            method: 'POST',
            body: JSON.stringify({username,useremail,password}),
            headers:{'Content-Type':'application/json'},
        });
        if (response.status === 200) {
            alert('registration successfull');
            setRedirect(true);
            
        } else {
            alert('Registration failed');
        }
    }
    if(redirect){
        return <Navigate to={'/login'}/>
    }

    return(
        <form className="register" onSubmit={register}>
            <h1>Create Your JotTech Account</h1>
        <input type="text" 
            placeholder="Username"
            value={username} 
            onChange={ev=> setUsername(ev.target.value)}/>
        <input type="email" 
            placeholder="Email id"
            value={useremail} 
            onChange={ev=> setUseremail(ev.target.value)}/>
        <input type="password" 
            placeholder="Password"
            value={password}
            onChange={ev=> setPassword(ev.target.value)} />
            <button>Register</button>
        </form>
    );
}
