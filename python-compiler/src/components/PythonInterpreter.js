import React, { useState, useRef  } from "react";
import { jsPython } from "jspython-interpreter";
import { FiFilePlus, FiFolderPlus, FiRefreshCw, FiShare2 } from "react-icons/fi";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-monokai";

const PythonInterpreter = () => {
  const [pythonCode, setPythonCode] = useState("");
  const [output, setOutput] = useState("");
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [openEditor, setOpenEditor] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [inputType, setInputType] = useState("file");
  const [newFileName, setNewFileName] = useState("");
  const [targetFolder, setTargetFolder] = useState(null);
  const [openFolders, setOpenFolders] = useState({});
  const [debugMode, setDebugMode] = useState(false);
  const [debugLines, setDebugLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const breakpointsRef = useRef([]);
  const aceRef = useRef();

  const runPythonCode = async () => {
    try {
      const interpreter = jsPython();
      let stdout = [];

      interpreter.assignGlobalContext({
        print: (...args) => {
          stdout.push(args.join(" "), "\n");
        },
      });

      await interpreter.evaluate(pythonCode);
      setOutput(stdout.join(""));
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const startDebug = () => {
    setDebugMode(true);
    const lines = pythonCode.split("\n");
    setDebugLines(lines);
    setCurrentLine(0);
    setOutput("");
  };

  const stepDebug = async () => {
    if (currentLine >= debugLines.length) {
      setDebugMode(false);
      return;
    }

    try {
      while (currentLine < debugLines.length &&
             breakpointsRef.current.length > 0 &&
             !breakpointsRef.current.includes(currentLine)) {
        setCurrentLine((prev) => prev + 1);
        return;
      }

      const interpreter = jsPython();
      let stdout = [];

      interpreter.assignGlobalContext({
        print: (...args) => {
          stdout.push(args.join(" "), "\n");
        },
      });

      const codeToRun = debugLines.slice(0, currentLine + 1).join("\n");
      await interpreter.evaluate(codeToRun);
      setOutput(stdout.join(""));
      setCurrentLine((prev) => prev + 1);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const toggleFolder = (folderName) => {
    setOpenFolders({ ...openFolders, [folderName]: !openFolders[folderName] });
  };

  const saveFile = () => {
    if (newFileName.trim() === "") {
      alert("Lütfen bir dosya adı girin.");
      return;
    }

    const fileObj = {
      name: newFileName.trim(),
      content: pythonCode,
      folder: targetFolder,
    };

    setFiles([...files, fileObj]);
    setOpenEditor(newFileName.trim());
    setNewFileName("");
    setShowInput(false);
    setTargetFolder(null);
  };

  const deleteFile = (fileName) => {
    const updatedFiles = files.filter((file) => file.name !== fileName);
    setFiles(updatedFiles);
    if (openEditor === fileName) setOpenEditor(null);
  };

  const createFolder = () => {
    setInputType("folder");
    setShowInput(true);
    setTargetFolder(null);
  };

  const addFolder = () => {
    if (newFileName.trim() === "") return;
    const name = newFileName.trim();
    if (!folders.includes(name)) {
      setFolders([...folders, name]);
    } else {
      alert("Bu klasör zaten var.");
    }
    setNewFileName("");
    setShowInput(false);
  };

  const refresh = () => {
    alert("Dosyalar yenilendi.");
  };

  const share = () => {
    alert("Paylaşma özelliği henüz aktif değil.");
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif", position: "relative" }}>
      {debugMode && (
        <div style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", zIndex: 10, backgroundColor: "#333", padding: "10px", borderRadius: "8px" }}>
          <button onClick={stepDebug} style={{ marginRight: "10px", padding: "6px 12px", fontSize: "14px" }}>Step</button>
          <button onClick={() => setDebugMode(false)} style={{ padding: "6px 12px", fontSize: "14px" }}>Stop</button>
        </div>
      )}

      <div style={{ width: "300px", background: "#1e1e1e", color: "white", padding: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ color: "#c586c0" }}>GalacDUS</strong>
          <div style={{ display: "flex", gap: "10px" }}>
            <FiFilePlus
              onClick={() => {
                setShowInput(true);
                setInputType("file");
                setTargetFolder(null);
              }}
              style={{ cursor: "pointer" }}
              title="Create File"
            />
            <FiFolderPlus onClick={createFolder} style={{ cursor: "pointer" }} title="Create Folder" />
            <FiRefreshCw onClick={refresh} style={{ cursor: "pointer" }} title="Refresh" />
            <FiShare2 onClick={share} style={{ cursor: "pointer" }} />
          </div>
        </div>

        {/* Dinamik Input Alanı */}
        {showInput && (
          <div style={{ marginTop: "10px" }}>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder={`Yeni ${inputType === "folder" ? "klasör" : "dosya"} adı`}
              style={{ width: "90%", padding: "5px", fontSize: "14px",backgroundColor:"#272822",color:"whitesmoke",border:"1px solid #555",borderRadius:"4px" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  inputType === "folder" ? addFolder() : saveFile();
                }
              }}
            />
          </div>
        )}

        {/* Open Editors */}
        <div style={{ marginTop: "30px", fontSize: "12px", color: "#569cd6" }}>
          <strong>OPEN EDITORS</strong>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {openEditor && (
              <li>
                <span style={{ color: "#d4d4d4" }}>📄 {openEditor}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Explorer */}
        <div style={{ marginTop: "20px", fontSize: "12px", color: "#dcdcaa" }}>
          <strong>EXPLORER</strong>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {folders.map((folder, idx) => (
              <li key={idx} style={{ marginTop: "5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div
                    onClick={() => toggleFolder(folder)}
                    style={{ cursor: "pointer", fontWeight: "bold", color: "#f9f79f" }}
                  >
                    {openFolders[folder] ? "▼" : "▶"} 🗂️ {folder}
                  </div>
                  <button
                    onClick={() => {
                      setShowInput(true);
                      setInputType("file");
                      setTargetFolder(folder);
                    }}
                    style={{ padding: "2px 6px", fontSize: "12px", cursor: "pointer" }}
                  >
                    <FiFilePlus />
                  </button>
                </div>
                {openFolders[folder] && (
                  <ul style={{ marginTop: "5px" }}>
                    {files
                      .filter((file) => file.folder === folder)
                      .map((file, index) => (
                        <li
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "5px",
                            backgroundColor: "#252526",
                            padding: "5px",
                            borderRadius: "4px",
                          }}
                        >
                          <span style={{ color: "#d4d4d4" }}>📄 {file.name}</span>
                          <span>
                            <button
                              onClick={() => {
                                setPythonCode(file.content);
                                setOpenEditor(file.name);
                              }}
                              style={{ marginRight: "5px", padding: "2px 6px", cursor: "pointer" }}
                            >
                              Load
                            </button>
                            <button
                              onClick={() => deleteFile(file.name)}
                              style={{
                                padding: "2px 6px",
                                backgroundColor: "red",
                                color: "white",
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}

            {/* Kök dizindeki dosyalar */}
            {files
              .filter((file) => !file.folder)
              .map((file, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "5px",
                    backgroundColor: "#252526",
                    padding: "5px",
                    borderRadius: "4px",
                  }}
                >
                  <span style={{ color: "#d4d4d4" }}>📄 {file.name}</span>
                  <span>
                    <button
                      onClick={() => {
                        setPythonCode(file.content);
                        setOpenEditor(file.name);
                      }}
                      style={{ marginRight: "5px", padding: "2px 6px", cursor: "pointer" }}
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteFile(file.name)}
                      style={{
                        padding: "2px 6px",
                        backgroundColor: "red",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div style={{ flexGrow: 1, backgroundColor: "#272822" }}>
        <div style={{ marginTop: "10px", marginBottom: "10px", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <div>
            <button onClick={runPythonCode} style={{ backgroundColor: "green", padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>Run</button>
            <button onClick={saveFile} style={{ backgroundColor: "green", padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>Save</button>
            <button onClick={startDebug} style={{ backgroundColor: "orange", padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>Debug</button>
          </div>
        </div>

        <h1 style={{ marginTop: "1px", width: "100px", marginBottom: "1px", display: "flex", color: "whitesmoke", fontSize: "20px", border: "1px solid #333" }}>{openEditor || "file.name"}</h1>

        <div style={{ display: "flex", height: "87%", borderTop: "1px solid #555", borderBottom: "1px solid #555" }}>
          <div style={{ flex: 1 }}>
            <AceEditor
              mode="python"
              theme="monokai"
              name="python_ace_editor"
              value={pythonCode}
              ref={aceRef}
              onChange={(newValue) => setPythonCode(newValue)}
              editorProps={{ $blockScrolling: true }}
              highlightActiveLine={true}
              highlightGutterLine={true}
              setOptions={{
                useWorker: false,
                fontSize: 18,
                showPrintMargin: false,
                showLineNumbers: true,
                tabSize: 2,
              }}
              onLoad={(editor) => {
                aceRef.current = { editor }; 
                editor.on("guttermousedown", function (e) {
                  const target = e.domEvent.target;
                  if (target.className.indexOf("ace_gutter-cell") === -1) return;
                  const row = e.getDocumentPosition().row;
                  const breakpoints = editor.session.getBreakpoints();

                  if (typeof breakpoints[row] === "undefined") {
                    editor.session.setBreakpoint(row);
                    if (!breakpointsRef.current.includes(row)) {
                      breakpointsRef.current.push(row);
                    }
                  } else {
                    editor.session.clearBreakpoint(row);
                    breakpointsRef.current = breakpointsRef.current.filter((r) => r !== row);
                  }
                  e.stop();
                });
              }}
              style={{ width: "100%", height: "100%", borderRight: "1px solid #555" }}
            />
          </div>
          <div style={{ flex: 1, background: "#272822" }}>
            <pre style={{ background: "#272822", margin: "0px", overflow: "auto", height: "100%", fontSize: "20px", color: "whitesmoke", paddingLeft: "5px" }}>{output}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythonInterpreter;
