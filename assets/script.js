function checkPalindrome() {
    console.log('checking palindrome');
    url = 'http://n5pkcfeark.execute-api.us-east-1.amazonaws.com/default/palindrome';
    fetch(url, {
            method: 'post',
            headers: {
                "Content-Type": "application/json",
                "Origin": "http://www.tacoda.me"
            },
            body: {
                phrase: "racecar"
            }
        })
        .then(function(response) {
            if (response.status !== 200) {
                console.log('Error: status code ' + response.status);
                return;
            }

            response.json().then(function(data) {
                console.log(data);
            })
        })
        .catch(function(err) {
            console.log('Fetch error: ' + err);
        });
}

function loadPalindromeHandler() {
    document.getElementById('palindrome')
            .addEventListener('click', checkPalindrome);
}

function loadHandlers() {
    loadPalindromeHandler();
}

window.addEventListener('load', loadHandlers);
