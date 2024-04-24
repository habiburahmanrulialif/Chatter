document.getElementById("message-form").style.display = "none";
document.getElementById("add-member").style.display = "none";
fetchGroup()

var interval = 100;
var intervalId;

function getCSRFToken() {
    const selectElement = document.querySelector('input[name="csrfmiddlewaretoken"]');
    return selectElement.value;
}

function fetchGroup(){
    document.querySelector('#group-list').innerHTML = '';
    fetch('group', {
        method: 'GET',
        headers: {
        }
        })
    .then(response => response.json())
    .then(groups => {
        groups.forEach(group => {
            console.log(group)

        // Creating div for each group
        const newGroup = document.createElement('div');

        const imagePath = '/static/chat/images/no-image.jpg';
        newGroup.innerHTML = `
        <div id="group-card">
            <div class="row g-0" id="group-content">
                <div class="col-md-2 col-sm-5" id="group-image-container">
                    <img src="${imagePath}" id="group-image" alt="...">
                </div>
                <div class="col-md-10 col-sm-7" id="group-info-container">
                    <h5 id="group-info-title">${group.group_name}</h5>
                    <p id="group-info-member">Member : </p>
                </div>
            </div>
        </div>
        `;

        // Selecting the group-info-member element
        const groupInfoMember = newGroup.querySelector('#group-info-member');
        
        // Iterate over group members and append them to group-info-member
        group.group_member.forEach((member, index) => {
            const memberElement = document.createElement('span');
            memberElement.textContent = member;
        
            // Add comma for non-last members
            if (index < group.group_member.length - 1) {
                memberElement.textContent += ', ';
            }
        
            groupInfoMember.appendChild(memberElement);
        });

        // Adding event listener for each div
        newGroup.addEventListener('click', function() {
            stopInterval();
            fetchChat(group.group_name);
            intervalChat(group.group_name);
            changeGroupName(group.group_name, group.group_member);
            });
        document.querySelector('#group-list').append(newGroup);

        });
    })
    .catch(error => console.error('Error:', error));
}

function fetchChat(groupName){
    const addMember = document.getElementById("add-member");
    addMember.style.display = "block";

    addMember.addEventListener('click', function(){
        openNewMemberForm(groupName);
    })

    console.clear();
    fetch(`group/${groupName}`, {
        method: 'GET',
        headers: {
        }
        })
    .then(response => response.json())
    .then(chats => {
        const messageContainer = document.querySelector('#message-data');
        messageContainer.textContent= "";
        const firstChatNode = messageContainer.firstChild;
        chats.forEach(chat => {
            console.log(chat)
            const isCurrentUser = chat.sender === currentUser; // currentUser already created outside of chat,js. its in html script

            // Creating div for each chat message
            const newChat = document.createElement('div');
            if (isCurrentUser) {
                newChat.classList.add('message-list-owner');
            } else {
                newChat.classList.add('message-list-not-owner');
            }
            newChat.innerHTML = `
                <div class="message-container">
                    <div class="message-sender">
                        ~ ${chat.sender}
                    </div>
                    <div class="message-content">
                        ${chat.message}
                    </div>
                </div>
            `;

            // Insterting div before the firstchild to make the oldest chat as the firstchat. so the newest at the botton
            messageContainer.insertBefore(newChat, firstChatNode);
        });
    })
    .catch(error => console.error('Error:', error));
}

// to change group name when selecting a group div
function changeGroupName(groupName, groupMember){

    document.getElementById("message-form").style.display = "block";

    const groupTitle = document.getElementById("group-title");
    const group_Member = document.getElementById("group-member");
    group_Member.textContent = "";

    changeSendBtn(groupName);

    groupTitle.textContent = groupName;

    groupMember.forEach((member, index) => {
        const memberElement = document.createElement('span');
        memberElement.textContent = member;
    
        // Add comma for non-last members
        if (index < groupMember.length - 1) {
            memberElement.textContent += ', ';
        }
    
        group_Member.appendChild(memberElement);
    });
}

function clearForm(){
    document.getElementById("groupNameInput").value = '';
    document.getElementById("newMemberInput").value = '';
    const newMessage = document.getElementById("message-form-text").value = '';
}

function openForm(){
    document.getElementById("myForm").style.display = "block";
    document.getElementById("add-group").style.display = "none";
    clearForm();
}

function closeForm(){
    document.getElementById("myForm").style.display = "none";
    document.getElementById("add-group").style.display = "block";
    document.getElementById("myMemberForm").style.display = "none";
    clearForm();
}

function newGroup(){
    const groupNameInput = document.getElementById("groupNameInput").value;
    var data = {
        group_name : groupNameInput
    }

    fetch("group/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        clearForm();
        if (response.ok) {
            // Handle success response
            console.log("Group created successfully.");
            closeForm();
            fetchGroup();
            // You can redirect or show a success message here
        } else {
            // Handle error response
            console.error("Error creating group.");
            // You can display an error message here
        }
        clearForm()
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

function sendMessage(groupName){
    const newMessage = document.getElementById("message-form-text").value;
    var data = {
        content : newMessage
    }
    fetch(`group/${groupName}/newMessage`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify(data)
        })
        .then(response => {
            clearForm();
            if (response.ok) {
                // Handle success response
                console.log("Group created successfully.");
                closeForm();
                fetchGroup();
                // You can redirect or show a success message here
            } else {
                // Handle error response
                console.error("Error creating group.");
                // You can display an error message here
            }
            clearForm()
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

function changeSendBtn(groupName) {
    
    const formBtn = document.getElementById("message-form-button");
    const formSubmit = document.getElementById("message-form-form");

    // Remove any existing click event listener
    formBtn.removeEventListener('click', formBtn.clickEvent);
    formSubmit.removeEventListener('submit', formSubmit.submitEvent);

    // Add a new click event listener
    formBtn.clickEvent = function() {
        sendMessage(groupName);
    };

    formSubmit.submitEvent = function(event){
        event.preventDefault();
        sendMessage(groupName);
    };

    formBtn.addEventListener('click', formBtn.clickEvent);
    formSubmit.addEventListener('submit', formSubmit.submitEvent);
}

function intervalChat(groupName){

    // Then, start the interval and store its identifier
    intervalId = setInterval(fetchChat, 1000, groupName); // Runs every 1 second (1000 milliseconds)

}

function stopInterval(){
    clearInterval(intervalId);
}

function openNewMemberForm(groupName){
    document.getElementById("myMemberForm").style.display = 'block';

    const btnNewMember = document.getElementById("btnNewMember");

    btnNewMember.removeEventListener('click', btnNewMember.clickEvent);

    btnNewMember.clickEvent = function() {
        newMember(groupName);
    };

    btnNewMember.addEventListener('click', btnNewMember.clickEvent);
}

function newMember(groupName){
    const newMemberUserName = document.getElementById("newMemberInput").value;

    fetch(`group/${groupName}/addMember/${newMemberUserName}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
    })
    .then(response => {
        clearForm();
        if (response.ok) {
            // Handle success response
            console.log("member added");
            closeForm();
            fetchGroup();
            // You can redirect or show a success message here
        } else {
            // Handle error response
            document.getElementById("alertMember").style.display = 'block';
            document.getElementById("alertMemberContent").textContent = 'user not found';
            console.error("Error adding member");
            // You can display an error message here
            clearForm()
        }
        
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

function openSidebar(){
    let sidebar = document.getElementById("sidebar");
    if (sidebar.style.display === 'block') {
        sidebar.style.display = 'none';
    } else {
        sidebar.style.display = 'block';
    }
}

function adjustSidebarDisplay() {
    var sidebar = document.getElementById("sidebar");
    if (window.innerWidth >= 1200) {
        sidebar.style.display = 'block';
    } else {
        sidebar.style.display = 'none';
    }
}

// Initial adjustment
adjustSidebarDisplay();

// Event listener for window resize so the page responsive
window.addEventListener('resize', adjustSidebarDisplay);