import React, { useState } from "react";
import { jsPython } from "jspython-interpreter";

const PythonInterpreter = () => {
  const [pythonCode, setPythonCode] = useState(""); // Kullanıcının yazdığı Python kodu
  const [output, setOutput] = useState(""); // Çıktı
  const [files, setFiles] = useState([]); // Kayıtlı dosyaların listesi
  const [newFileName, setNewFileName] = useState(""); // Yeni dosya adı

  const runPythonCode = async () => {
    try {
      const interpreter = jsPython();

      let stdout = []; // Çıktıları toplamak için bir array tanımlıyoruz
      interpreter.assignGlobalContext({
        print: (...args) => {
          stdout.push(args.join(" "), "\n"); // Her çıktıyı array'e ekliyoruz
        },
      });

      // Python kodunu çalıştır
      const result = await interpreter.evaluate(pythonCode);

      console.log("Python'dan dönen sonuç:", result);

      // Toplanan çıktıyı Output kısmına aktar
      setOutput(stdout.join("")); // Çıktıları string olarak set ediyoruz
    } catch (error) {
      setOutput(`Error: ${error.message}`); // Hata durumunda hata mesajını döndürüyoruz
    }
  };

  const saveFile = () => {
    if (newFileName.trim() === "") {
      alert("Lütfen bir dosya adı girin.");
      return;
    }

    const newFile = { name: newFileName, content: pythonCode };
    setFiles([...files, newFile]);
    setNewFileName("");
    alert(`Dosya '${newFileName}' kaydedildi.`);
  };

  const deleteFile = (fileName) => {
    const updatedFiles = files.filter((file) => file.name !== fileName);
    setFiles(updatedFiles);
    alert(`Dosya '${fileName}' silindi.`);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Python Interpreter</h1>
      <textarea
        value={pythonCode}
        onChange={(e) => setPythonCode(e.target.value)}
        placeholder="Python kodunuzu buraya yazın..."
        rows={10}
        cols={50}
        style={{ width: "100%", fontSize: "16px", padding: "10px" }}
      />
      <div style={{ marginTop: "10px" }}>
        <button
          onClick={runPythonCode}
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", marginRight: "10px" }}
        >
          Run
        </button>
        <button
          onClick={saveFile}
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
        >
          Save
        </button>
      </div>
      <h2>Output:</h2>
      <pre style={{ background: "#f4f4f4", padding: "10px" }}>{output}</pre>

      <h2>Files:</h2>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder="Yeni dosya adı"
          style={{ padding: "10px", fontSize: "16px", marginRight: "10px" }}
        />
        <button
          onClick={saveFile}
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
        >
          New File
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>File Name</th>
            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{file.name}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <button
                  onClick={() => setPythonCode(file.content)}
                  style={{ padding: "5px 10px", fontSize: "14px", cursor: "pointer", marginRight: "10px" }}
                >
                  Load
                </button>
                <button
                  onClick={() => deleteFile(file.name)}
                  style={{ padding: "5px 10px", fontSize: "14px", cursor: "pointer", backgroundColor: "red", color: "white" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PythonInterpreter;
