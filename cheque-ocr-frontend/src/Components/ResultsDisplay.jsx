import React from 'react';

function ResultsDisplay({ results }) {
    return (
        <div className="results-container">
            <h2>Extracted Data:</h2>
            <div className="scrollable-results">
                {results.map((result, index) => (
                    <div key={index} className="result-instance">
                        <h3>Instance {index + 1}</h3>
                        <div id="issuer">Issuer: {result.Issuer}</div>
                        <div id="payee">Payee: {result.Payee}</div>
                        <div id="amount">Amount: {result.Amount}</div>
                        <div id="date">Date: {result.Date}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ResultsDisplay;