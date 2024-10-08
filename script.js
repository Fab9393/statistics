const ctx = document.getElementById('myChart').getContext('2d');

// Funzione per generare dati casuali basati su probabilità p con somma compensata
function generateData(m, n, p) {
    let data = [];
    for (let i = 0; i < m; i++) {
        let successCount = 0;
        let c = 0.0; // Variabile di compensazione
        for (let j = 0; j < n; j++) {
            let y = (Math.random() < p) ? 1 : 0 - c;
            let t = successCount + y;
            c = (t - successCount) - y;
            successCount = t;
        }
        data.push(successCount);
    }
    return data;
}

// Aggiungi evento al pulsante
document.getElementById('simulateButton').addEventListener('click', () => {
    // Leggi i valori dal modulo
    const N = parseInt(document.getElementById('n').value); // Numero di server
    const M = parseInt(document.getElementById('m').value); // Numero di hacker
    const p = parseFloat(document.getElementById('p').value); // Probabilità di successo

    // Genera i dati
    const data = generateData(M, N, p);

    // Crea l'istogramma
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from({ length: N + 1 }, (_, i) => i.toString()),
            datasets: [{
                label: 'Distribuzione degli attacchi riusciti',
                data: data.reduce((acc, val) => {
                    acc[val] = (acc[val] || 0) + 1;
                    return acc;
                }, Array(N + 1).fill(0)),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});