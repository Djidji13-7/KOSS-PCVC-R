// Importer les modules Firebase nécessaires
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC2oK7q5ZTYB6a1QwDkW5ybYq36CTe0EnU",
  authDomain: "ramonagekoss.firebaseapp.com",
  projectId: "ramonagekoss",
  storageBucket: "ramonagekoss.appspot.com",
  messagingSenderId: "135009782729",
  appId: "1:135009782729:web:1224464e0aa1ab2c7bf618",
  measurementId: "G-W1PRBG7YD4"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Liste des créneaux disponibles (jours et périodes spécifiques)
const creneaux = [
  { jour: "lundi", periode: "matin" },
  { jour: "lundi", periode: "matin" },
  { jour: "lundi", periode: "après-midi" },
  { jour: "lundi", periode: "après-midi" },
  { jour: "mardi", periode: "matin" },
  { jour: "mardi", periode: "matin" },
  { jour: "mardi", periode: "après-midi" },
  { jour: "mardi", periode: "après-midi" },
  { jour: "jeudi", periode: "matin" },
  { jour: "jeudi", periode: "matin" },
  { jour: "jeudi", periode: "après-midi" },
  { jour: "jeudi", periode: "après-midi" },
  { jour: "vendredi", periode: "matin" },
  { jour: "vendredi", periode: "matin" },
  { jour: "vendredi", periode: "après-midi" },
  { jour: "vendredi", periode: "après-midi" }
];

// Période future à couvrir (en mois)
const moisFuturs = 2;

// Fonction pour charger et afficher les créneaux disponibles
async function chargerCreneaux() {
  const select = document.getElementById("datetime");
  select.innerHTML = ""; // Réinitialiser les options

  let reservations = {};
  try {
    // Récupérer les créneaux réservés depuis Firebase
    const snapshot = await getDocs(collection(db, "reservations"));
    snapshot.forEach(doc => {
      const { jour, periode } = doc.data();
      if (!reservations[jour]) {
        reservations[jour] = { matin: 0, "après-midi": 0 };
      }
      reservations[jour][periode] = (reservations[jour][periode] || 0) + 1;
    });
  } catch (error) {
    console.error("Erreur lors du chargement des réservations :", error);
  }

  // Générer les créneaux futurs
  const aujourdHui = new Date();
  for (let mois = 0; mois < moisFuturs; mois++) {
    const dateDebutMois = new Date(
      aujourdHui.getFullYear(),
      aujourdHui.getMonth() + mois,
      1
    );

    while (dateDebutMois.getMonth() === aujourdHui.getMonth() + mois) {
      creneaux.forEach(creneau => {
        const jourIndex = [
          "dimanche",
          "lundi",
          "mardi",
          "mercredi",
          "jeudi",
          "vendredi",
          "samedi"
        ].indexOf(creneau.jour);

        if (dateDebutMois.getDay() === jourIndex) {
          const jour = creneau.jour;
          const periode = creneau.periode;

          if (
            !reservations[jour] ||
            reservations[jour][periode] < 2 // Max 2 réservations par période
          ) {
            const optionValue = `${jour}_${periode}_${dateDebutMois
              .toISOString()
              .slice(0, 10)}`;
            const optionText = `${jour} ${dateDebutMois.toLocaleDateString(
              "fr-FR"
            )} (${periode})`;
            const option = document.createElement("option");
            option.value = optionValue;
            option.textContent = optionText;
            select.appendChild(option);
          }
        }
      });

      dateDebutMois.setDate(dateDebutMois.getDate() + 1);
    }
  }
}

// Fonction pour réserver un créneau
async function reserverCreneau(event) {
  event.preventDefault();
  const select = document.getElementById("datetime");
  const datetime = select.value;

  if (!datetime) {
    alert("Veuillez choisir un créneau.");
    return;
  }

  const [jour, periode, date] = datetime.split("_");

  try {
    // Vérifier si le créneau est déjà réservé avant de l'ajouter
    const snapshot = await getDocs(collection(db, "reservations"));
    const reservations = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!reservations[data.jour]) {
        reservations[data.jour] = { matin: 0, "après-midi": 0 };
      }
      reservations[data.jour][data.periode] =
        (reservations[data.jour][data.periode] || 0) + 1;
    });

    if (reservations[jour] && reservations[jour][periode] >= 2) {
      alert("Désolé, ce créneau est déjà complet.");
      chargerCreneaux(); // Mettre à jour les options disponibles
      return;
    }

    // Ajouter la réservation dans Firebase
    await addDoc(collection(db, "reservations"), { jour, periode, date });
    alert("Réservation confirmée !");
    chargerCreneaux(); // Recharger les créneaux disponibles
  } catch (error) {
    console.error("Erreur lors de la réservation :", error);
    alert("Une erreur est survenue. Veuillez réessayer.");
  }
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  chargerCreneaux();
  document.querySelector("form").addEventListener("submit", reserverCreneau);
});

// Envoi à Web3Forms
document
  .querySelector("form")
  .addEventListener("submit", async function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        alert("Votre formulaire a été envoyé avec succès !");
        form.reset();
      } else {
        alert("Une erreur s'est produite. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur :", error);
      alert("Impossible d'envoyer le formulaire pour le moment.");
    }
  });

//////////////////////////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  const menuIcon = document.querySelector(".icon1");
  const menu = document.querySelector(".menu");
  const closeIcon = document.querySelector(".fermer");
  const navLinks = document.querySelectorAll(".nav-link");

  // Affiche/masque le menu lorsque l'icône est cliquée
  menuIcon.addEventListener("click", () => {
    menu.classList.toggle("active");
  });

  // Masque le menu lorsque 'Fermer' est cliqué
  closeIcon.addEventListener("click", () => {
    menu.classList.remove("active");
  });

  // Masque le menu lorsque l'un des liens est cliqué
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("active");
    });
  });
});

///NAV SCROLL FIXED//////
document.addEventListener("DOMContentLoaded", () => {
  const navContainer = document.querySelector(".nav-container");

  // Ajoute une écoute pour le défilement
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navContainer.classList.add("shrink");
    } else {
      navContainer.classList.remove("shrink");
    }
  });
});

////PROMO//////////////
document.addEventListener("DOMContentLoaded", () => {
  const promoBar = document.querySelector(".promo");
  const promoCloseIcon = document.querySelector(".fermer1");
  const promoMessages = promoBar.querySelectorAll("span:not(.fermer1)");

  let currentIndex = 0;

  // Function to show the next message
  function showNextMessage() {
    // Hide all messages
    promoMessages.forEach((msg, index) => {
      msg.style.opacity = 0;
      msg.style.zIndex = -1;
    });

    // Show the current message
    promoMessages[currentIndex].style.opacity = 1;
    promoMessages[currentIndex].style.zIndex = 1;

    // Move to the next message, looping back to the first if needed
    currentIndex = (currentIndex + 1) % promoMessages.length;
  }

  // Start the cycle to change messages every 2 seconds
  setInterval(showNextMessage, 2000);

  // Initial call to show the first message
  showNextMessage();

  // Add a click event to the close icon to hide the promo
  promoCloseIcon.addEventListener("click", () => {
    promoBar.classList.add("hide");
  });
});

//FAQ////////////////////////////////////

document.querySelectorAll(".faq-item h4").forEach(item => {
  item.addEventListener("click", () => {
    // Toggle la classe "active" sur le titre de la question
    item.classList.toggle("active");

    // Afficher ou masquer la réponse correspondante
    const answer = item.nextElementSibling;
    if (answer.style.display === "block") {
      answer.style.display = "none";
    } else {
      answer.style.display = "block";
    }
  });
});
///ADRESSE Algolia///////////////////
// Algolia Places initialization
const placesAutocomplete = places({
  appId: "0PP8W6ACHY", // Remplacez par votre App ID
  apiKey: "a00b7fdf8356716dc847c3b1a356e8fb", // Remplacez par votre API Key
  container: document.querySelector("#adresse")
});

// Optionnel : gestion des événements
placesAutocomplete.on("change", e => {
  console.log("Selected address:", e.suggestion);
});

placesAutocomplete.on("error", e => {
  console.error("Error occurred:", e);
});
