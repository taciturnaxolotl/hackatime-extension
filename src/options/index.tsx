import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

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
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("hackatimeToken");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    localStorage.setItem("hackatimeToken", token);
    setMessage("Token saved!");
    setAnimate(true);
    setTimeout(() => setAnimate(false), 200); // Reset animation after 300ms
  };

  return (
    <>
      <form method="post" className="flex flex-row self-center w-[60%]" onSubmit={handleSubmit}>
        <input
          type="text"
          name="token"
          className="input-default m-2"
          required
          placeholder="Enter your hackatime token here"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button type="submit" className={`btn-primary m-2 transition-transform duration-150 ${animate ? 'button-pop' : ''}`}>Submit</button>
      </form>
      <p className={`text-text-secondary dark:text-text-dark-secondary italic text-sm transition-transform duration-200 ${animate ? 'animate-pop' : ''}`}>
        {message}
      </p>

      <style>{`
        .animate-pop {
          transform: scale(1.1) rotate(2deg);
        }

        .button-pop {
          transform: scale(1.05);
        }
      `}</style>
    </>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
