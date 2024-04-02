import React from "react";
import './Head.css';

const Head = () => {
  return (
    <>
      <section className='head'>
        <div className='container flexB'>
          {/* Replace the text-based logo with an image */}
          <img
            src="../images/new.png"
            alt="NIELIT Blockchain Version Logo"
            className="logo"  
          />
        </div>
      </section>
    </>
  );
};

export default Head;



