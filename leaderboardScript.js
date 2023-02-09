let leaderboard_sorted = [];
let leaderboard_code = "";
let current_try;

generateLeaderboard();
function generateLeaderboard() {

    leaderboard_sorted = JSON.parse(localStorage['leaderboard_sorted']);
    current_try = JSON.parse(localStorage['try_id']);


    document.getElementById("highscore").innerHTML = `HIGHSCORE: ${leaderboard_sorted[0].score}`;

    for (let i = 0; i < leaderboard_sorted.length; i++) {
        if (leaderboard_sorted[i].try_id == current_try) {
            leaderboard_code += `
            <tr style="color: red;">
                <td>${leaderboard_sorted[i].name}</td>
                <td>${leaderboard_sorted[i].score}</td>
            </tr>
            `;
        } else {
            leaderboard_code += `
            <tr>
                <td>${leaderboard_sorted[i].name}</td>
                <td>${leaderboard_sorted[i].score}</td>
            </tr>
            `;
        }
    }

    document.getElementById("leaderboard").innerHTML = `
    <tr>
        <td>NAME</td>
        <td>SCORE</td>
    </tr>
    ${leaderboard_code}
    `;

}

function back() {
    //RÜCKEN AUF ENGLISCH
    window.close();
}