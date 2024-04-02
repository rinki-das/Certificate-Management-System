import React from "react";
import "./footer.css";

const Footer = () => {
  return (
    <>
      <section className='newletter'>
        <div className='container flexSB'>
          <div className='left row'>
            <h1>Write to us here</h1>
            <span></span>
          </div>
          <div className='right row'>
            <input type='text' placeholder='Enter email address' />
            <i className='fa fa-paper-plane'></i>
          </div>
        </div>
      </section>
      <footer>
        <div className='container padding'>
          <div className='logo'>
            <img src="https://nielit.gov.in/images/NIELIT_logo.jpg" alt="NIELIT Logo" style={{ width: '150px', height: 'auto', }} />
            <span>EDUCATION, LEARNING & MANAGEMENT</span>
            <p>National Institute of Electronics and Information Technology, formerly known as the DOEACC Society, is a society that offers Information Technology and Electronics training at different levels.</p>

            <a href="https://www.facebook.com/NIELITIndia/" target="_blank" rel="noopener noreferrer">
              <i className='fab fa-facebook-f icon'></i>
            </a>
            <a href="https://twitter.com/NIELITIndia?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor" target="_blank" rel="noopener noreferrer">
              <i className='fab fa-twitter icon'></i>
            </a>
            <a href="https://www.instagram.com/kol_nielit/" target="_blank" rel="noopener noreferrer">
              <i className='fab fa-instagram icon'></i>
            </a>
          </div>
          <div className='box link'>
            <h3>Explore</h3>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="https://nielit.gov.in/kolkata/">Services</a></li>
              <li><a href="https://nielit.gov.in/kolkata/content/various-courses-training-programmes-0">Courses</a></li>
              <li><a herf='https://nielit.gov.in/kolkata//content/acts-rules'>Act and Rules</a></li>
            </ul>
          </div>
          <div className='box link'>
            <h3>Quick Links</h3>
            <ul>
              <li><a href="https://nielit.gov.in/kolkata/">Contact Us</a></li>
              <li><a href="https://nielit.gov.in/node/3561">Terms & Conditions</a></li>
              <li><a href="https://nielit.gov.in/kolkata//node/3563">Privacy</a></li>
              <li><a href="https://nielit.gov.in/kolkata/sites/default/files/Kolkata/Holiday%20List%202024.pdf">Holiday List</a></li>
            </ul>
          </div>
          
          <div className='box last'>
            <h3>Have a Questions?</h3>
            <ul>
              <li>
                <i className='fa fa-map'></i>
                Jadavpur University Campus, Kolkata-700032
              </li>
              <li>
                <i className='fa fa-phone-alt'></i>
                (033) 2414 - 6054/ 6081
              </li>
              <li>
                <i className='fa fa-paper-plane'></i>
                <a href="mailto:dir-kolkata@nielit.gov.in">dir-kolkata@nielit.gov.in</a> <a href="mailto:kolkata@nielit.gov.in">kolkata@nielit.gov.in</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
      <div className='legal'>
        <p>
          Copyright ©2023 All rights reserved by NIELIT
        </p>
      </div>
    </>
  );
};

export default Footer;
