const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

let dbUser = null;
let dbAdmin = null;

const initializeDBs = async () => {
  try {
    dbUser = await open({
      filename: path.join(__dirname, 'people_data.db'),
      driver: sqlite3.Database,
    });

    dbAdmin = await open({
      filename: path.join(__dirname, 'dummy_admins.db'),
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log('✅ Server running at http://localhost:3000');
    });
  } catch (e) {
    console.error('❌ DB Error:', e.message);
    process.exit(1);
  }
};

initializeDBs();

// People login 
// app.post('/auth_user', async (request, response) => {
//   try {
//     const { aadharNo, password } = request.body;

//     console.log("Request received:", request.body);

//     if (!aadharNo || !password) {
//       return response.status(400).send({ succeeded: false, error: 'Missing fields' });
//     }

//     const checkPersonQuery = `SELECT * FROM people WHERE aadhaarNo = ?;`;
//     const person = await db.get(checkPersonQuery, [aadharNo]);

//     if (person) {
//       const expected = person.aadhaarNo.slice(8, 12);
//       const isValid = password === expected;

//       if (isValid) {
//         const payload = { aadharNo: person.aadhaarNo };
//         const jwtToken = jwt.sign(payload, 'MY_SECRET_TOKEN');

//         return response.status(200).send({ succeeded: true, jwtToken });
//       } else {
//         return response.status(200).send({ succeeded: false, error: 'Invalid password' });
//       }
//     } else {
//       return response.status(200).send({ succeeded: false, error: 'User not found' });
//     }
//   } catch (error) {
//     console.error("🔥 /auth_user error:", error.message);
//     return response.status(500).send({ succeeded: false, error: 'Internal Server Error' });
//   }
// });

app.post('/auth_user', async (request, response) => {
  try {
    const { aadharNo, password } = request.body;

    const person = await dbUser.get('SELECT * FROM people WHERE aadhaarNo = ?', [aadharNo]);

    if (person && password === person.aadhaarNo.slice(8, 12)) {
      const token = jwt.sign({ aadharNo }, 'MY_SECRET');
      response.send({ succeeded: true, jwtToken: token });
    } else {
      response.send({ succeeded: false, error: 'Invalid user credentials' });
    }
  } catch (error) {
    console.error('/auth_user error:', error.message);
    response.status(500).send({ succeeded: false, error: 'Internal Server Error' });
  }
});



// Admin authentication route
// app.post('/auth_admin', async (request, response) => {
//   try {
//     const { email, password } = request.body;

//     console.log("Request received:", request.body);

//     if (!email || !password) {
//       return response.status(400).send({ succeeded: false, error: 'Missing fields' });
//     }

//     const checkPersonQuery = `SELECT * FROM admin WHERE email = ?;`;
//     const person = await db.get(checkPersonQuery, [email]);

//     if (person) {
//       const expected = person.password;
//       const isValid = password === expected;

//       if (isValid) {
//         const payload = { email: person.email };
//         const jwtToken = jwt.sign(payload, 'MY_SECRET_TOKEN');

//         return response.status(200).send({ succeeded: true, jwtToken });
//       } else {
//         return response.status(200).send({ succeeded: false, error: 'Invalid password' });
//       }
//     } else {
//       return response.status(200).send({ succeeded: false, error: 'User not found' });
//     }
//   } catch (error) {
//     console.error("🔥 /auth_user error:", error.message);
//     return response.status(500).send({ succeeded: false, error: 'Internal Server Error' });
//   }
// });


app.post('/auth_admin', async (request, response) => {
  try {
    const { email, password } = request.body;

    const admin = await dbAdmin.get('SELECT * FROM admins WHERE Email = ?', [email]);
    console.log("Admin request received:", request.body);
    if (password === admin.Password) {
      const token = jwt.sign({ email }, 'MY_SECRET');
      response.send({ succeeded: true, jwtToken: token });
    } else {
      console.log("Invalid admin credentials:", password, admin.Password);
      response.send({ succeeded: false, error: 'Invalid admin credentials' });
    }
  } catch (error) {
    console.error('/auth_admin error:', error.message);
    response.status(500).send({ succeeded: false, error: 'Internal Server Error' });
  }
});


