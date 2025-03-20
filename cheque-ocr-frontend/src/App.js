"use client"

import { useState, useEffect } from "react"
import "./App.css"
import * as XLSX from "xlsx"
import "bootstrap/dist/css/bootstrap.min.css"

function App() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [processingProgress, setProcessingProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState("")

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files))
  }

  const handleProcess = async () => {
    if (files.length === 0) {
      alert("Please select one or more images.")
      return
    }

    setLoading(true)
    setResults([])
    setProcessingProgress(0)

    const allResults = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setCurrentFile(file.name)
      
      // Update progress based on current file index
      const progress = Math.round(((i) / files.length) * 100)
      setProcessingProgress(progress)

      try {
        const compressedFile = await compressImage(file, 0.7)
        const formData = new FormData()
        formData.append("file", compressedFile, file.name)

        const response = await fetch("http://127.0.0.1:8000/process", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        allResults.push(data)
        
        // Update progress after file is processed
        const newProgress = Math.round(((i + 1) / files.length) * 100)
        setProcessingProgress(newProgress)
      } catch (error) {
        alert(`Error processing ${file.name}: ${error.message}`)
        console.error("Error:", error)
      }
    }

    // Simulate a slight delay before completing to show 100% progress
    setProcessingProgress(100)
    setTimeout(() => {
      setLoading(false)
      setResults(allResults)
      createAndDownloadExcel(allResults)
    }, 500)
  }

  const compressImage = (file, quality) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")
          ctx.drawImage(img, 0, 0)
          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, { type: file.type }))
            },
            file.type,
            quality,
          )
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const cleanString = (str) => {
    if (!str) return ""
    return str.replace(/\*/g, "").trim()
  }

  const createAndDownloadExcel = (data) => {
    const newData = data.map((item, index) => {
        // Clean all fields
        let cleanedIssuer = cleanString(item.Issuer);
        let cleanedPayee = cleanString(item.Payee);
        let cleanedDate = cleanString(item.Date);
        
        // Special handling for amount to format as currency
        let cleanedAmount = cleanString(item.Amount);
        if (cleanedAmount) {
            // Remove any existing currency symbols or non-numeric characters except . and ,
            cleanedAmount = cleanedAmount.replace(/[^0-9.,]/g, '');
            const parsedAmount = parseFloat(cleanedAmount.replace(/,/g, ''));
            if (!isNaN(parsedAmount)) {
                cleanedAmount = '$' + parsedAmount.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                });
            } else {
                cleanedAmount = '$0.00'; // Default value if parsing fails
            }
        } else {
            cleanedAmount = '$0.00'; // Default value if amount is empty
        }

        return {
            'Sl. No.': index + 1,
            'Issuer': cleanedIssuer,
            'Payee': cleanedPayee,
            'Amount': cleanedAmount,
            'Date': cleanedDate
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(newData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cheque Data");
    XLSX.writeFile(workbook, "cheque_data.xlsx");
};

  return (
    <div className="container-fluid split-screen">
      <div className="left-section">
        <div className="content-wrapper">
          <h1 className="app-title">Cheque Digitization</h1>
          <div className="steps">
            <h2>How It Works</h2>
            <ol>
              <li>
                <strong>Select Cheque Images:</strong> Choose one or more cheque images from your device.
              </li>
              <li>
                <strong>Process Cheques:</strong> Click the "Process Cheques" button to extract the data.
              </li>
              <li>
                <strong>Download Excel:</strong> Download the extracted data as an Excel file.
              </li>
            </ol>
          </div>
        </div>
      </div>
      <div className="right-section">
        <div className="fixed-header">
          <div className="input-area">
            <h2 className="section-title">Upload Cheques</h2>
            <input type="file" onChange={handleFileChange} accept="image/*" multiple className="form-control mb-3" />
            <button onClick={handleProcess} className="btn btn-primary w-100" disabled={loading}>
              {loading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </span>
              ) : (
                "Process Cheques"
              )}
            </button>
          </div>
        </div>
        <div className="scrollable-content">
          {loading && (
            <div className="loading-container">
              <div className="loading-card">
                <div className="loading-animation">
                  <div className="document-icon">
                    <div className="page"></div>
                    <div className="page"></div>
                    <div className="page"></div>
                  </div>
                  <div className="scan-line"></div>
                </div>
                <h3 className="processing-title">Processing Cheques</h3>
                <div className="progress-container">
                  <div className="progress">
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar" 
                      style={{ width: `${processingProgress}%` }}
                      aria-valuenow={processingProgress} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    >
                      {processingProgress}%
                    </div>
                  </div>
                </div>
                <p className="current-file">
                  {currentFile && <span>Processing: {currentFile}</span>}
                </p>
                <div className="processing-steps">
                  <div className={`step ${processingProgress > 0 ? 'active' : ''}`}>
                    <div className="step-icon">1</div>
                    <div className="step-text">Reading Files</div>
                  </div>
                  <div className={`step ${processingProgress > 30 ? 'active' : ''}`}>
                    <div className="step-icon">2</div>
                    <div className="step-text">Analyzing</div>
                  </div>
                  <div className={`step ${processingProgress > 60 ? 'active' : ''}`}>
                    <div className="step-icon">3</div>
                    <div className="step-text">Extracting Data</div>
                  </div>
                  <div className={`step ${processingProgress > 90 ? 'active' : ''}`}>
                    <div className="step-icon">4</div>
                    <div className="step-text">Finalizing</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {results.length > 0 && (
  <div className="results-section mt-4 fade-in">
    <h2 className="section-title">Extracted Data</h2>
    {results.map((result, index) => {
      // Clean all fields for display
      const cleanedIssuer = result.Issuer ? result.Issuer.replace(/\*/g, '') : '';
      const cleanedPayee = result.Payee ? result.Payee.replace(/\*/g, '') : '';
      const cleanedDate = result.Date ? result.Date.replace(/\*/g, '') : '';
      
      // Clean and format amount with dollar sign
      let cleanedAmount = result.Amount ? result.Amount.replace(/\*/g, '') : '';
      if (cleanedAmount) {
        // Remove any existing currency symbols or non-numeric characters except . and ,
        cleanedAmount = cleanedAmount.replace(/[^0-9.,]/g, '');
        const parsedAmount = parseFloat(cleanedAmount.replace(/,/g, ''));
        if (!isNaN(parsedAmount)) {
          cleanedAmount = '$' + parsedAmount.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          });
        } else {
          cleanedAmount = '$0.00'; // Default value if parsing fails
        }
      } else {
        cleanedAmount = '$0.00'; // Default value if amount is empty
      }
      
      return (
        <div key={index} className="result-instance slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <h3>Instance {index + 1}</h3>
          <div className="result-grid">
            <div className="result-item" id="issuer">
              <span className="label">Issuer:</span> {cleanedIssuer}
            </div>
            <div className="result-item" id="payee">
              <span className="label">Payee:</span> {cleanedPayee}
            </div>
            <div className="result-item" id="amount">
              <span className="label">Amount:</span> {cleanedAmount}
            </div>
            <div className="result-item" id="date">
              <span className="label">Date:</span> {cleanedDate}
            </div>
          </div>
        </div>
      );
    })}
  </div>
)}
        </div>
      </div>
    </div>
  )
}

export default App
