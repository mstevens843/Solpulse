// // UserCardModal.jsx
// import React from "react";
// import PropTypes from "prop-types";
// import UserCard from "./UserCard"; // Import the original UserCard component
// import "@/css/components/UserCardModal.css"; // Modal-specific styles for UserCard

// function UserCardModal({ user, onClose }) {
//     return (
//         <div className="user-card-modal-overlay" onClick={onClose}>
//             <div className="user-card-modal-content" onClick={(e) => e.stopPropagation()}>
//                 <button className="close-btn" onClick={onClose}>X</button>
//                 <UserCard user={user} />
//             </div>
//         </div>
//     );
// }

// UserCardModal.propTypes = {
//     user: PropTypes.shape({
//         id: PropTypes.number.isRequired,
//         username: PropTypes.string.isRequired,
//         profilePicture: PropTypes.string,
//         followersCount: PropTypes.number,
//         followingCount: PropTypes.number,
//     }).isRequired,
//     onClose: PropTypes.func.isRequired, // Close the modal
// };

// export default UserCardModal;
