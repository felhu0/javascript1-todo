const container = document.querySelector('.container');
const listContainer = document.querySelector('.list-container');
const form = document.querySelector('.form')
const btn = document.querySelector('button');
const btnAddTodo = document.querySelector('.btn-add-todo')
const input  = document.querySelector('#todo-input');
const removeErrorMsg = document.querySelector('.remove-error-msg');
const addErrorMsg = document.querySelector('.add-error-msg');
const faSolid = document.querySelector('.fa-solid');
const modalContainer = document.querySelector('.modal-container');
const closeModalButton = document.querySelector('.modal-close-button');
// import { API_KEY } from '/api.js';

const apiKey = window.API_KEY

// Hämta Todo-listan från API:et vid sidans laddning
let todos = []
window.addEventListener('load', async () => {
    
    try {
        const res = await fetch(`https://js1-todo-api.vercel.app/api/todos?apikey=${apiKey}`);
        console.log(res)

        if(res.status !== 200) {
            throw new Error('Something went wrong, stutus: ' + res.status + '-' + res.statusText)
        }

        const data = await res.json()
        Array.prototype.unshift.apply(todos, data);
        displayData(todos);
        console.log(data)
    } catch (err) {
        console.error(err)
    }
});


//Skriver ut listan på webbsidan

const displayData = (todos) => {
    
    if(!todos) {
        console.log('data not found')
        return;
    }

    let listHTML = '';
    
    for(let i = 0; i < todos.length; i++) {
        
        const dataList = todos[i];
        const todoId = dataList._id;
        const deleteButtonVisibilityClass = dataList.completed ? '' : 'hidden';
        const deleteButtonHtml = `<button id="delete-btn-${todoId}" class="btn-delete-todo" onclick="deleteTodo('${todoId}')"><i class="fa-solid fa-trash-can ${deleteButtonVisibilityClass}"></i></button> `;
        const spanClass = dataList.completed ? 'span-fokus' : '';
        const spanHtml = `<span id="span-${todoId}" class="${spanClass}" >${dataList.title}</span> `;
        const putButtonClass = dataList.completed ? 'fa-solid fa-square-check' : 'fa-regular fa-square';
        const putButtonHtml = `<button class="btn-put-todo" onclick=" togglePutButton('${todoId}'); putTodo('${todoId}')"><i class="${putButtonClass}"></i></button> `;
        
        if (dataList._id){
            listHTML += `<li id="todo-${todoId}">${spanHtml}</span>${putButtonHtml} ${deleteButtonHtml}</li>`;   
        }                                                                                                         
        
    }

    listContainer.innerHTML = `<ul class="todo-list">${listHTML}</ul>`;
    
    console.log(todos);
}




//Add Todo knapp
btnAddTodo.addEventListener('click', (e) => {
    e.preventDefault()
    
    validateText(input)
    addNewTodo(input)

    
    
})



//validera inmatning
function validateText(input) {
    const errorElement = input.nextElementSibling
    if(input.value.trim() === '') {
        errorElement.classList.add('add-error-msg');
        errorElement.textContent = 'This field can\'t be empty';
        console.log('This field can\'t be empty');

        return false
    } else {
        errorElement.classList.remove('remove-error-msg');
        errorElement.textContent = '';
        console.log('');
        
        return true
    }
}

// //Lägga till en ny todo
async function addNewTodo() {
    const newPost = {
        title: input.value
    };

    try {
        const res = await fetch(`https://js1-todo-api.vercel.app/api/todos?apikey=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newPost)
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        //Upptatera todon i den lockala arryen
        todos.push(data);
        
        displayData(todos);
        input.value = ''
        
    } catch (error) {
        console.error(error);
    }
    
}





// //To bort todo
async function deleteTodo(todoId) {
    const todo = todos.find(t => t._id === todoId);
    if(todo && !todo.completed) {
        modalContainer.classList.add('modal-container-visible');
        return;
    }
    
    try {
        const res = await fetch(`https://js1-todo-api.vercel.app/api/todos/${todoId}?apikey=${apiKey}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        //Upptatera todon i den lockala arryen
        todos = todos.filter(todo => todo._id !== todoId);
       
        console.log(`Todo with id: ${todoId} is now deleted`);
        
        displayData(todos);
        
    } catch (error) {
        console.error('Error;', error);
    }
    
}



//PUT

async function putTodo(todoId) {
    const todo = todos.find(todo => todo._id === todoId);
    if (!todo) {
        console.error('Todo not found');
        return;
    }
    // const putNewTodo = !todoToToggle.completed;
    const putNewTodo = {
        completed: !todo.completed
    }
    try {
        const res = await fetch(`https://js1-todo-api.vercel.app/api/todos/${todoId}?apikey=${apiKey}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(putNewTodo)
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const updateTodo = await res.json();

        //Upptatera todon i den lockala arryen 
        const index = todos.findIndex(t => t._id === todoId);
        todos[index] = updateTodo;

        const todoElement = document.getElementById(`todo-${todoId}`);
        if (todoElement) {
            const spanElement = todoElement.querySelector(`#span-${todoId}`);
            if (spanElement) {
                spanElement.textContent = updateTodo.title;
                spanElement.classList.toggle('span-fokus', updateTodo.completed);

                
            }
           
            const putButton = todoElement.querySelector('.btn-put-todo i');
            if (putButton) {
                if (updateTodo.completed) {
                    putButton.classList.remove('fa-regular', 'fa-square');
                    putButton.classList.add('fa-solid', 'fa-square-check');
                } else {
                    putButton.classList.remove('fa-solid', 'fa-square-check');
                    putButton.classList.add('fa-regular', 'fa-square');
                }
            
            }

            const deleteButtonHidden = todoElement.querySelector('.btn-delete-todo i');
            if (deleteButtonHidden) {
                deleteButtonHidden.classList.toggle('hidden', !updateTodo.completed);

                
            }
                
           
        }

        togglePutButton(todoId);
       
        console.log(todos)
        
    } catch (error) {
        console.error(error);
    }
    
}

function togglePutButton(todoId) {
    const deleteButton = document.getElementById(`delete-btn-${todoId}`);
    
    if (deleteButton) {
        deleteButton.classList.toggle('hidden');
    }
   
}

//Modal close knapp 
closeModalButton.addEventListener('click', (e) => {
    e.preventDefault()
    closeModal()
})


function closeModal() {
    if (modalContainer) {
        modalContainer.classList.remove('modal-container-visible');
    }
}