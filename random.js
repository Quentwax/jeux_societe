import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {


getFirestore,
collection,
getDocs


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
// ELEMENTS
// ==========================================

const playersInput =
document.getElementById("players");

const minTimeInput =
document.getElementById("minTime");

const maxTimeInput =
document.getElementById("maxTime");

const randomButton =
document.getElementById("randomButton");

const rerollButton =
document.getElementById("rerollButton");

const resultSection =
document.getElementById("resultSection");

const resultImage =
document.getElementById("resultImage");

const resultName =
document.getElementById("resultName");

const resultFranchise =
document.getElementById("resultFranchise");

const resultDetails =
document.getElementById("resultDetails");

const resultDescription =
document.getElementById("resultDescription");

const messageSection =
document.getElementById("messageSection");

const messageTitle =
document.getElementById("messageTitle");

const messageText =
document.getElementById("messageText");

// ==========================================
// JEUX
// ==========================================

let games = [];

// ==========================================
// CHARGER LES JEUX
// ==========================================

async function loadGames() {


try {

    randomButton.disabled = true;

    randomButton.innerHTML =
        "⏳ Chargement...";


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


    randomButton.disabled = false;

    randomButton.innerHTML =
        "🎲 Lancer le tirage";


    if (games.length === 0) {

        showMessage(
            "Ludothèque vide",
            "Aucun jeu n'est actuellement enregistré."
        );

    }


} catch (error) {

    console.error(
        "Erreur Firebase :",
        error
    );


    randomButton.disabled = true;

    randomButton.innerHTML =
        "❌ Impossible de charger";


    showMessage(
        "Erreur",
        "Impossible de charger les jeux."
    );

}


}

// ==========================================
// VERIFIER UN JEU
// ==========================================

function gameMatchesFilters(game) {


// ======================================
// JOUEURS
// ======================================

const selectedPlayers =
    Number(
        playersInput.value
    );


if (
    Number.isFinite(selectedPlayers) &&
    playersInput.value !== ""
) {

    const minPlayers =
        Number(game.minPlayers);


    const maxPlayers =
        Number(game.maxPlayers);


    if (
        !Number.isFinite(minPlayers) ||
        !Number.isFinite(maxPlayers)
    ) {

        return false;

    }


    if (
        selectedPlayers < minPlayers ||
        selectedPlayers > maxPlayers
    ) {

        return false;

    }

}



// ======================================
// DUREE MINIMUM
// ======================================

const minTime =
    Number(
        minTimeInput.value
    );


if (
    minTimeInput.value !== "" &&
    Number.isFinite(minTime)
) {

    const gameMaxDuration =
        Number(game.maxDuration);


    if (
        !Number.isFinite(
            gameMaxDuration
        )
    ) {

        return false;

    }


    if (
        gameMaxDuration < minTime
    ) {

        return false;

    }

}



// ======================================
// DUREE MAXIMUM
// ======================================

const maxTime =
    Number(
        maxTimeInput.value
    );


if (
    maxTimeInput.value !== "" &&
    Number.isFinite(maxTime)
) {

    const gameMinDuration =
        Number(game.minDuration);


    if (
        !Number.isFinite(
            gameMinDuration
        )
    ) {

        return false;

    }


    if (
        gameMinDuration > maxTime
    ) {

        return false;

    }

}



return true;


}

// ==========================================
// TIRAGE
// ==========================================

function drawRandomGame() {


hideMessage();


const matchingGames =
    games.filter(
        game =>
            gameMatchesFilters(game)
    );


if (
    matchingGames.length === 0
) {

    resultSection.classList.remove(
        "visible"
    );


    showMessage(

        "Aucun jeu trouvé",

        "Aucun jeu de ta ludothèque ne correspond à ces critères."

    );


    return;

}



const randomIndex =
    Math.floor(
        Math.random() *
        matchingGames.length
    );


const selectedGame =
    matchingGames[randomIndex];


displayGame(
    selectedGame
);


}

// ==========================================
// AFFICHER LE JEU
// ==========================================

function displayGame(game) {


resultSection.classList.add(
    "visible"
);


resultImage.innerHTML =

    game.image

    ? `

        <img
            src="${escapeHTML(game.image)}"
            alt="${escapeHTML(game.name)}"
        >

    `

    : "🎲";



resultName.textContent =
    game.name || "Jeu sans nom";



resultFranchise.textContent =
    game.franchise || "";



resultDetails.innerHTML =
    "";



// ======================================
// JOUEURS
// ======================================

const players =
    formatPlayers(game);


if (players) {

    addDetail(
        players
    );

}



// ======================================
// DUREE
// ======================================

const duration =
    formatDuration(game);


if (duration) {

    addDetail(
        duration
    );

}



// ======================================
// AGE
// ======================================

if (
    game.minAge != null
) {

    addDetail(
        `${game.minAge}+ ans`
    );

}



// ======================================
// DESCRIPTION
// ======================================

resultDescription.textContent =
    game.description || "";


}

// ==========================================
// DETAILS
// ==========================================

function addDetail(text) {


const span =
    document.createElement(
        "span"
    );


span.textContent =
    text;


resultDetails.appendChild(
    span
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


    return `${min}–${max} joueurs`;

}



if (
    min != null
) {

    return `${min}+ joueurs`;

}



if (
    max != null
) {

    return `Jusqu'à ${max} joueurs`;

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



if (
    min != null
) {

    return `${min}+ min`;

}



if (
    max != null
) {

    return `Jusqu'à ${max} min`;

}



return "";


}

// ==========================================
// MESSAGES
// ==========================================

function showMessage(
title,
text
) {


messageTitle.textContent =
    title;


messageText.textContent =
    text;


messageSection.classList.add(
    "visible"
);


}

function hideMessage() {


messageSection.classList.remove(
    "visible"
);


}

// ==========================================
// SECURITE HTML
// ==========================================

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
// BOUTONS
// ==========================================

randomButton.addEventListener(
"click",
drawRandomGame
);

rerollButton.addEventListener(
"click",
drawRandomGame
);

// ==========================================
// DEMARRAGE
// ==========================================

loadGames();
