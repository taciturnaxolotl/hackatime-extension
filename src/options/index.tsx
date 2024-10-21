import { createRoot } from "react-dom/client";
const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(
    <div className="flex flex-col items-center">
      <h1 className="text-primary">Hi!</h1>
      <p>Welcome to your Hackatime extension!</p>

      <p>
        This is a work in progress. The goal is to help you track the time you
        spend on different websites.
      </p>

      <form method="post" className="flex flex-row self-center w-[60%]">
            <input type="text" name="token" className="input-default m-2" required placeholder="Enter your hackatime token here" />
            <button type="submit" className="btn-primary m-2">Submit</button>
      </form>
    </div>
  );
}
