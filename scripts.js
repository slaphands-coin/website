var connected_account;

const install_overlay = document.getElementById('install');
const blur_overlay = document.getElementById('blur');
const login_overlay = document.getElementById('login');
const connect_btn = document.getElementById('connect');
const connect_wallet_btn = document.getElementById('connect_wallet');
const connect_btn_holder = document.getElementById('connect_btn_holder');
const user_info_holder = document.getElementById('user_info_holder');
const view_address_link = document.getElementById('view_address');

const user_address_view = document.getElementById('user_address');

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

const receiveEnsNames = async() => {

}

const connected = async() => {
    console.log("Connected function fired, address => " + connected_account + ".");
    connect_btn_holder.classList.add('hidden');

    window.web3 = new Web3(window.ethereum);
    user_address_view.innerText = connected_account.substring(0, 5) + '...' + connected_account.substring(38);
    user_info_holder.classList.remove('hidden');
}

const view_address = () => {
    window.open('https://polygonscan.com/address/' + connected_account, '_blank').focus();
}

connect_btn.onclick = connect;
connect_wallet_btn.onclick = connect;
view_address_link.onclick = view_address;