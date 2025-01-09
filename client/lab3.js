let currentPage = 1;
let totalResults = [];
let resultsPerPage = 10;
let currentlist = []
let allLists = []; // Holds all the lists after they are loaded

// Base URL for API
const BASE_URL = 'http://localhost:3000/api';

// Initialize the map and set view to a default location
const map = L.map('map').setView([20.5937, 78.9629], 5); // Centered on India

// Add the OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// Search destinations based on field and pattern
async function searchDestinations() {
    const field = document.getElementById('searchField').value;
    const pattern = document.getElementById('searchInput').value;
    resultsPerPage = parseInt(document.getElementById('resultsLimit').value, 10);

    // Input sanitization: remove any potential harmful characters or patterns
    const sanitizeInput = (input) => {
        // Remove leading/trailing spaces and prevent potential harmful characters
        return input.replace(/[^a-zA-Z0-9\s-]/g, ''); // Only allow alphanumeric characters, spaces, and hyphens
    };

    // Sanitize the inputs
    const sanitizedField = sanitizeInput(field);
    const sanitizedPattern = sanitizeInput(pattern);

    // Validation: Check if sanitized inputs are valid
    if (!sanitizedField || !sanitizedPattern) {
        alert("Please enter valid search criteria.");
        return;
    }

    // Clear all markers by removing layers
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer); // Remove only marker layers
        }
    });
    
    const response = await fetch(`${BASE_URL}/destinations/search?field=${field}&pattern=${pattern}`);
    totalResults = await response.json();

    totalResults.forEach((result) => {
        if (result.Latitude && result.Longitude) {
            // Add a marker for each result
            const marker = L.marker([result.Latitude, result.Longitude]).addTo(map);

            // Add a popup with additional information
            marker.bindPopup(`
                <strong>${result.Destination}</strong><br>
                ${result.Description || 'No description available'}
            `);
        }
    });

    // Adjust map view to fit all markers
    const bounds = L.latLngBounds(totalResults.map(r => [r.Latitude, r.Longitude]));
    map.fitBounds(bounds);

    currentPage = 1; // Reset to first page on new search
    displayResults();
}

function createParagraph(label, content) {
            const p = document.createElement('p');
    
            const strong = document.createElement('strong');
            strong.textContent = `${label}: `;
            
            p.appendChild(strong);
            p.appendChild(document.createTextNode(content || 'N/A'));
            
            return p;
        }
// Display search results
function displayResults(destinations) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = ''; // Clear previous results

    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const pageResults = totalResults.slice(startIndex, endIndex);

    pageResults.forEach(destination => {
        const div = document.createElement('div');
        div.className = 'destination';
    
        // Title
        const title = document.createElement('h3');
        title.textContent = destination.Destination;
        div.appendChild(title);
    
        // Helper function to create a paragraph with a label and content
        
    
        // Append each field as a paragraph
        div.appendChild(createParagraph('Region', destination.Region));
        div.appendChild(createParagraph('Country', destination.Country));
        div.appendChild(createParagraph('Category', destination.Category));
        div.appendChild(createParagraph('Coordinates', `${destination.Latitude}, ${destination.Longitude}`));
        div.appendChild(createParagraph('Approximate Annual Tourists', destination["Approximate Annual Tourists"]));
        div.appendChild(createParagraph('Currency', destination.Currency));
        div.appendChild(createParagraph('Majority Religion', destination["Majority Religion"]));
        div.appendChild(createParagraph('Famous Foods', destination["Famous Foods"]));
        div.appendChild(createParagraph('Language', destination.Language));
        div.appendChild(createParagraph('Best Time to Visit', destination["Best Time to Visit"]));
        div.appendChild(createParagraph('Cost of Living', destination["Cost of Living"]));
        div.appendChild(createParagraph('Safety', destination.Safety));
        div.appendChild(createParagraph('Cultural Significance', destination["Cultural Significance"]));
        div.appendChild(createParagraph('Description', destination.Description));
    
        // Button to add to favorites
        const addButton = document.createElement('button');
        addButton.textContent = 'Add to Favorites';
        addButton.onclick = () => addToFavorites(destination.Destination);
        div.appendChild(addButton);
    
        // Append the destination div to the results container
        resultsContainer.appendChild(div);
    });
    

    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${Math.ceil(totalResults.length / resultsPerPage)}`;

}



// Create a new favorite list
async function createFavoriteList() {
    let listName = document.getElementById('favoriteListName').value.trim();

    // Input sanitization: Remove unwanted characters and notify the user
    const sanitizeInput = (input) => {
        const sanitized = input.replace(/[^a-zA-Z0-9\s-_]/g, ''); // Allow letters, numbers, spaces, hyphens, and underscores
        if (sanitized !== input) {
            alert('Invalid characters were removed from the list name. Only letters, numbers, spaces, hyphens, and underscores are allowed.');
        }
        return sanitized;
    };

    listName = sanitizeInput(listName);

    // Validation: Check if listName is empty after sanitization
    if (!listName) {
        alert('Please enter a valid list name');
        return;
    }

    // Optional: Check for reasonable length for list name (e.g., between 3 and 50 characters)
    if (listName.length < 3 || listName.length > 50) {
        alert('List name must be between 3 and 50 characters');
        return;
    }

    const res = await fetch(`${BASE_URL}/lists`);
    const lists = await res.json();

    let listnames = Object.keys(lists).map(key => lists[key].Name);
    let changelist =null;

    if(listnames.includes(listName)){

        for (const key in lists) {
            if (lists[key].Name === listName) {
                changelist = listName[key];
                break;
            }
        }
        


        try {
            let destinationIds = changelist.IDs;
            const response = await fetch(`${BASE_URL}/api/lists/${listName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ destinationIds }),
            });
    
            if (!response.ok) {
                const error = await response.json();
                console.error('Error updating list:', error.error);
            } else {
                const result = await response.json();
                console.log(result.message); // "List updated successfully"
            }
        } catch (err) {
            console.error('Network error:', err);
        }
    }

    const response = await fetch(`${BASE_URL}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listName })
    });

    const result = await response.json();
    if (result.error) {
        alert(result.error);
    } else {
        alert('List created successfully');
        loadFavoriteLists();
    }
    
    fetch(`${BASE_URL}/lists/${listName}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            destinationIds: currentlist,
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the success response from the server
        if (data.message) {
            console.log(data.message); // 'List updated successfully'
        } else {
            console.error('Error:', data.error);
        }
    })
    .catch(error => {
        // Handle any errors during the request
        console.error('Request failed', error);
    });
//emplty currentlist when done
    currentlist = []; 
}

async function loadFavoriteLists() {
    const response = await fetch(`${BASE_URL}/lists`);
    const lists = await response.json();
    const container = document.getElementById('favoriteListsContainer');
    container.innerHTML = ''; // Clear previous lists

    Object.values(lists).forEach(list => {
        const div = document.createElement('div');
        div.className = 'favorite-list';
        div.innerHTML = `<h4>${list.Name}</h4><button onclick="viewList('${list.Name}')">View List</button>`;
        container.appendChild(div);
    });
}

async function viewList(listName) {
    try {
        const response = await fetch(`${BASE_URL}/lists/${listName}`);
        const data = await response.json();

        if (data.error) {
            alert('Error: ' + data.error);
            return;
        }

        // The actual list data is in data.list
        const list = data.list;

        // Hide the lists container and show the view list section
        document.getElementById('favoriteListsContainer').style.display = 'none';
        document.getElementById('viewListSection').style.display = 'block';

        // Set the list name
        document.getElementById('viewListName').innerText = list.Name;

        // Clear previous list items and populate them
        const viewListItemsContainer = document.getElementById('viewListItems');
        viewListItemsContainer.innerHTML = ''; // Clear any previous items

        // Check if list.IDs is an array and if it has elements
        if (Array.isArray(list.IDs) && list.IDs.length > 0) {
            list.IDs.forEach(async id => {
                const listItem = document.createElement('li');
                const res = await fetch(`${BASE_URL}/destination/${id}`);
                const dest = await res.json();
                console.log(dest);
                listItem.appendChild(createParagraph('Desination', dest.Destination));
                listItem.appendChild(createParagraph('Region', dest.Region));
                listItem.appendChild(createParagraph('Country', dest.Country));
                listItem.appendChild(createParagraph('Category', dest.Category));
                listItem.appendChild(createParagraph('Coordinates', `${dest.Latitude}, ${dest.Longitude}`));
                listItem.appendChild(createParagraph('Approximate Annual Tourists', dest["Approximate Annual Tourists"]));
                listItem.appendChild(createParagraph('Currency', dest.Currency));
                listItem.appendChild(createParagraph('Majority Religion', dest["Majority Religion"]));
                listItem.appendChild(createParagraph('Famous Foods', dest["Famous Foods"]));
                listItem.appendChild(createParagraph('Language', dest.Language));
                listItem.appendChild(createParagraph('Best Time to Visit', dest["Best Time to Visit"]));
                listItem.appendChild(createParagraph('Cost of Living', dest["Cost of Living"]));
                listItem.appendChild(createParagraph('Safety', dest.Safety));
                listItem.appendChild(createParagraph('Cultural Significance', dest["Cultural Significance"]));
                listItem.appendChild(createParagraph('Description', dest.Description));
                viewListItemsContainer.appendChild(listItem);
            });
        } else {
            // If no IDs or IDs is not an array, show a message
            const listItem = document.createElement('li');
            listItem.textContent = 'No destinations available for this list.';
            viewListItemsContainer.appendChild(listItem);
        }

    } catch (error) {
        console.error('Error viewing list:', error);
    }
}

function backtolists(){
    document.getElementById('viewListSection').style.display = 'none';
    document.getElementById('favoriteListsContainer').style.display = 'block';
}

function deletelist(){
    let listname = document.getElementById('viewListName').textContent;
    fetch(`http://localhost:3000/api/lists/${listname}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
    
}



// Add a destination to the selected favorite list
async function addToFavorites(destinationName) {
    const listName = document.getElementById('favoriteListName').value;
    if (!listName) {
        alert('Please create or select a favorite list');
        return;
    }

    const alldestinations = await fetch(`${BASE_URL}/destinations`);
    const alldestjson = await alldestinations.json();

    const index = (alldestjson.findIndex(item => item.Destination === destinationName))+1;
    currentlist.push(index);
    console.log(currentlist);
    alert(`Adding ${destinationName} to list: ${listName} index is ${index}`);
}

function nextPage() {
    const totalPages = Math.ceil(totalResults.length / resultsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayResults();
    } else {
        alert('You are already on the last page.');
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayResults();
    } else {
        alert('You are already on the first page.');
    }
}