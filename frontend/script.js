const imageInput = document.getElementById('imageInput');
const processButton = document.getElementById('processButton');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.getElementById('loading');

processButton.addEventListener('click', async () => {
    const files = imageInput.files;
    if (files.length === 0) {
        alert("Please select one or more images.");
        return;
    }

    loadingDiv.style.display = 'block';
    resultsDiv.style.display = 'none';

    const allResults = [];

    for (const file of files) {
        try {
            const compressedFile = await compressImage(file, 0.7);
            const formData = new FormData();
            formData.append('file', compressedFile, file.name);

            const response = await fetch('http://127.0.0.1:8000/process', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            allResults.push(data);

        } catch (error) {
            alert(`Error processing ${file.name}: ${error.message}`);
            console.error("Error:", error);
        }
    }

    loadingDiv.style.display = 'none';

    createAndDownloadExcel(allResults);
});

async function compressImage(file, quality) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, { type: file.type }));
                }, file.type, quality);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function createAndDownloadExcel(data) {
    const newData = data.map((item, index) => {
        let cleanedAmount = item.Amount;
        if (cleanedAmount) {
            cleanedAmount = cleanedAmount.replace(/\*\*/g, ''); // Remove double asterisks
            cleanedAmount = cleanedAmount.replace(/[^0-9.,]/g, ''); // Improved regex
            cleanedAmount = parseFloat(cleanedAmount.replace(/,/g, ''));
            cleanedAmount = '$' + cleanedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
            cleanedAmount = '';
        }

        return {
            'Sl. No.': index + 1,
            'Amount': cleanedAmount,
            ...item
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(newData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cheque Data");
    XLSX.writeFile(workbook, "cheque_data.xlsx");
}