console.log('Lets write JavaScript');
let songs;
let currFolder;
let currentSong = new Audio();

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    // console.log(a, "folder")
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    // console.log(as)
    songs = []
    // console.log(songs)
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="Images/music.svg" alt="Music">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>Vikas</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert icon" src="Images/play.svg" alt="">
                            </div> </li>`;
    }
    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        console.log(e)
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML.trim())
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return (songs)
}


const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "Images/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}
/*
Async function to fetch the list of songs from the specified directory
and store it in the global songs array.
*/
async function displayAlbums() {
    try {
        let a = await fetch(`/songs/`);
        if (!a.ok) {
            throw new Error('Failed to fetch albums');
        }
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");
        for (const e of anchors) {
            if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
                let folder = (e.href.split("/").slice(-1)[0]);
                console.log(folder)
                // let infoResponse = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
                let infoResponse = await fetch(`/songs/${folder}/info.json`);

                if (!infoResponse.ok) {
                    throw new Error(`Failed to fetch info.json for ${folder}`);
                }
                let infoData = await infoResponse.json();
                let cardDiv = document.createElement("div");
                cardDiv.dataset.folder = folder;
                cardDiv.classList.add("card");
                cardDiv.innerHTML = `
                    <div class="play">
                        <img src="Images/play.svg" alt="play">
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="Chill">
                    <h2>${infoData.title}</h2>
                    <p>${infoData.description}</p>
                `;
                cardContainer.appendChild(cardDiv);
            }
        }
        // Load the playlist whenever card is clicked
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            console.log("Fetching Songs", e)
            e.addEventListener("click", async item => {
                console.log("items", item.target, item.currentTarget.dataset)
                songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
                // playMusic(songs[0])

            })
        })
    } catch (error) {
        console.error('Error:', error);
    }
}


async function main() {
    await getsongs("songs/ncs")
    console.log(songs)
    playMusic(songs[0], true)
    // var audio = new Audio(songs[0])

    //display all albums on this page 
    displayAlbums()
    //Hambuger for responsiveness
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
        console.log("closed")
    })

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "Images/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "Images/play.svg"
        }
    })
    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })
    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })
    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })

    //Load album page on click
    document.querySelector(".hamburgercontainer #album").addEventListener("click", () => {
        window.location.href = "albums.html";
    });
    document.querySelector(".hamburgercontainer #albumback").addEventListener("click", () => {
        window.location.href = "index.html";
    });
    //load home page 
    document.getElementById("logo").addEventListener('click', () => {
        window.location.reload();
    });

    document.getElementById("home").addEventListener('click', () => {
        window.location.replace("index.html");
    });

    document.getElementById("search").addEventListener('click', () => {
        window.alert("Search feature coming soon!  Stay tuned!");
    });
    document.getElementById("signUpBtn").addEventListener('click', () => {
        window.alert("SignUp option coming soon!  Stay tuned!");
    });
    document.getElementById("loginBtn").addEventListener('click', () => {
        window.alert("Login Option coming soon!  Stay tuned!");
    });


}
main()