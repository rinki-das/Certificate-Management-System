import React from 'react';
import './App.css';
import Header from './components/common/header/Header';
import Footer from './components/common/footer/Footer';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import About from './components/about/About';
import CourseHome from './components/allcourses/CourseHome';
import Team from './components/team/Team';
import Contact from './components/contact/Contact';
import Home from './components/home/Home';
import Admin from './components/Admin/admin'; // Corrected file name
import Logins from './components/Admin/Logins';
import DataEntry from './components/Admin/DataEntry';
import CertDept from './components/Admin/CertDept';
import AdminForm from './components/Admin/AdminForm';
import UserForm from './components/Admin/UserForm'; // Update this path
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrintCert from './components/Admin/PrintCert'
import Certtable from './components/Admin/certtable';
import NotificationsPage from './components/Admin/NotificationsPage';
import AddCert from './components/Admin/AddCert';
import Reg from './components/Admin/Reg';
import Admins from './components/Admin/Admins';
import ProPage from './components/Admin/ProPage'
import BatchCode from './components/Admin/BatchCode'
import FindStudent from './components/Admin/FindStudent';
import DisplayStudent from './components/Admin/DisplayStudent';
import ForgetPass from './components/Admin/ForgetPass';
import AddInstitute from './components/Admin/AddInstitute';
import StudentTable from './components/Admin/StudentTable'
import TablePrint from './components/Admin/tableprint'
import Certificate from './components/Admin/Certificate'


export default function App() {
  return (
    <Router>
      <ToastContainer /> {/* Include ToastContainer here */}
      <Routes>
        <>
          <Route path="/" element={<><Header /><Home /><Footer /></>} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/about" element={<><Header /><About /><Footer /></>} />
          <Route path="/courses" element={<><Header /><CourseHome /><Footer /></>} />
          <Route path="/team" element={<><Header /><Team /><Footer /></>} />
          <Route path="/contact" element={<><Header /><Contact /><Footer /></>} />
          <Route path="/data-entry" element={<DataEntry />} />
          <Route path="/logins" element={<Logins />} />
          <Route path="/certdept" element={<CertDept />} />
          <Route path="/certtable" element={<Certtable />} />
          <Route path="/notify" element={<><Header /><NotificationsPage /><Footer /></>} />
          <Route path="/add" element={<AddCert />} />
          <Route path="/adminform" element={<AdminForm />} />
          <Route path="/userform" element={<UserForm />} />
          <Route path="/reg" element={<Reg />} />
          <Route path="/printcert" element={<PrintCert />} />
          <Route path="/pro" element={<ProPage />} />
          <Route path="/admins" element={<Admins />} />
          <Route path="/batch" element={<BatchCode />} />
          <Route path="/findstudent" element={<FindStudent/>} />
          <Route path="/display" element={<DisplayStudent/>} />
          <Route path="/forgetpass" element={<ForgetPass/>} />
          <Route path="/addinst" element={<AddInstitute/>} />
          <Route path="/Student" element={<StudentTable/>} />
          <Route path="/table" element={<TablePrint/>} />
          <Route path="/cert" element={<Certificate/>} />
        </>
      </Routes>
    </Router>
  );
}