const express = require('express');
const { parseCSV } = require('./csvparser');
const { createList, saveToList, getList, deleteList, getAllLists } = require('./listManager');
const cors = require('cors'); // Import the cors middleware
const app = express();
const PORT = process.env.PORT || 3000;

//firebase require statements 
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword , createUserWithEmailAndPassword, updatePassword } = require("firebase/auth");
const { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc, addDoc, query, where} = require("firebase/firestore");


// Firebase configuration object 
const firebaseConfig = {
    //private firebase Config
  };

// Initialize Firebase app
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);



app.use(express.json());

app.use(cors());

// Root endpoint for testing
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

// Endpoint to get all destinations or a specific destination by ID
app.get('/api/destination/:id', async (req, res) => {
    const rowId = parseInt(req.params.id, 10); // Convert ID to integer
    try {
        const destination = await parseCSV(rowId);
        if (destination) {
            res.json(destination);
        } else {
            res.status(404).json({ error: 'Destination not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error parsing data file' });
    }
});

app.get('/api/destinations', async (req, res) => {
    try {
        const destinations = await parseCSV(); // No ID passed, so it will return all data
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ error: 'Error parsing data file' });
    }
});

// Endpoint to get geographical coordinates of a specific destination by ID
app.get('/api/destination/:id/coordinates', async (req, res) => {
    const rowId = parseInt(req.params.id, 10);
    try {
        const destination = await parseCSV(rowId);
        if (destination) {
            const { Latitude, Longitude } = destination;
            res.json({ Latitude, Longitude });
        } else {
            res.status(404).json({ error: 'Destination not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error parsing data file' });
    }
});

app.get('/api/destinations/search', async (req, res) => {
    const { field, pattern, n } = req.query;
    const limit = n ? parseInt(n, 10) : null;

    if (!field || !pattern) {
        return res.status(400).json({ error: 'Both field and pattern are required' });
    }

    try {
        const destinations = await parseCSV(); // Fetch all destinations
        const matches = destinations.filter(destination => {
            const value = destination[field];
            return value && value.toString().toLowerCase().includes(pattern.toLowerCase());
        });

        // Limit the results to 'n' if 'n' is specified, otherwise return all matches
        const limitedResults = limit ? matches.slice(0, limit) : matches;
        res.json(limitedResults);
    } catch (error) {
        res.status(500).json({ error: 'Error parsing data file' });
    }
});

// Create a new list with a given name
app.post('/api/lists', (req, res) => {
    const { listName } = req.body;
    if (!listName) {
        return res.status(400).json({ error: 'List name is required' });
    }
    const result = createList(listName);
    if (result.error) {
        res.status(400).json({ error: result.error });
    } else {
        res.json({ message: 'List created successfully' });
    }
});

// Save destination IDs to a list (overwrite existing IDs if list exists)
app.put('/api/lists/:listName', (req, res) => {
    const listName = req.params.listName;
    const { destinationIds } = req.body;
    if (!Array.isArray(destinationIds)) {
        return res.status(400).json({ error: 'destinationIds should be an array' });
    }
    const result = saveToList(listName, destinationIds);
    if (result.error) {
        res.status(400).json({ error: result.error });
    } else {
        res.json({ message: 'List updated successfully' });
    }
});

app.get('/api/lists/:listName', (req, res) => {
    const listName = req.params.listName;
    const list = getList(listName);
    if (list.error) {
        res.status(404).json({ error: list.error });
    } else {
        res.json({list});
    }
});


// Endpoint to get specific fields for all destinations in a saved list
app.get('/api/lists/:listName/destinations', async (req, res) => {
    const listName = req.params.listName;

    const destinationIds = getList(listName);
    if (destinationIds.error) {
        return res.status(404).json({ error: destinationIds.error });
    }

    try {
        
        const destinations = await parseCSV();

        const filteredDestinations = destinations
            .filter((_, index) => destinationIds.includes(index + 1))  // Using 1-based indexing
            .map(destination => ({
                name: destination.Destination,       
                region: destination.Region,
                country: destination.Country,
                latitude: destination.Latitude,
                longitude: destination.Longitude,
                currency: destination.Currency,
                language: destination.Language
            }));

        res.json(filteredDestinations);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving destinations' });
    }
});


// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Authenticate the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Return user details
    return res.json({
      message: "Login successful",
      uid: user.uid,
      email: user.email,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(401).json({
      errorCode: error.code,
      errorMessage: error.message,
    });
  }
});

app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
  
    try {
      // Attempt to create a new user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      res.status(201).json({
        message: "Account created successfully",
        uid: user.uid,
        email: user.email,
      });
    } catch (error) {
      console.error("Registration error:", error.code, error.message);
  
      // Handle specific error codes
      if (error.code === "auth/email-already-in-use") {
        return res.status(409).json({ error: "The email address is already in use by another account." });
      }
  
      // Generic error response
      res.status(500).json({ error: "Failed to create account. Please try again." });
    }
  });
  

  app.post("/api/associate", async (req, res) => {
    const { email, username } = req.body;
  
    if (!email || !username) {
      return res.status(400).json({ error: "Email and username are required" });
    }
  
    try {
      const emailKey = email.replace(/\./g, ","); // Replace dots for Firestore compatibility
      const userRef = doc(db, "users", emailKey); // Reference to Firestore document
  
      // Write data to Firestore
      await setDoc(userRef, { email, username });
  
      res.status(201).json({ message: "Email associated with username successfully" });
    } catch (error) {
      console.error("Firestore error:", error.message);
      res.status(500).json({ error: "Failed to associate email with username" });
    }
  });
  

  app.get("/api/getUsername", async (req, res) => {
    const { emailKey } = req.query;
  
    if (!emailKey) {
      return res.status(400).json({ error: "Email key is required" });
    }
  
    try {
      // Fetch the document from Firestore
      const userRef = doc(db, "users", emailKey); // Reference to the Firestore document
      const userDoc = await getDoc(userRef); // Fetch the document
  
      if (!userDoc.exists()) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const userData = userDoc.data(); // Extract document data
      res.json({ username: userData.username });
    } catch (error) {
      console.error("Firestore error:", error.message);
      res.status(500).json({ error: "Failed to fetch username" });
    }
  });

  app.post('/api/saveList', async (req, res) => {
    const { username, listName, description, destinations, visibility } = req.body;

    // Validate request data
    if (!username || !listName || !destinations || !Array.isArray(destinations)) {
        return res.status(400).json({
            error: "Username, list name, and an array of destinations are required."
        });
    }

    // Validate visibility field
    const validVisibilities = ["public", "private"];
    if (!visibility || !validVisibilities.includes(visibility)) {
        return res.status(400).json({
            error: "Visibility must be either 'public' or 'private'."
        });
    }

    try {
        // Reference to Firestore document
        const listRef = doc(db, "lists", `${username}_${listName}`);

        // Save the list to Firestore
        await setDoc(listRef, {
            username,
            listName,
            description: description || "No description provided",
            destinations,
            visibility, // Include visibility
            createdAt: new Date().toISOString(), // Timestamp for list creation
        });

        res.status(201).json({
            message: "List saved successfully!",
            list: {
                username,
                listName,
                description,
                destinations,
                visibility,
            },
        });
    } catch (error) {
        console.error("Error saving list to Firestore:", error.message);
        res.status(500).json({
            error: "Failed to save the list. Please try again later.",
        });
    }
});

app.get('/api/lists', async (req, res) => {
    try {
        // Reference to the Firestore "lists" collection
        const listsCollection = collection(db, "lists");

        // Fetch all documents from the "lists" collection
        const snapshot = await getDocs(listsCollection);

        // Map through the snapshot to extract list data
        const lists = snapshot.docs.map((doc) => ({
            id: doc.id, // Include document ID
            ...doc.data(), // Include document data
        }));

        res.json(lists);
    } catch (error) {
        console.error("Error fetching lists:", error.message);
        res.status(500).json({ error: "Failed to fetch lists." });
    }
});

app.patch('/api/lists/:id', async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const listRef = doc(db, "lists", id);
        await updateDoc(listRef, updatedData);
        res.status(200).json({ message: "List updated successfully!" });
    } catch (error) {
        console.error("Error updating list:", error.message);
        res.status(500).json({ error: "Failed to update list." });
    }
});

app.delete('/api/lists/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const listRef = doc(db, "lists", id);
        await deleteDoc(listRef);
        res.status(200).json({ message: "List deleted successfully!" });
    } catch (error) {
        console.error("Error deleting list:", error.message);
        res.status(500).json({ error: "Failed to delete list." });
    }
});

app.post('/api/reviews', async (req, res) => {
    const { listId, username, rating, comment } = req.body;

    if (!listId || !username || !rating) {
        return res.status(400).json({ error: "List ID, username, and rating are required." });
    }

    try {
        const reviewRef = collection(db, "reviews");
        const reviewData = {
            listId,
            username,
            rating,
            comment: comment || "", // Optional comment
            createdAt: new Date().toISOString(),
        };

        await addDoc(reviewRef, reviewData);

        res.status(201).json({ message: "Review submitted successfully!" });
    } catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).json({ error: "Failed to submit review." });
    }
});

app.get('/api/reviews/average/:listId', async (req, res) => {
    const { listId } = req.params;

    try {
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("listId", "==", listId));
        const querySnapshot = await getDocs(q);

        let totalRating = 0;
        let reviewCount = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            totalRating += data.rating;
            reviewCount += 1;
        });

        const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

        res.status(200).json({ averageRating });
    } catch (error) {
        console.error("Error fetching average review score:", error);
        res.status(500).json({ error: "Failed to fetch average review score." });
    }
});

app.get('/api/reviews/:listId', async (req, res) => {
    const { listId } = req.params;

    try {
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("listId", "==", listId));
        const querySnapshot = await getDocs(q);

        const reviews = [];
        querySnapshot.forEach((doc) => {
            reviews.push(doc.data());
        });

        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: "Failed to fetch reviews." });
    }
});

app.post('/api/updatePassword', async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ error: "Email and new password are required." });
    }

    try {
        // Use email to find the user and update their password
        const user = await admin.auth().getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        await admin.auth().updateUser(user.uid, { password: newPassword });

        res.status(200).json({ message: "Password updated successfully!" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ error: "Failed to update password. Please try again." });
    }
});




  



// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

