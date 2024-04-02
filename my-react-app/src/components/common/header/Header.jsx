import React, { useState } from "react";
import { Link } from "react-router-dom";
import Head from "./Head";
import "./header.css";

const Header = () => {
  const [click, setClick] = useState(false);

  return (
    <>
      <Head />
      <header>
        <nav className='flexSB'>
          <ul className={click ? "mobile-nav" : "flexSB "} onClick={() => setClick(false)}>
            <li>
              <Link to='/'>
                <i className='fas fa-home'></i> Home
              </Link>
            </li>
            <li>
              <Link to='/courses'>
                <i className='fas fa-graduation-cap'></i> All Courses
              </Link>
            </li>
            <li>
              <Link to='/about'>
                <i className='fas fa-info-circle'></i> About
              </Link>
            </li>
            <li>
              <Link to='/team'>
                <i className='fas fa-users'></i> Team
              </Link>
            </li>
            <li>
              <Link to='/logins'>
                <i className='fas fa-user-cog'></i> Login
              </Link>
            </li>
            
            <li>
              <Link to='/contact'>
                <i className='fas fa-envelope'></i> Contact
              </Link>
            </li>
            <li>
              <Link to='/reg'>
                <i className='fas fa-envelope'></i> Registration
              </Link>
            </li>
           
          </ul>
          
          <button className='toggle' onClick={() => setClick(!click)}>
            {click ? <i className='fas fa-times'></i> : <i className='fas fa-bars'></i>}
          </button>
        </nav>
      </header>
    </>
  );
};

export default Header;

