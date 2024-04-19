const express = require('express');
const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3001;
const multer = require('multer');
const mongoURL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const dbName = 'NIELIT';
const path = require('path');
const xlsx = require('xlsx');
require('dotenv').config();
app.use(cors());
app.use(express.json());

// Use environment variables for sensitive information
const emailUser = process.env.EMAIL_USER || 'enter your emailID here';
const emailPass = process.env.EMAIL_PASS || 'enter your email key here';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

let db; // Declare the 'db' variable outside the connection block

const connectToMongo = async () => {
  const client = new MongoClient(mongoURL, { useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(dbName); // Assign the 'db' variable here
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const otpStorage = {};

const getSequenceNumber = async (mobcode, distCode, courseCode) => {
  const client = await connectToMongo();
  const db = client.db(dbName);
  const batchCodeMasterCollection = db.collection('batchcode_master');

  const existingBatch = await batchCodeMasterCollection.findOne({
    mobcode,
    dist_code: distCode,
    course_code: courseCode,
  });

  if (!existingBatch) {
    return '01';
  }

  const lastBatchCode = existingBatch.batchcode;
  const lastSequenceNumber = lastBatchCode.slice(-2);
  const nextSequenceNumber = (parseInt(lastSequenceNumber, 10) + 1).toString().padStart(2, '0');

  return nextSequenceNumber;
};

const instituteDetailsCollection = 'Institute_Details';

// Fetch last mobcode number
app.get('/lastMobcode', async (req, res) => {
  let client;
  try {
    client = new MongoClient(mongoURL, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(instituteDetailsCollection);
    const lastDoc = await collection.findOne({}, { sort: { mobcode: -1 } });
    
    let lastMobcode = 0; // Initialize as integer
    if (lastDoc && lastDoc.mobcode) {
      lastMobcode = parseInt(lastDoc.mobcode, 10); // Parse string to integer
    }

    res.status(200).json(lastMobcode);
  } catch (error) {
    console.error('Error fetching last mobcode:', error);
    res.status(500).json({ error: 'Failed to fetch last mobcode' });
  } finally {
    if (client) {
      await client.close();
    }
  }

});

// Route to fetch all courses with names and codes
app.get('/api/courses', async (req, res) => {
  let client; // Declare the client variable

  try {
    // Create a new MongoClient instance
    client = new MongoClient(mongoURL, { useUnifiedTopology: true });

    // Connect to the MongoDB server
    await client.connect();

    // Access the database and collection
    const db = client.db(dbName);
    const courseCollection = db.collection('course_master');

    // Fetch all courses from the collection
    const courses = await courseCollection.find({}, { projection: { _id: 0 } }).toArray();

    // Send the courses as JSON response
    res.json(courses);
  } catch (error) {
    // Handle any errors
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    // Close the MongoDB client connection
    if (client) {
      await client.close();
    }
  }
});



// Add Institute route
app.post('/addInstitute', async (req, res) => {
  let client;
  try {
    client = new MongoClient(mongoURL, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    const { ownerName, organisationName, mobileNumber, altMobileNumber, email, address, postOffice, policeStation, district, distCode, pinCode, selectedCourses } = req.body;

    // Fetch the last mobcode to determine the next mobcode
    const lastMobcode = await getLastMobcode(db);

    // Increment the last mobcode by 1
    const nextMobcode = lastMobcode + 1;

    // Store the institute details with the next mobcode
    const instituteResult = await db.collection(instituteDetailsCollection).insertOne({
      mobcode: nextMobcode.toString(), // Convert back to string before storing
      owner_name: ownerName,
      orgname: organisationName,
      mobile_number: mobileNumber,
      alt_mobile_num: altMobileNumber,
      email: email,
      address: address,
      po: postOffice,
      ps: policeStation,
      dist_code: distCode,
      district_name: district,
      pin_code: pinCode,
    });

    // Add course information for the institute with the same mobcode
    const courseResult = await db.collection(instituteCourseCollection).insertMany(selectedCourses.map(courseCode => ({
      mobcode: nextMobcode.toString(),
      course_code: courseCode,
      Reg_By_UserID: 'user', // Assuming this is a hardcoded value for now
      Register_Time: new Date().toISOString(), // Use current time as registration time
    })));

    res.status(200).json({ success: true, message: 'Institute details and course information added successfully!' });
  } catch (error) {
    console.error('Error adding institute details:', error);
    res.status(500).json({ success: false, message: 'Failed to add institute details and course information. Please try again.' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});



const instituteCourseCollection = 'Institute_course_master';
// Add Institute course route
app.post('/addInstituteCourse', async (req, res) => {
  let client;
  try {
    client = new MongoClient(mongoURL, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    const { mobcode, courseCode, Reg_By_UserID, Register_Time } = req.body;

    // Store the course information for the institute
    await db.collection(instituteCourseCollection).insertOne({
      mobcode: mobcode,
      course_code: courseCode,
      Reg_By_UserID: Reg_By_UserID,
      Register_Time: Register_Time,
    });

    res.status(200).json({ success: true, message: 'Course information added successfully!' });
  } catch (error) {
    console.error('Error adding course information:', error);
    res.status(500).json({ success: false, message: 'Failed to add course information. Please try again.' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});




// Add Institute and Course route
app.post('/addInstituteAndCourse', async (req, res) => {
  let client;
  try {
    client = new MongoClient(mongoURL, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    const { ownerName, organisationName, mobileNumber, altMobileNumber, email, address, postOffice, policeStation, district, distCode, pinCode, selectedCourses } = req.body;

    // Fetch the last mobcode to determine the next mobcode
    const lastMobcode = await getLastMobcode(db);

    // Increment the last mobcode by 1
    const nextMobcode = lastMobcode + 1;

    // Store the institute details with the next mobcode
    const result = await db.collection(instituteDetailsCollection).insertOne({
      mobcode: nextMobcode.toString(), // Convert back to string before storing
      owner_name: ownerName,
      orgname: organisationName,
      mobile_number: mobileNumber,
      alt_mobile_num: altMobileNumber,
      email: email,
      address: address,
      po: postOffice,
      ps: policeStation,
      dist_code: distCode,
      district_name: district,
      pin_code: pinCode,
    });

    // Insert course information for the institute
    const coursesInsertionResult = await Promise.all(selectedCourses.map(courseCode => {
      return db.collection(instituteCourseMasterCollection).insertOne({
        mobcode: nextMobcode.toString(),
        course_code: courseCode,
        Reg_By_UserID: 'user', // Assuming this is a hardcoded value for now
        Register_Time: new Date().toISOString(), // Use current time as registration time
      });
    }));

    res.status(200).json({ success: true, message: 'Institute details and courses added successfully!' });
  } catch (error) {
    console.error('Error adding institute details and courses:', error);
    res.status(500).json({ success: false, message: 'Failed to add institute details and courses. Please try again.' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

// we need to ensure that when fetching the last mobcode, it's treated as an integer,
// and when incrementing it, it remains an integer until it's stored back as a string in the database.

// Function to fetch the last mobcode
async function getLastMobcode(db) {
  const collection = db.collection(instituteDetailsCollection);
  const lastDoc = await collection.findOne({}, { sort: { mobcode: -1 } });
  let lastMobcode = 0; // Initialize as integer
  if (lastDoc && lastDoc.mobcode) {
    lastMobcode = parseInt(lastDoc.mobcode, 10); // Parse string to integer
  }
  return lastMobcode;
}



app.get('/distinfo', async (req, res) => {
  let client; // Declare the client variable

  try {
    client = await connectToMongo(); // Assign the client variable
    const db = client.db(dbName);
    const districtMasterCollection = db.collection('district_master');
    const districts = await districtMasterCollection.find({}, { projection: { _id: 0, district_name: 1, dist_code: 1 } }).toArray();
    res.json(districts);
  } catch (error) {
    console.error('Error fetching district information:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the client in the finally block to ensure it is always closed
    if (client) {
      await client.close();
    }
  }
});


app.get('/getBatchDetails', async (req, res) => {
  let client;

  try {
    const { batchCode } = req.query;
    console.log('Received batchCode:', batchCode);

    client = await connectToMongo();
    const db = client.db(dbName);
    const batchesCollection = db.collection('batchcode_master');

    // Use a simple query without regular expression
    const batchDetails = await batchesCollection.findOne({ batchCode });

    if (!batchDetails) {
      res.status(404).json({ error: 'Batch details not found' });
      return;
    }

    res.json({ batchDetails });
  } catch (error) {
    console.error('Error fetching batch details:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

// Endpoint for sending notifications
app.post('/sendNotification', async (req, res) => {
  let client; // Declare the 'client' variable here

  try {
    const { batchCode, courseName, startDate, endDate } = req.body;

    // Ensure the 'db' variable is assigned by connecting to MongoDB
    client = await connectToMongo();

    const certificateCollection = db.collection('certificate');

    // Fetch all email addresses from the certificate collection
    const emails = await certificateCollection.distinct('email');

    // Prepare the email content
    const mailOptions = {
      from: emailUser,
      to: emails.join(', '), // Concatenate all email addresses
      subject: 'Notification from User Department',
      text: `Dear Certificate Department,\n\nPlease continue with the other process for the following:\n\nBatch Code: ${batchCode}\nCourse Name: ${courseName}\nStart Date: ${startDate}\nEnd Date: ${endDate}\n\nRegards,\nAdmin`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false });
      } else {
        console.log('Email sent:', info.response);
        res.json({ success: true });
      }
    });
  } catch (error) {
    console.error('Error in sendNotification endpoint:', error);
    res.status(500).json({ success: false });
  } finally {
    if (client) {
      await client.close();
    }
  }
});


app.post('/forgotpassword', (req, res) => {
  const { email } = req.body;

  // Generate OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Save OTP to storage
  otpStorage[email] = otp;

  // Send OTP to the provided email
  const mailOptions = {
    from: emailUser,
    to: email,
    subject: 'Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Error sending OTP email' });
    } else {
      res.status(200).json({ message: 'OTP sent successfully' });
    }
  });
});

app.post('/verifyotp', (req, res) => {
  const { email, otp } = req.body;

  // Check if the entered OTP matches the stored OTP
  if (otpStorage[email] && otp === otpStorage[email]) {
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
});

// for reg.jsx page
// Endpoint to send OTP via email
app.post('/request-otp', async (req, res) => {
  try {
    const { userEmail } = req.body; // Extract email from request body

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Save OTP to storage
    otpStorage[userEmail] = otp;

    // Send OTP to the provided email
    const mailOptions = {
      from: emailUser,
      to: userEmail, // Use extracted email here
      subject: 'OTP for Email Verification',
      text: `Your OTP for verification is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error sending OTP email', error: error.message });
      } else {
        res.status(200).json({ message: 'OTP sent successfully' });
      }
    });
  } catch (error) {
    console.error('Error in /request-otp:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


// Endpoint to verify OTP
app.post('/verify-otp', async (req, res) => {
  try {
    const { userEmail, otp } = req.body;

    // Check if OTP is valid
    if (otp === otpStorage[userEmail]) {
      // OTP is valid, proceed with registration or other actions
      res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      // Invalid OTP
      res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error in /verify-otp:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


app.post('/changepassword', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const client = await connectToMongo();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const certificateCollection = db.collection('certificate');

    // Check if the email exists in the users collection
    const user = await usersCollection.findOne({ email });

    if (user) {
      // Update the password in the users collection
      await usersCollection.updateOne({ email }, { $set: { password: newPassword } });
      res.status(200).json({ message: 'Password changed successfully' });
    } else {
      // Check if the email exists in the certificate collection
      const certificateUser = await certificateCollection.findOne({ email });

      if (certificateUser) {
        // Update the password in the certificate collection
        await certificateCollection.updateOne({ email }, { $set: { password: newPassword } });
        res.status(200).json({ message: 'Password changed successfully' });
      } else {
        res.status(400).json({ message: 'Email not found' });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});


// Endpoint to update password for users
app.post('/updatepassword/user', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const client = await connectToMongo();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await usersCollection.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'Password updated successfully' });
    } else {
      res.status(400).json({ message: 'User not found or password update failed' });
    }
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Error updating password' });
  }
});

// Endpoint to update password for certificates
app.post('/updatepassword/certificate', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const client = await connectToMongo();
    const db = client.db(dbName);
    const certificateCollection = db.collection('certificate');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await certificateCollection.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'Password updated successfully' });
    } else {
      res.status(400).json({ message: 'User not found or password update failed' });
    }
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Error updating password' });
  }
});



app.get('/userexists/:email', async (req, res) => {
  const { email } = req.params;

  const client = await connectToMongo();
  const db = client.db(dbName);
  const usersCollection = db.collection('users');

  const user = await usersCollection.findOne({ email });

  res.json({ exists: !!user });
});

app.get('/certificateexists/:email', async (req, res) => {
  const { email } = req.params;

  const client = await connectToMongo();
  const db = client.db(dbName);
  const certificateCollection = db.collection('certificate');

  const certificateUser = await certificateCollection.findOne({ email });

  res.json({ exists: !!certificateUser });
});



app.post('/register', async (req, res) => {
  let client;  // Declare the client variable outside the try-catch block to ensure proper closing

  try {
    const { name, department, phoneNumber, email, password } = req.body;
    if (!name || !department || !phoneNumber || !email || !password) {
      return res.status(400).json({ message: 'Incomplete user registration data' });
    }

    client = await connectToMongo();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const certificateCollection = db.collection('certificate');

    // Check if email already exists in either collection
    const existingUser = await usersCollection.findOne({ email });
    const existingCertificateUser = await certificateCollection.findOne({ email });

    if (existingUser || existingCertificateUser) {
      return res.status(400).json({ message: 'User with the same email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      phoneNumber,
      email,
      password: hashedPassword,
      loginHistory: [],
    };

    if (department === 'User Department') {
      newUser.department = 'User Department';
      await usersCollection.insertOne(newUser);
    } else if (department === 'Certificate Department') {
      newUser.department = 'Certificate Department';
      await certificateCollection.insertOne(newUser);
    } else {
      return res.status(400).json({ message: 'Invalid department' });
    }

    console.log('User registered successfully:', newUser);

    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error registering user' });
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Incomplete login data' });
    }

    const client = await connectToMongo();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const certificateCollection = db.collection('certificate');

    const user = await usersCollection.findOne({ email });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const loginTime = new Date().toLocaleString();
        await usersCollection.updateOne({ email }, { $push: { loginHistory: loginTime } });

        const { name, phoneNumber, department } = user;

        res.status(200).json({ name, phoneNumber, department });
        return;
      }
    }

    const certificateUser = await certificateCollection.findOne({ email });
    if (certificateUser) {
      const isPasswordValid = await bcrypt.compare(password, certificateUser.password);
      if (isPasswordValid) {
        const loginTime = new Date().toLocaleString();
        await certificateCollection.updateOne({ email }, { $push: { loginHistory: loginTime } });

        const { name, phoneNumber, department } = certificateUser;

        res.status(200).json({ name, phoneNumber, department });
        return;
      }
    }

    res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});
app.post('/get-sequence-number', async (req, res) => {
  try {
    const { mobcode, distCode, courseCode } = req.body;
    const sequenceNumber = await getSequenceNumber(mobcode, distCode, courseCode);
    res.status(200).json({ sequenceNumber });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error getting sequence number' });
  }
});


app.post('/updateStudentDetails', async (req, res) => {
  let client;
  try {
    const { regNo, studentName, marksTheory, marksProject, totalMarks, grade, percentageMarks } = req.body;

    // Validate input
    if (!regNo || !studentName || !marksTheory || !marksProject || !totalMarks || !grade || !percentageMarks) {
      return res.status(400).json({ success: false, message: 'Invalid input data' });
    }

    client = await connectToMongo();
    const db = client.db(dbName);
    const studentDetailsCollection = db.collection('Student_Details');

    const result = await studentDetailsCollection.updateOne(
      { reg_no: regNo },
      {
        $set: {
          student_name: studentName,
          marks_obtained_theory: marksTheory,
          marks_obtained_project: marksProject,
          total_marks: totalMarks,
          grade: grade,
          percent_of_marks: percentageMarks,
          /* add other fields as needed */
        },
      }
    );

    if (result.matchedCount > 0) {
      return res.json({ success: true, message: 'Student details updated successfully' });
    } else {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error updating student details:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});




app.post('/addcertificate', async (req, res) => {
  try {
    const { regNo, certificateNumber } = req.body;

    // Check if the request body contains the required data
    if (!regNo || !certificateNumber) {
      return res.status(400).json({ success: false, message: 'Invalid request body' });
    }

    // Connect to the MongoDB database
    const client = await connectToMongo();
    const db = client.db(dbName);
    const studentDetailsCollection = db.collection('Student_Details');

    // Update the certificate number for the student in the database
    const result = await studentDetailsCollection.updateOne(
      { reg_no: regNo },
      { $set: { certificate_no: certificateNumber } },
      { upsert: true }
    );

    await client.close();

    if (result.upsertedCount > 0 || result.modifiedCount > 0) {
      res.json({ success: true, message: 'Certificate number added successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to add certificate number' });
    }
  } catch (error) {
    console.error('Error adding certificate number:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


app.post('/updateCertificateNumber', async (req, res) => {
  let client;

  try {
    const { regNo, certificateNumber } = req.body;
    client = await connectToMongo();

    const db = client.db(dbName);
    const studentDetailsCollection = db.collection('Student_Details');

    const result = await studentDetailsCollection.updateOne(
      { reg_no: regNo },
      { $set: { certificate_no: certificateNumber } }
    );

    if (result.matchedCount > 0) {
      res.json({ success: true, message: 'Certificate number updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error updating certificate number:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});




app.post('/savecertificate', async (req, res) => {
  try {
    const { studentDetails } = req.body;

    // Check if the request body contains the required data
    if (!studentDetails || !Array.isArray(studentDetails)) {
      return res.status(400).json({ success: false, message: 'Invalid request body' });
    }

    // Connect to the MongoDB database
    const client = await connectToMongo();
    const db = client.db(dbName);
    const studentDetailsCollection = db.collection('Student_Details');

    // Update certificate numbers for each student
    const promises = studentDetails.map(async (student) => {
      const { regNo, certificateNumber } = student;

      // Update the certificate number for the student in the database
      return studentDetailsCollection.updateOne(
        { reg_no: regNo },
        { $set: { certificate_no: certificateNumber } }
      );
    });

    // Execute all update operations concurrently
    await Promise.all(promises);

    // Close the MongoDB connection
    await client.close();

    // Send a success response
    res.json({ success: true, message: 'Certificate numbers saved successfully' });
  } catch (error) {
    console.error('Error saving certificate numbers:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});




// API endpoint to fetch student details
app.get('/getStudentDetails', async (req, res) => {
  try {
    const { batchCode } = req.query;

    // Connect to MongoDB
    const client = await connectToMongo();
    const db = client.db(dbName);

    // Collection name
    const collection = db.collection('Student_Details');

    // Fetch student details including Aadhaar number, father's name, and mother's name
    const studentDetails = await collection
      .find({ batchcode: batchCode })
      .project({
        courseName: 1,
        startDate: 1,
        endDate: 1,
        reg_no: 1,
        student_name: 1,
        marks_obtained_theory: 1,
        marks_obtained_project: 1,
        total_marks: 1,
        grade: 1,
        percent_of_marks: 1,
        certificate_no: 1, // Include certificate_number in the result
        aadhar: 1, // Include Aadhaar number
        father_name: 1, // Include father's name
        mother_name: 1, // Include mother's name
      })
      .toArray();

    // Close the MongoDB connection
    await client.close();

    res.json({ studentDetails });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ error: 'Error fetching student details' });
  }
});


app.post('/updateStudentName', async (req, res) => {
  try {
    const { reg_no, student_name } = req.body;

    const client = await connectToMongo();
    const db = client.db(dbName);

    const studentDetailsCollection = db.collection('Student_Details');

    // Update the student's name based on registration number
    const result = await studentDetailsCollection.updateOne(
      { reg_no },
      { $set: { student_name } }
    );

    if (result.modifiedCount === 1) {
      // If the update was successful
      res.json({ success: true, message: 'Student name updated successfully.' });
    } else if (result.matchedCount === 0 && result.modifiedCount === 0) {
      // If no student was found with the given registration number
      res.status(404).json({ success: false, message: 'Student not found.' });
    } else {
      // If the registration number was correct but no actual update occurred
      res.status(200).json({ success: false, message: 'No updates were made.' });
    }
  } catch (error) {
    console.error('Error updating student name:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});
app.post('/generatecertificatenumbers', (req, res) => {
  try {
    const { studentDetails } = req.body;

    if (!studentDetails || !Array.isArray(studentDetails)) {
      return res.status(400).json({ success: false, message: 'Invalid request body' });
    }

    let lastCertificateIndex = 0;

    const updatedStudentDetails = studentDetails.map((student, index) => {
      if (student.grade !== 'Absent' && student.grade !== 'Failed') {
        const certificateNumber = `${student.regNo}/${(lastCertificateIndex + 1).toString().padStart(3, '0')}`;
        lastCertificateIndex++;
        return {
          ...student,
          certificateNumber,
        };
      } else {
        // For absent or failed students, keep the certificate number empty
        return {
          ...student,
          certificateNumber: '',
        };
      }
    });

    res.json({ success: true, studentDetails: updatedStudentDetails });
  } catch (error) {
    console.error('Error generating certificate numbers:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});







const formatDate = (excelDate) => {
  const dobDate = new Date((excelDate - 25569) * 86400 * 1000);
  return `${dobDate.getDate().toString().padStart(2, '0')}-${(dobDate.getMonth() + 1).toString().padStart(2, '0')}-${dobDate.getFullYear()}`;
};

app.post('/upload-excel', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    const { mobcode, dist_code, batchcode, startDate, endDate, course_code, courseName, examDate } = req.body; // Extract examDate from request body

    const fileBuffer = req.file.buffer;
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const students = data.map((row, index) => {
      const reg_no = `${batchcode}/${(index + 1).toString().padStart(3, '0')}`;

      // Initialize grade as Absent by default
      let grade = 'Absent';

      // Check if marks are available for both theory and project
      if (row['Marks_obtained(Theory)(40)'] && row['Marks_obtained(Project)(10)']) {
        // Parse marks from the Excel sheet
        const theoryMarks = parseInt(row['Marks_obtained(Theory)(40)']);
        const projectMarks = parseInt(row['Marks_obtained(Project)(10)']);

        // Check if marks are less than the passing criteria
        if (theoryMarks < 15 || projectMarks < 5) {
          // If either theory or project marks are below passing criteria, mark as Failed
          grade = 'Failed';
        } else {
          // Calculate total marks and percentage if both marks are above passing criteria
          const totalMarks = theoryMarks + projectMarks;
          const percentageMarks = (totalMarks / 50) * 100;

          // Assign grade based on percentage
          if (percentageMarks >= 90) {
            grade = 'A+';
          } else if (percentageMarks >= 80) {
            grade = 'A';
          } else if (percentageMarks >= 70) {
            grade = 'B+';
          } else if (percentageMarks >= 60) {
            grade = 'B';
          } else if (percentageMarks >= 50) {
            grade = 'C+';
          } else if (percentageMarks >= 40) {
            grade = 'C';
          }
        }
      }

      return {
        mobcode,
        dist_code,
        course_code,
        batchcode,
        startDate,
        endDate,
        examDate, // Include examDate in the student details
        reg_no,
        student_name: row.student_name,
        father_name: row.father_name,
        mother_name: row.mother_name,
        dob: formatDate(row.dob), // Format the Excel date
        category: row.category,
        gender: row.gender,
        aadhar: row.aadhar.toString(),
        phone: row.phone,
        email: row.email,
        address: row.address,
        hqualification: row.hqualification,
        passyear: row.passyear,
        bord: row.bord,
        certficte_path: row.certficte_path,
        photo_path: row.photo_path,
        sign_path: row.sign_path,
        current_year: row.current_year,
        username: row.username,
        E_U_Date: row.E_U_Date,
        courseName,
        marks_obtained_theory: row['Marks_obtained(Theory)(40)'],
        marks_obtained_project: row['Marks_obtained(Project)(10)'],
        percent_of_marks: (grade === 'Absent') ? 0 : (row['Marks_obtained(Theory)(40)'] + row['Marks_obtained(Project)(10)']) / 50 * 100,
        total_marks: (grade === 'Absent') ? 0 : row['Marks_obtained(Theory)(40)'] + row['Marks_obtained(Project)(10)'],
        grade,
      };
    });

    const client = await connectToMongo();
    const db = client.db(dbName);

    // Save students data to MongoDB
    const result = await db.collection('Student_Details').insertMany(students);

    // Respond with success message
    res.json({ message: `Data stored successfully for batchcode: ${batchcode}` });
  } catch (error) {
    console.error('Error uploading and processing Excel file:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// API endpoint to fetch only course information (course code and exam date) based on the batch code
app.get('/getCourseInfo', async (req, res) => {
  try {
    const { batchCode } = req.query;

    // Connect to MongoDB
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);

    // Collection name
    const collection = db.collection('Student_Details');

    // Fetch only course information
    const courseInfo = await collection.findOne({ batchcode: batchCode }, { projection: { course_code: 1, examDate: 1 } });

    // Close the MongoDB connection
    await client.close();

    res.json(courseInfo);
  } catch (error) {
    console.error('Error fetching course info:', error);
    res.status(500).json({ error: 'Error fetching course info' });
  }
});


app.post('/generate-batch-code', async (req, res) => {
  try {
    const { mobcode, distCode, courseCode } = req.body;

    // Get the current year and month
    const year = new Date().getFullYear().toString().slice(2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');

    // Generate a new batch code
    const batchCode = await generateUniqueBatchCode(mobcode, distCode, courseCode, year, month);

    res.json({ batchCode });
  } catch (error) {
    console.error('Error generating batch code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const generateUniqueBatchCode = async (mobcode, distCode, courseCode, year, month) => {
  let sequenceNumber = await getSequenceNumber(mobcode, distCode, courseCode);
  let batchCode;

  // Generate a new batch code until a unique one is found
  while (true) {
    batchCode = `${mobcode}${distCode}${courseCode}${year}${month}${sequenceNumber}`;

    // Check if the batch code already exists
    const existingBatch = await checkBatchCodeExists(batchCode);

    if (!existingBatch) {
      break;
    }

    // If the batch code already exists, increment the sequence number and try again
    sequenceNumber = incrementSequenceNumber(sequenceNumber);
  }

  return batchCode;
};

const incrementSequenceNumber = (sequenceNumber) => {
  // Increment the last two digits of the sequence number
  const nextSequenceNumber = (parseInt(sequenceNumber, 10) + 1).toString().padStart(2, '0');
  return nextSequenceNumber;
};

const checkBatchCodeExists = async (batchCode) => {
  const client = await connectToMongo();
  const db = client.db(dbName);
  const batchCodeMasterCollection = db.collection('batchcode_master');

  const existingBatch = await batchCodeMasterCollection.findOne({ batchcode: batchCode });

  return existingBatch;
};



app.get('/getCourseOptions', async (req, res) => {
  let client; // Declare client variable outside the try block
  try {
    client = await connectToMongo();
    const db = client.db(dbName);
    const instituteCourseCollection = db.collection('Institute_course_master');
    const courseMasterCollection = db.collection('course_master');

    const courseOptionsResult = await instituteCourseCollection.find({ mobcode: req.query.mobcode }).toArray();

    if (!courseOptionsResult || courseOptionsResult.length === 0) {
      return res.status(404).json({ error: 'No courses found for the selected mobcode' });
    }

    const courseCodes = courseOptionsResult.map((course) => course.course_code);
    const courseMasterResult = await courseMasterCollection.find({ course_code: { $in: courseCodes } }).toArray();

    const courseOptions = courseMasterResult.map((course) => ({
      courseCode: course.course_code,
      courseName: course.course_name,
    }));

    return res.json({ courseOptions });
  } catch (error) {
    console.error('Error fetching course options:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});


app.get('/getInstituteNames', async (req, res) => {
  let client; // Declare client variable outside the try block
  try {
    client = await connectToMongo();
    const db = client.db(dbName);
    const collection = db.collection('Institute_Details');
    const orgNameField = 'orgname';
    const mobCodeField = 'mobcode';

    const query = { [orgNameField]: { $exists: true }, [mobCodeField]: { $exists: true } };
    const projection = { [orgNameField]: 1, [mobCodeField]: 1, _id: 0 };

    const result = await collection.find(query).project(projection).toArray();

    const instituteNames = result.map(item => `${item[orgNameField]} - ${item[mobCodeField]}`);

    res.json({ instituteNames });
  } catch (error) {
    console.error('Error fetching institute names:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});


app.get('/getDistrictOptions', async (req, res) => {
  let client; // Declare client variable outside the try block
  try {
    const { user } = req.query;
    const [orgName, mobCode] = user.split(' - ');

    client = await connectToMongo();
    const db = client.db(dbName);

    const instituteCollection = db.collection('Institute_Details');
    const districtCollection = db.collection('district_master');

    const instituteResult = await instituteCollection.findOne({ orgname: orgName, mobcode: mobCode });

    if (!instituteResult) {
      return res.status(404).json({ error: 'Institute not found' });
    }

    const distCode = instituteResult.dist_code;

    if (!distCode) {
      return res.status(404).json({ error: 'District code not found for the selected institute' });
    }

    const districtResult = await districtCollection.findOne({ dist_code: distCode });

    if (!districtResult) {
      return res.status(404).json({ error: 'District not found' });
    }

    const districtOptions = [{
      distCode: distCode,
      distName: `${districtResult.district_name} - ${distCode}`
    }];

    return res.json({ districtOptions });
  } catch (error) {
    console.error('Error fetching district options:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

app.post('/store-batch-data', async (req, res) => {
  let client;

  try {
    const formData = req.body;
    client = await connectToMongo();
    const db = client.db(dbName);
    const batchCodeMasterCollection = db.collection('batchcode_master');

    // Insert the form data into the batchcode_master collection
    await batchCodeMasterCollection.insertOne(formData);

    res.json({ success: true, message: 'Batch data stored successfully.' });
  } catch (error) {
    console.error('Error storing batch data:', error);
    res.status(500).json({ success: false, message: 'Error storing batch data.' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});
app.post('/checkStudent', async (req, res) => {
  let client;

  try {
    const { mobuser, mobcourse, cyear, coursemonth } = req.body;

    // Convert the coursemonth to a numeric value
    const numericCourseMonth = months.indexOf(coursemonth) + 1;

    client = await connectToMongo();
    const db = client.db(dbName);
    const batchCodeMasterCollection = db.collection('batchcode_master');

    const query = {
      mobcode: mobuser,
      course_code: mobcourse,
      regyear: parseInt(cyear, 10),
      regmonth: numericCourseMonth, // Use the converted numeric value
    };

    const result = await batchCodeMasterCollection.findOne(query);

    if (!result) {
      return res.status(404).json({ error: 'No matching student found' });
    }

    const studentDetails = {
      batchcode: result.batchcode,
      // Add other details as needed
    };

    res.json({ success: true, studentDetails });
  } catch (error) {
    console.error('Error checking student:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});




app.get('/getBatchCodes', async (req, res) => {
  let client; // Declare client at a higher scope

  try {
    const { prefix } = req.query;

    client = await connectToMongo();
    const db = client.db(dbName);
    const batchCodeMasterCollection = db.collection('batchcode_master');

    // Use a regular expression to find batch codes starting with the given prefix
    const regex = new RegExp(`^${prefix}`);
    const batchCodes = await batchCodeMasterCollection.find({ batchcode: regex }).toArray();

    res.json({ batchCodes });
  } catch (error) {
    console.error('Error fetching batch codes:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});
app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
