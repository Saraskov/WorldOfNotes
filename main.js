//General variables
const boxover = document.querySelector('#boxover');
const editNoteIcon = document.querySelectorAll(".noteEdit");
const createForm = document.querySelector("#addNewNote");

//Event listener
showNotes();
document.querySelector('#addNote').addEventListener("click", function(){displayForm("addNewNote")}, false);
document.querySelector('#closeCreateForm').addEventListener("click", function(){noDisplayForm("addNewNote")}, false);
document.querySelector('#closeEditForm').addEventListener("click", function() {noDisplayForm("editNote")}, false);

//Function that gets documents from the database
function showNotes(){
    let singleNoteHTML = "";
    //Get id
    let noteID = "";
    db.collection('notes').get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            noteID = doc.id;
            writeNotes(doc.data(), noteID);
        });
    }).catch(err => {
        console.log(err);
    });

    //The old way de does it in the video
    // db.collection('notes').get()
    // .then((snapshot) => {
    //     // when we have the data
    //     snapshot.docs.forEach(doc => {
    //         writeNotes(doc.data(), noteID);
    //     });
    // }).catch(err => {
    //     console.log(err);
    // });

// Write single notes from the documents
    function writeNotes(note, noteID){
        let desktop = document.querySelector('#noteDesktop');
        let time = note.date.toDate();

        singleNoteHTML = `
            <div class="col-lg-4 marginTop">
                <div class="oneNote ${note.colour}">
                    <div class="row">
                        <h3 class="col-10">${note.title}</h3>
                        <i class="`+(note.important ? "fas fa-exclamation" : "")+` col-2"></i>
                    </div>
                    <textarea disabled >${note.body}</textarea>
                    <div class="row">
                        <small class="col"><i>Created at: ${time.getDate()}/${time.getMonth()}-${time.getFullYear()}<i></small>
                        <div class="noteIconsBox col">
                            <i class="far fa-edit noteEdit" onclick="editNote('${noteID}')"></i>
                            <i class="far fa-trash-alt noteEdit" onclick="deleteNote('${noteID}')"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
        desktop.innerHTML += singleNoteHTML;
        // desktop.querySelector('.openEditNote').forEach(function(n){
        //     console.log(n);
        //     // n.addEventListener('click', function(){editNote(singleNoteHTML)});
        // })
    }
}

//______________________________ DISPLAY FORMS FUNCTIONS ______________________________
//Functions that toggle display for box for creating notes
function displayForm(form){
    let theForm = document.getElementById(form);
    boxover.classList.remove("noDisplay");
    theForm.classList.remove("noDisplay");
}

function noDisplayForm(form){
    let theForm = document.getElementById(form);
    boxover.classList.add("noDisplay");
    theForm.classList.add("noDisplay");
}

//______________________________ CREATE NOTES FUNCTIONS ______________________________
//Function that validates the create new note form
createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const now = new Date();
    const chosenColour = createForm.querySelector("#selectColour");
    const newnote = {
        body: createForm.querySelector("#body").value,
        colour: chosenColour.value,
        date: firebase.firestore.Timestamp.fromDate(now),
        important: document.querySelector("#inputImportant").checked, //For whatever reason it can't find it inside the form?
        title: createForm.querySelector("#title").value
    };
    // let title = createForm.Title.value;
    db.collection('notes').add(newnote).then(() =>{
        location.reload();
    }).catch(err => {
        console.log(err);
    });
});

//_______________________________ EDIT NOTES FUNCTIONS _______________________________
//function for edit note
// function editNote(noteID){

// }
function editNote(noteID){
    let editForm = document.querySelector('#editNote');
    
    db.collection('notes').doc(noteID).get().then(function(doc) {
        TheDate = doc.data().date;
        editForm.querySelector('#editTitle').value = doc.data().title;
        editForm.querySelector('#editBody').value = doc.data().body;
        editForm.querySelector('#editSelectColour').value = doc.data().colour;
        editForm.querySelector('#editInputImportant').checked = doc.data().important;
        displayForm("editNote");
    }).catch(function(err) {
        console.log(err);
    });
    
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        db.collection('notes').doc(noteID).set({
            title: editForm.querySelector('#editTitle').value,
            body: editForm.querySelector('#editBody').value,
            colour: editForm.querySelector('#editSelectColour').value,
            important: editForm.querySelector('#editInputImportant').checked,
            date: TheDate
        })
        .then(function() {
            location.reload();
        })
        .catch(function(err) {
            console.log(err);
        })
    })

    editForm.querySelector('#closeEditForm').addEventListener('click', function() {
        noDisplayForm('editNote');
    })
};

//______________________________ DELETE NOTES FUNCTIONS ______________________________
function deleteNote(noteID){
    db.collection('notes').doc(noteID).delete().then(() => {
        console.log('recipe deleted');
        location.reload();
    });
}


//_________________________________ SEARCH FUNCTIONS _________________________________
const searchnote = document.querySelector('#searchnote');
const filterButton = document.querySelector('#filterDropDown');
const filterContainer = document.querySelector('.dropdown-container')

//Filter button
filterButton.addEventListener('click', (e) => {
    filterContainer.classList.toggle('dropdown-container');
    filterButton.classList.toggle('purpleText');
    e.preventDefault();
});

//Function for the search button and validation.
searchnote.addEventListener('submit' , (e) => {
    e.preventDefault();
    let searchfield = document.querySelector('#inputFilter');
    let searchColour = document.querySelector('#typeOfNote');
    let searchImportant = document.querySelector('#searchImportant');
    let searchErrorMsg = document.querySelector('#searchErrorMsg');

    console.log(searchColour.value + " , "+ searchImportant.checked);
    if(searchfield.value != "" || searchfield.value != null || searchColour != "All" || searchImportant != false){
        let filter = searchfield.value.toUpperCase();
        let listOfNotes = document.querySelectorAll('.oneNote');

        listOfNotes.forEach((oneNote) => {
            oneNote.parentElement.style.display = 'block';

            if(searchImportant.checked == true){
                if(oneNote.querySelector('.fa-exclamation') != null) {
                    oneNote.parentElement.style.display = 'block';
                } else {
                    oneNote.parentElement.style.display = 'none';
                }
            }
            if(searchfield.value != "" || searchfield.value != null){
                if(oneNote.innerHTML.toUpperCase().indexOf(filter) >= 0 && oneNote.parentElement.style.display != 'none'){
                    oneNote.parentElement.style.display = 'block';
                } else {
                    oneNote.parentElement.style.display = 'none';
                }
            }
            
            if(searchColour.value != 'all'){
                if(oneNote.classList[1] == searchColour.value && oneNote.parentElement.style.display != 'none'){
                    oneNote.parentElement.style.display = 'block';
                } else {
                    oneNote.parentElement.style.display = 'none';
                }
                
            }
        })
    } else {
        searchErrorMsg.innerText = "Type in a search word or a filter";
    }

    //Det virker. Så den tjekker om input feltet er tomt
    //Men den tror også filter knappen er en submit, det skal ændres til at vise filterne
})