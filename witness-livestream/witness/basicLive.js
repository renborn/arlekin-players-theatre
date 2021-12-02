// create Agora client
var client = AgoraRTC.createClient({mode: "live", codec: "vp8"});
var localTracks = {
    videoTrack: null,
    audioTrack: null
};
var remoteUsers = {};
// Agora client options
var options = {
    appid: null,
    channel: null,
    uid: null,
    token: null,
    role: "audience",
    audienceLatency: 2
};

// the demo can auto join channel with params in url
$(async () => {
    var urlParams = new URL(location.href).searchParams;
    options.appid = urlParams.get("appid");
    options.channel = urlParams.get("channel");
    options.token = urlParams.get("token");
    options.uid = urlParams.get("uid");

    try {
        await join();
    } catch (error) {
        console.error(error);
    }
})

async function join() {
    // create Agora client
    client.setClientRole(options.role, {level: options.audienceLatency});
    // add event listener to play remote tracks when remote user publishs.
    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);

    // join the channel
    options.uid = await client.join(options.appid, options.channel, options.token || null, options.uid || null);
}

async function subscribe(user, mediaType) {
    const uid = user.uid;
    // subscribe to a remote user
    await client.subscribe(user, mediaType);
    console.log("subscribe success");
    if (mediaType === 'video') {
        const player = $(`<div id="player-${uid}" class="player"></div>`);
        $("#livestream").append(player);
        user.videoTrack.play(`player-${uid}`, {fit: "contain"});
    }
    if (mediaType === 'audio') {
        user.audioTrack.play();
    }

    setTimeout(() => {
        const videoBlock = $("#livestream").find('video');
        videoBlock.attr('controls', '')
    }, 1000)
}

function handleUserPublished(user, mediaType) {
    const id = user.uid;
    subscribe(user, mediaType);
}

function handleUserUnpublished(user, mediaType) {
    if (mediaType === 'video') {
        const id = user.uid;
        $(`#player-wrapper-${id}`).remove();
    }
}
