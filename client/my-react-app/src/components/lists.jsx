import "./lists.css"

import React, { useState, useEffect } from "react";

const BASE_URL = "http://localhost:3000/api";

const ListsPage = ({ currentUsername }) => {
    const [userLists, setUserLists] = useState([]); // Logged-in user's lists
    const [otherLists, setOtherLists] = useState([]); // Other users' lists
    const [expandedList, setExpandedList] = useState(null); // Track which list is expanded
    const [expandedDestination, setExpandedDestination] = useState(null); // Track which destination is expanded
    const [editingList, setEditingList] = useState(null); // Track which list is being edited
    const [editData, setEditData] = useState({}); // Store the current edit values
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 0, comment: "", listId: null });
    const [averageScores, setAverageScores] = useState({});
    const [expandedReviews, setExpandedReviews] = useState({});




    useEffect(() => {
        const fetchLists = async () => {
            try {
                const response = await fetch(`${BASE_URL}/lists`);
                if (!response.ok) throw new Error("Failed to fetch lists.");
                const allLists = await response.json();
    
                // Sort lists by `modifiedAt` or `createdAt` in descending order
                allLists.sort((a, b) => new Date(b.modifiedAt || b.createdAt) - new Date(a.modifiedAt || a.createdAt));
    
                // Separate lists into logged-in user's and others'
                const userLists = allLists.filter((list) => list.username === currentUsername);
                const otherLists = allLists.filter(
                    (list) => list.username !== currentUsername && list.visibility !== "private"
                );
    
                // Apply the limit based on whether the user is logged in
                setUserLists(userLists.slice(0, currentUsername ? 20 : 0)); // User's own lists
                setOtherLists(otherLists.slice(0, currentUsername ? 20 : 10)); // Other users' lists
            } catch (error) {
                console.error("Error fetching lists:", error);
            }
        };

        const fetchAverageScores = async () => {
            try {
                const scores = {};
    
                for (const list of [...userLists, ...otherLists]) {
                    const response = await fetch(`${BASE_URL}/reviews/average/${list.id}`);
                    if (!response.ok) throw new Error("Failed to fetch average score.");
    
                    const { averageRating } = await response.json();
                    scores[list.id] = averageRating;
                }
    
                setAverageScores(scores);
            } catch (error) {
                console.error("Error fetching average scores:", error);
            }
        };
    
        fetchLists();
        fetchAverageScores();
    }, [currentUsername, userLists, otherLists]);
    

    const toggleExpandedList = (listId) => {
        setExpandedList((prev) => (prev === listId ? null : listId));
        setExpandedDestination(null); // Reset destination expansion when changing list
    };

    const toggleExpandedDestination = (destinationIndex) => {
        setExpandedDestination((prev) => (prev === destinationIndex ? null : destinationIndex));
    };

    const handleEditToggle = (listId) => {
        setEditingList(listId);
        const listToEdit = userLists.find((list) => list.id === listId);
        setEditData({ ...listToEdit });
    };

    const handleEditChange = (field, value) => {
        setEditData((prevData) => ({ ...prevData, [field]: value }));
    };

    const handleSaveEdit = async () => {
        try {
            const response = await fetch(`${BASE_URL}/lists/${editingList}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editData),
            });
            if (!response.ok) throw new Error("Failed to update list.");
    
            // Update the local state with the modified list
            setUserLists((prevLists) =>
                prevLists.map((list) =>
                    list.id === editingList ? { ...list, ...editData } : list
                )
            );
    
            alert("List updated successfully!");
            setEditingList(null);
        } catch (error) {
            console.error("Error saving edited list:", error);
        }
    };
    

    const renderDestinationDetails = (destination) => (
        <div className="destination-details">
            {Object.entries(destination).map(([key, value]) => (
                <p key={key}>
                    <strong>{key.replace(/_/g, " ")}:</strong> {value}
                </p>
            ))}
        </div>
    );

    const renderListDetails = (list, isEditable) => (
        <div className="list-details">
            {isEditable && editingList === list.id ? (
                <div>
                    <input
                        type="text"
                        value={editData.listName}
                        onChange={(e) => handleEditChange("listName", e.target.value)}
                    />
                    <textarea
                        value={editData.description}
                        onChange={(e) => handleEditChange("description", e.target.value)}
                    ></textarea>
                    <select
                        value={editData.visibility}
                        onChange={(e) => handleEditChange("visibility", e.target.value)}
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                    <ul>
                        {editData.destinations.map((destination, index) => (
                            <li key={index}>
                                <strong>{destination.Destination}</strong> - {destination.Country}
                                <button onClick={() => handleDeleteDestination(index)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleSaveEdit}>Save</button>
                    <button onClick={() => setEditingList(null)}>Cancel</button>
                    <button onClick={() => handleDeleteList(list.id)}>Delete List</button>
                </div>
            ) : (
                <div>
                    <p>
                        <strong>Description:</strong> {list.description}
                    </p>
                    <p>
                        <strong>Visibility:</strong> {list.visibility}
                    </p>
                    <ul>
                        {list.destinations.map((destination, index) => (
                            <li
                                key={index}
                                onClick={() => toggleExpandedDestination(index)}
                                style={{ cursor: "pointer" }}
                            >
                                <strong>{destination.Destination}</strong> - {destination.Country}
                                {expandedDestination === index && (
                                    <div className="destination-details">
                                        {Object.entries(destination).map(([key, value]) => (
                                            <p key={key}>
                                                <strong>{key.replace(/_/g, " ")}:</strong> {value}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    {isEditable && (
                        <>
                            <button onClick={() => handleEditToggle(list.id)}>Edit</button>
                            <button onClick={() => handleDeleteList(list.id)}>Delete List</button>
                        </>
                    )}
                    {!isEditable && currentUsername && (
                        <button onClick={() => openReviewModal(list.id)}>Leave a Review</button>
                    )}
                </div>
            )}
        </div>
    );
    
    

    const renderList = (list, isEditable) => (
        <div className="list-container">
            <div className="list-summary" onClick={() => toggleExpandedList(list.id)} style={{ cursor: "pointer" }}>
                <h3>{list.listName}</h3>
                <p>
                    <strong>Created By:</strong> {list.username}
                </p>
                <p>
                    <strong>Number of Destinations:</strong> {list.destinations.length}
                </p>
                <p>
                    <strong>Last Modified:</strong> {new Date(list.modifiedAt || list.createdAt).toLocaleString()}
                </p>
                <p>
                    <strong>Average Review Score:</strong>{" "}
                    {averageScores[list.id] ? averageScores[list.id].toFixed(1) : "No reviews yet"}
                </p>
                <button onClick={() => toggleReviews(list.id)}>
                    {expandedReviews[list.id] ? "Hide Reviews" : "Show Reviews"}
                </button>
            </div>
            {expandedList === list.id && renderListDetails(list, isEditable)}
            {expandedReviews[list.id] && renderReviews(expandedReviews[list.id])}
        </div>
    );

    const renderReviews = (reviews) => (
        <div className="reviews-container">
            <h4>Reviews</h4>
            {reviews.length > 0 ? (
                reviews.map((review, index) => (
                    <div key={index} className="review-item">
                        <p>
                            <strong>Rating:</strong> {review.rating} / 5
                        </p>
                        {review.comment && (
                            <p>
                                <strong>Comment:</strong> {review.comment}
                            </p>
                        )}
                        <p>
                            <strong>Reviewer:</strong> {review.username}
                        </p>
                    </div>
                ))
            ) : (
                <p>No reviews yet for this list.</p>
            )}
        </div>
    );
    
    

    const handleDeleteDestination = (index) => {
        setEditData((prevData) => ({
            ...prevData,
            destinations: prevData.destinations.filter((_, i) => i !== index),
        }));
    };

    const handleDeleteList = async (listId) => {
        if (!window.confirm("Are you sure you want to delete this list?")) return;
    
        try {
            const response = await fetch(`${BASE_URL}/lists/${listId}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete the list.");
    
            // Update the state to remove the deleted list
            setUserLists((prevLists) => prevLists.filter((list) => list.id !== listId));
    
            alert("List deleted successfully!");
        } catch (error) {
            console.error("Error deleting list:", error);
            alert("Failed to delete the list. Please try again.");
        }
    };

    const openReviewModal = (listId) => {
        setReviewData((prev) => ({ ...prev, listId }));
        setIsReviewModalOpen(true);
    };
    
    const closeReviewModal = () => {
        setIsReviewModalOpen(false);
        setReviewData({ rating: 0, comment: "", listId: null });
    };

    const handleSubmitReview = async () => {
        if (!reviewData.rating) {
            alert("Rating is required!");
            return;
        }
    
        try {
            const response = await fetch(`${BASE_URL}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    listId: reviewData.listId,
                    username: currentUsername,
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                }),
            });
    
            if (!response.ok) throw new Error("Failed to submit review.");
    
            alert("Review submitted successfully!");
            closeReviewModal();
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review. Please try again.");
        }
    };

    const fetchReviews = async (listId) => {
        try {
            const response = await fetch(`${BASE_URL}/reviews/${listId}`);
            if (!response.ok) throw new Error("Failed to fetch reviews.");
    
            const reviews = await response.json();
            setExpandedReviews((prev) => ({
                ...prev,
                [listId]: reviews,
            }));
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const toggleReviews = (listId) => {
        if (expandedReviews[listId]) {
            // If already expanded, collapse the reviews
            setExpandedReviews((prev) => {
                const updated = { ...prev };
                delete updated[listId];
                return updated;
            });
        } else {
            // Fetch and display reviews
            fetchReviews(listId);
        }
    };
    
    
    

    return (
        <div className="lists-page">
            <h1>All Lists</h1>

            {/* Logged-in User's Lists */}
            <section>
                <h2>Your Lists</h2>
                {userLists.length > 0 ? (
                    userLists.map((list) => (
                        <div key={list.id}>{renderList(list, true)}</div>
                    ))
                ) : (
                    <p>You have no lists yet.</p>
                )}
            </section>

            {/* Other Users' Lists */}
            <section>
                <h2>Lists by Other Users</h2>
                {otherLists.length > 0 ? (
                    otherLists.map((list) => (
                        <div key={list.id}>{renderList(list, false)}</div>
                    ))
                ) : (
                    <p>No lists available from other users.</p>
                )}
            </section>
            {isReviewModalOpen && (
    <div className="modal-overlay" onClick={closeReviewModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Leave a Review</h2>
            <label>
                Rating (out of 5):
                <input
                    type="number"
                    min="1"
                    max="5"
                    value={reviewData.rating}
                    onChange={(e) =>
                        setReviewData((prev) => ({ ...prev, rating: parseInt(e.target.value, 10) }))
                    }
                />
            </label>
            <label>
                Comment (optional):
                <textarea
                    value={reviewData.comment}
                    onChange={(e) =>
                        setReviewData((prev) => ({ ...prev, comment: e.target.value }))
                    }
                ></textarea>
            </label>
            <button onClick={handleSubmitReview}>Submit</button>
            <button onClick={closeReviewModal}>Cancel</button>
        </div>
    </div>
)}
        </div>
        
    );
};

export default ListsPage;
