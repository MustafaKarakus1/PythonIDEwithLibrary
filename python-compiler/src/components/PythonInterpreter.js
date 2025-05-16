import React, { useState } from "react";
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
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Sol Panel */}
      <div style={{ width: "300px", background: "#1e1e1e", color: "white", padding: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ color: "#c586c0" }}>SCENARIOS</strong>
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
              style={{ width: "100%", padding: "5px", fontSize: "14px" }}
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

      {/* Sağ Panel */}
      <div style={{ flexGrow: 1, backgroundColor: "#272822" }}>
        <div style={{ marginTop: "10px" ,  marginBottom:"10px", display: "flex", justifyContent: "flex-end", alignItems: "center"}}>
          <button
            onClick={runPythonCode}
            style={{ backgroundColor:"green", padding: "10px 20px", fontSize: "16px", cursor: "pointer"  }}
          >
            Run
          </button>
          <button
            onClick={saveFile}
            style={{  backgroundColor:"green", padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
          >
            Save
          </button>
        </div>
        <AceEditor
          mode="python"
          theme="monokai"
          name="python_ace_editor"
          value={pythonCode}
          onChange={(newValue) => setPythonCode(newValue)}
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            useWorker: false,
            fontSize: 16,
            showPrintMargin: false,
            showLineNumbers: true,
            tabSize: 2,
          }}
          style={{ width: "100%", height: "93%", marginBottom: "10px" }}
        />
        <h2>Output:</h2>
        <pre style={{ background: "#eaeaea", padding: "10px" }}>{output}</pre>
      </div>
    </div>
  );
};

export default PythonInterpreter;
