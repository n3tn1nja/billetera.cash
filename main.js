// Create Formatter to format numbers.
const US = new Intl.NumberFormat();
let thebchPrice = 0;
function resetSendBCHform () {
    var resetBtn = document.getElementById( 'resetSendForm' ),
        sendtotal = document.getElementById( 'send-total' ),
        totalUsd = document.getElementById( 'send-totalusd' ),
        sendBCHform = document.getElementById( 'sendbchform' );
}
// RUN when the DOM Content has been loaded
document.addEventListener( "DOMContentLoaded", async ( event ) => {
    globalThis.exports = globalThis.exports || {};
    Object.assign( globalThis, await __mainnetPromise );

    // Fix for loading persistent named wallets from IndexDB Storage Provider.
    BaseWallet.StorageProvider = IndexedDBProvider;

    // Using the mainnet.cash wallet.namedExists() to check if user has created wallet
    const walletExists = await Wallet.namedExists( DB_SEED );
    console.log( 'Wallet Exists? ' + walletExists )

    // If the wallet exists, set the walletId
    if ( walletExists ) {

        try {

            // if yes, get/set the walletid in localStorage.
            let walletId = localStorage.getItem( "walletId" );
            if ( !walletId || walletId === '' ) { // walletId is null OR walletId is empty / blank string
                //wallet exists BUT the walletId hasn't yet been set. That means it's an old wallet (using the default derivation)
                //Create the named wallet (with DB_SEED) and create/set the walletId in localStorage **This will preserve old/previously created wallets.
                const wallet = await Wallet.named( DB_SEED );

                const derivation = wallet.derivationPath;
                // ISSUE - default derivation is "m/44'/0'/0'/0/0"
                // ** WHEN CREATING A NEW WALLET, I'LL NEED TO CREATE ONE, THEN USE THAT SEED TO CREATE A NEW ONE WITH THE CORRECT DERIVATION
                // use the DB_SEED to create wallet1, then use that seed to create wallet with proper derivation.
                const seed = wallet.mnemonic;
                // const derivationPath = "m/44'/145'/0'/0/0";
                // Create user wallet using supplied seed & derivation path.
                walletId = 'seed:mainnet:' + seed + ':' + derivation;
                localStorage.setItem( "walletId", walletId );
                console.log( 'walletId created from existing wallet - ' + walletId );
                // Get Wallet Balance
                wallet.balance = await wallet.getBalance();
                // Get all UTXOs for wallet. Use this to provide UTXO selection to wallet via datatable
                wallet.utxos = await wallet.getUtxos();
                // Load the wallet
                // loadWallet(wallet);
                loadWallet( wallet );

            } else { // end walletId null check
                console.log( 'walletId is not blank, value = ' + walletId );
                const wallet = await Wallet.replaceNamed( DB_SEED, walletId );
                // Get Wallet Balance
                wallet.balance = await wallet.getBalance();
                // Get all UTXOs for wallet. Use this to provide UTXO selection to wallet via datatable
                wallet.utxos = await wallet.getUtxos();
                // Load the wallet
                // loadWallet(wallet);
                loadWallet( wallet );

            }

        } catch ( err ) {
            console.log( err );
            console.error( err );
        } // end try/catch.

    } else {
        // Wallet does not exist, show newwalletview div.
        document.getElementById( "newwalletview" ).classList.remove( 'hide' );
        // Hide the loader afterwards
        document.getElementById( "beaneater" ).classList.add( 'hide' );
        //document.getElementById("newWalletView").style.display = "inline";
    }

} ); // END CONTENT LOADED LISTENER


// async function to create a new wallet
async function createNewWallet () {

    // Use promises?
    //     return new Promise(async (resolve, reject) => {
    // set the derivation path, DEFAULT now being the standard HD wallet that most other wallets use - "m/44'/145'/0'/0/0;
    const derivation = "m/44'/145'/0'/0/0";
    // ISSUE - default derivation is "m/44'/0'/0'/0/0"
    // ** WHEN CREATING A NEW WALLET, I'LL NEED TO CREATE ONE, THEN USE THAT SEED TO CREATE A NEW ONE WITH THE CORRECT DERIVATION
    // use the DB_SEED to create wallet1, then use that seed to create wallet with proper derivation.
    const wallet1 = await Wallet.named( DB_SEED );

    const seed = wallet1.mnemonic;
    // const derivationPath = "m/44'/145'/0'/0/0";
    // Create user wallet using supplied seed & derivation path.
    const walletId = 'seed:mainnet:' + seed + ':' + derivation;
    // Save the walletId for later use -
    localStorage.setItem( "walletId", walletId );
    // Load/create the wallet.
    const wallet = await Wallet.replaceNamed( DB_SEED, walletId );

    // Get Wallet Balance
    wallet.balance = await wallet.getBalance();

    // Get all UTXOs for wallet. Use this to provide UTXO selection to wallet via datatable
    wallet.utxos = await wallet.getUtxos();

    // Load the wallet
    loadWallet( wallet );
}

// function to import a wallet using a 12 word mnemonic seed phrase & derivation path.
async function importWallet () {
    // grab selected derivation path
    const d = document.getElementById( 'derivationPath' );
    var derivation = d.options[ d.selectedIndex ].value;
    // grab user entered seed phrase
    const seed = document.getElementById( 'enterSeedphrase' ).value.trim();
    // Create user wallet using supplied seed & derivation path.
    const walletId = 'seed:mainnet:' + seed + ':' + derivation;
    // Save the walletId for later use -
    localStorage.setItem( "walletId", walletId );
    // Create the wallet.
    const wallet = await Wallet.replaceNamed( DB_SEED, walletId );

    // Get Wallet Balance
    wallet.balance = await wallet.getBalance();
    // Get all UTXOs for wallet. Use this to provide UTXO selection to wallet via datatable
    wallet.utxos = await wallet.getUtxos();
    // Load the wallet
    loadWallet( wallet );
}

// function to load the wallet
async function loadWallet ( wallet ) {
    // Show the wallet details
    document.getElementById( "walletexists" ).classList.remove( 'hide' );
    // Hide the new wallet view
    document.getElementById( "newwalletview" ).classList.add( 'hide' );
    document.getElementById( "beaneater" ).classList.add( 'hide' );
    // Check persistent theme dark/light mode from IndexedDB.

    console.log( 'Mainnet BCH wallet has been created... ', wallet );
    localStorage.setItem( "isnew", "false" );

    if ( wallet.derivationPath !== "m/44'/145'/0'/0/0" ) {
        console.log( 'Wallet is NOT using BIP39 Derivation path' );
    } else {
        console.log( 'Wallet IS using BIP39 Derivation path' );
    }

    // Get current wallet Derivation path and display for user.
    let derPath = wallet.derivationPath;
    console.log( 'DERIVATION PATH FOR WALLET = ' + derPath );
    //document.getElementById( "derivation" ).innerHTML = derPath;

    // DEBUG console.log('all wallet UTXOs = ' + JSON.stringify(wallet.utxos, null, 4));
    console.log( 'Hydrating UTXO Table...' );

    //set utxo length






    //  Get USD price of 1 BCH to display using the built-in price-getter from mainnet.cash library
    // TODO: Add a dropdown to select the currency and then save that preference in localStorage.getItem('currency'); Default: USD
    let bchPrice = await convert( 1, "bch", "usd" );
    if ( bchPrice ) {
        document.getElementById( "bchprice" ).innerHTML = bchPrice;
        thebchPrice = bchPrice;
    }

    // MAINNET WALLET LOGIC to run only after wallet has been loaded/created.
    if ( wallet ) {

        // Display all balance info - BCH, USD & SATS
        document.getElementById( 'bal' ).innerHTML = wallet.balance.bch + ' BCH';
        console.log( wallet.balance )
        document.getElementById( 'balusd' ).innerHTML = US.format( wallet.balance.usd );
        document.getElementById( 'sats' ).innerHTML = US.format( wallet.balance.sat );
        // Get Network Info and Splice to Uppercase.
        let network = wallet.network;
        wallet.network = network.charAt( 0 ).toUpperCase() + network.slice( 1 );

        // console.log('wallet.getDepositAddress() = ' + wallet.getDepositAddress());

        // Add Deposit Addr QR code to HTML.
        document.querySelector( '#depositqr' ).src = wallet.getDepositQr().src;


        // Add Wallet Cash Address to HTML
        document.getElementById( "cashaddr" ).innerHTML = '<span id="copytext" onClick="copyText()">' + wallet.cashaddr + '  <img width="15px" src="assets/img/copytext.jpg"></span>';
        // Add Mnemonic and Network to HTML
        document.getElementById( "mnemonic" ).innerHTML = wallet.mnemonic;

        // Watch Main Deposit Addr for any new incoming transactions // If it isn't working then the websocket connections to the spv nodes
        // probably timed out. Refresh the page to get new connections.
        console.log( 'Watching address for new transactions' );

        // wallet.watchAddress((txHash) => {

        wallet.watchAddressTransactions( ( tx ) => {

            let txString = JSON.stringify( tx, null, 4 );

            console.log( 'New Transaction recieved. TX Details = ' + txString );
            // Should watch only for INCOMING TXs.

            let txHash = tx.txid;

            // Get all outputs
            let outputs = tx.vout;

            outputs.forEach( o => {
                // if the output wallet address matches this wallet, it's a BINGO!
                o.scriptPubKey.addresses.forEach( a => {
                    if ( a === wallet.address ) {
                        // You have received vout.value BCH
                        // TODO: add USD value based on current price.
                        // let bchPrice = document.getElementById("bchprice").innerHTML
                        let usdval = o.value * bchPrice;
                        document.getElementById( 'txouts' ).innerHTML = '<span style="font-size:15pt;">' + o.value + ' BCH Received ($' + usdval + ').</span>';
                    }
                } )
            } )


            window.alert( 'New unspent transaction output recieved. TX HASH = ' + txHash )


            // Create NOTIFICATION for new address displayed in top right of screen
            createNotif( txHash );


            //Show the UtxoModal & refresh bal when it is closed by user
            document.getElementById( 'modalbtn' ).click();

        } ); // End wallet.watchAddressTransactions((tx) => {

        // never cancelWatch. Always keep Watching as long as page is open




    } // END if(wallet){}



} // End loadWallet(wallet)

// Function to allow user to Delete their bitcoincash wallet (and start anew). For some reason, it says it fails to delete, but it actually does delete it.
// TODO: Should force a reload of the page after delete so user doesn't accidentally send coins to old wallet.
function deleteWallet () {

    let databaseName = "bitcoincash";

    if ( confirm( 'Are you sure you want to DELETE THIS BITCOIN CASH WALLET? This cannot be undone. Once you confirm, the wallet will be reset and you will be prompted to create a new wallet, or restore an existing one. Make sure to save the Mnemonic Seed Phrase and Derivation Path first so you can restore it later!' ) ) {
        // Save it!
        var req = indexedDB.deleteDatabase( databaseName );
        req.onsuccess = function () {
            console.log( "Deleted Bitcoin Cash wallet successfully." );
            alert( 'Deleted Bitcoin Cash wallet successfully. Please reload the page (Ctrl + R) to create a new wallet. DO NOT SEND BCH to this current wallet unless you have backed up your mnemonic seed phrase.' );
            location.reload( true );
        };
        req.onerror = function () {
            console.log( "Couldn't delete database for BCH wallet." );
            alert( "Error... but it still probably deleted the wallet. You should refresh the page!" );
            location.reload( true );
        };
        req.onblocked = function () {
            console.log( "Couldn't delete database for BCH wallet due to the operation being blocked. It probably deleted it anyways though." );
            // This error always comes up... but it does actually delete the wallet and reset everything.
            alert( "Couldn't delete database for BCH wallet due to the operation being blocked." );
            location.reload( true );
        };

    } else {
        // Do nothing!
        console.log( 'Wallet was not deleted; user cancelled' );
    }
}

// Where el is the DOM element you'd like to test for visibility
function isHidden ( el ) {
    return ( el.offsetParent === null )
}


async function sendBCH () {

    console.log( 'SendBCH function kicked off...' );

    // Check for errors upfront and return error if exists.
    console.log( 'checking for invalid feedback..' );
    var invalidInputs = document.getElementsByClassName( "invalid-feedback" );
    var thereareerrors = false;

    for ( var i = 0; i < invalidInputs.length; i++ ) {

        if ( !isHidden( invalidInputs[ i ] ) ) {
            thereareerrors = true;
        }
    }

    // Null check
    if ( document.getElementById( "send-total" ).value < 0.00000001 ) {
        console.log( 'User is trying to send value less than 0.00000001' );
        thereareerrors = true;
    }

    console.log( 'Are there errors? ' + thereareerrors );

    if ( thereareerrors == false ) {
        // there are no errors, proceed with SEND
        console.log( 'There are no errors, proceeding with send' );

        // Show loader GIF
        document.getElementById( "loader" ).style.display = "inline";

        // Get variables for sending, trim whitespace on sendtoAddr.
        let sendToAddr = document.getElementById( "sendtoaddress" ).value.trim();
        let sendTotal = document.getElementById( "send-total" ).value;
        let sendMax = document.getElementById( "sendmax" );

        console.log( 'SendMax is checked? ' + sendMax.checked );

        // Creates new/loads existing MAINNET WALLET STORED IN USER BROWSER, referenced by DB_SEED set here.
        const wallet = await Wallet.named( DB_SEED );

        // if Sendmax was checked, lets just send all funds to specified address.
        if ( sendMax.checked ) {
            console.log( 'SendMax was checked. Sending all funds to address provided.' );

            try {

                const txData = await wallet.sendMax( sendToAddr );
                console.log( txData );

                // if it returns a successful txData obj, lets pass this info back to HTML
                if ( txData ) {
                    // add to HTML
                    console.log( 'txData = ' + txData );
                    let txHash = txData.txId;

                    let txDataHTML = 'Transaction sent successfully. <br />Tx Hash => <a href="https://blockchair.com/bitcoin-cash/transaction/' + txHash + '" target="_blank">' + txHash + '</a>. <br /><br />';

                    let txDataSpan = document.getElementById( "txdata" );
                    txDataSpan.style.display = "inline";
                    txDataSpan.innerHTML = txDataHTML;

                    // Hide loader GIF
                    document.getElementById( "loader" ).style.display = "none";

                    // Display all balance info with the returned balance - BCH, USD & SATS
                    document.getElementById( 'bal' ).innerHTML = txData.balance.bch + ' BCH';
                    document.getElementById( 'balusd' ).innerHTML = US.format( txData.balance.usd );
                    document.getElementById( 'sats' ).innerHTML = US.format( txData.balance.sat );

                    // Reset the BCH Send Form
                    resetSendBCHform();

                    //TODO: After send, run the reloadBal()

                }

            } catch ( error ) {
                // set error message in HTML
                error = '<br />' + error;
                document.getElementById( 'send-error' ).innerHTML = error;

                // Hide the loader GIF again
                document.getElementById( "loader" ).style.display = "none";
            }


        } else {
            console.log( 'SendMax wasnt checked. Checking for utxo selections.' );


            var sendRequestOptions;

            if ( sendRequestOptions ) {
                console.log( 'sendRequestOptions is not NULL. This means there are custom params for the send (utxo selections)' );



                // clear any existing errors
                document.getElementById( 'send-error' ).innerHTML = null;

                try {

                    // Functioning METHOD OF SENDING WITH SENDMAX - LIMITED TO ONLY THE SELECTED UTXOs.
                    const txData = await wallet.sendMax( sendToAddr, sendRequestOptions );

                    // if it returns a successful txData obj, lets pass this info back to HTML
                    if ( txData ) {
                        // add to HTML
                        console.log( 'TX SUCCESSFUL. txData = ' + txData );
                        let txHash = txData.txId;

                        let txDataHTML = 'Transaction sent successfully. <br />Tx Hash => <a href="https://blockchair.com/bitcoin-cash/transaction/' + txHash + '" target="_blank">' + txHash + '</a>. <br /><br />';

                        let txDataSpan = document.getElementById( "txdata" );
                        txDataSpan.innerHTML = txDataHTML;
                        txDataSpan.style.display = "block";
                        // TODO: Create a Modal or alert for notification of tx sent info.

                        // Hide loader GIF
                        document.getElementById( "loader" ).style.display = "none";

                        // Display all balance info with the returned balance - BCH, USD & SATS
                        document.getElementById( 'bal' ).innerHTML = txData.balance.bch + ' BCH';
                        document.getElementById( 'balusd' ).innerHTML = US.format( txData.balance.usd );
                        document.getElementById( 'sats' ).innerHTML = US.format( txData.balance.sat );

                        // Reset the BCH Send Form
                        resetSendBCHform();
                    }

                } catch ( error ) {
                    // set error in HTML
                    error = '<br />' + error;
                    document.getElementById( 'send-error' ).innerHTML = error;

                    // Hide loader GIF
                    document.getElementById( "loader" ).style.display = "none";
                }



            } else {
                console.log( 'SendRequestOptions is NULL. This means there was no utxo selection. This could mean they manually entered an amount to send (in BCH).' );

                // clear any errors
                document.getElementById( 'send-error' ).innerHTML = null;

                try {
                    console.log( 'continuing with a ( SIMPLE SEND / Custom Amount Send ) of ' + Number( sendTotal ) + ' to ' + sendToAddr + '.' );
                    // SIMPLE SEND with just an address and the custom amount in BCH.
                    const txData = await wallet.send( [
                        {
                            cashaddr: sendToAddr,
                            value: Number( sendTotal ),
                            unit: 'bch'
                            //  sendRequestOptions
                        }
                    ] ); // end txData

                    // if it returns a successful txData obj, lets pass this on to the user
                    if ( txData ) {
                        // add to HTML
                        console.log( 'txData = ' + txData );
                        let txHash = txData.txId;

                        let txDataHTML = 'Transaction sent successfully. <br />Tx Hash => <a href="https://blockchair.com/bitcoin-cash/transaction/' + txHash + '" target="_blank">' + txHash + '</a>. <br /><br />';

                        let txDataSpan = document.getElementById( "txdata" );
                        txDataSpan.innerHTML = txDataHTML;
                        // TODO: Create a Modal for notification of this info.

                        // Hide loader GIF
                        document.getElementById( "loader" ).style.display = "none";

                        // Display all balance info with the returned balance - BCH, USD & SATS
                        document.getElementById( 'bal' ).innerHTML = txData.balance.bch + ' BCH';
                        document.getElementById( 'balusd' ).innerHTML = US.format( txData.balance.usd );
                        document.getElementById( 'sats' ).innerHTML = US.format( txData.balance.sat );

                        // Reset the BCH Send Form
                        resetSendBCHform();

                    } // end if(txData)

                } catch ( error ) { // catch send error
                    // set error in HTML
                    error = '<br />' + error;
                    document.getElementById( 'send-error' ).innerHTML = error;

                    // Hide loader GIF
                    document.getElementById( "loader" ).style.display = "none";

                }

            } // end else (no utxo selection send)
        } // End else for SendMax

    } else { // there are errors. Tell user to fix the errors.

        document.getElementById( 'send-error' ).innerHTML = '<br />Please fix the errors.';

    } // END IF THEREAREERRORS = FALSE;

}





// show hidden mnemonic button
function showMnemonic () {
    console.log( 'showing mnemonic' );
    document.getElementById( "mnemonic" ).style.all = "initial";
    document.getElementById( "lock-open" ).style.display = "inline";
    document.getElementById( "lock" ).style.display = "none";

    //show the hide button
    document.getElementById( "hideMnemonicMenu" ).style.display = "inline";
    document.getElementById( "showMnemonicMenu" ).style.display = "none";

    // filter: blur(50%);
}

// show hidden mnemonic button
function hideMnemonic () {
    console.log( 'hiding mnemonic' );
    document.getElementById( "mnemonic" ).style = "filter: blur(50%);color: transparent;text-shadow: 0 0 5px rgba(0,0,0,0.5);";
    document.getElementById( "lock-open" ).style.display = "none";
    document.getElementById( "lock" ).style.display = "inline";

    //show the hide button
    document.getElementById( "showMnemonicMenu" ).style.display = "inline";
    document.getElementById( "hideMnemonicMenu" ).style.display = "none";

    // filter: blur(50%);
}

function hideMnemonicTab () {
    document.getElementById( "theMnemonic" ).style.display = "none"
}

function showMnemonicTab () {
    document.getElementById( "theMnemonic" ).style.display = "inline"
}


// RUN THIS IF THE MODAL IS CLOSED IN ANY WAY. (Not just the "Close" button)
async function reloadBal () {
    console.log( 'Reload Balance (& UTXOs) func kicked off...' );

    // Get variables for sending and reset all values.
    let sendToAddr = document.getElementById( "sendtoaddress" ).value;
    let sendTotal = document.getElementById( "send-total" ).value;
    let sendMax = document.getElementById( "sendmax" );

    sendToAddr = null;
    sendTotal = null;
    sendMax.checked = false;

    // Creates new/loads existing MAINNET WALLET STORED IN USER BROWSER, referenced by DB_SEED set here.
    const wallet = await Wallet.replaceNamed( DB_SEED, walletId );
    // Get Wallet Balance
    wallet.balance = await wallet.getBalance();
    // Get all UTXOs for wallet. Use this to provide UTXO selection to wallet via datatable
    wallet.utxos = await wallet.getUtxos();
    // Load the wallet and refresh/re-create the datatables. TODO: confirm this doesn't break the datatables...
    loadWallet( wallet );

} // end reloadBal()
async function setSendMax () {

    // Creates new/loads existing MAINNET WALLET STORED IN USER BROWSER, referenced by DB_SEED set here.
    const wallet = await Wallet.named( DB_SEED );
    // Get Wallet Balance
    wallet.balance = await wallet.getBalance()
    console.log( wallet.balance )
    document.getElementById( "send-total" ).value = wallet.balance.bch
    calcUsd()
}
function getNewDepositAddr () {
    // TODO: add this funcitonality when mainnet.js can scan/use other addresses for funds. Right now it's only the one address that you can (EASILY) send/recieve on.
}
// Create a NEW NOTIFICATION for any incoming transactions
let notifLength2 = 0;
function createNotif ( txHash ) {

    notifLength2++;

    document.getElementById( 'notifLength' ).innerHTML = notifLength2;
    document.getElementById( 'notifLength2' ).innerHTML = notifLength2;

    let notifications =
        '<li class="notification-item"  style="overflow:scroll;"> <i class="bi bi-exclamation-circle text-warning"></i><div> <h4>New TX Detected!</h4> <p>TXID/Hash is ' + txHash + '</p> <p><a href="https://blockchair.com/bitcoin-cash/transaction/' + txHash + '" target="_blank">View in Explorer</a></p> </div> </li> <li> <hr class="dropdown-divider"> </li>';
    document.getElementById( 'notifications' ).innerHTML += notifications;


    let txHashURL = '<a href="https://blockchair.com/bitcoin-cash/transaction/' + txHash + '" target="_blank">' + txHash + '</a>'

    document.getElementById( 'txhash' ).innerHTML = txHashURL;


}


// copy function
function copyText () {
    let text = document.getElementById( 'cashaddr' ).innerText;
    console.log( 'text to copy is... ' + text );
    navigator.clipboard.writeText( text.trim() );
    alert( 'The deposit address ' + text + ' was copied to clipboard.' );
}




// Easy selector helper function

const select = ( el, all = false ) => {
    el = el.trim()
    if ( all ) {
        return [ ...document.querySelectorAll( el ) ]
    } else {
        return document.querySelector( el )
    }
}


// Easy event listener function
const on = ( type, el, listener, all = false ) => {
    if ( all ) {
        select( el, all ).forEach( e => e.addEventListener( type, listener ) )
    } else {
        select( el, all ).addEventListener( type, listener )
    }
}


// Easy on scroll event listener
const onscroll = ( el, listener ) => {
    el.addEventListener( 'scroll', listener )
}


// Search bar toggle
if ( select( '.search-bar-toggle' ) ) {
    on( 'click', '.search-bar-toggle', function ( e ) {
        select( '.search-bar' ).classList.toggle( 'search-bar-show' )
    } )
}


//Navbar links active state on scroll
let navbarlinks = select( '#navbar .scrollto', true )
const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach( navbarlink => {
        if ( !navbarlink.hash ) return
        let section = select( navbarlink.hash )
        if ( !section ) return
        if ( position >= section.offsetTop && position <= ( section.offsetTop + section.offsetHeight ) ) {
            navbarlink.classList.add( 'active' )
        } else {
            navbarlink.classList.remove( 'active' )
        }
    } )
}

window.addEventListener( 'load', navbarlinksActive )
onscroll( document, navbarlinksActive )

//. Toggle .header-scrolled class to #header when page is scrolled
let selectHeader = select( '#header' )
if ( selectHeader ) {
    const headerScrolled = () => {
        if ( window.scrollY > 100 ) {
            selectHeader.classList.add( 'header-scrolled' )
        } else {
            selectHeader.classList.remove( 'header-scrolled' )
        }
    }
    window.addEventListener( 'load', headerScrolled )
    onscroll( document, headerScrolled )
}


// Back to top button
let backtotop = select( '.back-to-top' )
if ( backtotop ) {
    const toggleBacktotop = () => {
        if ( window.scrollY > 100 ) {
            backtotop.classList.add( 'active' )
        } else {
            backtotop.classList.remove( 'active' )
        }
    }
    window.addEventListener( 'load', toggleBacktotop )
    onscroll( document, toggleBacktotop )
}


function clearSendForm () {
    document.getElementById( 'sendbchform' ).reset();
}



// Function to calculate the USD total for the send-total input. If the send-total (BCH) input is changed, this function will be kicked
// off to re-calc the USD totals.
function calcUsd () {

    const filterNum = ( str ) => {
        const numericalChar = new Set( [ ".", ",", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9" ] );
        str = str.split( "" ).filter( char => numericalChar.has( char ) ).join( "" );
        return str;
    }

    total = document.getElementById( 'send-total' ),
        totalUsd = document.getElementById( 'send-totalusd' ),
        bal = document.getElementById( 'bal' );

    bal = filterNum( bal.innerHTML );
    console.log( 'balance = ' + bal );

    // Currently using price that was generated on page load.
    var totalUsdVal = US.format( total.value * thebchPrice );
    // Showing user the totals
    totalUsd.innerHTML = totalUsdVal;
    // Debug console log
    //        console.log('total.value = '+ total.value);

    // Check if the user entered send amount is more than user balance and show error if so.
    if ( total.value > Number( bal ) ) {
        console.log( 'user doesnt have enough funds' );
        // show error
        document.getElementById( 'needfunds' ).style.display = 'inline';
    } else {
        // dont show error
        document.getElementById( 'needfunds' ).style.display = 'none';
    }

}


const copyTextOld = async () => {
    try {
        let text = document.getElementById( 'cashaddr' ).innerText;
        await navigator.clipboard.writeText( text );
        console.log( 'Bitcoin Cash address has been copied to clipboard' );
    } catch ( err ) {
        console.error( 'Failed to copy BCH address: ', err );
    }
}

// CUSTOM SCRIPT TO SAVE AS PDF - PAPER WALLET ON THE GO.
//function getPDF() {
//var doc = new jsPDF();
//doc.addHTML(document.body, function() {
//doc.save('test.pdf')
//})
// }


