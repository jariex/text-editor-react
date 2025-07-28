import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import { setDoc, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase-config";
import "./styles/TextEditor.css";
import "react-quill/dist/quill.snow.css";
import { throttle } from "lodash";
import { collection, getDocs } from "firebase/firestore";

export const TextEditor = () => {
  const quillRef = useRef<any>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const isLocalChange = useRef(false);

  const [docId, setDocId] = useState(""); // input
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null); // doc abierto
  const [docList, setDocList] = useState<string[]>([]);

  // Crear / abrir documento
  const handleSelect = async () => {
    const id = docId.trim();
    if (!id) return;

    const ref = doc(db, "documents", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { content: [] });
    }
    setSelectedDoc(id);
  };

  // Guardar contenido en Firebase (acelerado con throttle)
  const saveContent = throttle((documentRef: any) => {
    if (quillRef.current && isLocalChange.current) {
      const content = quillRef.current.getEditor().getContents();
      console.log("saving content to DB:", content);
      setDoc(documentRef, { content: content.ops }, { merge: true })
        .then(() => console.log("content saved"))
        .catch(console.error);
      isLocalChange.current = false;
    }
  }, 1300);

  //Carga la lista de documentos existentes
  useEffect(() => {
    const fetchDocuments = async () => {
      const querySnapshot = await getDocs(collection(db, "documents"));
      const ids = querySnapshot.docs.map((doc) => doc.id);
      setDocList(ids);
    };

    fetchDocuments();
  }, []);

  // Cargar documento seleccionado
  useEffect(() => {
    if (!quillRef.current || !selectedDoc) return;

    const documentRef = doc(db, "documents", selectedDoc);

    getDoc(documentRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const savedContent = docSnap.data().content;
          if (savedContent) {
            quillRef.current.getEditor().setContents(savedContent);
          }
        } else {
          console.log("No document found. Starting with a blank editor");
        }
      })
      .catch(console.error);

    const unsubscribe = onSnapshot(documentRef, (snapshot) => {
      if (snapshot.exists()) {
        const newContent = snapshot.data().content;

        if (!isEditing) {
          const editor = quillRef.current.getEditor();
          const currentCursorPosition = editor.getSelection()?.index || 0;

          editor.setContents(newContent, "silent");
          editor.setSelection(currentCursorPosition);
        }
      }
    });

    const editor = quillRef.current.getEditor();

    editor.on("text-change", (delta: any, oldDelta: any, source: any) => {
      if (source === "user") {
        isLocalChange.current = true;
        setIsEditing(true);
        saveContent(documentRef);

        setTimeout(() => {
          setIsEditing(false);
        }, 5000);
      }
    });

    return () => {
      unsubscribe();
      editor.off("text-change");
    };
  }, [selectedDoc]);

  return (
    <div className="editor-layout">
      <div className="doc-selector">
        <h3>Recent documents</h3>
        <input
          type="text"
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
          placeholder="Create or open recent doc..."
        />
        <button onClick={handleSelect}>Crear / Abrir</button>

        <ul className="doc-list">
          {docList.map((docId) => (
            <li key={docId} onClick={() => setSelectedDoc(docId)}>
              {docId}
            </li>
          ))}
        </ul>
      </div>

      <div className="editor-wrapper">
        <div className="editor-container">
          <ReactQuill ref={quillRef} theme="snow" />
        </div>
      </div>
    </div>
  );
};
