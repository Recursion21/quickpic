// profile related functionality

import {clearInner} from './myHelpers.js';
import {generateCard} from './post.js';
import API from './api.js';

const api = new API('http://localhost:5000');

export const deleteProfile = () => {
    if (document.getElementById("profileWrapper")) {
        clearInner(document.getElementById("profileWrapper"));
    }
}

// generates a wrapper around the to be generated profile
export const generateProfileWrapper = () => {
    let main = document.getElementById("mainBody");
    let wrapperDiv = document.createElement("div");
    wrapperDiv.setAttribute("id", "profileWrapper");
    main.appendChild(wrapperDiv);
}

// generates all profile info that will exist in profileWrapper
export const generateProfileInfo = (data, users, loginToken) => {
    let main = document.getElementById("profileWrapper");
    let profileBlock = document.createElement("div");
    profileBlock.classList.add("profile-block");

    let profileImage = document.createElement("img");
    profileImage.src = "assets/blank-profile.jpg";
    profileImage.classList.add("profile-blank-img");

    let nameDiv = document.createElement("div");
    let nameTextNode = document.createTextNode(`Name: ${data.name}`);
    nameDiv.appendChild(nameTextNode);

    let emailDiv = document.createElement("div");
    let emailTextNode = document.createTextNode(`Email: ${data.email}`);
    emailDiv.appendChild(emailTextNode);

    let followNumDiv = document.createElement("div");
    let followNumTextNode = document.createTextNode(`Followers: ${data.followed_num}`);
    followNumDiv.appendChild(followNumTextNode);

    let followDiv = document.createElement("div");
    let followTextNode = document.createTextNode(`Following: ${data.following.length}`);
    followDiv.appendChild(followTextNode);

    profileBlock.appendChild(profileImage);
    profileBlock.appendChild(nameDiv);
    profileBlock.appendChild(emailDiv);
    profileBlock.appendChild(followNumDiv);
    profileBlock.appendChild(followDiv);

    main.appendChild(profileBlock);

    // converts all followers from their userID to username, then promise.all to display them after 
    // all promises are complete 
    const promises = [];
    let userList = [];
    for (let i = 0; i < data.following.length; ++i) {
        // store users so no need to do api calls on repeated IDs
        if (data.following[i] in users) {
            userList.push(users[data.following[i]]);
        } else {
            promises.push(
                api.get(`user/?id=${data.following[i]}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${loginToken}`,
                    },
                })
                    .then(data => {
                        users[`${data.id}`] = `${data.name}`;
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
            let followArrayDiv = document.createElement("div");
            let followArrayTextNode = document.createTextNode(`Following: ${userNames}`);
            followArrayDiv.appendChild(followArrayTextNode);
            profileBlock.appendChild(followArrayDiv);

            let followButton = document.createElement("button");
            let followButtonTextNode = document.createTextNode("Follow"); 
            followButton.appendChild(followButtonTextNode);
            profileBlock.appendChild(followButton);

            let unfollowButton = document.createElement("button");
            let unfollowButtonTextNode = document.createTextNode("unfollow"); 
            unfollowButton.appendChild(unfollowButtonTextNode);
            unfollowButton.style.display = "none";
            profileBlock.appendChild(unfollowButton);

            // follow button attached to api call
            followButton.addEventListener('click', (e) => {
                api.put(`user/follow/?username=${data.username}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${loginToken}`,
                    },
                })
                    .then(() => {
                        // change to unfollow button in UI
                        followButton.style.display = "none";
                        unfollowButton.style.display = "initial";
                        alert("User followed!");
                    })
                    .catch(err => {
                        alert(err);
                    })
            })

            // unfollow button attached to api call
            unfollowButton.addEventListener('click', (e) => {
                api.put(`user/unfollow/?username=${data.name}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${loginToken}`,
                    },
                })
                    .then(() => {
                        // change to follow button in UI
                        unfollowButton.style.display = "none";
                        followButton.style.display = "initial";
                        alert("User Unfollowed!");
                    })
                    .catch(err => {
                        alert(err);
                    })
            })

            // update profile modal button
            let updateProfileButton = document.createElement("button");
            updateProfileButton.innerText = "Update Profile";
            updateProfileButton.setAttribute("data-toggle", "modal");
            updateProfileButton.setAttribute("data-target", "#updateProfile");
            let username = localStorage.getItem("username");

            // can only update own profile
            if (username === data.username) {
                profileBlock.appendChild(updateProfileButton);
            

                let updateProfileConfirmButton = document.getElementById("updateProfileButton");

                updateProfileConfirmButton.addEventListener('click', (e) => {
                    let updateName = document.getElementById('updateName').value;
                    const updatePassword = document.getElementById('updatePassword').value;
                    const updateConfirmPassword = document.getElementById('updateConfirmPassword').value;
                    let updateEmail = document.getElementById('updateEmail').value;

                    if (updatePassword != updateConfirmPassword) {
                        alert("Passwords Must Match");
                    } else {
                        e.preventDefault();

                        // if empty fields, then keep original fields - useful when user only
                        // wants to update 1 field
                        if (updateName === "") {
                            updateName = data.name;
                        }
                        if (updateEmail === "") {
                            updateEmail = data.email;
                        }
                    
                        api.put("user", {
                            body: JSON.stringify({
                                "email": updateEmail,
                                "name": updateName,
                                "password": updatePassword,
                            }),
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Token ${loginToken}`,
                            },
                        })
                            .then(() => {
                                alert("Profile Updated!");
                            })
                            .catch(err => {
                                alert(err);
                            });
                    }
                })
            }
        })

    // generate posts made by user on their profile page
    for (let i = 0; i < data.posts.length; ++i) {
        api.get(`post/?id=${data.posts[i]}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${loginToken}`,
            },
        })
            .then(post => {
                generateCard(post, "profileWrapper", loginToken, users);
            })
            .catch(err => {
                alert(err);
            })
    }
}
