const op = ["Rarely", "Sometimes", "Frequently", "Mostly", "Always"]
const questions = [
  // I. SOCIAL RELATIONSHIP AND RECIPROCITY
  { question: "Has poor eye contact", options: op },
  { question: "Lacks social smile", options: op },
  { question: "Remains aloof", options: op },
  { question: "Does not reach out to others", options: op },
  { question: "Unable to relate to people", options: op },
  { question: "Unable to respond to social/environmental cues", options: op },
  { question: "Engages in solitary and repetitive play activities", options: op },
  { question: "Unable to take turns in social interaction", options: op },
  { question: "Does not maintain peer relationships", options: op },

  // II. EMOTIONAL RESPONSIVENESS
  { question: "Shows inappropriate emotional response", options: op },
  { question: "Shows exaggerated emotions", options: op },
  { question: "Engages in self-stimulating emotions", options: op },
  { question: "Lacks fear of danger", options: op },
  { question: "Excited or agitated for no apparent reason", options: op },

  // III. SPEECH-LANGUAGE AND COMMUNICATION
  { question: "Acquired speech and lost it", options: op },
  { question: "Has difficulty in using non-verbal language or gestures to communicate", options: op },
  { question: "Engages in stereotyped and repetitive use of language", options: op },
  { question: "Engages in echolalic speech", options: op },
  { question: "Produces infantile squeals/unusual noises", options: op },
  { question: "Unable to initiate or sustain conversation with others", options: op },
  { question: "Uses jargon or meaningless words", options: op },
{ question: "Uses pronoun reversals", options: op },
{ question: "Unable to grasp pragmatics of communication (real meaning)", options: op },

// IV. BEHAVIOUR PATTERNS
{ question: "Engages in stereotyped and repetitive motor mannerisms", options: op },
{ question: "Shows attachment to inanimate objects", options: op },
{ question: "Shows hyperactivity/restlessness", options: op },
{ question: "Exhibits aggressive behavior", options: op },
{ question: "Throws temper tantrums", options: op },
{ question: "Engages in self-injurious behavior", options: op },
{ question: "Insists on sameness", options: op },

// V. SENSORY ASPECTS
{ question: "Unusually sensitive to sensory stimuli", options: op },
{ question: "Stares into space for long periods of time", options: op },
{ question: "Has difficulty in tracking objects", options: op },
{ question: "Has unusual vision", options: op },
{ question: "Insensitive to pain", options: op },
{ question: "Responds to objects/people unusually by smelling, touching or tasting", options: op },

// VI. COGNITIVE COMPONENT
{ question: "Inconsistent attention and concentration", options: op },
{ question: "Shows delay in responding", options: op },
{ question: "Has unusual memory of some kind", options: op },
{ question: "Has ‘savant’ ability", options: op }
];

const optionValues = {
  "Rarely": 1,
  "Sometimes": 2,
  "Frequently": 3,
  "Mostly": 4,
  "Always": 5
};

let currentIndex = 0;
let selectedAnswers = new Array(questions.length).fill(null);

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const counterEl = document.getElementById("counter");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");

function loadQuestion() {
  const q = questions[currentIndex];
  questionEl.textContent = q.question;
  counterEl.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  
  optionsEl.innerHTML = "";
  nextBtn.disabled = selectedAnswers[currentIndex] === null;

  q.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.classList.add("option-btn");

    if (selectedAnswers[currentIndex]?.label === opt) {
      btn.classList.add("selected");
    }

    btn.onclick = () => {
      selectedAnswers[currentIndex] = {
      label: opt,
      value: optionValues[opt]
    }
      document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      nextBtn.disabled = false;
    };

    optionsEl.appendChild(btn);
  });

  backBtn.disabled = currentIndex === 0;

  if (currentIndex === questions.length - 1) {
    nextBtn.textContent = "Submit";
  } else {
    nextBtn.textContent = "Next";
  }
}

backBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    loadQuestion();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    loadQuestion();
  }
  else {
  const totalScore = selectedAnswers.reduce((sum, answer) => sum + answer.value, 0);
  sessionStorage.setItem("score", totalScore);
  const payload = {
    totalScore: totalScore
  };
  // Debug log or confirmation
  console.log("Total Score:", totalScore);
  

  // Send to server (POST request)
  fetch('/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (!response.ok) throw new Error("Network response was not ok");
    return response.text();
  })
  .then(data => {
    alert("Thank you! Your responses have been submitted.");
    console.log("Server response:", data);
    window.location.href="test_details.html"
  })
  .catch(error => {
    console.error("Submission failed:", error);
    alert("Submission failed. Please try again.");
  });

  // UI lock after submit
  nextBtn.textContent = "Go to Next Test"
  backBtn.disabled = true;
  optionsEl.innerHTML = "";
  questionEl.textContent = "Submission complete!";
  counterEl.textContent = "";
}
});

loadQuestion();
