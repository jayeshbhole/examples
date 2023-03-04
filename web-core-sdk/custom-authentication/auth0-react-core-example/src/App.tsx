import { useEffect, useState } from "react";
import { Web3AuthCore } from "@web3auth/core";
import { WALLET_ADAPTERS, CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import "./App.css";
// import RPC from './ethersRPC' // for using ethers.js
import RPC from "./web3RPC"; // for using web3.js

// testnet
// const clientId = "BP5aL_QCnyKdqyiDUCqmJRRGgqdh-FnqqkolYBKgJczUewBUZyimowuOvOTTFnDYniyp-LU46d7J8N2RpcpkiVc"; // get from https://dashboard.web3auth.io

// cyan
// const clientId = "BBOxcJhcxkrUwD3H5BI6N74oQmt2MeFzbg8iGd8O8pp6trQmWQzEmfEM0iKNbknIzvljCRvAwkznb5MbK6k795I"; // get from https://dashboard.web3auth.io

function App() {
  const [web3auth, setWeb3auth] = useState<Web3AuthCore | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3AuthCore({
          // cyan
          // clientId: "BBOxcJhcxkrUwD3H5BI6N74oQmt2MeFzbg8iGd8O8pp6trQmWQzEmfEM0iKNbknIzvljCRvAwkznb5MbK6k795I",
          // web3AuthNetwork: "cyan",

          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            // chainId: "0x5",
          },

          // testnet
          clientId: "BP5aL_QCnyKdqyiDUCqmJRRGgqdh-FnqqkolYBKgJczUewBUZyimowuOvOTTFnDYniyp-LU46d7J8N2RpcpkiVc",
          web3AuthNetwork: "testnet",
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            uxMode: "popup",
            loginConfig: {
              jwt: {
                verifier: "--sms-human-wallet",
                typeOfLogin: "jwt",
                clientId: "Zl9eV64bYTEVetCTCafh4MwPHOrAq6Fp", //auth0 client id
              },
            },
          },
        });
        web3auth.configureAdapter(openloginAdapter);
        setWeb3auth(web3auth);

        await web3auth.init();
        if (web3auth.provider) {
          setProvider(web3auth.provider);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      loginProvider: "jwt",
      extraLoginOptions: {
        domain: "https://dev-qivh3oikzzwonafa.us.auth0.com", // Please append "https://" before your domain
        verifierIdField: "name",
      },
    });

    setProvider(web3authProvider);
  };

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
  };

  const getChainId = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const chainId = await rpc.getChainId();
    uiConsole(chainId);
  };
  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction();
    uiConsole(receipt);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();
    uiConsole(signedMessage);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();
    uiConsole(privateKey);
  };

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button
            onClick={getUserInfo}
            className="card"
          >
            Get User Info
          </button>
        </div>
        <div>
          <button
            onClick={authenticateUser}
            className="card"
          >
            Get ID Token
          </button>
        </div>
        <div>
          <button
            onClick={getChainId}
            className="card"
          >
            Get Chain ID
          </button>
        </div>
        <div>
          <button
            onClick={getAccounts}
            className="card"
          >
            Get Accounts
          </button>
        </div>
        <div>
          <button
            onClick={getBalance}
            className="card"
          >
            Get Balance
          </button>
        </div>
        <div>
          <button
            onClick={signMessage}
            className="card"
          >
            Sign Message
          </button>
        </div>
        <div>
          <button
            onClick={sendTransaction}
            className="card"
          >
            Send Transaction
          </button>
        </div>
        <div>
          <button
            onClick={getPrivateKey}
            className="card"
          >
            Get Private Key
          </button>
        </div>
        <div>
          <button
            onClick={logout}
            className="card"
          >
            Log Out
          </button>
        </div>
      </div>
      <div
        id="console"
        style={{ whiteSpace: "pre-line" }}
      >
        <p style={{ whiteSpace: "pre-line" }}>Logged in Successfully!</p>
      </div>
    </>
  );

  const unloggedInView = (
    <button
      onClick={login}
      className="card"
    >
      Login
    </button>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a
          target="_blank"
          href="http://web3auth.io/"
          rel="noreferrer"
        >
          Web3Auth
        </a>{" "}
        & ReactJS Example using Auth0
      </h1>

      <div className="grid">{provider ? loggedInView : unloggedInView}</div>
    </div>
  );
}

export default App;
