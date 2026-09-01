import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


import {

    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    writeBatch

}
from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



// ==========================================
// FIREBASE
// ==========================================

const firebaseConfig = {

    apiKey:
        "AIzaSyBSJq_1VgjhmDfKSCwcWBzqVieTDo3JQuo",

    authDomain:
        "jeux-societe-d11a9.firebaseapp.com",

    projectId:
        "jeux-societe-d11a9",

    storageBucket:
        "jeux-societe-d11a9.firebasestorage.app",

    messagingSenderId:
        "1093940990306",

    appId:
        "1:1093940990306:web:03860c21ca310642fa5c3b",

    measurementId:
        "G-MHG7JCGX1V"

};


const app =
    initializeApp(firebaseConfig);


const db =
    getFirestore(app);



// ==========================================
// CLOUDINARY
// ==========================================

const CLOUDINARY_CLOUD_NAME =
    "afkcpdrb";


const CLOUDINARY_UPLOAD_PRESET =
    "jeux societe";



// ==========================================
// ELEMENTS
// ==========================================

const form =
    document.getElementById("gameForm");


const gameName =
    document.getElementById("gameName");


const gameFranchise =
    document.getElementById("gameFranchise");


const gameOrder =
    document.getElementById("gameOrder");


const orderGroup =
    document.getElementById("orderGroup");


const minPlayers =
    document.getElementById("minPlayers");


const maxPlayers =
    document.getElementById("maxPlayers");


const minDuration =
    document.getElementById("minDuration");


const maxDuration =
    document.getElementById("maxDuration");


const minAge =
    document.getElementById("minAge");


const gameDescription =
    document.getElementById("gameDescription");


const gameImage =
    document.getElementById("gameImage");


const imagePreview =
    document.getElementById("imagePreview");


const gamesList =
    document.getElementById("adminGamesList");


const gameCount =
    document.getElementById("adminGameCount");


const formTitle =
    document.getElementById("formTitle");


const saveButton =
    document.querySelector(".save-button");


const cancelButton =
    document.getElementById("cancelEdit");


const searchInput =
    document.getElementById("adminSearch");



// ==========================================
// VARIABLES
// ==========================================

let games = [];

let editingGameId = null;

let editingGameImage = null;



// ==========================================
// APERCU IMAGE
// ==========================================

gameImage.addEventListener(
    "change",
    () => {

        const file =
            gameImage.files[0];


        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            event => {

                imagePreview.innerHTML = `

                    <img
                        src="${event.target.result}"
                        alt="Aperçu de l'image"
                    >

                `;

            };


        reader.readAsDataURL(file);

    }
);



// ==========================================
// CLOUDINARY
// ==========================================

async function uploadImage(file) {

    const url =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    const response =
        await fetch(
            url,
            {
                method: "POST",
                body: formData
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        console.error(
            "Erreur Cloudinary :",
            data
        );


        throw new Error(

            data.error?.message ||

            "Impossible d'envoyer l'image."

        );

    }


    return data.secure_url;

}



// ==========================================
// CHARGER LES JEUX
// ==========================================

async function loadGames() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "games"
                )
            );


        games = [];


        snapshot.forEach(
            document => {

                games.push({

                    id:
                        document.id,

                    ...document.data()

                });

            }
        );


        renderGames();


    } catch (error) {

        console.error(
            "Erreur Firebase :",
            error
        );


        alert(

            "Impossible de charger les jeux.\n\n" +
            error.message

        );

    }

}



// ==========================================
// COMPARER LES POSITIONS
// ==========================================

function compareGameOrder(a, b) {

    const orderA =
        Number(a.order);


    const orderB =
        Number(b.order);


    const validA =
        Number.isFinite(orderA);


    const validB =
        Number.isFinite(orderB);


    if (!validA && !validB) {

        return (a.name || "")
            .localeCompare(
                b.name || "",
                "fr",
                {
                    sensitivity: "base"
                }
            );

    }


    if (!validA) {
        return 1;
    }


    if (!validB) {
        return -1;
    }


    if (orderA !== orderB) {
        return orderA - orderB;
    }


    return (a.name || "")
        .localeCompare(
            b.name || "",
            "fr",
            {
                sensitivity: "base"
            }
        );

}



// ==========================================
// PROCHAINE POSITION
// ==========================================

function getNextPosition() {

    const positions =
        games

            .map(
                game =>
                    Number(game.order)
            )

            .filter(
                position =>
                    Number.isFinite(position)
            );


    if (positions.length === 0) {
        return 1;
    }


    return (
        Math.max(...positions) + 1
    );

}



// ==========================================
// AFFICHER LES JEUX
// ==========================================

function renderGames() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const filteredGames =

        games

            .filter(game => {

                const name =
                    (game.name || "")
                        .toLowerCase();


                const franchise =
                    (game.franchise || "")
                        .toLowerCase();


                return (

                    name.includes(search) ||

                    franchise.includes(search)

                );

            })

            .sort(compareGameOrder);


    gamesList.innerHTML = "";


    gameCount.textContent =
        filteredGames.length;


    const emptyGames =
        document.getElementById(
            "emptyGames"
        );


    if (
        filteredGames.length === 0
    ) {

        emptyGames.style.display =
            "block";

        return;

    }


    emptyGames.style.display =
        "none";


    filteredGames.forEach(game => {

        const article =
            document.createElement(
                "article"
            );


        article.className =
            "admin-game";


        const players =
            formatPlayers(game);


        const duration =
            formatDuration(game);


        article.innerHTML = `

            <div class="admin-game-image">

                ${
                    game.image

                    ? `

                        <img
                            src="${escapeHTML(game.image)}"
                            alt=""
                        >

                    `

                    : "🎲"
                }

            </div>


            <div class="admin-game-info">

                <h4>
                    ${escapeHTML(game.name)}
                </h4>


                <p>

                    ${
                        game.franchise

                        ? escapeHTML(
                            game.franchise
                        ) + " · "

                        : ""
                    }

                    ${players}

                    ${
                        duration
                        ? " · " + duration
                        : ""
                    }

                </p>


                <small>

                    Position :
                    ${
                        Number.isFinite(
                            Number(game.order)
                        )
                        ? game.order
                        : "—"
                    }

                </small>

            </div>


            <div class="admin-game-actions">

                <button
                    class="edit-button"
                    type="button"
                    data-id="${game.id}"
                >
                    ✏️
                </button>


                <button
                    class="delete-button"
                    type="button"
                    data-id="${game.id}"
                >
                    🗑️
                </button>

            </div>

        `;


        gamesList.appendChild(article);

    });


    addActionListeners();

}



// ==========================================
// CHANGER UNE POSITION
// ==========================================

async function changePosition(
    gameId,
    oldPosition,
    newPosition
) {

    if (
        oldPosition === newPosition
    ) {

        return;

    }


    const orderedGames =

        games

            .filter(
                game =>
                    game.id !== gameId
            )

            .filter(
                game =>
                    Number.isFinite(
                        Number(game.order)
                    )
            )

            .sort(
                compareGameOrder
            );


    const batch =
        writeBatch(db);



    // ======================================
    // MONTER
    // ======================================

    if (
        newPosition < oldPosition
    ) {

        orderedGames.forEach(game => {

            const position =
                Number(game.order);


            if (

                position >= newPosition &&

                position < oldPosition

            ) {

                batch.update(

                    doc(
                        db,
                        "games",
                        game.id
                    ),

                    {
                        order:
                            position + 1
                    }

                );

            }

        });

    }



    // ======================================
    // DESCENDRE
    // ======================================

    else {

        orderedGames.forEach(game => {

            const position =
                Number(game.order);


            if (

                position > oldPosition &&

                position <= newPosition

            ) {

                batch.update(

                    doc(
                        db,
                        "games",
                        game.id
                    ),

                    {
                        order:
                            position - 1
                    }

                );

            }

        });

    }



    // ======================================
    // POSITION DU JEU
    // ======================================

    batch.update(

        doc(
            db,
            "games",
            gameId
        ),

        {
            order:
                newPosition
        }

    );


    await batch.commit();

}



// ==========================================
// AJOUT / MODIFICATION
// ==========================================

form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (
            !gameName.value.trim()
        ) {

            alert(
                "Le nom du jeu est obligatoire."
            );

            return;

        }


        try {

            saveButton.disabled =
                true;


            saveButton.innerHTML =
                "<span>⏳</span> Enregistrement...";



            // ==================================
            // IMAGE
            // ==================================

            let imageUrl =
                editingGameImage;


            if (
                gameImage.files.length > 0
            ) {

                imageUrl =
                    await uploadImage(
                        gameImage.files[0]
                    );

            }



            // ==================================
            // AJOUT
            // ==================================

            if (!editingGameId) {

                const newPosition =
                    getNextPosition();


                const game = {

                    name:
                        gameName.value.trim(),


                    franchise:
                        gameFranchise.value.trim()
                        || null,


                    order:
                        newPosition,


                    minPlayers:
                        numberOrNull(
                            minPlayers.value
                        ),


                    maxPlayers:
                        numberOrNull(
                            maxPlayers.value
                        ),


                    minDuration:
                        numberOrNull(
                            minDuration.value
                        ),


                    maxDuration:
                        numberOrNull(
                            maxDuration.value
                        ),


                    minAge:
                        numberOrNull(
                            minAge.value
                        ),


                    description:
                        gameDescription.value.trim()
                        || null,


                    image:
                        imageUrl || null

                };


                await addDoc(

                    collection(
                        db,
                        "games"
                    ),

                    game

                );

            }



            // ==================================
            // MODIFICATION
            // ==================================

            else {

                const currentGame =
                    games.find(
                        game =>
                            game.id ===
                            editingGameId
                    );


                if (!currentGame) {

                    throw new Error(
                        "Jeu introuvable."
                    );

                }


                const oldPosition =
                    Number(
                        currentGame.order
                    );


                let newPosition =
                    Number(
                        gameOrder.value
                    );


                if (
                    !Number.isFinite(
                        newPosition
                    )
                ) {

                    newPosition =
                        oldPosition;

                }


                newPosition =
                    Math.max(
                        1,
                        Math.floor(
                            newPosition
                        )
                    );


                const maxPosition =
                    games.length;


                newPosition =
                    Math.min(
                        newPosition,
                        maxPosition
                    );



                // Changement de position

                if (
                    newPosition !==
                    oldPosition
                ) {

                    await changePosition(

                        editingGameId,

                        oldPosition,

                        newPosition

                    );

                }



                // Autres informations

                await updateDoc(

                    doc(
                        db,
                        "games",
                        editingGameId
                    ),

                    {

                        name:
                            gameName.value.trim(),


                        franchise:
                            gameFranchise.value.trim()
                            || null,


                        minPlayers:
                            numberOrNull(
                                minPlayers.value
                            ),


                        maxPlayers:
                            numberOrNull(
                                maxPlayers.value
                            ),


                        minDuration:
                            numberOrNull(
                                minDuration.value
                            ),


                        maxDuration:
                            numberOrNull(
                                maxDuration.value
                            ),


                        minAge:
                            numberOrNull(
                                minAge.value
                            ),


                        description:
                            gameDescription.value.trim()
                            || null,


                        image:
                            imageUrl || null

                    }

                );

            }



            resetForm();


            await loadGames();



        } catch (error) {

            console.error(
                "Erreur :",
                error
            );


            alert(

                "Impossible d'enregistrer le jeu.\n\n" +
                error.message

            );



        } finally {

            saveButton.disabled =
                false;


            saveButton.innerHTML =
                "<span>＋</span> Ajouter le jeu";

        }

    }
);



// ==========================================
// BOUTONS
// ==========================================

function addActionListeners() {

    document
        .querySelectorAll(".edit-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    editGame(
                        button.dataset.id
                    );

                }
            );

        });


    document
        .querySelectorAll(".delete-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteGame(
                        button.dataset.id
                    );

                }
            );

        });

}



// ==========================================
// MODIFIER
// ==========================================

function editGame(id) {

    const game =
        games.find(
            game =>
                game.id === id
        );


    if (!game) {
        return;
    }


    editingGameId =
        id;


    editingGameImage =
        game.image || null;



    gameName.value =
        game.name || "";


    gameFranchise.value =
        game.franchise || "";


    gameOrder.value =
        game.order ?? "";


    minPlayers.value =
        game.minPlayers ?? "";


    maxPlayers.value =
        game.maxPlayers ?? "";


    minDuration.value =
        game.minDuration ?? "";


    maxDuration.value =
        game.maxDuration ?? "";


    minAge.value =
        game.minAge ?? "";


    gameDescription.value =
        game.description || "";


    gameImage.value =
        "";



    // Afficher le champ position

    orderGroup.style.display =
        "block";



    if (game.image) {

        imagePreview.innerHTML = `

            <img
                src="${escapeHTML(game.image)}"
                alt="Image actuelle"
            >

            <p>
                Choisis une nouvelle image
                pour la remplacer.
            </p>

        `;

    } else {

        imagePreview.innerHTML = `

            <span>
                🖼️
            </span>

            <p>
                Aucune image
            </p>

        `;

    }



    formTitle.textContent =
        "Modifier le jeu";


    saveButton.innerHTML =
        "<span>✓</span> Enregistrer les modifications";


    cancelButton.style.display =
        "block";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}



// ==========================================
// SUPPRIMER
// ==========================================

async function deleteGame(id) {

    const game =
        games.find(
            game =>
                game.id === id
        );


    if (!game) {
        return;
    }


    const confirmed =
        confirm(

            `Supprimer "${game.name}" ?\n\n` +
            "Cette action est définitive."

        );


    if (!confirmed) {
        return;
    }


    try {

        const deletedPosition =
            Number(game.order);


        const batch =
            writeBatch(db);


        // Décaler les jeux suivants

        if (
            Number.isFinite(
                deletedPosition
            )
        ) {

            games.forEach(otherGame => {

                if (
                    otherGame.id === id
                ) {
                    return;
                }


                const position =
                    Number(
                        otherGame.order
                    );


                if (

                    Number.isFinite(
                        position
                    ) &&

                    position >
                    deletedPosition

                ) {

                    batch.update(

                        doc(
                            db,
                            "games",
                            otherGame.id
                        ),

                        {
                            order:
                                position - 1
                        }

                    );

                }

            });

        }


        // Supprimer le jeu

        batch.delete(

            doc(
                db,
                "games",
                id
            )

        );


        await batch.commit();


        await loadGames();



    } catch (error) {

        console.error(
            "Erreur Firebase :",
            error
        );


        alert(

            "Impossible de supprimer le jeu.\n\n" +
            error.message

        );

    }

}



// ==========================================
// ANNULER
// ==========================================

cancelButton.addEventListener(
    "click",
    resetForm
);



function resetForm() {

    editingGameId =
        null;


    editingGameImage =
        null;


    form.reset();


    formTitle.textContent =
        "Ajouter un jeu";


    saveButton.innerHTML =
        "<span>＋</span> Ajouter le jeu";


    cancelButton.style.display =
        "none";


    // Cacher la position

    orderGroup.style.display =
        "none";


    imagePreview.innerHTML = `

        <span>
            🖼️
        </span>

        <p>
            Aucune image sélectionnée
        </p>

    `;

}



// ==========================================
// RECHERCHE
// ==========================================

searchInput.addEventListener(
    "input",
    renderGames
);



// ==========================================
// OUTILS
// ==========================================

function numberOrNull(value) {

    if (
        value === ""
    ) {
        return null;
    }


    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : null;

}



function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}



// ==========================================
// JOUEURS
// ==========================================

function formatPlayers(game) {

    const min =
        game.minPlayers;


    const max =
        game.maxPlayers;


    if (
        min != null &&
        max != null
    ) {

        if (
            min === max
        ) {

            return `${min} joueur${
                min > 1
                ? "s"
                : ""
            }`;

        }


        return `${min}–${max}`;

    }


    if (min != null) {
        return `${min}+`;
    }


    if (max != null) {
        return `jusqu'à ${max}`;
    }


    return "";

}



// ==========================================
// DUREE
// ==========================================

function formatDuration(game) {

    const min =
        game.minDuration;


    const max =
        game.maxDuration;


    if (
        min != null &&
        max != null
    ) {

        if (
            min === max
        ) {

            return `${min} min`;

        }


        return `${min}–${max} min`;

    }


    if (min != null) {
        return `${min}+ min`;
    }


    if (max != null) {
        return `jusqu'à ${max} min`;
    }


    return "";

}



// ==========================================
// DEMARRAGE
// ==========================================

resetForm();

loadGames();