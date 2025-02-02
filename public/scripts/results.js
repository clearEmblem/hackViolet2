document.addEventListener('DOMContentLoaded', () => {
    const topicElement = document.getElementById('topic');
    const topic = localStorage.getItem('topic2');
    const trans = document.getElementById('trans');
    const transcript = localStorage.getItem("transcript");
    trans.innerText = transcript;
    if (topic) {
        topicElement.innerText = topic;
    }

    const audio = document.getElementById('audio');

    function getAudioFromLocalStorage() {
        console.log('Getting audio from local storage');
        const base64data = localStorage.getItem('audioFile');
        if (base64data) {
            const audioSrc = new Audio(base64data);
            audio.src = audioSrc.src;
            console.log('Audio file retrieved from local storage');
        } else {
            console.log('No audio file found in local storage');
        }
    }
    getAudioFromLocalStorage();

    // Progress bars
    const professionalismBar = document.querySelector('#professionalism-bar');
    const speakingSkillsBar = document.querySelector('#speaking-skills-bar');
    const informationBar = document.querySelector('#information-bar');
    const timeManagementBar = document.querySelector('#time-management-bar');
    const grammarBar = document.querySelector('#grammar-bar');
    const relevanceBar = document.querySelector('#relevance-bar');

    // Function to update progress bars
    function updateProgressBars(data) {
        professionalismBar.style.width = `${data.professional_language.score}%`;
        professionalismBar.setAttribute('aria-valuenow', data.professional_language.score);
        professionalismBar.innerText = `Professionalism: ${data.professional_language.score}%`;

        speakingSkillsBar.style.width = `${data.speaking_skills.score}%`;
        speakingSkillsBar.setAttribute('aria-valuenow', data.speaking_skills.score);
        speakingSkillsBar.innerText = `Speaking Skills: ${data.speaking_skills.score}%`;

        informationBar.style.width = `${data.information_contained.score}%`;
        informationBar.setAttribute('aria-valuenow', data.information_contained.score);
        informationBar.innerText = `Information: ${data.information_contained.score}%`;

        timeManagementBar.style.width = `${data.time_management.score}%`;
        timeManagementBar.setAttribute('aria-valuenow', data.time_management.score);
        timeManagementBar.innerText = `Time Management: ${data.time_management.score}%`;

        grammarBar.style.width = `${data.grammar.score}%`;
        grammarBar.setAttribute('aria-valuenow', data.grammar.score);
        grammarBar.innerText = `Grammar: ${data.grammar.score}%`;

        relevanceBar.style.width = `${data.relevance.score}%`;
        relevanceBar.setAttribute('aria-valuenow', data.relevance.score);
        relevanceBar.innerText = `Relevance: ${data.relevance.score}%`;
    }

    // Function to update accordion content
    function updateAccordionContent(data) {
        const weakSentencesElement = document.getElementById('weak-sentences');
        const strongSentencesElement = document.getElementById('strong-sentences');
        const missedTopicsElement = document.getElementById('missed-topics');

        weakSentencesElement.innerHTML = `<strong>Weak Sentence:</strong> ${data.examples.weak_sentence.sentence}<br><strong>Explanation:</strong> ${data.examples.weak_sentence.explanation}`;
        strongSentencesElement.innerHTML = `<strong>Strong Sentence:</strong> ${data.examples.strong_sentence.sentence}<br><strong>Explanation:</strong> ${data.examples.strong_sentence.explanation}`;
        missedTopicsElement.innerHTML = `<strong>Missed Topics:</strong> ${data.missing_topics.join(', ')}`;
    }

    // Function to create and update cards
    function updateCards(data) {
        const cardsContainer = document.getElementById('cards-container');
        const cardData = [
            { title: 'Professional Language', summary: data.professional_language.summary },
            { title: 'Speaking Skills', summary: data.speaking_skills.summary },
            { title: 'Information Contained', summary: data.information_contained.summary },
            { title: 'Time Management', summary: data.time_management.summary },
            { title: 'Grammar', summary: data.grammar.summary },
            { title: 'Relevance', summary: data.relevance.summary }
        ];

        cardData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4';
            card.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${item.title}</h5>
                        <p class="card-text">${item.summary}</p>
                    </div>
                </div>
            `;
            cardsContainer.appendChild(card);
        });
    }

    // Create the JSON object to send in the POST request
    const apiPush = {
        transcript: transcript
    };

    // Call the API and update progress bars and accordion content
    fetch('http://localhost:8001/grade', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiPush) // Send the apiPush variable
    })
        .then(response => response.json()) // Parse the JSON from the response
        .then(data => {
            console.log('API response:', data);

            if (data && data.gradeResult && data.gradeResult.ratings) { // Check for nested properties
                updateProgressBars(data.gradeResult.ratings); // Access ratings directly
                updateAccordionContent(data.gradeResult); // Update accordion content
                updateCards(data.gradeResult.ratings); // Update cards
                localStorage.setItem('feedback', JSON.stringify(data.gradeResult)); // Store the grade result
            } else {
                console.error("Invalid API response:", data);
            }
        })
        .catch(error => {
            console.error('Error calling API:', error);
        });
});




