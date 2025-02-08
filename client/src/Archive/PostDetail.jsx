// This page shows full details of a single post, including the content, comment, likes, and other interactions. 
// It allows users to engage more deeply with specific piece of content. 
// - Description: 
// Displays full post with author details and post date. 
// Shows all comments on the post. 
// Allows users to add comments. 


// import React, { useState, useEffect, useCallback } from "react";
// import { useParams } from "react-router-dom";
// import { api } from "@/api/apiConfig"; // Using centralized API instance
// import LikeButton from "@/components/LikeButton";
// import RetweetButton from "@/components/RetweetButton";
// import CommentSection from "@/components/CommentSection";
// import CryptoTip from "@/components/CryptoTip";
// import Loader from "@/components/Loader";
// import "@/css/pages/PostDetail.css"; // Updated for Vite alias

// function PostDetail() {
//   const { id: postId } = useParams();
//   const [post, setPost] = useState(
//     JSON.parse(localStorage.getItem(`post-${postId}`)) || null
//   );
//   const [comments, setComments] = useState(
//     JSON.parse(localStorage.getItem(`comments-${postId}`)) || []
//   );
//   const [loading, setLoading] = useState(!post);
//   const [errorMessage, setErrorMessage] = useState("");

//   const fetchPost = useCallback(async () => {
//     setLoading(true);
//     setErrorMessage("");
//     try {
//       const response = await api.get(`/posts/${postId}`);
//       const fetchedPost = response.data;

//       setPost(fetchedPost);
//       setComments(fetchedPost.comments || []);

//       localStorage.setItem(`post-${postId}`, JSON.stringify(fetchedPost));
//       localStorage.setItem(
//         `comments-${postId}`,
//         JSON.stringify(fetchedPost.comments || [])
//       );
//     } catch (error) {
//       console.error("Error fetching post:", error);
//       setErrorMessage(
//         error.response?.data?.message ||
//           "Failed to load the post. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [postId]);

//   useEffect(() => {
//     if (!post) fetchPost();
//   }, [fetchPost, post]);

//   const addComment = (newComment) => {
//     setComments((prevComments) => {
//       const updatedComments = [...prevComments, newComment];
//       localStorage.setItem(
//         `comments-${postId}`,
//         JSON.stringify(updatedComments)
//       );
//       return updatedComments;
//     });
//   };

//   if (loading) return <Loader />;

//   if (errorMessage) {
//     return (
//       <div className="error-container">
//         <p>{errorMessage}</p>
//         <button onClick={fetchPost}>Retry</button>
//       </div>
//     );
//   }

//   return (
//     <div className="post-detail-container">
//       <section className="post-info">
//         <h2>{post.author || "Anonymous"}</h2>
//         <p>{post.content || "No content available."}</p>
//         {post.cryptoTag && <p className="crypto-tag">#{post.cryptoTag}</p>}
//         {post.media && (
//           <div className="post-media">
//             {post.mediaType === "image" ? (
//               <img src={post.media} alt="Post media" />
//             ) : (
//               <video controls>
//                 <source src={post.media} type="video/mp4" />
//                 Your browser does not support the video tag.
//               </video>
//             )}
//           </div>
//         )}
//         <CryptoTip recipientId={Number(post.authorId) || 0} onTip={() => {}} />
//       </section>

//       <section className="post-actions">
//         <LikeButton postId={post.id} initialLikes={post.likes || 0} />
//         <RetweetButton postId={post.id} />
//       </section>

//       <section className="comments-section">
//         <h3>Comments</h3>
//         {comments.length > 0 ? (
//           <CommentSection
//             postId={post.id}
//             comments={comments}
//             addComment={addComment}
//           />
//         ) : (
//           <p>No comments yet. Be the first to comment!</p>
//         )}
//       </section>
//     </div>
//   );
// }

// export default PostDetail;