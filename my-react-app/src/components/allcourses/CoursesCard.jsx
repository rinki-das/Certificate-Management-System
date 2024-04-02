// CoursesCard.jsx

import React from "react";
import "./courses.css";
import { coursesCard } from "../../dummydata";

const CoursesCard = () => {
  return (
    <>
      <section className='coursesCard'>
        <div className='container grid2'>
          {coursesCard.map((val) => (
            <div className='items' key={val.coursesName}>
              <div className='content flex'>
                <div className='left'>
                  <div className='img'>
                    <img src={val.cover} alt='' />
                  </div>
                </div>
                <div className='text'>
                  <h1>{val.coursesName}</h1>
                  <div className='rate'>
                    <i className='fa fa-star'></i>
                    <i className='fa fa-star'></i>
                    <i className='fa fa-star'></i>
                    <i className='fa fa-star'></i>
                    <i className='fa fa-star'></i>
                    <label htmlFor=''>{val.rating}</label>
                  </div>
                  <div className='details'>
                    {val.courTeacher.map((details, index) => (
                      <React.Fragment key={index}>
                        <div className='box'>
                          <div className='dimg'>
                            <img src={details.dcover} alt='' />
                          </div>
                          <div className='para'>
                            <h4>{details.name}</h4>
                          </div>
                        </div>
                        <span>{details.totalTime}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
              {/* Gooey Button */}
              <button className="c-button c-button--gooey">
                ENROLL NOW!
                <div className="c-button__blobs">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default CoursesCard;

