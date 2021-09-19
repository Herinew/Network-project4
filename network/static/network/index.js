document.addEventListener('DOMContentLoaded', function() {  
    window.history.pushState('network', 'Network', 'http://localhost:8000/');
    if(document.querySelector('#following')) {
        document.querySelector('#following').addEventListener('click', () => all_posts("/followed",1));          
    } else {
        document.querySelector('#post_form').addEventListener('click', () => login());
    }
    document.querySelector('#profile-view').style.display = 'none';
    document.querySelector('#edit_form').style.display = 'none';
    all_posts("", 1);
})

function all_posts(arg, page) {        
    if (arg.includes("?")) {
        arg = arg + `&page=${page}`;
    } else {
        arg = arg + `?page=${page}`;
        document.querySelector('#profile-view').style.display = 'none';
    }
    fetch(`/posts${arg}`)
    .then(response => response.json())
    .then(response => {
        document.querySelector('#posts').innerHTML = '';
        paginator(arg, page, response.num_pages);
        response.posts.forEach(post => create_post(post));
    })
    arg = "";
}

function paginator(arg, page, max_pages) {
    const item_previous = document.querySelector('#item_Previous');
    const item_current = document.querySelector('#item_current');
    const item_next = document.querySelector('#item_next');

    const link_previous = document.querySelector('#link_Previous');
    const link_current = document.querySelector('#link_current');
    const link_next = document.querySelector('#link_next');
    
    if (page == 1) {
        item_previous.className = 'page-item disabled';
        if (page != max_pages) {
            item_next.className = 'page-item';
        } else {
            item_next.className = 'page-item disabled';
        }
        item_current.className = 'page-item active';
        link_current.innerHTML = page;
        link_next.addEventListener('click', () => all_posts(arg, page + 1))
    } else if (page == max_pages) {
        item_next.className = 'page-item disabled';
        item_current.className = 'page-item active';
        item_previous.className = 'page-item';
        link_current.innerHTML = page;
        link_previous.addEventListener('click', () => all_posts(arg, page - 1))           
    } else {
        item_current.className = 'page-item active';
        item_next.className = 'page-item';
        item_previous.className = 'page-item';
        link_current.innerHTML = page;
        link_next.addEventListener('click', () => all_posts(arg, page + 1))
        link_previous.addEventListener('click', () => all_posts(arg, page - 1))
    }
}

function profile(user_id) {
    all_posts(`?user_profile=${user_id}`, 1);
    document.querySelector('#post_form').style.display = 'none';  
    follow_button = document.querySelector('#follow-button'); 
    follow_button.style.display = 'none';
    document.querySelector('#profile-view').style.display = 'block';  
    fetch(`/profile/${user_id}`)
    .then(response => response.json())
    .then(profile => {
        if (profile.profile_following) {
            document.querySelector('#following-count').innerHTML = profile.profile_following;
        } else {
            document.querySelector('#following-count').innerHTML = 0;
        }
        if (profile.profile_followers) {
            document.querySelector('#followers-count').innerHTML = profile.profile_followers;
        } else {
            document.querySelector('#followers-count').innerHTML = 0;
        }
        document.querySelector('#title_head').innerHTML = `${profile.profile_username} profile`;
        if(profile.follow_available) {               
            follow_button.style.display = 'unset'; 
            if(profile.is_following) {
                follow_button.innerHTML = 'Unfollow';    
            } else {
                follow_button.innerHTML = 'Follow';    
            }
            follow_button.addEventListener('click', () => update_follow(user_id) );
        }
    })
    window.scrollTo(0,0);
}

function create_post(post) {
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
    title.addEventListener('click', () => profile(post.user_id));
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
}

function like_toggle(post) {
    fetch(`/posts/${post.id}/like`)
    .then(response => response.json())
    .then(response => {
        if (response.like) {
            document.getElementById(`like_${post.id}`).innerHTML = '<i class="fas fa-heart"></i>';
        } else {
            document.getElementById(`like_${post.id}`).innerHTML = '<i class="far fa-heart"></i>';
        }
        document.getElementById(`num_likes_${post.id}`).innerHTML=response.num_likes;
    })
}

function update_follow(profile_id) {
    fetch(`/profile/${profile_id}/follow`)
    .then(response => response.json())
    .then(response => {
        follow_button = document.getElementById('follow-button');
        if (response.follow) {
            follow_button.innerHTML = "Unfollow";
        } else {
            follow_button.innerHTML = "Follow";
        }
        document.getElementById('followers-count').innerHTML = response.followers;
    })
}

function login() {
    alert("please, you must log in!");
    document.getElementById('login').click();
}

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
}

function edit_post(post) {
    document.querySelector('#post_form').style.display = 'none';
    document.querySelector('#edit_form').style.display = 'block';
        
    const content = document.getElementById(`text_${post.id}`);
    const textarea = document.getElementById('exampleFormControlTextarea2');
    textarea.value = content.innerHTML;
    
    document.querySelector('#save_button').addEventListener('click', () => {
        fetch('/posts/new', {
            method: 'PUT',
            headers: {'X-CSRFToken': getCookie("csrftoken")},
            body: body = JSON.stringify({
                id: post.id,
                text: textarea.value,
            })
        })
        .then(response => response.json())
        .then(response => {
            console.log(response);
            content.innerHTML = textarea.value;
            textarea.value = '';
        })
    })   
}
