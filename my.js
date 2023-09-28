var express = require('express')  
const bodyParser = require('body-parser');
var app = express()

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');
var admin = require("firebase-admin");

var serviceAccount = require("./key.json");



admin.initializeApp({
    credential: cert(serviceAccount)
  });
  
const db = getFirestore();
 
app.use(express.static('public'));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/signup', function (req, res) {  
res.sendFile( __dirname + "/public/" + "signin.html" );
});

app.get('/cart',(req,res)=>{
  const alertMessage=req.query.alertMessage;
  res.sendFile(__dirname + "/public/" + "cart.html")
}) 

app.post("/signupSubmit",async function(req,res) {  
    const user={ 
        Fullname: req.body.Fullname,
        Email:req.body.Email,
        phoneno: req.body.Phoneno,
        Password:req.body.Password,
      }
      try {
       
        const userRef = db.collection('userDemo');
        const userDoc = await userRef.where('Email', '==', user.Email).get();
        if (!userDoc.empty) {
          const alertmessage=encodeURIComponent('User already exists. please Login');
          return res.redirect(`/signup?alertmessage=${alertmessage}`);
        }
    
       
        await userRef.add(user);
        const alertmessage=encodeURIComponent('User created Successfully');
        return res.redirect(`/login?alertmessage=${alertmessage}`);
      } catch (error) {
        console.error('Error creating user:', error);
        const alertmessage=encodeURIComponent('An error occured');
        return res.redirect(`/signup?alertmessage=${alertmessage}`);
      }
    });
 
app.get("/login", function (req,res) {  
    res.sendFile( __dirname + "/public/" + "login.html" );
});
  

app.post('/loginSubmit',async function (req, res) {
    try {
      const userRef = db.collection('userDemo');
      const querySnapshot = await userRef.where('Email', '==', req.body.Email).get();
  
      if (querySnapshot.empty) {
        const alertmessage = 'User not found. Please register.';
        return res.redirect(`/login?alertmessage=${encodeURIComponent(alertmessage)}`);
      }
  
      const userDoc = querySnapshot.docs[0]; 
      const storedEmail = userDoc.data().Email; 
      const enteredEmail = req.body.Email;
  
      if (storedEmail === enteredEmail) {
        
        const userPassword = userDoc.data().Password;
        const enteredPassword = req.body.Password;
  
        if (userPassword === enteredPassword) {
          const alertmessage = 'Login successful';
          return res.sendFile( __dirname + "/public/" + "mainpage.html");
        } else {
          const alertmessage = 'Incorrect password.';
          return res.redirect(`/login?alertmessage=${encodeURIComponent(alertmessage)}`);
        }
      } else {
        const alertmessage = 'Please check your email ID.';
        return res.redirect(`/login?alertmessage=${encodeURIComponent(alertmessage)}`);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      const alertmessage = 'An error occurred';
      return res.redirect(`/login?alertmessage=${encodeURIComponent(alertmessage)}`);
    }
});

app.get('/', function (req, res){
    res.sendFile( __dirname + "/public/" +"index.html")
});

const path = require('path');

const projectDirectory = __dirname; 
const publicDirectory = 'public';
const filename = 'cart.html';



app.get("/addedToCart", (req, res) => {
  const val = req.query.item;
  const user=req.query.email
  const cost = parseFloat(req.query.cost); 
  const userinf=db.collection('userDemo').doc(user)
  const costsCollection = userinf.collection('costs');
  
  let totalamount = parseInt(req.query.totalamount) || 0;

 
  costsCollection.add({
      item: val,
      cost: cost,
  })
  .then((docRef) => {
      console.log("Document written with ID: ", docRef.id); 
      totalamount += cost;
      res.sendFile(path.join(__dirname, 'public', 'cart.html'));
  })
  .catch((error) => {
      console.error("Error adding document: ", error);
  });
 

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
