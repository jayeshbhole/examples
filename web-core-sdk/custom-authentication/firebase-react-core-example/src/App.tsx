import { CHAIN_NAMESPACES, SafeEventEmitterProvider, WALLET_ADAPTERS } from "@web3auth/base";
import { Web3AuthCore } from "@web3auth/core";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { useEffect, useRef, useState } from "react";
import "./App.css";
// import RPC from "./evm.web3";
import { initializeApp } from "firebase/app";
import { ConfirmationResult, RecaptchaVerifier, User, getAuth, signInWithPhoneNumber } from "firebase/auth";
import RPC from "./evm.ethers";

const clientId = "BP5aL_QCnyKdqyiDUCqmJRRGgqdh-FnqqkolYBKgJczUewBUZyimowuOvOTTFnDYniyp-LU46d7J8N2RpcpkiVc"; // get from https://dashboard.web3auth.io

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9CJtCzBqGsC0cJFebPK2S-cgzllhdZYQ",
  authDomain: "human-wallet-9863e.firebaseapp.com",
  projectId: "human-wallet-9863e",
  storageBucket: "human-wallet-9863e.appspot.com",
  messagingSenderId: "290641545437",
  appId: "1:290641545437:web:2edba62e13ff47402a7334",
  measurementId: "G-6DL8VMY3XY",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [web3auth, setWeb3auth] = useState<Web3AuthCore | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);

  const [phoneNumber, setPhoneNumber] = useState<string>("+918424009195");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const recaptchaContainer = useRef<HTMLDivElement>(null);

  const [applicationVerifier, setApplicationVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!recaptchaContainer.current) return;

    setApplicationVerifier(
      new RecaptchaVerifier(
        recaptchaContainer.current as HTMLDivElement,
        {
          size: "invisible",
        },
        auth
      )
    );
  }, [recaptchaContainer.current]);

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3AuthCore({
          clientId,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x5",
          },
          web3AuthNetwork: "testnet",
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            uxMode: "popup",
            loginConfig: {
              jwt: {
                verifier: "wallet-firebase",
                typeOfLogin: "jwt",
                clientId,
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

  const requestOTP = async () => {
    if (!applicationVerifier) {
      console.log("applicationVerifier not initialized yet");
      return;
    }
    try {
      console.log("requestOTP", phoneNumber);

      const res = await signInWithPhoneNumber(auth, phoneNumber, applicationVerifier);
      console.log(res);

      setConfirmationResult(res);
      return res;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const verifyOTP = async () => {
    if (!confirmationResult || !verificationCode) {
      console.log("confirmationResult not initialized yet or verification code not entered");
      return;
    }

    try {
      // verify otp
      const loginRes = await confirmationResult.confirm(verificationCode);
      console.log("login details", loginRes);

      setUser(loginRes.user);
    } catch (err) {
      console.error(err);
    }
  };

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    if (!confirmationResult || !verificationCode) {
      console.log("confirmationResult not initialized yet or verification code not entered");
      return;
    }
    if (!user) {
      console.log("user not initialized yet");
      return;
    }

    try {
      const idToken = await user.getIdToken(true);
      console.log("idToken", idToken);

      const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
        loginProvider: "jwt",
        extraLoginOptions: {
          id_token: idToken,
          verifierIdField: "sub",
          domain: "http://localhost:3000",
        },
      });
      setProvider(web3authProvider);
    } catch (err) {
      console.error(err);
    }
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

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const userAccount = await rpc.getAccounts();
    uiConsole(userAccount);
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

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.signMessage();
    uiConsole(result);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.signAndSendTransaction();
    uiConsole(result);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const loginView = (
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

  const logoutView = (
    <>
      <div>
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />

        <button onClick={requestOTP}>Send OTP</button>

        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
        />

        <button onClick={verifyOTP}>Verify OTP</button>

        <button onClick={login}>Login</button>
      </div>
    </>
  );

  return (
    <div className="container">
      <div
        id="recaptcha-container"
        ref={recaptchaContainer}
      ></div>
      <h1 className="title">
        <a
          target="_blank"
          href="http://web3auth.io/"
          rel="noreferrer"
        >
          Web3Auth
        </a>{" "}
        & Firebase React Example for Google Login
      </h1>

      <div className="grid">{provider ? loginView : logoutView}</div>

      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/examples/tree/main/web-core-sdk/custom-authentication/firebase-react-core-example"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
      </footer>
    </div>
  );
}

export default App;
