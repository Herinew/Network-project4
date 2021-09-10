document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('#following')) {
        document.querySelector('#following').addEventListener('click', () => all_posts("/followed", 1));
    } else {
        document.querySelector('#post_form').addEventListener('click', () => login());
    }
    document.querySelector('#profile-view').style.display = 'none';
    document.querySelector('#edit_form').style.display = 'none';
    all_posts("", 1);
});

function paginator(arg, page, max_pages) {
    const item_previous = document.querySelector('#item_Previous');
    const item_current = document.querySelector('#item_current');
    const item_next = document.querySelector('#item_next');

    const link_previous = document.querySelector('#link_Previous');
    const link_current = document.querySelector('#link_current');
    const link_next = document.querySelector('#link_next');
    
    if (page == 1 && page != max_pages) {
        item_previous.className = 'page-item disabled';
        item_current.className = 'page-item active';
        item_next.className = 'page-item';
        link_current.innerHTML = page;
        link_next.addEventListener('click', () => all_posts("", page + 1))
    } else if (page == max_pages) {
        item_next.className = 'page-item disabled';
        item_current.className = 'page-item active';
        item_previous.className = 'page-item';
        link_current.innerHTML = page;
        link_previous.addEventListener('click', () => all_posts("", page - 1))           
    } else {
        item_current.className = 'page-item active';
        item_next.className = 'page-item';
        item_previous.className = 'page-item';
        link_current.innerHTML = page;
        link_next.addEventListener('click', () => all_posts("", page + 1))
        link_previous.addEventListener('click', () => all_posts("", page - 1))
    }
};

function all_posts(arg, page) {

    if (arg.includes("?")) {
        arg = arg + `&page=${page}`;
    } else {
        arg = arg + `?page=${page}`;
        document.querySelector('#profile-view').style.display = 'none';
        document.querySelector('#post_form').style.display = 'unset';
        document.querySelector('#title_head').innerHTML = 'All posts';
    }
    console.log(arg);
    fetch(`/posts${arg}`)
    .then(response => response.json())
    .then(response => {
        document.querySelector('#posts').innerHTML = '';
        paginator(arg, page, response.num_pages)
        response.posts.forEach(post => view_posts(post));
    })
};


function view_posts(post) {

    const view_posts = document.querySelector('#posts');
    const card = document.createElement('div');
    card.className = 'card m-3';
    view_posts.append(card);

    const body = document.createElement('div');
    body.className = 'card-body';
    card.append(body);

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.style.cursor = 'pointer';
    title.innerHTML = post.username;
    title.addEventListener('click', () => view_profile(post.user_id));
    body.append(title);

    const text = document.createElement('p');
    text.className = 'card-text';
    text.innerHTML = post.text;
    text.id = `text_${post.id}`;
    body.append(text);
    
    const like = document.createElement('a');
    like.className = 'card-link';
    like.href = '#';
    like.id = `like_${post.id}`;
    if (post.liked) {
        like.innerHTML = '<i class="fas fa-heart"></i>';
    } else {
        like.innerHTML = '<i class="far fa-heart"></i>';
    }
    if (document.querySelector('#following')) {
        like.addEventListener('click', () => like_toggle(post));
    } else {
        like.addEventListener('click', () => login());
    }
    body.append(like);

    const num_likes = document.createElement('a');
    num_likes.className = 'card-link';
    num_likes.id = `num_likes_${post.id}`;
    num_likes.innerHTML = post.likes;
    body.append(num_likes);

    if (post.aviable_to_edit) {
        const edit_link = document.createElement('a');
        edit_link.className = 'card-link';
        edit_link.href = '#';
        edit_link.innerHTML = '<small>Edit</small>';
        edit_link.addEventListener('click', () => edit_post(post));
        body.append(edit_link);
    }

    const date_parent = document.createElement('p');
    date_parent.className = 'card-text mt-1';
    body.append(date_parent);

    const date = document.createElement('small');
    date.className = 'text-muted';
    date.innerHTML = post.date;
    date_parent.append(date);
};


function view_profile(user_id) {
    all_posts(`?user_profile=${user_id}`, 1);
    document.querySelector('#profile-view').style.display = 'block';
    document.querySelector('#post_form').style.display = 'none';
    document.querySelector('#edit_form').style.display = 'none';
    let follow_button = document.querySelector('#follow-button');

    fetch(`/profile/${user_id}`)
    .then(response => response.json())
    .then(response => {
        console.log(response);
        document.querySelector('#title_head').innerHTML = `${response.profile_username} profile`;
        document.querySelector('#following-count').innerHTML = response.profile_following;
        document.querySelector('#followers-count').innerHTML = response.profile_followers;

        if (response.follow_available) {
            follow_button.style.display = 'unset';
            if (response.is_following) {
                follow_button.innerHTML = 'unfollow';
            } else {
                follow_button.innerHTML = 'follow';
            }
            follow_button.addEventListener('click', () => follow_toggle(user_id));
        } else {
            follow_button.style.display = 'none';            
        }
        window.scrollTo(0,0);
    })
};


function follow_toggle(user_id) {
    let follow_button = document.querySelector('#follow-button');

    fetch(`profile/${user_id}/follow`)
    .then(response => response.json())
    .then(response => {
        if (response.follow) {
            follow_button.innerHTML = 'unfollow';
        } else {
            follow_button.innerHTML = 'follow';
        }
        document.querySelector('#followers-count').innerHTML = response.followers;
    })
};

function like_toggle(post) {
    const like = document.querySelector(`#like_${post.id}`);

    fetch(`posts/${post.id}/like`)
    .then(response => response.json())
    .then(response => {
        if (response.like) {
            like.innerHTML = '<i class="fas fa-heart"></i>';
        } else {
            like.innerHTML = '<i class="far fa-heart"></i>';
        }
        document.querySelector(`#num_likes_${post.id}`).innerHTML = response.num_likes;
    })
};

function login() {
    alert("Please you must be login!");
    document.querySelector('#login').click();
};

//Get from Django documentation
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

function edit_post(post) {

    document.querySelector('#edit_form').style.display = 'block';
    document.querySelector('#post_form').style.display = 'none';

    var post_id = post.id;
    let text_post = document.getElementById(`text_${post_id}`);
    let textarea = document.querySelector('#exampleFormControlTextarea2');
    textarea.value = text_post.innerHTML;
    
    document.querySelector('#save_button').addEventListener('click', () => {
        fetch('/posts/new', {
            method: 'PUT',
            headers: {'X-CSRFToken': getCookie("csrftoken")},
            body: body = JSON.stringify({
                id: post_id,
                text: textarea.value
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result) {
                text_post.innerHTML = textarea.value;
                console.log(result);
                textarea.value = '';
                post_id = null;
            }
        });
    });
};