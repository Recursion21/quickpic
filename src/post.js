// functionality for post as a 'card'
import { clearInner, convertDate} from './myHelpers.js';
import { deleteProfile, generateProfileWrapper, generateProfileInfo, } from './profile.js';
import { deleteFeed} from './feed.js';
import API from './api.js';

const api = new API('http://localhost:5000');

export const generateCard = (post, wrapper, loginToken, users) => {
    let main = document.getElementById(wrapper);
    let card = document.createElement("div");
    let cardAuthor = document.createElement("div");
    let cardTime = document.createElement("div");
    let cardImage = document.createElement("img");
    let cardLikes = document.createElement("div");
    let cardText = document.createElement("div");
    let cardComments = document.createElement("div");
    let cardLikeImage = document.createElement("img");

    cardComments.classList.add("add-comment-div");

    // hover features
    let cardLikeButton = document.createElement("button");
    cardLikeButton.setAttribute("type", "button");
    cardLikeButton.classList.add("btn");
    cardLikeButton.classList.add("btn-secondary");
    cardLikeButton.classList.add("circle-button");
    cardLikeButton.setAttribute("data-container", "body");
    cardLikeButton.setAttribute("data-toggle", "popover");
    cardLikeButton.setAttribute("data-placement", "top");
    cardLikeButton.setAttribute("data-content", "+1");

    // hover features, slight delay activated after api call
    let showLikeButton = document.createElement("button");
    showLikeButton.setAttribute("type", "button");
    showLikeButton.classList.add("btn");
    showLikeButton.classList.add("btn-secondary");
    showLikeButton.classList.add("show-like-button");
    showLikeButton.setAttribute("data-container", "body");
    showLikeButton.setAttribute("data-toggle", "popover");
    showLikeButton.setAttribute("data-trigger", "hover");
    showLikeButton.setAttribute("data-placement", "top");
    showLikeButton.setAttribute("data-content", `${post.meta.likes}`);
    showLikeButton.setAttribute("id", `showLike${post.id}`);

    let showLikeText = document.createTextNode("Show Likes");
    

    // event function for showing who liked post
    // hover functionality for some reason doesn't work consistently in developer tools, please exit 
    // developer tools to hover over 'show likes'
    const showLikeEvent = () => {
        const promises = [];
            let userList = [];
            for (let i = 0; i < post.meta.likes.length; ++i) {
                if (post.meta.likes[i] in users) {
                    userList.push(users[post.meta.likes[i]]);
                } else {
                    promises.push(
                        api.get(`user/?id=${post.meta.likes[i]}`, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Token ${loginToken}`,
                            },
                        })
                            .then(data => {
                                users.push({
                                    key: `${data.id}`,
                                    value: `${data.name}`
                                });
                                if (i == 0) {
                                    userList.push(data.name);
                                } else {
                                    userList.push(` ${data.name}`);
                                }
                            })
                            .catch(err => {
                                alert(err);
                            })
                    );
                }
            }
            Promise.all(promises)
                .then(() => { 
                    let userNames = userList.toString();
                    showLikeButton.setAttribute("data-content", `${userNames}`);
                    // bootstrap related jQuery "You are permitted to include jQuery so bootstrap can use it."
                    $(function () {
                        $(`#showLike${post.id}`).popover()
                    });
                    $(`#showLike${post.id}`).popover({ trigger: "hover" });
                })
        // one time eventlistener because only need to do conversion between id to name once
        showLikeButton.removeEventListener('mouseover', showLikeEvent, false);
    }

    // converts userIDs to names upon hover
    showLikeButton.addEventListener('mouseover', showLikeEvent, false);

    // event function for add like
    const addLike = () => {
        api.put(`post/like/?id=${post.id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${loginToken}`,
            },
        })
            .catch(err => {
                alert(err);
            });
    }

    // event listener on api call to add like on like button
    cardLikeButton.addEventListener('click', addLike);

    let textNodeAuthor = document.createTextNode(`${post.meta.author}`);
    let cardAuthorText = document.createElement("span");
    cardAuthorText.classList.add("author-text");
    cardAuthorText.appendChild(textNodeAuthor);

    // event listener on author name to visit their profile page
    cardAuthorText.addEventListener('click', e => {
        api.get(`user/?username=${post.meta.author}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${loginToken}`,
            },
        })
            .then(data => {
                deleteFeed();
                deleteProfile();
                generateProfileWrapper();
                generateProfileInfo(data, users, loginToken);
            })
            .catch(err => {
                alert(err);
            });
    })

    // edit button wrapper to trigger modal
    let editPostButton = document.createElement("button");
    let editButtonTextNode = document.createTextNode("Edit Post");
    editPostButton.setAttribute("data-toggle", "modal");
    editPostButton.setAttribute("data-target", "#editPost");
    editPostButton.appendChild(editButtonTextNode);

    // dynamically generate buttons in modal form so they don't link to the same ID
    let editModal = document.getElementById("editModalFooter");
    clearInner(editModal);

    let cancelButton = document.createElement("button");
    cancelButton.classList.add("btn");
    cancelButton.classList.add("btn-secondary");
    cancelButton.setAttribute("data-dismiss", "modal");
    cancelButton.innerText = "Cancel";

    let editPostConfirmButton = document.createElement("button");
    editPostConfirmButton.classList.add("btn");
    editPostConfirmButton.classList.add("btn-primary");
    editPostConfirmButton.setAttribute("data-dismiss", "modal");
    editPostConfirmButton.setAttribute("id", "putPostButton");
    editPostConfirmButton.innerText = "Post";

    let editPostDeleteButton = document.createElement("button");
    editPostDeleteButton.classList.add("btn");
    editPostDeleteButton.classList.add("btn-danger");
    editPostDeleteButton.setAttribute("data-dismiss", "modal");
    editPostDeleteButton.innerText = "Delete";

    editModal.appendChild(cancelButton);
    editModal.appendChild(editPostDeleteButton);
    editModal.appendChild(editPostConfirmButton);

    // fill in form previously
    editPostButton.addEventListener('click', e => {
        document.getElementById("editDesc").value = `${post.meta.description_text}`;
    })

    let putEditButton = document.getElementById("putPostButton");

    // event listener on edit post button confirm api call
    putEditButton.addEventListener('click', e => {
        const editDesc = document.getElementById('editDesc').value;
        e.preventDefault();
    
        api.put(`post/?id=${post.id}`, {
            body: JSON.stringify({
                "description_text": editDesc,
                "src": `${post.src}`,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${loginToken}`,
            },
        })
            .then(() => {
                alert("Post Edited!");
            })
            .catch(err => {
                alert(err);
            });
    })

    // delete post button confirm
    editPostDeleteButton.addEventListener('click', e => {
        api.delete(`post/?id=${post.id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${loginToken}`,
            },
        })
            .then(() => {
                alert("Post Deleted!");
            })
            .catch(err => {
                alert(err);
            });
    })

    // comment button to open modal
    let addCommentButton = document.createElement("button");
    addCommentButton.classList.add("btn", "btn-secondary");
    addCommentButton.setAttribute("data-toggle", "modal");
    addCommentButton.setAttribute("data-target", "#addComment");
    addCommentButton.innerText = "Add Comment";

    let addCommentConfirmButton = document.createElement("button");
    addCommentConfirmButton.classList.add("btn", "btn-primary");
    addCommentConfirmButton.setAttribute("data-dismiss", "modal");
    addCommentConfirmButton.setAttribute("id", "commentButton");
    addCommentConfirmButton.innerText = "Comment";

    let commentModal = document.getElementById("commentModalFooter");
    clearInner(commentModal);

    commentModal.appendChild(cancelButton);
    commentModal.appendChild(addCommentConfirmButton);

    // eventlistener for add comment button confirm to make comment api call
    addCommentConfirmButton.addEventListener('click', e => {
        const commentDesc = document.getElementById('commentDesc').value;
        api.put(`post/comment/?id=${post.id}`, {
            body: JSON.stringify({
                "comment": commentDesc,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${loginToken}`,
            },
        })
            .then(() => {
                alert("Comment Added!");
            })
            .catch(err => {
                alert(err); 
            });
    })

    let textNodeTime = document.createTextNode(convertDate(post.meta.published));
    let dateSpan = document.createElement("span");
    dateSpan.appendChild(textNodeTime);
    dateSpan.classList.add("float-right");

    cardImage.src = `data:image/jpeg;base64,${post.src}`;
    cardImage.classList.add("img");
    cardLikeImage.src = "assets/like.png";
    cardLikeImage.classList.add("thumbnail");
    
    let likesSpan = document.createElement("span");
    let textNodeLikes = document.createTextNode(`${post.meta.likes.length}`);
    likesSpan.appendChild(textNodeLikes);
    likesSpan.classList.add("likes-span");

    let textNodeText = document.createTextNode(`${post.meta.description_text}`);
    let textNodeComments = document.createTextNode(`Comments: ${post.comments.length}`);

    cardAuthor.classList.add("card-title", "card-author");
    cardText.classList.add("card-title");
    cardLikes.classList.add("card-title");
    addCommentButton.classList.add("card-title", "float-right");

    let showCommentsButton = document.createElement("button");
    showCommentsButton.classList.add("btn", "btn-secondary");
    showCommentsButton.innerText = "Show Comments";
    showCommentsButton.classList.add("card-title", "float-right");

    cardAuthor.appendChild(cardAuthorText);
    cardLikes.appendChild(cardLikeButton);
    cardLikeButton.appendChild(cardLikeImage);
    cardLikes.appendChild(likesSpan);
    cardLikes.appendChild(showLikeButton);
    cardLikes.appendChild(dateSpan);
    showLikeButton.appendChild(showLikeText);
    cardText.appendChild(textNodeText);
    cardComments.appendChild(textNodeComments);

    card.classList.add("card", "mb-3");

    let cardRow = document.createElement("div");
    cardRow.classList.add("row", "no-gutters");
    card.appendChild(cardRow);

    let cardLeftSplit = document.createElement("div");
    cardLeftSplit.classList.add("col-md-4");
    let cardRightSplit = document.createElement("div");
    cardRightSplit.classList.add("col-md-8");
    cardRow.appendChild(cardLeftSplit);
    cardRow.appendChild(cardRightSplit);

    let cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
    cardRightSplit.appendChild(cardBody);

    cardLeftSplit.appendChild(cardImage);
    cardImage.classList.add("card-img");
    
    cardBody.appendChild(cardAuthor);
    cardBody.appendChild(cardText);
    cardBody.appendChild(cardLikes);
    cardBody.appendChild(addCommentButton);
    cardBody.appendChild(showCommentsButton);
    cardBody.appendChild(cardComments);

    editPostButton.classList.add("float-right", "btn", "btn-secondary");
    cardAuthor.appendChild(editPostButton);

    // if post is not yours, hide editPostButton
    let username = localStorage.getItem("username");
    if (username !== post.meta.author) {
        editPostButton.style.display = "none";
    }

    // add comments at bottom
    let commentBlock = document.createElement("div");
    cardRightSplit.appendChild(commentBlock);
    commentBlock.style.display = "none";

    // event listener for show comments button
    showCommentsButton.addEventListener('click', e => {
        if (commentBlock.style.display === "none") {
            commentBlock.style.display = "inherit";
        } else {
            commentBlock.style.display = "none";
        }
    })

    // display comments, but keep them hidden in right side of post card
    for (let i = 0; i < post.comments.length; ++i) {

        let commentCard = document.createElement("div");
        commentCard.classList.add("card");
        commentBlock.appendChild(commentCard);

        let commentHeader = document.createElement("div");
        commentHeader.classList.add("card-header");
        let tempTextNode = document.createTextNode(`${post.comments[i].author}`);
        commentHeader.appendChild(tempTextNode);
        commentCard.appendChild(commentHeader);

        let commentBody = document.createElement("div");
        commentBody.classList.add("card-body");
        commentCard.appendChild(commentBody);

        let commentText = document.createElement("div");
        commentText.classList.add("card-title");
        tempTextNode = document.createTextNode(`${post.comments[i].comment}`);
        commentText.appendChild(tempTextNode);
        commentBody.appendChild(commentText);

        let commentDate = document.createElement("div");
        commentBody.classList.add("card-title");

        dateSpan = document.createElement("span");
        tempTextNode = document.createTextNode(convertDate(post.comments[i].published));
        dateSpan.appendChild(tempTextNode);
        dateSpan.classList.add("float-right");
        commentDate.appendChild(dateSpan);
        commentBody.appendChild(commentDate);
    }
    
    main.appendChild(card);
}