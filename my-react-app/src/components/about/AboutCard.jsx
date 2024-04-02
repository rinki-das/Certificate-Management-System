import React from "react";
import Heading from "../common/heading/Heading";
import "./about.css";
import { homeAbout } from "../../dummydata";
import Awrapper from "./Awrapper";

const AboutCard = () => {
  return (
    <>
      <section className="aboutHome">
        <div className="container flexSB">
          <div className="left row">
            <img
              src="https://trainingmag.com/wp/wp-content/uploads/2021/12/01feature-narayanan-696x696.jpg"
              alt=""
            />
          </div>
          <div className="right row">
            <Heading subtitle="Enhance Workflow Efficiency" title="Streamline tasks for faster, more productive work." />
            <div className="items">
              {homeAbout.map((val) => (
                <div key={val.id} className="item flexSB">
                  <div className="img">{val.icon}</div>
                  <div className="text">
                    <h2>{val.title}</h2>
                    <p>{val.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Awrapper />
    </>
  );
};

export default AboutCard;




