import { useEffect } from "react";
import { auth } from "./firebase-config";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { TextEditor } from "./components/TextEditor";

function App() {
  useEffect(() => {
    signInAnonymously(auth);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed in:", user.uid);
      }
    });
  });
  return (
    <div className="App">
      <header>
        <img src="/doc-icon.svg" alt="document icon" className="doc-icon" />
        <h1>Cool Text Editor</h1>
      </header>

      <TextEditor />
    </div>
  );
}

export default App;
