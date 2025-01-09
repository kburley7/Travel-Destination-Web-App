import React, { useState } from "react";
import "./home.css";
import Map from "./Map"; // Import the map component
import Fuse from "fuse.js";


const BASE_URL = "http://localhost:3000/api";

const Home = ({currentUsername }) => {
  const [displayContent, setDisplayContent] = useState("default"); // State for content display
  const [searchResults, setSearchResults] = useState([]); // State for search results
  const [expandedResults, setExpandedResults] = useState({}); // State for expanded results
  const [addedDestinations, setAddedDestinations] = useState([]);
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [visibility, setVisibility] = useState("private"); // Visibility state, default to private


  // Function to toggle expanded data
  const toggleExpand = (index) => {
    setExpandedResults((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle the expanded state for the specific result
    }));
  };

  // Function to compare two objects deeply
  const areObjectsEqual = (obj1, obj2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };

  // Function to find common whole objects
  const getCommonObjects = (list1, list2, list3) => {
    return list1.filter(
      (item1) =>
        list2.some((item2) => areObjectsEqual(item1, item2)) &&
        list3.some((item3) => areObjectsEqual(item1, item3))
    );
  };

  const searchbutton = async () => {
    const namequery = document.getElementById("namesearch").value.trim();
    const regionquery = document.getElementById("regionsearch").value.trim();
    const countryquery = document.getElementById("countrysearch").value.trim();

    if (!namequery && !regionquery && !countryquery) {
        alert("Please enter an input");
        return;
    }

    setDisplayContent("Search"); // Update display state to "Search"

    // Fetch all destinations to perform fuzzy matching
    const response = await fetch(`${BASE_URL}/destinations`);
    const allDestinations = await response.json();

    // Set up Fuse.js options for fuzzy search
    const fuseOptions = {
        keys: ["Destination", "Region", "Country"], // Fields to search in
        threshold: 0.4, // Match threshold (lower = stricter)
    };

    const fuse = new Fuse(allDestinations, fuseOptions);

    // Perform fuzzy matching for each query
    let results = allDestinations;
    if (namequery) {
        results = fuse.search(namequery).map((result) => result.item);
    }
    if (regionquery) {
        results = results.filter((item) =>
            fuse.search(regionquery).some((match) => match.item === item)
        );
    }
    if (countryquery) {
        results = results.filter((item) =>
            fuse.search(countryquery).some((match) => match.item === item)
        );
    }

    // Update state with fuzzy matched results
    setSearchResults(results);
    setExpandedResults({}); // Reset expanded states
};

  const handleAddToList = (destination) => {
    const isAlreadyAdded = addedDestinations.some(
        (item) => item.Destination === destination.Destination
    );

    if (!isAlreadyAdded) {
        setAddedDestinations((prevList) => [...prevList, destination]);
    } else {
        alert(`${destination.Destination} is already in your list!`);
    }
};

// Function to handle saving the list
const handleSaveList = async () => {
  if (!listName.trim()) {
      alert("List name is required!");
      return;
  }

  if (addedDestinations.length === 0) {
      alert("You must add at least one destination to save the list!");
      return;
  }

  const savedList = {
      username: currentUsername,
      listName,
      description: listDescription || "No description provided",
      destinations: addedDestinations,
      visibility, // Visibility set by user
  };

  try {
      const response = await fetch(`${BASE_URL}/saveList`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(savedList),
      });

      if (response.ok) {
          alert("List saved successfully!");
          // Reset states
          setListName("");
          setListDescription("");
          setVisibility("private");
          setAddedDestinations([]);
      } else {
          const error = await response.json();
          alert(`Failed to save list: ${error.message}`);
      }
  } catch (error) {
      console.error("Error saving list:", error);
  }
};

const handleClearList = () => {
  setAddedDestinations([]);
  setListName("");
  setListDescription("");
};


  return (
    <div className="home-container">
  {/* Search Bar */}
  <div className="searchBar">
    <label>Search For a Destination:</label>
    <input type="text" id="namesearch" placeholder="Name" />
    <input type="text" id="regionsearch" placeholder="Region" />
    <input type="text" id="countrysearch" placeholder="Country" />
    <button onClick={searchbutton}>Submit</button>
  </div>

  {/* Default Content */}
  {displayContent === "default" && (
    <div>
      <h1 className="app-title">Destination Finder</h1>
      <p className="about-blurb">
        Welcome to Destination Finder! Discover your dream destinations in Europe with our intuitive and easy-to-use application.
      </p>
    </div>
  )}

   {/* Map Section */}
   {displayContent === "Search" && searchResults.length > 0 && (
        <Map locations={searchResults} />
      )}

<div className="search-results">
  {searchResults.length > 0 ? (
    searchResults.map((result, index) => (
      <div key={index} className="result-container">
        {/* Basic Information */}
        <h3>{result.Destination}</h3>
        <p>
          <strong>Country:</strong> {result.Country}
        </p>
        {currentUsername && (
            <button
            className="add-to-list-button"
            onClick={() => handleAddToList(result)}
        >
            Add to List
        </button>
        
            
          )}

        {/* Expanded Information */}
        {expandedResults[index] && (
  <div className="expanded-content">
    {/* Display all key-value pairs */}
    {Object.entries(result).map(([key, value]) => (
      <p key={key}>
        <strong>{key.replace(/_/g, " ")}:</strong> {value}
      </p>
      
    ))}

    {/* DuckDuckGo Search Button */}
    <a
      href={`https://duckduckgo.com/?q=${encodeURIComponent(
        `${result.Destination} ${result.Country}`
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="duckduckgo-button"
    >
      Search on DuckDuckGo
    </a>
  </div>
)}

        {/* Show More / Show Less Button */}
        <button onClick={() => toggleExpand(index)}>
          {expandedResults[index] ? "Show Less" : "Show More"}
        </button>
      </div>
    ))
  ) : (
    <p>No results found.</p>
  )}
</div>

{/* List Name and Description */}
            <div className="list-info">
                <h2>Create Your List</h2>
                <input
                    type="text"
                    placeholder="Enter list name"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                />
                <textarea
                    placeholder="Enter a description for your list (optional)"
                    value={listDescription}
                    onChange={(e) => setListDescription(e.target.value)}
                ></textarea>
            </div>
            <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                </select>

            {/* Added Destinations */}
            <div className="added-destinations">
                <h2>Your List</h2>
                {addedDestinations.length > 0 ? (
                    <ul>
                        {addedDestinations.map((destination, index) => (
                            <li key={index}>{destination.Destination}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No destinations added yet.</p>
                )}
                {addedDestinations.length > 0 && (
                    <>
                        <button onClick={handleSaveList}>Save List</button>
                        <button onClick={handleClearList} className="clear-list-button">
                            Clear List
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
export default Home;
