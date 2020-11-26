import API from './api.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';
import { showLogin} from './login.js';
import { deleteFeed, showFeed} from './feed.js';
import { deleteProfile, generateProfileWrapper, generateProfileInfo, } from './profile.js';

// This url may need to change depending on what port your backend is running
// on.
const api = new API('http://localhost:5000');

// bootstrap popover functionality
$(function () {
    $('[data-toggle="popover"]').popover()
});

let loginToken = null;
let users = [];
let postImage64 = "";

const showButtons = () => {
    document.getElementById("show-profile").style.display = "inherit";
    document.getElementById("show-feed").style.display = "inherit";
    document.getElementById("makePostButton").style.display = "inherit";
}

// if user has already logged in, then refreshing the page will redirect them directly to their feed
if (localStorage.getItem("token") !== null) {
    loginToken = localStorage.getItem("token");
    showButtons();
    showFeed(loginToken, users);
} else {
    showLogin();
}

// signin button event listener, which calls sign in api
document.getElementById('signin').addEventListener('click', e => {
    e.preventDefault();
    const loginUsername = document.getElementById('loginUsername').value;
    const loginPassword = document.getElementById('loginPassword').value;
    if (loginUsername === '' || loginPassword === '') {
        alert('Empty Username and/or Password!');
    }
    api.post('auth/login', {
        body: JSON.stringify({
            "username": loginUsername,
            "password": loginPassword,
        }),
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(data => {
            loginToken = data['token'];
            localStorage.setItem("token", `${loginToken}`);
            localStorage.setItem("username", `${loginUsername}`)
            showButtons();
            showFeed(loginToken, users);
        })
        .catch(err => {
            alert(err);
        });
})

// register button event listener, on click triggers api call to signup
document.getElementById('registerButton').addEventListener('click', e => {
    e.preventDefault();
    const registerUsername = document.getElementById('registerUsername').value;
    const registerPassword = document.getElementById('registerPassword').value;
    const registerPassword2 = document.getElementById('registerPassword2').value;
    const registerEmail = document.getElementById('registerEmail').value;
    const registerName = document.getElementById('registerName').value;

    if (registerPassword !== registerPassword2) {
        alert('Entered passwords must match');
    } else {
        api.post('auth/signup', {
            body: JSON.stringify({
                "username": registerUsername,
                "password": registerPassword,
                "email": registerEmail,
                "name": registerName,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${loginToken}`,
            },
        })
            .then(data => {
                loginToken = data['token'];
                alert('Register Successful');
            })
            .catch(err => {
                alert(err);
            });
    }
})

// show own profile button event listner to trigger api call to get logged in user, triggers transitions
document.getElementById('show-profile').addEventListener('click', e => {
    api.get(`user`, {
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

// show feed button event listener
document.getElementById('show-feed').addEventListener('click', e => {
    showFeed(loginToken, users);
})
  

let postImageUpload = document.getElementById('postImg');

// event listener for uploading image during making a post,
// converts image to base64 and stores in local variable
postImageUpload.addEventListener('change', (e) => {
    let uploadImage = document.getElementById('postImg').files[0];
    try {
        fileToDataUrl(uploadImage)
        .then(data => {
            let imageData = [null];
            imageData = data.match(/[^,"]+$/);
            postImage64 = imageData[0];
        })
    }
    catch(err) {
        alert(err);
    }
})

let postButton = document.getElementById("postButton");

// post button event listener to trigger api call to make a post
postButton.addEventListener('click', e => {
    e.preventDefault();
    const postDesc = document.getElementById('postDesc').value;

    api.post("post", {
        body: JSON.stringify({
            "description_text": postDesc,
            "src": postImage64,
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${loginToken}`,
        },
    })
        .then(data => {
            alert("Post Successful");
        })
        .catch(err => {
            alert(err);
        });
})