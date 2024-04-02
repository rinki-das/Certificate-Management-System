import React from "react"
import Back from "../common/back/Back"
import "./contact.css"

const Contact = () => {
  const map = 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14744.752748784837!2d88.3713922!3d22.4971215!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02712492567ec7%3A0x2de1ded98e81e282!2sNIELIT%2C%20Kolkata%20Center!5e0!3m2!1sen!2sin!4v1694936272864!5m2!1sen!2sin"  width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" '
  return (
    <>
      <Back title='Contact us' />
      <section className='contacts padding'>
        <div className='container shadow flexSB'>
          <div className='left row'>
            <iframe src={map}></iframe>
          </div>
          <div className='right row'>
            <h1>Contact us</h1>
            <p>We're open for any suggestion or just to have a chat</p>

            <div className='items grid2'>
              <div className='box'>
                <h4>ADDRESS:</h4>
                <p> Jadavpur University Campus, Jadavpur, Jadavpur, Kolkata, West Bengal 700032</p>
              </div>
              <div className='box'>
                <h4>EMAIL:</h4>
                <p> dir-kolkata@nielit.gov.in kolkata@nielit.gov.in</p>
              </div>
              <div className='box'>
                <h4>PHONE:</h4>
                <p> 91-033-4602-2246</p>
              </div>
            </div>

            <form action=''>
              <div className='flexSB'>
                <input type='text' placeholder='Name' />
                <input type='email' placeholder='Email' />
              </div>
              <input type='text' placeholder='Subject' />
              <textarea cols='30' rows='10'>
                Create a message here...
              </textarea>
              <button className='primary-btn'>SEND MESSAGE</button>
            </form>

            <h3>Follow us here</h3>
            <span>FACEBOOK TWITTER INSTAGRAM YOUTUBE</span>
          </div>
        </div>
      </section>
    </>
  )
}

export default Contact
