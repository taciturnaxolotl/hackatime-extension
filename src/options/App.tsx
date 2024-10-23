import { useState } from "react";
import { useChromeStorageLocal } from "use-chrome-storage";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const App = () => (
  <div className="flex flex-col items-center">
    <h1 className="text-primary">Hi!</h1>
    <p>Welcome to your Hackatime extension!</p>
    <p>
      This is a work in progress. The goal is to help you track the time you
      spend on different websites.
    </p>
    <TokenForm />
  </div>
);

const TokenForm = () => {
  const [token, setToken] = useChromeStorageLocal('token', "");
  const [message, setMessage] = useState("");
  const [animate, setAnimate] = useState(false);
  const [hideAnimate, setHideAnimate] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setToken(token);
    setMessage("Token saved!");
    setAnimate(true);
    setTimeout(() => setAnimate(false), 200); // Reset animation after 200ms
  };

  return (
    <>
      <form method="post" className="flex flex-row self-center w-[60%]" onSubmit={handleSubmit}>
        <div className="relative w-full">
          <input
        type={showToken ? "text" : "password"}
        name="token"
        className="input-default m-2 w-full !pr-8"
        required
        placeholder="Enter your hackatime token here"
        value={token}
        onChange={(e) => setToken(e.target.value)}
          />
            <button type="button" className={`absolute right-1 top-1/2 transform -translate-y-1/2 scale-125 transition-transform duration-75 ${hideAnimate ? showToken ? '!scale-110' : 'scale-135' : ''}`} onClick={() => { setShowToken(!showToken); setHideAnimate(true); setTimeout(() => setHideAnimate(false), 100); }}>
            {showToken ? <AiFillEye/> : <AiFillEyeInvisible/>}
            </button>
        </div>
        <button type="submit" className={`btn-primary m-2 transition-transform duration-150 ml-5 ${animate ? 'button-pop' : ''}`}>Submit</button>
      </form>
      <p className={`text-text-secondary dark:text-text-dark-secondary italic text-sm transition-transform duration-200 ${animate ? 'animate-pop' : ''}`}>
        {message}
      </p>

      <style>{`
        .animate-pop {
          transform: scale(1.1) rotate(2deg);
        }

        .scale-135 {
          --tw-scale-x: 1.35;
          --tw-scale-y: 1.35;
        }

        .button-pop {
          transform: scale(1.05);
        }
      `}</style>
    </>
  );
};

export default App;