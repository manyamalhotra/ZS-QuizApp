document.getElementById('registration-form')?.addEventListener('submit', function(event) {
    event.preventDefault();
    console.log(document.getElementById('number-question'));

    var numberOfQuestions = document.getElementById('number-question').value;
    var level = document.querySelector('input[name="level"]:checked').value;
    var questionCategory = document.querySelector('input[name="category"]:checked').value;

    const API_URL='https://opentdb.com/api.php?amount='+ numberOfQuestions + ' &category= ' + questionCategory + '&difficulty=' + level +'&type=' + 'multiple';
    fetch(API_URL)
    .then(function(response) {
        console.log(response);
        if (!response.ok) {
            throw new Error(response.status);
        }
        return response.json();
    })

    .then(function(data) {
        console.log(data);

        showQuestions(data);
    })

    .catch(function(error) {
        displayError(error);
    });
});

var currentQuestionIndex = 0;
var isTimerPaused = false;
var score = 0;
var timer;
var data1;
var isQuizSubmitted = false;
var i=0;


var nextButton = document.getElementById('nextButton');
var timerElement = document.getElementById('timer')

function showQuestions(data) {
    document.getElementById("registration-form").style.display = "none";
    document.getElementById("quiz_container").style.display = "block";
    data1=data;
    currentQuestionIndex = data.results.length;

    helper(i);
}

function helper(i) {
    var show = data1.results[i].question;
    const choices = [...data1.results[i].incorrect_answers, data1.results[i].correct_answer];
    shuffleOptions(choices);
    
    console.log("Quest. ",show);
    console.log("Correct ans:" ,data1.results[i].correct_answer);

    var optionsHTML = '';
    for (var j = 0; j < 4; j++) {
        var choice = choices[j];
        optionsHTML += '<input type="radio" name="answer" onclick="onclickOptions()" id="option_' + j + '" value="' + choice + '">';
        optionsHTML += '<label for="option_' + j + '">' + choice + '</label><br>';
    }

    //display quiz_category
    const quiz_category=document.getElementById('quiz_category')
    quiz_category.innerHTML = '<h2>'+data1.results[i].category+'</h2>';

    // //score
    // const q_score=document.getElementById('quiz_score');
    // q_score.innerHTML = '<p>Current Score: '+score+'</p>';

    // //qno
    // const qno = document.getElementById('quiz_qno');
    // qno.innerHTML = '<p>Q'+(i+1)+' of '+data1.results.length+'</p>';


    //display quiz_timer
    startTimer();

    //display quiz_question
    var question = document.getElementById('quiz_question');
    question.innerHTML = '<p>'+show+'</p>';

    //dsiplay quiz_options
    var options = document.getElementById('quiz_options');
    options.innerHTML = optionsHTML;

    //display quiz_ans_submit
    var ans_submit = document.getElementById('quiz_ans_submit');
    document.getElementById('quiz_ans_submit').innerHTML = 
    "<button type='button' id='ans_submit' onclick='onclickSubmit()' disabled>Submit answer</button>";

    //clear quiz_feedback
    var feedback = document.getElementById('quiz_feedback');
    feedback.textContent = ''; // Clear the result message
}

function shuffleOptions(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
}

function startTimer() {
    var timeRemaining = 20; 
    var timer = document.getElementById("quiz_timer");
    //console.log("timer: ", timer);
    timer.textContent = "Time Remaining: " + timeRemaining;

    timerInterval = setInterval(function() {
        timeRemaining--;
        timer.textContent = "Time Remaining: " + timeRemaining;

        if (timeRemaining <= 0){
            clearInterval(timerInterval);

            //display feedback
            const timeup = document.getElementById("quiz_feedback")
            document.getElementById("quiz_feedback").style.display = "block";
            timeup.innerHTML='<p> TIME UP!<br><b>'+data1.results[i].correct_answer+' is the corect answer</p>';

            //disable options
            var radios = document.getElementsByName('answer');
            for (var k = 0, r=radios, l=r.length; k < l;  k++) {
                r[k].disabled = true;
                r[k].style.color = "#808080";
            }

            //disable ans submit button (in case option is selected but not submitted)
            document.getElementById("ans_submit").disabled=true;

            //display next_quest
            document.getElementById('quiz_next_quest').style.display='block';
            var next_quest = document.getElementById('quiz_next_quest');
            if(i===data1.results.length-1)
                next_quest.innerHTML = '<button type="submit" id="next_quest" onclick="endQuiz()">End Quiz</button>';
            else
                next_quest.innerHTML = '<button type="submit" id="next_quest" onclick="onclickNext()">Next Question</button>';
        }
    }, 1000);
}

function onclickOptions() {
    document.getElementById("ans_submit").removeAttribute("disabled");  
}

function onclickSubmit(){
    //disable ans submit button after submitting ans
    document.getElementById("ans_submit").disabled=true;

    //disable radio options
    var radios = document.getElementsByName('answer');
    for (var k = 0, r=radios, l=r.length; k < l;  k++) {
        r[k].disabled = true;
        r[k].style.color = "#808080";
    }

    clearInterval(timerInterval);
    var selectedAnswer = document.querySelector('input[name="answer"]:checked');
    var correctAnswer = data1.results[i];

    if (selectedAnswer && correctAnswer && correctAnswer.correct_answer) {
    var correctAnswer = correctAnswer.correct_answer;
        if (selectedAnswer.value === correctAnswer) {
            //display feedback
            const feedback = document.getElementById("quiz_feedback")
            feedback.style.display = "block";
            feedback.innerHTML = '<p>BRAVO! Correct Answer!';
            score++;
        }
        else
        {
            const feedback = document.getElementById("quiz_feedback")
            feedback.style.display = "block";
            feedback.innerHTML = '<p>Oops! Wrong Answer!<br><b>'+correctAnswer+'</b> is the correct answer</p>';
        }

        //display quiz_next_quest
        document.getElementById('quiz_next_quest').style.display='block';
        var next_quest = document.getElementById('quiz_next_quest');
        if(i===data1.results.length-1)
            next_quest.innerHTML = '<button type="submit" id="next_quest" onclick="endQuiz()">End Quiz</button>';
        else
            next_quest.innerHTML = '<button type="submit" id="next_quest" onclick="onclickNext()">Next Question</button>';
   }
}

function onclickNext() {
    document.getElementById('quiz_next_quest').style.display='none';
    helper(++i);
}

function endQuiz() {
    document.getElementById('quiz_container').style.display='none';
    document.getElementById('summary_container').style.display='block';
    //category & score
    var category = document.getElementById('summary_category');
    category.innerHTML = '<h2>'+data1.results[i].category+'<br><br> SCORE : '+score+'/'+data1.results.length+'</h2>';

    var feedback = document.getElementById('summary_feedback');
    feedback.innerHTML = '<p>You answered '+score+' out of '+data1.results.length+' questions correctly!</p>';
}

function displayError(error) {
    var questionElement = document.getElementById('error-block');
    console.log(questionElement)
    questionElement.innerHTML = '<p>Error: ' + error.message + '</p>';
}