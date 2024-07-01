import {Link} from 'react-router-dom';
import { useContext, useEffect, useState} from 'react';
import { UserContext } from './UserContext';


export default function Header(){
  const {setUserInfo,userInfo} = useContext(UserContext);
  useEffect(()=>{
    fetch('https://mern-blog-app-backend-aaqs.onrender.com/profile',{
      credentials: 'include',
    }).then(response=>{
      response.json().then(userInfo =>{
        setUserInfo(userInfo);
      });
    });
  },[]);
  
  function logout(){
    fetch('https://mern-blog-app-backend-aaqs.onrender.com/logout',{
      credentials:'include',
      method: 'POST',
    });
    setUserInfo(null);
  }

  const username = userInfo?.username;

    return(
        <header>
        <Link to="/" className="logo"> JotTech</Link>
        <nav>
        {
          username && (
            <>
              <Link to="/create"> Create New Post</Link>
              <a onClick={logout}>Logout</a>
            </>
          )
        }
        {!username &&(
          <>
          <Link to="/login"> login</Link>
          <Link to="/register"> Register</Link>
          </>
        )}
        
        </nav>
      </header>
    );
}
