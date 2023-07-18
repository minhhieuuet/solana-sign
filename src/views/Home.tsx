import { useState, useEffect } from "react";
import * as nacl from 'tweetnacl';
export const Home = () => {
  const message = `Please sign this message to verify this wallet belongs to you.`;
  const [walletKey, setWalletKey] = useState('');
  const [signature, setSignedSignature] = useState('');
  const [publicKey, setPublicKey] = useState('');

  useEffect(() => {
    (async () => {
      // @ts-ignore
      const { solana } = window;
      // @ts-ignore
      if (!window.solana.isConnected) {
        const response = await solana.connect();
        setWalletKey(solana.publicKey.toString());
        console.log("connected")
      }
    })();
  }, [])

  const getProvider = () => {
    if ('phantom' in window) {
      // @ts-ignore
      const provider = window.phantom?.solana;

      if (provider?.isPhantom) {
        return provider;
      }
    }

    window.open('https://phantom.app/', '_blank');
  };
  const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    if (solana) {
      try {
        const response = await solana.connect();
        setWalletKey(response.publicKey.toString());
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
        // @ts-ignore
        if (err && err?.code == 4001) {
          console.log('User rejected the request.')
        }
      }
    }
  };
  const signMessage = async () => {
    const provider = getProvider(); // see "Detecting the Provider"
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await provider.signMessage(encodedMessage, "utf8");
    console.log(signedMessage.publicKey.toBuffer())
    setPublicKey(Buffer.from(signedMessage.publicKey.toBuffer()).toString("base64"));
    setSignedSignature(Buffer.from(signedMessage.signature).toString("base64"));
  }

  const disconnectWallet = async () => {
    //@ts-ignore
    const { solana } = window;

    if (solana) {
      try {
        const response = await solana.disconnect();
        setWalletKey('');
      } catch (err) {
        console.log(err)
      }
    }
  }

  const verify = async () => {
    if(signature == '') {
      alert('Please sign a message first')
      return
    }
    let signatureBuffer = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    let publicKeyBuffer = Uint8Array.from(atob(publicKey), c => c.charCodeAt(0));
    const verified = nacl.sign.detached.verify(new TextEncoder().encode(message), signatureBuffer, publicKeyBuffer);
    if(verified) {
      alert('Verified!')
    } else {
      alert('Not verified!')
    }

  }

  return (
    <section className="text-gray-600 body-font relative p-10">
      {walletKey == '' ?
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-8" onClick={connectWallet}>Connect Phantom</button>
        : <button className="bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-8" onClick={disconnectWallet}>Disconnect Phantom</button>}
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-8" onClick={signMessage}>Sign Message</button>
      <button className="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-8" onClick={verify}>Verify</button>
      <br />
      <div className="p-4">
        <p><b>Connected Wallet:</b> {walletKey}</p>
        {signature !== '' &&
          <p><b>Signature: </b>{signature}</p>
        }
      </div>
    </section>
  );
};
