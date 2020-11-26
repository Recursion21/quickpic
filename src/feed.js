// main feed functionality
import { clearInner, } from './myHelpers.js';
import {generateCard} from './post.js';
import { showLogin, hideLogin} from './login.js';
import { deleteProfile} from './profile.js';
import API from './api.js';

const api = new API('http://localhost:5000');

export const deleteFeed = () => {
    if (document.getElementById("feedWrapper")) {
        clearInner(document.getElementById("feedWrapper"));
    }
}

// generates a wrapper around the to be generated feed
export const generateFeedWrapper = () => {
    let main = document.getElementById("mainBody");
    let wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("row");
    wrapperDiv.classList.add("row-cols-1");
    wrapperDiv.classList.add("row-cols-md-1");
    wrapperDiv.setAttribute("id", "feedWrapper");
    main.appendChild(wrapperDiv);
}


// show the feed for user, with various transitions considered
export const showFeed = (loginToken, users) => {
    api.get('user/feed', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${loginToken}`,
        },
    })
        .then(data => {
            let posts = data.posts;
            hideLogin();
            deleteFeed();
            deleteProfile();
            generateFeedWrapper();
            for (let post of posts) {
                generateCard(post, "feedWrapper", loginToken, users);
            }
        })
        .catch(err => {
            showLogin();
            alert(err);
        });
}