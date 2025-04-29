# 🧾 Cheque Digitization App

This project is a full-stack application designed to **extract structured data from cheque images** using **Google Cloud Document AI**. It enables users to upload multiple cheque images, automatically extracts information such as issuer, payee, amount, and date, and generates a downloadable Excel sheet with the extracted results.

## 🚀 Features

- Upload multiple cheque images
- Real-time progress feedback during processing
- OCR-powered data extraction via Google Document AI
- Automatic formatting and export to Excel
- Responsive UI built with React and Bootstrap

## 📦 Tech Stack

| Frontend                | Backend    | Cloud                |
|------------------------|------------|----------------------|
| React.js + Bootstrap   | FastAPI    | Google Document AI   |

## 🛠️ Setup Instructions

### 1. Clone the Repository



### 2. Backend Setup (FastAPI + Document AI)

**Requirements**:

- Python 3.9+
- Google Cloud SDK & Document AI enabled
- A service account key (`vision_key.json`)

### Install dependencies:

```bash
pip install fastapi uvicorn google-cloud-documentai python-multipart
```

### Run the backend server:

```bash
uvicorn main:app --reload
```

### 3. Frontend Setup (React)

**Requirements**:

- Node.js and npm installed

**Steps**:

```bash
cd frontend
npm install
npm start
```

## 📸 How It Works

1. Upload cheque image(s) via the UI.
2. Images are compressed in the browser.
3. Images are sent to the `/process` FastAPI endpoint.
4. Backend uses Document AI to extract fields.
5. Extracted data is displayed and exported to Excel.


## ✅ Sample Excel Output

| Sl. No. | Issuer    | Payee    | Amount    | Date       |
|---------|-----------|----------|-----------|------------|
| 1       | ABC Corp  | John Doe | $2,500.00 | 04/10/2024 |

## 🧰 Future Improvements

- User authentication  
- History tracking per session  
- Annotation viewer for validation  
- Cloud deployment (GCP, Vercel, etc.)

## 👤 Authors

- **Faraaz Rehan Junaidi Mohammed**
- **Mirza Abdul Aleem Baig**

