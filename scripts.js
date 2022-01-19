/* Credits: https://stackoverflow.com/users/895724/mandeep-janjua */
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


/* Rest is by me */
var connected_account;
var profile = 1;
var target_account;

const total_highfives_view = document.getElementById('total_highfives');

const install_overlay = document.getElementById('install');
const blur_overlay = document.getElementById('blur');
const login_overlay = document.getElementById('login');
const connect_btn = document.getElementById('connect');
const connect_wallet_btn = document.getElementById('connect_wallet');
const connect_btn_holder = document.getElementById('connect_btn_holder');
const user_info_holder = document.getElementById('user_info_holder');
const view_address_link = document.getElementById('view_address');

const user_address_view = document.getElementById('user_address');
const received_count_view = document.getElementById('received_count');
const given_count_view = document.getElementById('given_count');
const balance_view = document.getElementById('balance');
const payout_amount_view = document.getElementById('payout_amount');

const home_view = document.getElementById('home');
const highfive_view = document.getElementById('highfive');

const target_account_view = document.getElementById('target_account');
const highfive_connect_btn = document.getElementById('highfive_connect');
const highfive_btn = document.getElementById('highfive_btn');
const thanks_msg_view = document.getElementById('thanks_msg');

const connect = async() => {
    console.log("Connection function fired.");
    if (typeof window.ethereum === 'undefined') {
        install_overlay.classList.remove('hidden');
        return;
    }

    login_overlay.classList.add('hidden');
    blur_overlay.classList.remove('hidden');

    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        connected_account = accounts[0];
        connected();
    } catch (err) {
        blur_overlay.classList.add('hidden');
        login_overlay.classList.remove('hidden');
        return;
    }
    blur_overlay.classList.add('hidden');

}

const receiveAbi = () => {
    return new Promise(resolve => {
        const r = new XMLHttpRequest();
        r.addEventListener("load", () => {
            resolve(r.responseText);
        });
        r.open("GET", "/abi.json");
        r.send();
    });
}

const loadProfile = async() => {
    if (profile !== 1) { return; }
    user_address_view.innerText = connected_account.substring(0, 5) + '...' + connected_account.substring(38);
    const contract_user_info = await window.contract.methods.getCurrentUser().call({ from: connected_account });

    const contract_user_received = parseInt(contract_user_info[0]);
    const contract_user_given = parseInt(contract_user_info[1]);
    received_count_view.innerText = contract_user_received.toLocaleString(undefined);
    given_count_view.innerText = contract_user_given.toLocaleString(undefined);

    const contract_user_balance = await window.contract.methods.balanceOf(connected_account).call({ from: connected_account });
    balance_view.innerText = window.web3.utils.fromWei(contract_user_balance).toLocaleString(undefined);

    const contract_calculated_payout = await window.contract.methods.calculatePayout(contract_user_received, contract_user_given).call({ from: connected_account });
    payout_amount_view.innerText = contract_calculated_payout.toLocaleString(undefined);
}

const loadHighfive = async() => {
    if (profile !== 0) { return; }
    highfive_btn.classList.remove('hidden');
}

const highfive = async() => {
    try {
        await window.contract.methods.highfive(target_account).send({ from: connected_account });
        thanks_msg_view.classList.remove('hidden');
    } catch (err) {
        console.log(err);
    }
}

const connected = async() => {
    console.log("Connected function fired, address => " + connected_account + ".");
    connect_btn_holder.classList.add('hidden');
    highfive_connect_btn.classList.add('hidden');

    window.web3 = new Web3(window.ethereum);
    const abi = JSON.parse(await receiveAbi());
    window.contract = new web3.eth.Contract(abi, "0xa0c57cd1222f8c756d82f0798bc3f9f1a15d5519");

    loadProfile();
    loadHighfive();

    user_info_holder.classList.remove('hidden');
    setCookie("connected", "1", 365);

    const totalHighfives = await window.contract.methods.getTotalHighfives().call({ from: connected_account });
    total_highfives_view.innerText = totalHighfives.toLocaleString(undefined);
}

const view_address = () => {
    window.open('https://polygonscan.com/address/' + connected_account, '_blank').focus();
}

connect_btn.onclick = connect;
connect_wallet_btn.onclick = connect;
view_address_link.onclick = view_address;
highfive_connect_btn.onclick = connect;
highfive_btn.onclick = highfive;

document.body.onload = () => {
    if (window.location.hash && window.location.hash.length === 43) {
        profile = 0;
        target_account = window.location.hash.substring(1);
        home_view.classList.add('hidden');
        highfive_view.classList.remove('hidden');

        target_account_view.innerText = target_account.substring(0, 5) + '...' + target_account.substring(38);
        target_account_small.innerText = target_account.substring(0, 5) + '...' + target_account.substring(38);
    }
    if (getCookie("connected") !== null) {
        connect();
    }
}